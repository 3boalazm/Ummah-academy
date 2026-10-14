/**
 * Placement test engine — framework-free, accessible, ~3 KB gzipped.
 */
import { track } from './analytics';
import type { TrackTest, TrackKey, Question } from '@/data/placement';

interface Rec {
  course: string;
  trial: string;
  href: string;
  why: string;
}

const HEADLINES: Record<string, string> = {
  Beginner: 'You’re ready to start with the fundamentals',
  Intermediate: 'You have a solid base — time to refine it',
  Advanced: 'Strong foundations — you’re ready for mastery',
};

const isArabic = (s: string) => /[\u0600-\u06FF]/.test(s) && !/[a-z]/i.test(s.replace(/[\u0600-\u06FF\s«»]/g, ''));

export function recommend(key: TrackKey, pct: number, answers: Record<string, number>): Rec {
  if (key === 'quran') {
    if (answers.q1 === 0) return { course: 'Noor Al-Bayan (reading foundation)', trial: 'Noor Al-Bayan', href: '/online-arabic-classes/', why: 'Build confident letter-by-letter reading first — Tajweed sits on top of it.' };
    if (pct < 0.45) return { course: 'Quran Recitation', trial: 'Quran Recitation', href: '/quran-recitation-course/', why: 'Strengthen fluent, correct recitation with live correction from your teacher.' };
    if (pct < 0.8) return { course: 'Tajweed Rules — Level 2', trial: 'Tajweed Rules', href: '/quran-recitation-course/', why: 'You know the basics; now systematise the rules with Al-Jazariyyah.' };
    return { course: 'Hifz & Ijazah', trial: answers.q8 >= 2 ? 'Ijazah Program' : 'Quran Memorization (Hifz)', href: '/quran-memorization-hifz/', why: 'Your recitation is strong enough to memorise with the Itqan method — and work toward an Ijazah.' };
  }
  if (key === 'arabic') {
    if (answers.a1 === 0 || pct < 0.4) return { course: 'Noor Al-Bayan', trial: 'Noor Al-Bayan', href: '/online-arabic-classes/', why: 'Start from the letters and reach independent reading in months, not years.' };
    if (answers.a8 === 2) return { course: 'Arabic Conversation', trial: 'Arabic Conversation', href: '/online-arabic-classes/', why: 'You can read — now build speaking confidence for daily life and lectures.' };
    return { course: 'Grammar: Nahw & Sarf', trial: 'Arabic Grammar', href: '/online-arabic-classes/', why: 'Unlock understanding with the classical Al-Ajrumiyyah path.' };
  }
  if (key === 'kids') {
    const tiers: Rec[] = [
      { course: 'Ummah Cubs — Little Explorers (5–7)', trial: 'Ummah Cubs (Kids)', href: '/ummah-cubs-kids-islamic-studies/', why: 'Playful 30-minute sessions: first letters, stories and short surahs.' },
      { course: 'Ummah Cubs — Growing Learners (8–10)', trial: 'Ummah Cubs (Kids)', href: '/ummah-cubs-kids-islamic-studies/', why: 'Real reading fluency with Noor Al-Bayan plus short-surah memorisation.' },
      { course: 'Ummah Cubs — Junior Scholars (11–14)', trial: 'Ummah Cubs (Kids)', href: '/ummah-cubs-kids-islamic-studies/', why: 'A structured track with Tajweed basics and deeper Islamic studies.' },
    ];
    return tiers[answers.k1 ?? 0] ?? tiers[0];
  }
  const subjects = ['Aqeedah', 'Fiqh', 'Tafseer', 'Seerah'];
  const s = subjects[answers.i8 ?? 0] ?? 'Aqeedah';
  return { course: `Islamic Studies — ${s}`, trial: 'Islamic Studies', href: '/online-islamic-studies-classes/', why: `Start with ${s}, paced to your background, taught 1-on-1 with room for your questions.` };
}

