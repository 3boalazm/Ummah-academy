/**
 * Placement test engine (v2) — no self-rating step, no contact gate.
 * Instant, scored result → recommendation → prefilled booking or optional WhatsApp share.
 */
import { track } from './analytics';
import type { TrackTest, TrackKey, Question } from '@/data/placement';

type Lang = 'en' | 'ar';
interface Rec {
  course: string;
  trial: string;
  href: string;
  why: string;
}

const T = {
  en: {
    levels: { Beginner: 'Beginner', Intermediate: 'Intermediate', Advanced: 'Advanced' },
    headlines: {
      Beginner: 'You’re ready to start with the fundamentals',
      Intermediate: 'You have a solid base — time to refine it',
      Advanced: 'Strong foundations — you’re ready for mastery',
    },
    score: (p: number) => `You scored ${p}% on the skills we checked.`,
    levelLine: (lvl: string, track: string) => `${lvl} · ${track}`,
    noStrength: 'Motivation to begin — the most important step',
    noFocus: 'Consistency and long-term revision',
    msg: (track: string, lvl: string, p: number, course: string) =>
      ['Assalamu alaikum! I just took the Ummah Academy placement test.', `Track: ${track}`, `Result: ${lvl} (${p}%)`, `Recommended: ${course}`, 'Please send me my personalised study plan.'].join('\n'),
    count: (i: number, n: number) => `${i} / ${n}`,
  },
  ar: {
    levels: { Beginner: 'مبتدئ', Intermediate: 'متوسط', Advanced: 'متقدم' },
    headlines: {
      Beginner: 'أنت جاهز للبدء من الأساسيات',
      Intermediate: 'لديك أساس جيد — حان وقت صقله',
      Advanced: 'أساس قوي — أنت جاهز للإتقان',
    },
    score: (p: number) => `نتيجتك ${toAr(p)}٪ في المهارات التي اختبرناها.`,
    levelLine: (lvl: string, track: string) => `مستوى ${lvl} · ${track}`,
    noStrength: 'الرغبة في البدء — وهي أهم خطوة',
    noFocus: 'المواظبة والمراجعة على المدى الطويل',
    msg: (track: string, lvl: string, p: number, course: string) =>
      ['السلام عليكم، أنهيت اختبار تحديد المستوى في أكاديمية الأمة.', `المسار: ${track}`, `النتيجة: ${lvl} (${toAr(p)}٪)`, `الترشيح: ${course}`, 'أرجو إرسال خطة الدراسة المناسبة لي.'].join('\n'),
    count: (i: number, n: number) => `${toAr(i)} / ${toAr(n)}`,
  },
};

