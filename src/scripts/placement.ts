/**
 * Placement test engine (v2) — no self-rating step, no contact gate.
 * Instant, scored result → recommendation → prefilled booking or optional WhatsApp share.
 */
import { track } from './analytics';
import type { TrackTest, TrackKey, Question } from '@/data/placement';

interface Rec {
  course: string;
  trial: string;
  href: string;
  why: string;
}
type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type CW = { course: string; why: string };
/** Script strings, serialised by the view from src/locales/<lang>/placement.ts (S) — {placeholders} filled here. */
export interface PlacementStrings {
  lang: string;
  prefix: string;
  levels: Record<Level, string>;
  headlines: Record<Level, string>;
  score: string;
  levelLine: string;
  noStrength: string;
  noFocus: string;
  msg: string[];
  count: string;
  recs: {
    quranRead: CW;
    quranRecite: CW;
    quranTajweed: CW;
    quranHifz: CW;
    arabicNoor: CW;
    arabicTalk: CW;
    arabicGrammar: CW;
    kids: CW[];
    subjects: string[];
    islamic: CW;
  };
}

const toAr = (v: number | string) => String(v).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
/** Fill {placeholders}; numbers use Arabic-Indic digits on Arabic pages. */
const fmt = (S: PlacementStrings, tpl: string, vars: Record<string, string | number>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k: string) => (typeof vars[k] === 'number' && S.lang === 'ar' ? toAr(vars[k]) : String(vars[k] ?? '')));

export function recommend(key: TrackKey, pct: number, a: Record<string, number>, S: PlacementStrings): Rec {
  const R = S.recs;
  const at = (path: string) => `${S.prefix}${path}`;
  const rec = (cw: CW, trial: string, path: string): Rec => ({ ...cw, trial, href: at(path) });
  if (key === 'quran') {
    if (a.q1 === 0) return rec(R.quranRead, 'Noor Al-Bayan', '/online-arabic-classes/');
    if (pct < 0.45) return rec(R.quranRecite, 'Quran Recitation', '/quran-recitation-course/');
    if (pct < 0.8) return rec(R.quranTajweed, 'Tajweed Rules', '/quran-recitation-course/');
    return rec(R.quranHifz, a.q8 >= 2 ? 'Ijazah Program' : 'Quran Memorization (Hifz)', '/quran-memorization-hifz/');
  }
  if (key === 'arabic') {
    if (a.a1 === 0 || pct < 0.4) return rec(R.arabicNoor, 'Noor Al-Bayan', '/online-arabic-classes/');
    if (a.a8 === 2) return rec(R.arabicTalk, 'Arabic Conversation', '/online-arabic-classes/');
    return rec(R.arabicGrammar, 'Arabic Grammar', '/online-arabic-classes/');
  }
  if (key === 'kids') return rec(R.kids[a.k1 ?? 0] ?? R.kids[0], 'Ummah Cubs (Kids)', '/ummah-cubs-kids-islamic-studies/');
  const s = R.subjects[a.i8 ?? 0] ?? R.subjects[0];
  return rec({ course: fmt(S, R.islamic.course, { s }), why: fmt(S, R.islamic.why, { s }) }, 'Islamic Studies', '/online-islamic-studies-classes/');
}

const isArabicText = (s: string) => /[\u0600-\u06FF]/.test(s) && !/[a-z]/i.test(s);

/**
 * Level tests are half of what the portal's Website Requests board promises.
 * Fire-and-forget to the portal intake; the result screen never waits on this.
 */
function reportLevelTest(
  root: HTMLElement,
  t: { key: string; label: string },
  level: string,
  percent: number,
  rec: Rec,
): void {
  const endpoint = root.dataset.endpoint;
  if (!endpoint) return;
  const body = {
    kind: 'level-test',
    submissionId: `pt-${Date.now()}-${t.key}`,
    course: rec.trial,
    level,
    lang: root.dataset.lang || 'en',
    source: location.pathname,
    message: rec.course,
    payload: {
      track: t.key,
      trackLabel: t.label,
      percent,
      level,
      recommended: rec.course,
    },
    submitted_at: new Date().toISOString(),
  };
  try {
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ua-request': '1' },
      body: JSON.stringify(body),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never block the student's result on reporting */
  }
}

