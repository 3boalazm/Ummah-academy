/**
 * touch — phones and tablets, emulated (real devices are still a launch gate: docs/17).
 * Per device × key page:
 *  - tap targets ≥ 24 × 24 CSS px (WCAG 2.2 SC 2.5.8, AA) unless spaced or inline in text
 *  - form fields ≥ 16 px font size on phones, otherwise iOS Safari zooms on focus
 *  - nothing overflows the viewport
 * Plus: on a touch tablet with the desktop header, the mega menu opens and closes by tap.
 */
import { newPage, open, settle } from '../lib/browser.mjs';
import { PREFIX, pool } from '../lib/pages.mjs';

export const DEVICES = [
  { name: 'iPhone SE', width: 375, height: 667, dpr: 2, mobile: true, touch: true },
  { name: 'iPhone 15', width: 393, height: 852, dpr: 3, mobile: true, touch: true },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932, dpr: 3, mobile: true, touch: true },
  { name: 'Pixel 7', width: 412, height: 915, dpr: 2.625, mobile: true, touch: true },
  { name: 'Galaxy S8', width: 360, height: 740, dpr: 4, mobile: true, touch: true },
  { name: 'iPhone SE (landscape)', width: 667, height: 375, dpr: 2, mobile: true, touch: true },
  { name: 'iPad mini (portrait)', width: 768, height: 1024, dpr: 2, mobile: true, touch: true },
  { name: 'Galaxy Tab S8 (portrait)', width: 800, height: 1280, dpr: 2, mobile: true, touch: true },
  { name: 'iPad Air (landscape)', width: 1180, height: 820, dpr: 2, mobile: false, touch: true },
  { name: 'iPad Pro 12.9 (landscape)', width: 1366, height: 1024, dpr: 2, mobile: false, touch: true },
];

const KEY_PAGES = ['/', '/pricing/', '/contact/', '/placement-test/', '/quran-recitation-course/', '/teachers/', '/faq/'];

export function audit(isPhone) {
  const vw = document.documentElement.clientWidth;
  const out = [];
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    if (el.closest('[hidden], dialog:not([open]), details:not([open]) > :not(summary), [aria-hidden="true"], .sr-only')) return false;
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false;
    }
    return true;
  };
  const sel = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex="-1"])';
  const targets = [...document.querySelectorAll(sel)].filter(visible).map((el) => {
    // radios/checkboxes are usually visually hidden inside a big <label>: measure the label
    const box = (el.matches('input[type=radio], input[type=checkbox]') && el.closest('label')) || el;
    return { el, r: box.getBoundingClientRect() };
  });
  const isInline = (el) => {
    if (el.tagName !== 'A') return false;
    if (getComputedStyle(el).display !== 'inline') return false;
    const parent = el.parentElement;
    const text = [...parent.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join('');
    return text.length > 0; // a link inside a sentence (WCAG inline exception)
  };
  const small = [];
  for (const t of targets) {
    const { r, el } = t;
    if (r.width >= 24 && r.height >= 24) continue;
    if (isInline(el)) continue;
    // spacing exception: a 24 px circle centred on the target must not touch another target
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const crowded = targets.some((o) => {
      if (o === t || o.el.contains(el) || el.contains(o.el)) return false;
      const nx = Math.max(o.r.left, Math.min(cx, o.r.right));
      const ny = Math.max(o.r.top, Math.min(cy, o.r.bottom));
      if (Math.hypot(nx - cx, ny - cy) < 12) return true; // circle touches another target
      const oSmall = o.r.width < 24 || o.r.height < 24;
      // two undersized targets: their 24 px circles must not intersect either
      return oSmall && Math.hypot(o.r.left + o.r.width / 2 - cx, o.r.top + o.r.height / 2 - cy) < 24;
    });
    if (crowded) {
      const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 32);
      small.push(`${el.tagName.toLowerCase()} "${name}" ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  if (small.length) out.push(`tap targets under 24px: ${[...new Set(small)].slice(0, 5).join('; ')}`);
  if (isPhone) {
    const zoomers = [...document.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea')]
      .filter(visible)
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => `${el.tagName.toLowerCase()}#${el.id || el.name} ${getComputedStyle(el).fontSize}`);
    if (zoomers.length) out.push(`fields under 16px (iOS zooms on focus): ${zoomers.slice(0, 5).join(', ')}`);
  }
  const wide = [...document.body.querySelectorAll('*')].filter((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || r.right <= vw + 1) return false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).overflowX !== 'visible') return false;
    return visible(el) && !el.closest('.aurora');
  });
  if (wide.length) out.push(`overflow: ${wide[0].tagName.toLowerCase()}.${String(wide[0].className).split(' ')[0]}`);
  return out;
}