function toAr(v: number | string) {
  return String(v).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

const p = (lang: Lang, path: string) => (lang === 'ar' ? `/ar${path}` : path);

export function recommend(key: TrackKey, pct: number, a: Record<string, number>, lang: Lang = 'en'): Rec {
  const ar = lang === 'ar';
  if (key === 'quran') {
    if (a.q1 === 0)
      return { course: ar ? 'نور البيان (تأسيس القراءة)' : 'Noor Al-Bayan (reading foundation)', trial: 'Noor Al-Bayan', href: p(lang, '/online-arabic-classes/'), why: ar ? 'ابدأ بإتقان القراءة حرفًا حرفًا — فالتجويد يُبنى عليها.' : 'Build confident letter-by-letter reading first — Tajweed sits on top of it.' };
    if (pct < 0.45)
      return { course: ar ? 'تلاوة القرآن' : 'Quran Recitation', trial: 'Quran Recitation', href: p(lang, '/quran-recitation-course/'), why: ar ? 'قوِّ تلاوتك لتكون صحيحة وسلسة مع تصحيح مباشر من معلمك.' : 'Strengthen fluent, correct recitation with live correction from your teacher.' };
    if (pct < 0.8)
      return { course: ar ? 'أحكام التجويد — المستوى الثاني' : 'Tajweed Rules — Level 2', trial: 'Tajweed Rules', href: p(lang, '/quran-recitation-course/'), why: ar ? 'تعرف الأساسيات؛ والآن رتّب الأحكام بمنهجية مع متن الجزرية.' : 'You know the basics; now systematise the rules with Al-Jazariyyah.' };
    return { course: ar ? 'الحفظ والإجازة' : 'Hifz & Ijazah', trial: a.q8 >= 2 ? 'Ijazah Program' : 'Quran Memorization (Hifz)', href: p(lang, '/quran-memorization-hifz/'), why: ar ? 'تلاوتك قوية بما يكفي للحفظ بمنهج الإتقان والسير نحو الإجازة.' : 'Your recitation is strong enough to memorise with the Itqan method — and work toward an Ijazah.' };
  }
  if (key === 'arabic') {
    if (a.a1 === 0 || pct < 0.4)
      return { course: ar ? 'نور البيان' : 'Noor Al-Bayan', trial: 'Noor Al-Bayan', href: p(lang, '/online-arabic-classes/'), why: ar ? 'ابدأ من الحروف وصولًا إلى القراءة المستقلة خلال أشهر.' : 'Start from the letters and reach independent reading in months, not years.' };
    if (a.a8 === 2)
      return { course: ar ? 'المحادثة العربية' : 'Arabic Conversation', trial: 'Arabic Conversation', href: p(lang, '/online-arabic-classes/'), why: ar ? 'تقرأ جيدًا — والآن ابنِ ثقتك في الحديث للحياة اليومية والدروس.' : 'You can read — now build speaking confidence for daily life and lectures.' };
    return { course: ar ? 'النحو والصرف' : 'Grammar: Nahw & Sarf', trial: 'Arabic Grammar', href: p(lang, '/online-arabic-classes/'), why: ar ? 'افتح باب الفهم عبر مسار الآجرومية التراثي.' : 'Unlock understanding with the classical Al-Ajrumiyyah path.' };
  }
  if (key === 'kids') {
    const tiers: Rec[] = ar
      ? [
          { course: 'أشبال الأمة — المستكشفون الصغار (٥–٧)', trial: 'Ummah Cubs (Kids)', href: p(lang, '/ummah-cubs-kids-islamic-studies/'), why: 'حصص مرحة مدتها ٣٠ دقيقة: أول الحروف والقصص والسور القصيرة.' },
          { course: 'أشبال الأمة — المتعلمون الناشئون (٨–١٠)', trial: 'Ummah Cubs (Kids)', href: p(lang, '/ummah-cubs-kids-islamic-studies/'), why: 'طلاقة حقيقية في القراءة بنور البيان مع حفظ السور القصيرة.' },
          { course: 'أشبال الأمة — العلماء الصغار (١١–١٤)', trial: 'Ummah Cubs (Kids)', href: p(lang, '/ummah-cubs-kids-islamic-studies/'), why: 'مسار منظَّم يشمل أساسيات التجويد ودراسات إسلامية أعمق.' },
        ]
      : [
          { course: 'Ummah Cubs — Little Explorers (5–7)', trial: 'Ummah Cubs (Kids)', href: p(lang, '/ummah-cubs-kids-islamic-studies/'), why: 'Playful 30-minute sessions: first letters, stories and short surahs.' },
          { course: 'Ummah Cubs — Growing Learners (8–10)', trial: 'Ummah Cubs (Kids)', href: p(lang, '/ummah-cubs-kids-islamic-studies/'), why: 'Real reading fluency with Noor Al-Bayan plus short-surah memorisation.' },
          { course: 'Ummah Cubs — Junior Scholars (11–14)', trial: 'Ummah Cubs (Kids)', href: p(lang, '/ummah-cubs-kids-islamic-studies/'), why: 'A structured track with Tajweed basics and deeper Islamic studies.' },
        ];
    return tiers[a.k1 ?? 0] ?? tiers[0];
  }
  const subjects = ar ? ['العقيدة', 'الفقه', 'التفسير', 'السيرة'] : ['Aqeedah', 'Fiqh', 'Tafseer', 'Seerah'];
  const s = subjects[a.i8 ?? 0] ?? subjects[0];
  return {
    course: ar ? `الدراسات الإسلامية — ${s}` : `Islamic Studies — ${s}`,
    trial: 'Islamic Studies',
    href: p(lang, '/online-islamic-studies-classes/'),
    why: ar ? `ابدأ بـ${s} بالسرعة التي تناسب خلفيتك، في حصص فردية تتسع لأسئلتك.` : `Start with ${s}, paced to your background, taught 1-on-1 with room for your questions.`,
  };
}

const isArabicText = (s: string) => /[\u0600-\u06FF]/.test(s) && !/[a-z]/i.test(s);

export function initPlacement(): void {
  const root = document.querySelector<HTMLElement>('[data-pt]');
  const dataEl = document.getElementById('pt-data');
  if (!root || !dataEl) return;
  const tests = JSON.parse(dataEl.textContent || '[]') as TrackTest[];
  const lang = (root.dataset.lang as Lang) || 'en';
  const S = T[lang];
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
    $('[data-q-count]').textContent = S.count(state.i + 1, t.questions.length);
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
    const level = (pct < 0.4 ? 'Beginner' : pct < 0.75 ? 'Intermediate' : 'Advanced') as keyof typeof S.levels;
    const rec = recommend(t.key, pct, state.answers, lang);
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
    $('[data-r-level]').textContent = S.levelLine(S.levels[level], t.label);
    $('[data-r-headline]').textContent = S.headlines[level];
    $('[data-r-score]').textContent = S.score(percent);
    fill('[data-r-strengths]', uniq(strengths), S.noStrength);
    fill('[data-r-focus]', uniq(focus), S.noFocus);
    $('[data-r-course]').textContent = rec.course;
    $('[data-r-why]').textContent = rec.why;
    $<HTMLAnchorElement>('[data-r-link]').href = rec.href;
    const bookBase = lang === 'ar' ? '/ar/contact/' : '/contact/';
    $<HTMLAnchorElement>('[data-r-book]').href = `${bookBase}?course=${encodeURIComponent(rec.trial)}&level=${encodeURIComponent(S.levels[level])}${t.key === 'kids' ? '&learner=My%20child' : ''}#book`;
    $<HTMLAnchorElement>('[data-r-wa]').href = `https://wa.me/${wa}?text=${encodeURIComponent(S.msg(t.label, S.levels[level], percent, rec.course))}`;
    $<HTMLElement>('[data-q-bar]').style.width = '100%';
    track('placement_result', { track: t.key, level });
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
