/**
 * header — the header bar must fit at EVERY width, in every language.
 * Five label lengths (EN/AR/DE/FR/IT) break at different widths, so sparse samples
 * miss bugs (Phase 4 lesson): we scan densely, 1 px at a time by default.
 * Checks per width: nothing overflows the bar, brand / nav / actions don't overlap,
 * the CTA stays on one line and inside the bar.
 */
import { newPage, open } from '../lib/browser.mjs';
import { PREFIX, pool } from '../lib/pages.mjs';

export function check() {
  const bar = document.querySelector('.site-header__bar');
  if (!bar) return ['no header bar'];
  const rtl = document.documentElement.dir === 'rtl';
  const b = bar.getBoundingClientRect();
  const out = [];
  const visible = (el) => el && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
  const brand = bar.querySelector('.site-header__brand');
  const nav = bar.querySelector('.nav');
  const actions = bar.querySelector('.site-header__actions');
  const cta = bar.querySelector('.site-header__cta');
  if (bar.scrollWidth > bar.clientWidth + 1) out.push(`bar scrollWidth ${bar.scrollWidth} > ${bar.clientWidth}`);
  for (const [name, el] of [['brand', brand], ['nav', nav], ['actions', actions], ['cta', cta]]) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.left < b.left - 1 || r.right > b.right + 1) out.push(`${name} outside bar [${Math.round(r.left)}–${Math.round(r.right)} vs ${Math.round(b.left)}–${Math.round(b.right)}]`);
  }
  const overlap = (a, c) => {
    const r1 = a.getBoundingClientRect();
    const r2 = c.getBoundingClientRect();
    return Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left) > 1;
  };
  if (visible(brand) && visible(actions) && overlap(brand, actions)) out.push('brand overlaps actions');
  if (visible(nav) && visible(brand) && overlap(nav, brand)) out.push('nav overlaps brand');
  if (visible(nav) && visible(actions) && overlap(nav, actions)) out.push('nav overlaps actions');
  if (visible(cta)) {
    const label = [...cta.querySelectorAll('span')].find((s) => getComputedStyle(s).display !== 'none') || cta;
    const range = document.createRange();
    range.selectNodeContents(label);
    const lines = new Set([...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top))).size;
    if (lines > 1 || cta.getBoundingClientRect().height > 48) out.push(`CTA wraps (${lines} lines, ${Math.round(cta.getBoundingClientRect().height)}px)`);
    if (cta.scrollWidth > cta.clientWidth + 1) out.push('CTA text clipped');
  }
  void rtl;
  return out;
}

export default async function header({ browser, base, opts }) {
  const min = opts.min ?? 320;
  const max = opts.max ?? 1440;
  const step = opts.step ?? 1;
  const failures = [];
  let checked = 0;
  await pool(opts.langs, opts.concurrency, async (lang) => {
    const page = await newPage(browser, { width: min, height: 800 });
    try {
      await open(page, `${base}${PREFIX[lang]}/`);
      const bad = [];
      for (let w = min; w <= max; w += step) {
        await page.setViewport({ width: w, height: 800 });
        const r = await page.evaluate(check);
        checked++;
        if (r.length) bad.push(`${w}px: ${r.join(', ')}`);
      }
      // collapse consecutive widths with the same problem into ranges
      bad.slice(0, 12).forEach((d) => failures.push({ page: `${PREFIX[lang]}/`, detail: d }));
      if (bad.length > 12) failures.push({ page: `${PREFIX[lang]}/`, detail: `… and ${bad.length - 12} more widths` });
    } finally {
      await page.close();
    }
  });
  return { checked, unit: 'layout', failures };
}
