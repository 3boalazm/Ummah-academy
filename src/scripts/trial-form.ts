/**
 * Trial request form.
 * 1. Validates the 5 required fields with inline, accessible errors.
 * 2. Optionally POSTs JSON to PUBLIC_LEAD_ENDPOINT (CRM / Google Sheets / Zapier).
 * 3. Hands off to WhatsApp with a pre-filled summary via the /thank-you/ page,
 *    which is explicit about whether the request has already been received.
 */
import { track } from './analytics';

export const LEAD_KEY = 'ua:lead';

export interface Lead {
  firstName: string;
  lastName?: string;
  whatsapp: string;
  email?: string;
  country: string;
  ageGroup: string;
  course: string;
  teacherGender?: string;
  days?: string;
  time?: string;
  notes?: string;
  teacher?: string;
  plan?: string;
  timezone?: string;
  level?: string;
  source?: string;
}

export function leadMessage(l: Lead): string {
  const lines = [
    'Assalamu alaikum! I would like to book my 2 free trial sessions with Ummah Academy.',
    '',
    `Name: ${[l.firstName, l.lastName].filter(Boolean).join(' ')}`,
    `Course: ${l.course}${l.level ? ` (placement: ${l.level})` : ''}`,
    l.plan ? `Plan of interest: ${l.plan}` : '',
    `Learner: ${l.ageGroup}`,
    `Country: ${l.country}${l.timezone ? ` · Timezone: ${l.timezone}` : ''}`,
    l.teacher ? `Requested teacher: ${l.teacher}` : '',
    l.teacherGender && l.teacherGender !== 'No preference' ? `Teacher preference: ${l.teacherGender}` : '',
    l.days || l.time ? `Schedule: ${[l.days, l.time].filter(Boolean).join(' · ')}` : '',
    l.notes ? `Notes: ${l.notes}` : '',
  ];
  return lines.filter((x, i) => x !== '' || i === 1).join('\n');
}

export function initTrialForm(): void {
  const form = document.querySelector<HTMLFormElement>('[data-trial-form]');
  if (!form) return;
  const required = Array.from(form.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-req]'));
  const bar = form.querySelector<HTMLElement>('[data-progress-bar]');
  const text = form.querySelector<HTMLElement>('[data-progress-text]');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const params = new URLSearchParams(location.search);

  // Prefill from links like /contact/?course=Tajweed%20Rules&teacher=Omneya%20Ali&plan=Gold
  const set = (name: string, value: string | null) => {
    if (!value) return;
    const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
    if (!el) return;
    if (el instanceof HTMLSelectElement) {
      const match = Array.from(el.options).find((o) => o.value.toLowerCase() === value.toLowerCase());
      if (match) el.value = match.value;
    } else el.value = value;
  };
  set('course', params.get('course'));
  set('teacher', params.get('teacher'));
  set('plan', params.get('plan'));
  set('timezone', tz);
  const tzEl = form.querySelector('[data-tz]');
  if (tzEl) tzEl.textContent = tz || 'auto-detected';

  const isValid = (el: HTMLInputElement | HTMLSelectElement) => {
    const v = el.value.trim();
    if (!v) return false;
    if (el.name === 'whatsapp') return v.replace(/[^\d]/g, '').length >= 8;
    return true;
  };

  const update = () => {
    const done = required.filter(isValid).length;
    if (bar) bar.style.width = `${(done / required.length) * 100}%`;
    if (text) text.textContent = `${done} of ${required.length} completed`;
  };

  const showError = (el: HTMLInputElement | HTMLSelectElement, on: boolean) => {
    const field = el.closest('.field');
    field?.toggleAttribute('data-invalid', on);
    el.setAttribute('aria-invalid', String(on));
    const err = field?.querySelector<HTMLElement>('.error');
    if (err) {
      if (!err.id) err.id = `${el.id}-err`;
      const ids = new Set((el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean));
      on ? ids.add(err.id) : ids.delete(err.id);
      el.setAttribute('aria-describedby', Array.from(ids).join(' '));
    }
  };

  let started = false;
  required.forEach((el) => {
    el.addEventListener('input', () => {
      if (!started) {
        started = true;
        track('trial_form_start');
      }
      if (el.closest('.field')?.hasAttribute('data-invalid')) showError(el, !isValid(el));
      update();
    });
    el.addEventListener('change', update);
    el.addEventListener('blur', () => el.value && showError(el, !isValid(el)));
  });
  update();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = required.filter((el) => !isValid(el));
    required.forEach((el) => showError(el, !isValid(el)));
    if (invalid.length) {
      invalid[0].focus();
      track('trial_form_error', { fields: invalid.map((i) => i.name).join(',') });
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as unknown as Lead;
    data.source = location.pathname;
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.label = btn.innerHTML;
      btn.textContent = 'Preparing your request…';
    }

    let received = false;
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        received = res.ok;
      } catch {
        received = false;
      }
    }

    track('trial_form_submit', { course: data.course, age_group: data.ageGroup, received });
    sessionStorage.setItem(LEAD_KEY, JSON.stringify({ lead: data, received, message: leadMessage(data) }));
    location.href = '/thank-you/';
  });
}
