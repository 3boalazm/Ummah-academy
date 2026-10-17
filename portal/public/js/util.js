import { STR } from './i18n.js';

export const state = {
  me: null,
  lang: document.documentElement.lang === 'en' ? 'en' : 'ar',
  theme: document.documentElement.dataset.theme || 'light',
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo',
  hiddenWidgets: [],
  collapsedNav: false,
  helpOpen: false,
  screenOpen: false,
};

export function t(key) {
  const row = STR[key];
  if (!row) return key;
  return state.lang === 'ar' ? row[0] : row[1];
}

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function nm(row) {
  if (!row) return '—';
  if (state.lang === 'ar') return row.nameAr || row.titleAr || row.name || row.title || '—';
  return row.name || row.title || row.nameAr || row.titleAr || '—';
}

export function tx(row, key) {
  if (!row) return '';
  if (state.lang === 'ar') return row[`${key}Ar`] || row[key] || '';
  return row[key] || row[`${key}Ar`] || '';
}

export function num(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(state.lang === 'ar' ? 'ar-EG' : 'en-GB').format(value);
}

export function fmt(iso, tz = state.tz) {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(state.lang === 'ar' ? 'ar-EG' : 'en-GB', {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function dayKey(iso, tz = state.tz) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}

export function chip(status) {
  if (!status) return '';
  const key = `st_${status}`;
  return `<span class="chip ${esc(status)}">${esc(STR[key] ? t(key) : status)}</span>`;
}

export function errText(error) {
  const body = error?.data?.error;
  if (!body) return error?.message || t('fail');
  return state.lang === 'ar' ? body.messageAr || body.message : body.message;
}

export async function api(method, url, body, opts = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'content-type': 'application/json' } : {}),
      'x-ua-request': '1',
      ...(opts.idempotencyKey ? { 'idempotency-key': opts.idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error?.message || res.statusText);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export function toast(message) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.getElementById('toasts').append(el);
  setTimeout(() => el.remove(), 4200);
}

export function tzOffset(instant, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = Object.fromEntries(dtf.formatToParts(instant).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]));
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - instant.getTime();
}

export function localToIso(value, timeZone) {
  if (!value) return null;
  const [d, tm] = value.split('T');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = tm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, day, h, min, 0);
  let utc = guess;
  for (let i = 0; i < 3; i++) utc = guess - tzOffset(new Date(utc), timeZone);
  return new Date(utc).toISOString();
}

export function money(amount) {
  if (amount === null || amount === undefined) return t('priceHidden');
  return new Intl.NumberFormat(state.lang === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export function initials(row) {
  const name = nm(row);
  return name.replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 1) || '•';
}
