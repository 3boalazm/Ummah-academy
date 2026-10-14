/**
 * Booking wizard controller.
 * - 3 steps with per-step validation, focus management and progress
 * - Prefill from ?course= ?teacher= ?plan= ?level= ?learner=
 * - Timezone detection → country guess → WhatsApp placeholder dial code
 * - Optional webhook (PUBLIC_LEAD_ENDPOINT) with first-touch attribution
 * - Honest hand-off on /thank-you/ (received vs. "send on WhatsApp")
 */
import { track } from './analytics';
import { getAttribution } from './attribution';

export const LEAD_KEY = 'ua:lead';

interface I18n {
  lang: 'en' | 'ar';
  thankYou: string;
  eFirst: string;
  eWa: string;
  eCountry: string;
  eLearner: string;
  eCourse: string;
  step: string[];
  sending: string;
  courseLabels: Record<string, string>;
  countries: { v: string; d: string; tz: string[] }[];
}

type Lead = Record<string, string>;

function message(l: Lead, i: I18n): string {
  const course = i.courseLabels[l.course] ?? l.course;
  if (i.lang === 'ar') {
    return [
      'السلام عليكم، أودّ حجز الحصتين المجانيتين في أكاديمية الأمة.',
      '',
      `الاسم: ${l.firstName}`,
      `المتعلم: ${l.learnerLabel}${l.childAge ? ` (عمر الطفل: ${l.childAge})` : ''}`,
      `الدورة: ${course}${l.level ? ` — نتيجة الاختبار: ${l.level}` : ''}`,
      l.plan ? `الخطة: ${l.plan}` : '',
      l.teacher ? `المعلم المطلوب: ${l.teacher}` : '',
      `الدولة: ${l.country}${l.timezone ? ` · التوقيت: ${l.timezone}` : ''}`,
      `المواعيد: ${l.days} · ${l.time}`,
      l.teacherGender && l.teacherGender !== 'No preference' ? `تفضيل المعلم: ${l.teacherGender === 'Female teacher' ? 'معلمة' : 'معلم'}` : '',
      l.notes ? `ملاحظات: ${l.notes}` : '',
    ]
      .filter((x, idx) => x !== '' || idx === 1)
      .join('\n');
  }
  return [
    'Assalamu alaikum! I would like to book my 2 free trial sessions with Ummah Academy.',
    '',
    `Name: ${l.firstName}`,
    `Learner: ${l.learnerLabel}${l.childAge ? ` (child aged ${l.childAge})` : ''}`,
    `Course: ${course}${l.level ? ` — placement result: ${l.level}` : ''}`,
    l.plan ? `Plan of interest: ${l.plan}` : '',
    l.teacher ? `Requested teacher: ${l.teacher}` : '',
    `Country: ${l.country}${l.timezone ? ` · Timezone: ${l.timezone}` : ''}`,
    `Schedule: ${l.days} · ${l.time}`,
    l.teacherGender && l.teacherGender !== 'No preference' ? `Teacher preference: ${l.teacherGender}` : '',
    l.notes ? `Notes: ${l.notes}` : '',
  ]
    .filter((x, idx) => x !== '' || idx === 1)
    .join('\n');
}

