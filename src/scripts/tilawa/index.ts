/**
 * Tilawa — the on-device recitation companion (/tilawa/).
 *
 * Adapted from the Tilawa demo (github.com/yazinsai/tilawa, MIT). The engine and onnxruntime-web load only when the
 * visitor presses Start; the model, reference and runtime come from https://tilawa.dev/v1/ (the SDK default) and are
 * kept in the Cache API, so the next start works offline. Audio never leaves the device.
 */
import { ayahsRecited, type CheckerEvent, type EngineEvent, type MemorizationPassage, type PositionEvent, type TilawaSession, type WordRef } from '@tilawa/core';
import type { LoadProgress, Microphone, Tilawa } from '@tilawa/core/web';
import { ayahKey, displayIndex, indexQuran, surahList, type QuranText, type QuranVerse } from './quran-words';
import { prepareMic } from './mic';

type Pair = [string, string];
interface Strings {
  lang: string;
  listening: string;
  hintFree: string;
  hintPassage: string;
  hintLost: string;
  hintFinding: string;
  hintAmbiguous: string;
  statusGpu: string;
  statusCpu: string;
  noPlace: string;
  recited: string;
  zero: string;
  one: string;
  many: string;
  listError: string;
  surahFallback: string;
  loadingDownload: string;
  loadingCached: string;
  loadingAlmost: string;
  mic: { denied: Pair; unavailable: Pair; insecure: Pair };
  classes: Record<'wrong_word' | 'omitted_word' | 'added_word' | 'skipped_passage', Pair>;
}

type MistakeClass = keyof Strings['classes'];
interface NoteGroup {
  cls: MistakeClass;
  surah: number;
  ayah: number;
  items: { id: string; word: number }[];
  li: HTMLLIElement;
  btn: HTMLButtonElement;
}

type View = 'idle' | 'loading' | 'load-error' | 'mic-pending' | 'mic-error' | 'listening' | 'stopped';
const VIEWS: View[] = ['idle', 'loading', 'load-error', 'mic-pending', 'mic-error', 'listening', 'stopped'];
const STAGE_WEIGHT = { model: 0.75, reference: 0.2, warmup: 0.05 } as const;

