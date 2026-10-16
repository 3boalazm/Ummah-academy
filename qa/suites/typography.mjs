/**
 * typography — the shape of wrapped text, not its spelling.
 *
 * A paragraph that wraps should fill its box evenly: no stub of one or two words left alone on
 * the last line. `text-wrap: balance` does that, and it is what the design system asks for on
 * every text block up to six lines (the engine's own limit; long-form prose opts into `pretty`).
 * Losing the rule is invisible in every other suite — the page still passes axe, still fits, and
 * simply looks worse — so it gets its own check. Blog and legal prose are excluded: they opt into
 * `pretty`, which prevents an orphan word but leaves the lines ragged, and past six lines the
 * engine refuses to balance at all.
 *
 * How it measures: the line count comes from the element's height over its line-height, and the
 * last line's width from the last line box of a Range over the element's contents. Blocks whose
 * children are not plain inline text (cards, badges, flex rows) are skipped: their boxes are not
 * text lines.
 */
import { newPage, open, settle } from '../lib/browser.mjs';
import { PREFIX, pool } from '../lib/pages.mjs';

/** Text blocks whose last line is a stub (runs in the page). */
export function audit(minLines = 2) {
  const problems = [];
  const range = document.createRange();
  for (const el of document.querySelectorAll('p, li, blockquote, figcaption, dd')) {
    if (el.closest('.sr-only, [hidden], nav, header, footer, [data-install], dialog')) continue;
    // Long-form prose deliberately opts into `pretty` (no orphan word) instead of balancing:
    // past six lines the engine stops balancing, and that is most of an article body.
    if (el.closest('.prose, .legal')) continue;
    const cs = getComputedStyle(el);
    if (!['block', 'inline-block', 'list-item'].includes(cs.display)) continue;
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.whiteSpace === 'nowrap') continue;
    if (cs.textAlign === 'center') continue; // centred copy is balanced by the layout instead
    let plain = true;
    for (const c of el.children) {
      const ccs = getComputedStyle(c);
      if (!(ccs.display === 'inline' || ccs.display === 'inline-block') || ccs.position === 'absolute') plain = false;
    }
    if (!plain) continue;
    const text = (el.textContent || '').trim();
    if (text.length < 60) continue;
    const box = el.getBoundingClientRect();
    if (box.width < 140) continue;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
    const lines = Math.round(box.height / lh);
    if (lines < minLines || lines > 6) continue; // balancing only applies up to six lines
    range.selectNodeContents(el);
    const rects = [...range.getClientRects()].filter((r) => r.width > 1 && r.height > 3);
    if (!rects.length) continue;
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const last = rects.filter((r) => bottom - r.bottom < lh * 0.7);
    const lastWidth = Math.max(...last.map((r) => r.right)) - Math.min(...last.map((r) => r.left));
    const content = box.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const fill = lastWidth / content;
    const allowed = lines === 2 ? 0.45 : 0.4;
    if (fill < allowed) {
      problems.push({
        sel: `${el.tagName.toLowerCase()}${typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/)[0] : ''}`,
        detail: `${lines} lines in ${Math.round(content)}px, last one only ${Math.round(fill * 100)}% full (min ${Math.round(allowed * 100)}%) — “${text.replace(/\s+/g, ' ').slice(0, 44)}…”`,
      });
    }
  }
  return problems.slice(0, 6);
}

export default async function typography({ browser, base, pages, opts }) {
  const failures = [];
  let checked = 0;

  await pool(pages, opts.concurrency, async (pg) => {
    const page = await newPage(browser, { width: 1280, height: 900 });
    try {
      await open(page, base + pg.url);
      await settle(page);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < Math.min(height, 14000); y += 800) {
        await page.evaluate((t) => window.scrollTo(0, t), y);
        await new Promise((r) => setTimeout(r, 60));
        checked += 1;
        for (const d of await page.evaluate(audit, 2)) failures.push({ page: pg.url, detail: `${d.sel}: ${d.detail}` });
      }
    } catch (e) {
      failures.push({ page: pg.url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  });

  /* Phones are where a stub last line shows most: narrow column, long words. */
  for (const lang of opts.langs) {
    const url = PREFIX[lang] + '/';
    const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
    try {
      await open(page, base + url);
      await settle(page);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < Math.min(height, 12000); y += 800) {
        await page.evaluate((t) => window.scrollTo(0, t), y);
        await new Promise((r) => setTimeout(r, 60));
        checked += 1;
        for (const d of await page.evaluate(audit, 2)) failures.push({ page: `${url} · 390px`, detail: `${d.sel}: ${d.detail}` });
      }
    } catch (e) {
      failures.push({ page: url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  return { checked, unit: 'text block', failures };
}
