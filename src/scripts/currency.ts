/**
 * Display-currency switch. Reads [data-usd] amounts (always US dollars) and
 * rewrites them. Choice lives in localStorage (`ua:fx`). Charging stays USD.
 */
import { convertUsd, formatFx, FX, FX_KEY, isFx, type FxCode } from '@/data/fx';

const lang = (): 'en' | 'ar' | 'de' | 'fr' | 'it' => {
  const l = document.documentElement.lang;
  return l === 'ar' || l === 'de' || l === 'fr' || l === 'it' ? l : 'en';
};

const read = (): FxCode => {
  try {
    const v = localStorage.getItem(FX_KEY);
    if (isFx(v)) return v;
  } catch {
    /* private mode */
  }
  return 'USD';
};

const write = (code: FxCode) => {
  try {
    localStorage.setItem(FX_KEY, code);
  } catch {
    /* private mode */
  }
};

const paint = (code: FxCode) => {
  const pageLang = lang();
  document.querySelectorAll<HTMLElement>('[data-usd]').forEach((el) => {
    const usd = Number(el.dataset.usd);
    if (!Number.isFinite(usd)) return;
    el.textContent = formatFx(pageLang, code, convertUsd(usd, code));
  });
  document.querySelectorAll<HTMLElement>('[data-fx-code]').forEach((el) => {
    const on = el.dataset.fxCode === code;
    el.classList.toggle('is-current', on);
    if (el instanceof HTMLButtonElement) el.setAttribute('aria-pressed', String(on));
  });
  document.querySelectorAll('[data-fx-current]').forEach((el) => {
    el.textContent = FX.find((c) => c.code === code)?.short ?? 'USD';
  });
  document.documentElement.dataset.fx = code;
};

paint(read());

document.querySelectorAll<HTMLButtonElement>('[data-fx-code]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const code = btn.dataset.fxCode;
    if (!isFx(code)) return;
    write(code);
    paint(code);
    const details = btn.closest('details');
    if (details) details.open = false;
  });
});
