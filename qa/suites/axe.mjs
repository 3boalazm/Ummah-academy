/**
 * axe — WCAG 2.2 AA (+ axe best practices) on every page.
 * Motion is frozen and reveal-on-scroll content is shown first, otherwise colour-contrast
 * is measured mid-transition (Phase 3 lesson).
 */
import { createRequire } from 'node:module';
import { newPage, open, settle } from '../lib/browser.mjs';
import { pool } from '../lib/pages.mjs';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');

const OPTIONS = {
  runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
  resultTypes: ['violations'],
};

const format = (violations) =>
  violations.map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes[0]?.target?.join(' ')} — ${v.help}`);

async function inject(page) {
  const has = await page.evaluate(() => typeof window.axe !== 'undefined');
  if (!has) await page.addScriptTag({ path: AXE_PATH });
}

/** axe on one part of the page (an open popover). Returns problem strings. */
export async function axeScoped(page, selector) {
  await inject(page);
  const res = await page.evaluate((sel, options) => window.axe.run({ include: [sel] }, options), selector, OPTIONS);
  return format(res.violations);
}

export default async function axe({ browser, base, pages, opts }) {
  const failures = [];
  const width = opts.widths?.[0] ?? 1280;
  await pool(pages, opts.concurrency, async (pg) => {
    const page = await newPage(browser, { width, height: 900 });
    try {
      await open(page, base + pg.url);
      await settle(page);
      await inject(page);
      const res = await page.evaluate((options) => window.axe.run(document, options), OPTIONS);
      format(res.violations).forEach((d) => failures.push({ page: pg.url, detail: d }));
    } catch (e) {
      failures.push({ page: pg.url, detail: `axe error: ${e.message}` });
    } finally {
      await page.close();
    }
  });
  return { checked: pages.length, unit: 'page', failures };
}