export function initTilawa() {
  const root = document.querySelector<HTMLElement>('[data-tilawa]');
  const data = document.getElementById('tw-i18n');
  if (!root || !data) return;
  const S = JSON.parse(data.textContent || '{}') as Strings;
  const ar = S.lang === 'ar';
  const digits = (n: number | string) => (ar ? String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]) : String(n));
  const fill = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

  const $ = <T extends HTMLElement = HTMLElement>(name: string) => root.querySelector(`[data-tw="${name}"]`) as T;
  const quranUrl = root.dataset.quran || '/tilawa/quran.json';

  const isShown = (e: CheckerEvent): e is CheckerEvent & { errorClass: MistakeClass } => e.errorClass in S.classes;

  function show(view: View) {
    for (const v of VIEWS) $(`view-${v}`).hidden = v !== view;
    $('recitation').hidden = view !== 'listening' && view !== 'stopped';
    root!.dataset.view = view;
    $<HTMLButtonElement>('btn-passage').disabled = view === 'loading' || view === 'mic-pending' || view === 'listening';
  }

  // ── Loading: the Qur'an display text and the engine ──────────────────────────────────────────────
  let quranPromise: Promise<QuranText> | null = null;
  function loadQuran(): Promise<QuranText> {
    quranPromise ??= fetch(quranUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status} fetching the Qur’an text`);
        return r.json() as Promise<QuranVerse[]>;
      })
      .then(indexQuran);
    quranPromise.catch(() => (quranPromise = null));
    return quranPromise;
  }

  let tilawaPromise: Promise<Tilawa> | null = null;
  let loadAbort: AbortController | null = null;

  function loadTilawa(): Promise<Tilawa> {
    if (tilawaPromise) return tilawaPromise;
    const abort = (loadAbort = new AbortController());
    const done = { model: 0, reference: 0, warmup: 0 };
    let cached = true;
    tilawaPromise = import('@tilawa/core/web').then((web) =>
      web.createTilawa({
        signal: abort.signal,
        onProgress: (p: LoadProgress) => {
          done[p.stage] = p.fraction;
          if (!p.fromCache && p.stage !== 'warmup' && p.fraction < 1) cached = false;
          const overall = Object.entries(done).reduce((n, [k, f]) => n + f * STAGE_WEIGHT[k as keyof typeof done], 0);
          const pct = Math.floor(overall * 100);
          $('progress').style.setProperty('--progress', String(overall));
          $('progress-track').setAttribute('aria-valuenow', String(pct));
          $('progress-label').textContent = ar ? `${digits(pct)}٪` : `${pct}%`;
          $('loading-detail').textContent = cached ? S.loadingCached : p.stage === 'warmup' ? S.loadingAlmost : S.loadingDownload;
        },
      }),
    );
    tilawaPromise.then(
      (t) => ($('status').textContent = t.model.backend.includes('webgpu') ? S.statusGpu : S.statusCpu),
      () => (tilawaPromise = null),
    );
    return tilawaPromise;
  }

  // ── A take: one session, one microphone ──────────────────────────────────────────────────────────
  interface Take {
    session: TilawaSession;
    mic: Microphone | null;
    events: EngineEvent[];
    view: RecitationView;
  }
  let take: Take | null = null;
  let starting = false;

  async function start(passage?: MemorizationPassage) {
    if (starting || take) return;
    starting = true;
    // Before any await: keeps the tap's user gesture for iOS audio (listen() takes ownership).
    let prepared = prepareMic();
    try {
      show('loading');
      const [tilawa, quran] = await Promise.all([loadTilawa(), loadQuran()]);
      show('mic-pending');
      const session = passage ? tilawa.startMemorization(passage, { confirm: { after: 'next-word' } }) : tilawa.startFreeRecitation();
      const current: Take = { session, mic: null, events: [], view: new RecitationView(quran, passage ?? null) };
      session.subscribe((e) => {
        current.events.push(e);
        current.view.handle(e);
      });
      try {
        const opts = prepared ? { onLevel: meter, prepared } : { onLevel: meter };
        prepared = null;
        current.mic = await tilawa.listen(session, opts);
      } catch (e) {
        session.dispose();
        showMicError(e);
        return;
      }
      take = current;
      show('listening');
    } catch (e) {
      prepared?.release();
      if (e instanceof Error && e.name === 'AbortError') return show('idle');
      console.error(e);
      $('load-error-detail').textContent = e instanceof Error ? e.message : String(e);
      show('load-error');
    } finally {
      starting = false;
    }
  }

  async function stop() {
    const t = take;
    if (!t) return;
    const btn = $<HTMLButtonElement>('btn-stop');
    btn.disabled = true;
    try {
      await t.mic?.stop(); // ends the session: its final events arrive through subscribe
    } catch (e) {
      console.error(e);
    }
    take = null;
    btn.disabled = false;
    const mistakes = t.session.mistakes().filter(isShown);
    $('summary').textContent = summary(t.view.quran, ayahsRecited(t.events), mistakes.length);
    t.session.dispose();
    meter(-100);
    show('stopped');
    t.view.review();
  }

  const surahName = (quran: QuranText, surah: number) => {
    const a = quran.get(ayahKey(surah, 1));
    return (ar ? a?.surahName : a?.surahNameEn) ?? fill(S.surahFallback, { n: digits(surah) });
  };
  const ref = (surah: number, from: number, to?: number) => digits(`${surah}:${from}${to && to !== from ? `–${to}` : ''}`);

  function summary(quran: QuranText, recited: { surah: number; ayah: number }[], mistakes: number): string {
    if (!recited.length) return S.noPlace;
    const runs: string[] = [];
    let i = 0;
    while (i < recited.length) {
      const first = recited[i];
      let last = first;
      while (i + 1 < recited.length && recited[i + 1].surah === first.surah && recited[i + 1].ayah === last.ayah + 1) last = recited[++i];
      i++;
      runs.push(`${surahName(quran, first.surah)} ${ref(first.surah, first.ayah, last.ayah)}`);
    }
    const list = new Intl.ListFormat(S.lang, { type: 'conjunction' }).format(runs);
    const notes = mistakes === 0 ? S.zero : mistakes === 1 ? S.one : fill(S.many, { n: digits(mistakes) });
    return `${fill(S.recited, { runs: list })} ${notes}`;
  }

  function showMicError(e: unknown) {
    const reason = (e as { reason?: string }).reason;
    const key = reason === 'denied' ? 'denied' : reason === 'insecure-context' ? 'insecure' : 'unavailable';
    const [title, detail] = S.mic[key];
    $('mic-error-title').textContent = title;
    $('mic-error-detail').textContent = detail;
    show('mic-error');
  }

  const levelBar = $('level').firstElementChild as HTMLElement;
  function meter(db: number) {
    levelBar.style.setProperty('--level', String(Math.max(0, Math.min(1, (db + 60) / 50))));
  }

  // ── The recitation display: the current ayah, the current word, and confirmed notes ──────────────
  class RecitationView {
    private shown: string | null = null;
    private spans: HTMLSpanElement[] = [];
    private readonly marks = new Map<string, CheckerEvent>();
    /** One card per run of neighbouring words with the same kind of mistake (a skipped part is one card). */
    private groups: NoteGroup[] = [];
    private readonly byId = new Map<string, NoteGroup>();
    private readonly ayah = $('ayah');
    readonly quran: QuranText;

    constructor(quran: QuranText, passage: MemorizationPassage | null) {
      this.quran = quran;
      this.ayah.replaceChildren();
      delete this.ayah.dataset.ref;
      $('notes').replaceChildren();
      $('notes-wrap').hidden = true;
      $('place').textContent = passage ? `${surahName(quran, passage.surah)} ${ref(passage.surah, passage.fromAyah, passage.toAyah)}` : S.listening;
      $('hint').textContent = passage ? S.hintPassage : S.hintFree;
      $('hint').hidden = false;
    }

    handle(e: EngineEvent) {
      if (e.type === 'position') this.position(e);
      else if (e.type === 'checker') this.checker(e);
    }

    private position(e: PositionEvent) {
      const top = e.observed[0];
      const hint = $('hint');
      if (e.state === 'lost') hint.textContent = S.hintLost;
      else if (e.state === 'acquiring' && !this.shown) hint.textContent = S.hintFinding;
      if (e.state === 'ambiguous') {
        hint.hidden = false;
        hint.textContent = S.hintAmbiguous;
      }
      // Only a locked position moves the display: ambiguous candidates would flicker between ayahs.
      if (!top || e.state !== 'locked') return;
      hint.hidden = true;
      this.showWord(top.word);
    }

    /** Draws an ayah (once) and re-applies the marks that fall in it. */
    private render(surah: number, ayahNo: number): boolean {
      const key = ayahKey(surah, ayahNo);
      if (this.shown === key) return true;
      const ayah = this.quran.get(key);
      if (!ayah) return false;
      this.shown = key;
      this.spans = ayah.words.map((text, i) => {
        const span = document.createElement('span');
        span.className = 'tw-word';
        span.textContent = text;
        span.dataset.index = String(i);
        return span;
      });
      this.ayah.replaceChildren(...this.spans.flatMap((s, i) => (i ? [document.createTextNode(' '), s] : [s])));
      const marker = document.createElement('span');
      marker.className = 'tw-ayah-num';
      marker.textContent = ` ﴿${String(ayahNo).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])}﴾`;
      this.ayah.append(marker);
      this.ayah.dataset.ref = key;
      $('place').textContent = `${surahName(this.quran, surah)} ${ref(surah, ayahNo)}`;
      for (const m of this.marks.values()) this.applyMark(m);
      return true;
    }

    private showWord(w: WordRef) {
      if (!this.render(w.surah, w.ayah)) return;
      this.setActive(null);
      const at = displayIndex(w.surah, w.ayah, w.word);
      this.spans.forEach((s, i) => {
        s.classList.toggle('is-said', i < at);
        s.classList.toggle('is-current', i === at);
      });
    }

    /** Shows a note's ayah with its mistakes marked (the first note when none is given). */
    review(group: NoteGroup | undefined = this.groups[0]) {
      if (!group || !this.render(group.surah, group.ayah)) return;
      this.spans.forEach((s) => s.classList.remove('is-said', 'is-current'));
      this.setActive(group);
    }

    private setActive(group: NoteGroup | null) {
      for (const g of this.groups) {
        g.btn.classList.toggle('is-active', g === group);
        g.btn.setAttribute('aria-pressed', String(g === group));
      }
    }

    private checker(e: CheckerEvent) {
      if (!isShown(e)) return;
      if (e.state === 'confirmed') {
        this.marks.set(e.id, e);
        this.applyMark(e);
        this.addNote(e);
      } else if (e.state === 'resolved' && this.marks.delete(e.id)) {
        // A self-correction: take the note back.
        this.removeNote(e.id);
        const span = this.spanFor(e.location);
        if (span) {
          span.classList.remove('is-marked');
          span.removeAttribute('title');
        }
      }
    }

    private spanFor(w: WordRef): HTMLSpanElement | undefined {
      if (this.shown !== ayahKey(w.surah, w.ayah)) return undefined;
      return this.spans[displayIndex(w.surah, w.ayah, w.word)];
    }

    private applyMark(e: CheckerEvent) {
      const span = this.spanFor(e.location);
      if (!span || !isShown(e)) return;
      span.classList.add('is-marked');
      span.dataset.mark = e.errorClass;
      span.title = S.classes[e.errorClass][1];
    }

    private addNote(e: CheckerEvent & { errorClass: MistakeClass }) {
      const { surah, ayah, word } = e.location;
      const last = this.groups.at(-1);
      const prev = last?.items.at(-1);
      let group: NoteGroup;
      if (last && prev && last.cls === e.errorClass && last.surah === surah && last.ayah === ayah && word >= prev.word && word - prev.word <= 1) {
        group = last;
      } else {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tw-note';
        btn.dataset.class = e.errorClass;
        li.append(btn);
        const created: NoteGroup = { cls: e.errorClass, surah, ayah, items: [], li, btn };
        btn.addEventListener('click', () => this.review(created));
        this.groups.push(created);
        $('notes').append(li);
        group = created;
      }
      group.items.push({ id: e.id, word });
      group.items.sort((a, b) => a.word - b.word);
      this.byId.set(e.id, group);
      this.drawNote(group);
      $('notes-wrap').hidden = false;
    }

    private drawNote(g: NoteGroup) {
      const [label, text] = S.classes[g.cls];
      const head = document.createElement('span');
      head.className = 'tw-note__head';
      head.textContent = `${label} · ${ref(g.surah, g.ayah)}`;
      const words = this.quran.get(ayahKey(g.surah, g.ayah))?.words ?? [];
      const shown = [...new Set(g.items.map((i) => displayIndex(g.surah, g.ayah, i.word)))].map((i) => words[i]).filter(Boolean);
      if (shown.length) {
        const arWords = document.createElement('span');
        arWords.className = 'tw-note__word quranic';
        arWords.lang = 'ar';
        arWords.dir = 'rtl';
        arWords.textContent = shown.join(' ');
        head.append(arWords);
      }
      const body = document.createElement('span');
      body.className = 'tw-note__text';
      body.textContent = text;
      g.btn.replaceChildren(head, body);
      g.btn.dataset.note = g.items.map((i) => i.id).join(' ');
    }

    private removeNote(id: string) {
      const g = this.byId.get(id);
      if (!g) return;
      this.byId.delete(id);
      g.items = g.items.filter((i) => i.id !== id);
      if (g.items.length) this.drawNote(g);
      else {
        g.li.remove();
        this.groups = this.groups.filter((x) => x !== g);
      }
      $('notes-wrap').hidden = !this.groups.length;
    }
  }

  // ── Declared passage picker ──────────────────────────────────────────────────────────────────────
  async function fillPassagePicker() {
    const select = $<HTMLSelectElement>('passage-surah');
    if (select.dataset.ready) return;
    try {
      const list = surahList(await loadQuran());
      select.replaceChildren(
        ...list.map((s) => {
          const o = document.createElement('option');
          o.value = String(s.surah);
          o.textContent = `${digits(s.surah)}. ${ar ? s.name : s.nameEn}`;
          o.dataset.ayahs = String(s.ayahs);
          return o;
        }),
      );
      select.dataset.ready = '1';
      syncRange();
    } catch {
      select.firstElementChild!.textContent = S.listError;
    }
  }

  function syncRange() {
    const select = $<HTMLSelectElement>('passage-surah');
    const max = Number(select.selectedOptions[0]?.dataset.ayahs ?? 286);
    const from = $<HTMLInputElement>('passage-from');
    const to = $<HTMLInputElement>('passage-to');
    from.max = to.max = String(max);
    if (Number(from.value) > max) from.value = '1';
    if (Number(to.value) > max || Number(to.value) < Number(from.value)) to.value = String(Math.min(max, Number(from.value) + 6));
  }

  $('passage').addEventListener('toggle', () => {
    if (($('passage') as HTMLDetailsElement).open) void fillPassagePicker();
  });
  $('passage-surah').addEventListener('change', syncRange);
  $('passage-from').addEventListener('change', syncRange);
  $<HTMLFormElement>('passage-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const surah = Number($<HTMLSelectElement>('passage-surah').value);
    const fromAyah = Number($<HTMLInputElement>('passage-from').value);
    const toAyah = Number($<HTMLInputElement>('passage-to').value);
    if (!surah || !fromAyah || toAyah < fromAyah) return;
    ($('passage') as HTMLDetailsElement).open = false;
    void start({ surah, fromAyah, toAyah });
  });

  // ── Buttons ──────────────────────────────────────────────────────────────────────────────────────
  for (const name of ['btn-start', 'btn-again', 'btn-retry-load', 'btn-retry-mic']) $(name).addEventListener('click', () => void start());
  $('btn-stop').addEventListener('click', () => void stop());
  $('btn-cancel').addEventListener('click', () => loadAbort?.abort());
  window.addEventListener('pagehide', () => void take?.mic?.stop());

  show('idle');
}