/**
 * Comfort (warning, not failure): primary controls should offer a 44 × 44 hit area
 * (Apple HIG; WCAG 2.5.5 AAA). Measured by hit-testing 22 px around the centre, so an
 * invisible hit-area extension (::after with a negative inset) counts.
 */
export function comfort() {
  const sel = 'button, summary, a.btn, select, textarea, input:not([type=hidden]):not([type=radio]):not([type=checkbox])';
  const out = [];
  for (const el of document.querySelectorAll(sel)) {
    const r0 = el.getBoundingClientRect();
    if (!r0.width || !r0.height) continue;
    if (el.closest('[hidden], dialog:not([open]), details:not([open]) > :not(summary), [aria-hidden="true"], .sr-only')) continue;
    if ([...(function* () { for (let p = el; p && p !== document.body; p = p.parentElement) yield getComputedStyle(p); })()].some((s) => s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0')) continue;
    if (r0.width >= 44 && r0.height >= 44) continue;
    if (getComputedStyle(el).position !== 'fixed' && !el.closest('.site-header')) el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const pts = [[cx, cy - 21.5], [cx, cy + 21.5], [cx - 21.5, cy], [cx + 21.5, cy]];
    const hits = pts.filter(([x, y]) => {
      const hit = document.elementFromPoint(x, y);
      return hit && (hit === el || el.contains(hit));
    }).length;
    if (hits < 4) {
      const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('name') || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      out.push(`${el.tagName.toLowerCase()} "${name}" ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  window.scrollTo(0, 0);
  return [...new Set(out)];
}

export default async function touch({ browser, base, opts }) {
  const warnings = [];
  const failures = [];
  let checked = 0;
  const jobs = DEVICES.flatMap((d) => opts.langs.flatMap((lang) => KEY_PAGES.map((p) => ({ d, url: `${PREFIX[lang]}${p}` }))));
  await pool(jobs, opts.concurrency, async ({ d, url }) => {
    const page = await newPage(browser, d);
    try {
      await open(page, base + url);
      await settle(page);
      const phone = d.mobile && d.width < 600;
      const problems = await page.evaluate(audit, phone);
      checked++;
      problems.forEach((x) => failures.push({ page: url, detail: `${d.name}: ${x}` }));
      if (phone) {
        const soft = await page.evaluate(comfort);
        if (soft.length) warnings.push({ page: url, detail: `${d.name}: under 44×44 — ${soft.join('; ')}` });
      }
    } catch (e) {
      failures.push({ page: url, detail: `${d.name}: error ${e.message}` });
    } finally {
      await page.close();
    }
  });
  // touch tablet with the desktop header: the mega menu must work by tap alone
  const tablet = DEVICES.find((d) => d.name.startsWith('iPad Pro'));
  for (const lang of opts.langs) {
    const page = await newPage(browser, tablet);
    try {
      await open(page, `${base}${PREFIX[lang]}/`);
      const hoverNone = await page.evaluate(() => matchMedia('(hover: none)').matches);
      await page.tap('[data-mega-toggle]');
      const opened = await page.evaluate(() => document.querySelector('[data-mega]').hasAttribute('data-open'));
      await page.tap('[data-mega-toggle]');
      const closedAgain = await page.evaluate(() => !document.querySelector('[data-mega]').hasAttribute('data-open'));
      checked++;
      if (!opened) failures.push({ page: `${PREFIX[lang]}/`, detail: `${tablet.name}: mega menu does not open on tap` });
      if (!closedAgain) failures.push({ page: `${PREFIX[lang]}/`, detail: `${tablet.name}: mega menu does not close on a second tap (hover:none=${hoverNone})` });
    } finally {
      await page.close();
    }
  }
  return { checked, unit: 'device×page', failures, warnings };
}