export function initBooking(): void {
  const form = document.querySelector<HTMLFormElement>('[data-booking]');
  const i18nEl = document.getElementById('booking-i18n');
  if (!form || !i18nEl) return;
  const i18n = JSON.parse(i18nEl.textContent || '{}') as I18n;
  const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-bstep]'));
  const label = form.querySelector<HTMLElement>('[data-step-label]');
  const bar = form.querySelector<HTMLElement>('[data-step-bar]');
  let current = 0;
  let started = false;

  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | RadioNodeList | null;
  const value = (name: string) => {
    const el = field(name);
    if (!el) return '';
    return 'value' in el ? String(el.value || '') : '';
  };

  const show = (idx: number, focus = true) => {
    current = idx;
    steps.forEach((s, i) => s.classList.toggle('is-active', i === idx));
    if (label) label.textContent = i18n.step[idx];
    if (bar) bar.style.width = `${((idx + 1) / steps.length) * 100}%`;
    if (focus) {
      steps[idx].querySelector<HTMLElement>('legend')?.focus({ preventScroll: true });
      const top = form.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  /* Prefill */
  const params = new URLSearchParams(location.search);
  const setRadio = (name: string, v: string | null) => {
    if (!v) return;
    const input = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${CSS.escape(v)}"]`);
    if (input) input.checked = true;
  };
  setRadio('course', params.get('course'));
  setRadio('learner', params.get('learner'));
  (['teacher', 'plan', 'level'] as const).forEach((k) => {
    const v = params.get(k);
    const el = form.querySelector<HTMLInputElement>(`input[type=hidden][name="${k}"]`);
    if (v && el) el.value = v.slice(0, 80);
  });
  if (params.get('course') === 'Ummah Cubs (Kids)' && !params.get('learner')) setRadio('learner', 'My child');

  /* Timezone + country guess */
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const tzInput = form.querySelector<HTMLInputElement>('input[name="timezone"]');
  if (tzInput) tzInput.value = tz;
  const tzOut = form.querySelector('[data-tz]');
  if (tzOut) tzOut.textContent = tz || '—';
  const country = form.querySelector<HTMLSelectElement>('select[name="country"]');
  const wa = form.querySelector<HTMLInputElement>('input[name="whatsapp"]');
  const guess = i18n.countries.find((c) => c.tz.includes(tz));
  if (country && guess && !country.value) country.value = guess.v;
  const syncDial = () => {
    const c = i18n.countries.find((x) => x.v === country?.value);
    if (wa && c && c.d !== '+') wa.placeholder = `${c.d} …`;
  };
  syncDial();
  country?.addEventListener('change', syncDial);

  /* Child age visibility */
  const ageBox = form.querySelector<HTMLElement>('[data-child-age]');
  const syncAge = () => {
    const v = value('learner');
    if (ageBox) ageBox.hidden = !(v === 'My child' || v === 'Me and my child(ren)');
  };
  form.querySelectorAll('input[name="learner"]').forEach((r) => r.addEventListener('change', syncAge));
  syncAge();

  form.addEventListener('input', () => {
    if (!started) {
      started = true;
      track('booking_step', { step: 1, direction: 'start' });
    }
  });

  /* Validation */
  const setInvalid = (el: HTMLInputElement | HTMLSelectElement, bad: boolean) => {
    const f = el.closest('.field');
    f?.toggleAttribute('data-invalid', bad);
    el.setAttribute('aria-invalid', String(bad));
    const err = f?.querySelector<HTMLElement>('.error');
    if (err) {
      if (!err.id) err.id = `${el.id}-err`;
      const ids = new Set((el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
      bad ? ids.add(err.id) : ids.delete(err.id);
      el.setAttribute('aria-describedby', Array.from(ids).join(' '));
    }
  };

  const validate = (idx: number): HTMLElement | null => {
    const step = steps[idx];
    if (idx === 0) {
      const noLearner = !value('learner');
      const noCourse = !value('course');
      step.toggleAttribute('data-invalid-learner', noLearner);
      step.toggleAttribute('data-invalid-course', noCourse);
      if (noLearner) return step.querySelector<HTMLElement>('input[name="learner"]');
      if (noCourse) return step.querySelector<HTMLElement>('input[name="course"]');
      return null;
    }
    if (idx === 2) {
      let first: HTMLElement | null = null;
      const fn = form.querySelector<HTMLInputElement>('#bk-first')!;
      const badName = !fn.value.trim();
      setInvalid(fn, badName);
      if (badName) first = first ?? fn;
      const c = form.querySelector<HTMLSelectElement>('#bk-country')!;
      const badC = !c.value;
      setInvalid(c, badC);
      if (badC) first = first ?? c;
      const w = form.querySelector<HTMLInputElement>('#bk-wa')!;
      const badW = w.value.replace(/\D/g, '').length < 8;
      setInvalid(w, badW);
      if (badW) first = first ?? w;
      return first;
    }
    return null;
  };

  form.querySelectorAll<HTMLButtonElement>('[data-next]').forEach((b) =>
    b.addEventListener('click', () => {
      const bad = validate(current);
      if (bad) {
        bad.focus();
        track('booking_error', { step: current + 1 });
        return;
      }
      track('booking_step', { step: current + 2, direction: 'next' });
      show(Math.min(current + 1, steps.length - 1));
    })
  );
  form.querySelectorAll<HTMLButtonElement>('[data-back]').forEach((b) =>
    b.addEventListener('click', () => {
      track('booking_step', { step: current, direction: 'back' });
      show(Math.max(current - 1, 0));
    })
  );
  form.querySelectorAll('input[name="learner"], input[name="course"]').forEach((r) =>
    r.addEventListener('change', () => {
      steps[0].removeAttribute(r.getAttribute('name') === 'learner' ? 'data-invalid-learner' : 'data-invalid-course');
    })
  );
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('#bk-first, #bk-country, #bk-wa').forEach((el) =>
    el.addEventListener('input', () => {
      if (el.closest('.field')?.hasAttribute('data-invalid')) validate(2);
    })
  );

  /* Enter key on step 1/2 advances instead of submitting */
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && current < steps.length - 1 && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      steps[current].querySelector<HTMLButtonElement>('[data-next]')?.click();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    for (let i = 0; i < steps.length; i++) {
      const bad = validate(i);
      if (bad) {
        show(i);
        bad.focus();
        return;
      }
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Lead;
    const learnerInput = form.querySelector<HTMLInputElement>('input[name="learner"]:checked');
    data.learnerLabel =
      i18n.lang === 'ar' ? learnerInput?.closest('label')?.querySelector('.choice__box span')?.firstChild?.textContent?.trim() || data.learner : data.learner;
    data.source = location.pathname;
    data.lang = i18n.lang;
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = i18n.sending;
    }

    let received = false;
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, attribution: getAttribution(), submitted_at: new Date().toISOString() }),
        });
        received = res.ok;
      } catch {
        received = false;
      }
    }
    track('booking_submit', { course: data.course, learner: data.learner, received });
    sessionStorage.setItem(LEAD_KEY, JSON.stringify({ firstName: data.firstName, received, message: message(data, i18n) }));
    location.href = i18n.thankYou;
  });

  /* Deep link straight to step 3 if everything for step 1 is prefilled? Keep step 1 visible for confirmation. */
  show(0, false);
}