export function initPlacement(): void {
  const root = document.querySelector<HTMLElement>('[data-pt]');
  const dataEl = document.getElementById('pt-data');
  if (!root || !dataEl) return;
  const tests = JSON.parse(dataEl.textContent || '[]') as TrackTest[];
  const S = JSON.parse(document.getElementById('pt-i18n')?.textContent || '{}') as PlacementStrings;
  const wa = root.dataset.wa || '';
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const $ = <E extends Element>(sel: string) => root.querySelector<E>(sel)!;
  const state = { test: null as TrackTest | null, i: 0, answers: {} as Record<string, number> };

  const show = (name: string) => {
    steps.forEach((s) => (s.hidden = s.dataset.step !== name));
    const heading = root.querySelector<HTMLElement>(`[data-step="${name}"] .pt__focus`);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    const top = root.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const next = $<HTMLButtonElement>('[data-next]');

  const renderQuestion = () => {
    const t = state.test!;
    const q: Question = t.questions[state.i];
    $('[data-q-track]').textContent = t.label;
    $('[data-q-count]').textContent = fmt(S, S.count, { i: state.i + 1, n: t.questions.length });
    $<HTMLElement>('[data-q-bar]').style.width = `${(state.i / t.questions.length) * 100}%`;
    $('[data-q-prompt]').textContent = q.prompt;
    const wrap = $('[data-q-options]');
    wrap.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const label = document.createElement('label');
      label.className = 'choice';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q-${q.id}`;
      input.value = String(idx);
      input.checked = state.answers[q.id] === idx;
      const box = document.createElement('span');
      box.className = 'choice__box';
      const text = document.createElement('span');
      text.textContent = opt;
      if (isArabicText(opt) && /[«ً-ْ]/.test(opt + q.prompt)) text.className = 'ar-opt';
      box.append(text);
      label.append(input, box);
      input.addEventListener('change', () => {
        state.answers[q.id] = idx;
        next.disabled = false;
        window.setTimeout(advance, 260);
      });
      wrap.append(label);
    });
    next.disabled = state.answers[q.id] === undefined;
  };

  const advance = () => {
    const t = state.test!;
    if (state.answers[t.questions[state.i].id] === undefined) return;
    if (state.i < t.questions.length - 1) {
      state.i += 1;
      renderQuestion();
      $<HTMLElement>('[data-q-prompt]').focus?.();
    } else showResult();
  };

  const showResult = () => {
    const t = state.test!;
    let score = 0;
    let max = 0;
    const strengths: string[] = [];
    const focus: string[] = [];
    t.questions.forEach((q) => {
      const a = state.answers[q.id];
      if (q.kind === 'quiz') {
        max += 1;
        if (a === q.answer) {
          score += 1;
          strengths.push(q.skill);
        } else focus.push(q.skill);
      } else if (q.kind === 'self') {
        max += 1;
        const v = (a ?? 0) / (q.options.length - 1);
        score += v;
        (v >= 0.66 ? strengths : focus).push(q.skill);
      }
    });
    const pct = max ? score / max : 0;
    const level: Level = pct < 0.4 ? 'Beginner' : pct < 0.75 ? 'Intermediate' : 'Advanced';
    const rec = recommend(t.key, pct, state.answers, S);
    const percent = Math.round(pct * 100);
    const uniq = (xs: string[]) => Array.from(new Set(xs));
    const fill = (sel: string, items: string[], fallback: string) => {
      const ul = $(sel);
      ul.innerHTML = '';
      (items.length ? items : [fallback]).forEach((s) => {
        const li = document.createElement('li');
        li.textContent = s;
        ul.append(li);
      });
    };
    $('[data-r-level]').textContent = fmt(S, S.levelLine, { level: S.levels[level], track: t.label });
    $('[data-r-headline]').textContent = S.headlines[level];
    $('[data-r-score]').textContent = fmt(S, S.score, { p: percent });
    fill('[data-r-strengths]', uniq(strengths), S.noStrength);
    fill('[data-r-focus]', uniq(focus), S.noFocus);
    $('[data-r-course]').textContent = rec.course;
    $('[data-r-why]').textContent = rec.why;
    $<HTMLAnchorElement>('[data-r-link]').href = rec.href;
    const bookBase = `${S.prefix}/contact/`;
    $<HTMLAnchorElement>('[data-r-book]').href = `${bookBase}?course=${encodeURIComponent(rec.trial)}&level=${encodeURIComponent(S.levels[level])}${t.key === 'kids' ? '&learner=My%20child' : ''}#book`;
    $<HTMLAnchorElement>('[data-r-wa]').href = `https://wa.me/${wa}?text=${encodeURIComponent(S.msg.map((line) => fmt(S, line, { track: t.label, level: S.levels[level], p: percent, course: rec.course })).join('\n'))}`;
    $<HTMLElement>('[data-q-bar]').style.width = '100%';
    track('placement_result', { track: t.key, level });
    reportLevelTest(root, t, level, percent, rec);
    show('result');
  };

  next.addEventListener('click', advance);

  root.querySelectorAll<HTMLInputElement>('input[name="pt-track"]').forEach((r) =>
    r.addEventListener('change', () => {
      state.test = tests.find((t) => t.key === r.value) ?? null;
      state.i = 0;
      state.answers = {};
      track('placement_start', { track: r.value });
      renderQuestion();
      show('quiz');
    })
  );

  root.querySelector('[data-back]')?.addEventListener('click', () => {
    if (state.i > 0) {
      state.i -= 1;
      renderQuestion();
    } else show('track');
  });

  root.querySelector('[data-restart]')?.addEventListener('click', () => {
    state.test = null;
    root.querySelectorAll<HTMLInputElement>('input[name="pt-track"]').forEach((r) => (r.checked = false));
    show('track');
  });

  const pre = new URLSearchParams(location.search).get('track');
  const preInput = pre ? root.querySelector<HTMLInputElement>(`input[name="pt-track"][value="${pre}"]`) : null;
  if (preInput) {
    preInput.checked = true;
    preInput.dispatchEvent(new Event('change'));
  }
}