export function initPlacement(): void {
  const root = document.querySelector<HTMLElement>('[data-pt]');
  const dataEl = document.getElementById('pt-data');
  if (!root || !dataEl) return;
  const tests = JSON.parse(dataEl.textContent || '[]') as TrackTest[];
  const askLevel = root.dataset.askLevel === 'true';
  const gate = root.dataset.gate === 'true';
  const wa = root.dataset.wa || '';

  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const state = { test: null as TrackTest | null, level: '', i: 0, answers: {} as Record<string, number>, history: [] as string[] };

  const show = (name: string, push = true) => {
    const current = steps.find((s) => !s.hidden)?.dataset.step;
    if (push && current && current !== name) state.history.push(current);
    steps.forEach((s) => (s.hidden = s.dataset.step !== name));
    const heading = root.querySelector<HTMLElement>(`[data-step="${name}"] h2, [data-step="${name}"] legend`);
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderQuestion = () => {
    const t = state.test!;
    const q: Question = t.questions[state.i];
    $('[data-q-track]').textContent = t.label;
    $('[data-q-count]').textContent = `${state.i + 1} / ${t.questions.length}`;
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
      if (isArabic(opt)) {
        text.className = 'ar-opt';
        text.lang = 'ar';
        text.dir = 'rtl';
      }
      box.append(text);
      label.append(input, box);
      input.addEventListener('change', () => {
        state.answers[q.id] = idx;
        next.disabled = false;
        window.setTimeout(() => advance(), 280);
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
    } else {
      track('placement_complete', { track: t.key });
      if (gate) show('gate');
      else showResult();
    }
  };

  const showResult = (extra: { freq?: string; start?: string } = {}) => {
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
    const level = pct < 0.4 ? 'Beginner' : pct < 0.75 ? 'Intermediate' : 'Advanced';
    const rec = recommend(t.key, pct, state.answers);
    const uniq = (xs: string[]) => Array.from(new Set(xs));

    $('[data-r-level]').textContent = `${level} level · ${t.label}`;
    $('[data-r-headline]').textContent = HEADLINES[level];
    $('[data-r-score]').textContent = `You scored ${Math.round(pct * 100)}% on the skills we checked.`;
    const sList = $('[data-r-strengths]');
    sList.innerHTML = '';
    (uniq(strengths).length ? uniq(strengths) : ['Motivation to begin — the most important step']).forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      sList.append(li);
    });
    const fList = $('[data-r-focus]');
    fList.innerHTML = '';
    (uniq(focus).length ? uniq(focus) : ['Consistency and long-term revision']).forEach((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      fList.append(li);
    });
    $('[data-r-course]').textContent = rec.course;
    $('[data-r-why]').textContent = rec.why;
    $<HTMLAnchorElement>('[data-r-link]').href = rec.href;
    $<HTMLAnchorElement>('[data-r-book]').href = `/contact/?course=${encodeURIComponent(rec.trial)}#book`;
    const msg = [
      'Assalamu alaikum! I just took the Ummah Academy placement test.',
      `Track: ${t.label}`,
      `Result: ${level} (${Math.round(pct * 100)}%)`,
      `Recommended: ${rec.course}`,
      extra.freq ? `Preferred: ${extra.freq}` : '',
      extra.start ? `Start: ${extra.start}` : '',
      'Please send me my personalized study plan.',
    ]
      .filter(Boolean)
      .join('\n');
    $<HTMLAnchorElement>('[data-r-wa]').href = `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
    track('placement_result', { track: t.key, level });
    show('result');
  };

  const next = $<HTMLButtonElement>('[data-next]');
  next.addEventListener('click', advance);

  root.querySelectorAll<HTMLInputElement>('input[name="pt-track"]').forEach((r) =>
    r.addEventListener('change', () => {
      state.test = tests.find((t) => t.key === r.value) ?? null;
      state.i = 0;
      state.answers = {};
      track('placement_start', { track: r.value });
      if (askLevel) show('level');
      else {
        renderQuestion();
        show('quiz');
      }
    })
  );
  root.querySelectorAll<HTMLInputElement>('input[name="pt-level"]').forEach((r) =>
    r.addEventListener('change', () => {
      state.level = r.value;
      renderQuestion();
      show('quiz');
    })
  );

  root.querySelectorAll('[data-back]').forEach((b) =>
    b.addEventListener('click', () => {
      const current = steps.find((s) => !s.hidden)?.dataset.step;
      if (current === 'quiz' && state.i > 0) {
        state.i -= 1;
        renderQuestion();
        return;
      }
      const prev = state.history.pop();
      if (prev) show(prev, false);
    })
  );

  const gateForm = root.querySelector<HTMLFormElement>('[data-step="gate"]');
  gateForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(gateForm);
    const num = String(fd.get('wa') || '');
    const field = gateForm.querySelector('#pt-wa')?.closest('.field');
    if (num.replace(/\D/g, '').length < 8) {
      field?.setAttribute('data-invalid', '');
      gateForm.querySelector<HTMLInputElement>('#pt-wa')?.focus();
      return;
    }
    field?.removeAttribute('data-invalid');
    showResult({ freq: String(fd.get('freq') || ''), start: String(fd.get('start') || '') });
  });

  root.querySelector('[data-restart]')?.addEventListener('click', () => {
    state.test = null;
    state.history = [];
    root.querySelectorAll<HTMLInputElement>('input[type=radio]').forEach((r) => (r.checked = false));
    show('track', false);
  });

  // Deep link: /placement-test/?track=kids
  const pre = new URLSearchParams(location.search).get('track');
  const preInput = pre ? root.querySelector<HTMLInputElement>(`input[name="pt-track"][value="${pre}"]`) : null;
  if (preInput) {
    preInput.checked = true;
    preInput.dispatchEvent(new Event('change'));
  }
}
