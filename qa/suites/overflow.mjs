/**
 * overflow — nothing may stick out sideways, and no text may be cut off.
 * body has `overflow-x: clip`, so the page never scrolls sideways; content that would
 * overflow is silently cut off instead. We therefore measure boxes, not scrollWidth:
 *  1. any visible element whose box leaves the viewport and that no ancestor clips;
 *  2. any element carrying its own text whose box leaves a clipping ancestor
 *     (overflow hidden/clip — e.g. the hero and the footer panel), because that text
 *     is cut off. Scrollers (overflow auto/scroll) are legitimate and skipped.
 * Each page is loaded once and re-measured at every width (resize, no reload).
 */
import { newPage, open } from '../lib/browser.mjs';
import { pool } from '../lib/pages.mjs';

// 540/820/900/1180 were added after a 20-width sweep found a card CTA overflowing at exactly
// those widths in DE/FR/IT — the grid changes column count between the round numbers.
export const DEFAULT_WIDTHS = [320, 360, 390, 540, 768, 820, 900, 1024, 1180, 1280];

export function measure() {
  const vw = document.documentElement.clientWidth;
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    return `${el.tagName.toLowerCase()}${id}${cls}`;
  };
  const clippedByAncestor = (el) => {
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.overflowX !== 'visible' || s.overflow === 'hidden' || s.contain.includes('paint')) return true;
    }
    return false;
  };
  const hidden = (el) => {
    if (el.closest('[hidden], dialog:not([open]), details:not([open]) > :not(summary), .sr-only, .aurora')) return true;
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return true;
    }
    return false;
  };
  const offenders = [];
  for (const el of document.body.querySelectorAll('*')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.right <= vw + 1 && r.left >= -1) continue;
    if (hidden(el) || clippedByAncestor(el)) continue;
    offenders.push({ el, text: `${describe(el)} [${Math.round(r.left)}→${Math.round(r.right)} / ${vw}]` });
  }
  // report outermost offenders only
  const set = new Set(offenders.map((o) => o.el));
  const out = offenders.filter((o) => !set.has(o.el.parentElement)).slice(0, 6).map((o) => o.text);

  // 2 · text cut off by a clipping ancestor
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const clippers = [...document.body.querySelectorAll('*')].filter((c) => {
    if (c.closest('.sr-only, .aurora')) return false;
    const s = getComputedStyle(c);
    return (s.overflowX === 'hidden' || s.overflowX === 'clip') && s.textOverflow !== 'ellipsis' && !hidden(c);
  });
  const cut = new Set();
  for (const c of clippers) {
    const cr = c.getBoundingClientRect();
    if (!cr.width) continue;
    for (const el of c.querySelectorAll('*')) {
      if (cut.has(el) || !ownText(el)) continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      if (r.left >= cr.left - 1 && r.right <= cr.right + 1) continue;
      // is there a scroller between el and the clipper? then it's scrollable, not cut
      let scroller = false;
      for (let p = el.parentElement; p && p !== c; p = p.parentElement) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === 'auto' || ox === 'scroll') scroller = true;
      }
      if (scroller || hidden(el)) continue;
      cut.add(el);
      out.push(`text cut off: ${describe(el)} "${el.textContent.trim().slice(0, 30)}" [${Math.round(r.left)}→${Math.round(r.right)} in ${describe(c)} ${Math.round(cr.left)}→${Math.round(cr.right)}]`);
      if (out.length > 8) return out;
    }
  }
  return out;
}

export default async function overflow({ browser, base, pages, opts }) {
  const widths = opts.widths ?? DEFAULT_WIDTHS;
  const failures = [];
  let checked = 0;
  await pool(pages, opts.concurrency, async (pg) => {
    const page = await newPage(browser, { width: widths[0], height: 900 });
    try {
      await open(page, base + pg.url);
      for (const w of widths) {
        await page.setViewport({ width: w, height: 900 });
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        const bad = await page.evaluate(measure);
        checked++;
        if (bad.length) failures.push({ page: pg.url, detail: `@${w}px: ${bad.join(' · ')}` });
      }
    } catch (e) {
      failures.push({ page: pg.url, detail: `load error: ${e.message}` });
    } finally {
      await page.close();
    }
  });
  return { checked, unit: 'page×width', failures };
}
