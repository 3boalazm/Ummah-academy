/**
 * theme — the light ⇄ dark switch, and what dark mode is worth.
 *  1. the OS preference is honoured before the visitor ever touches the switch
 *  2. the header switch flips the theme, remembers it, and the choice survives navigation
 *  3. phones (the bar has no room for a fifth control) get the labelled row in the sheet
 *  4. dark is legible: axe colour-contrast on the pages with the most surfaces
 *  5. dark does not move the layout: nothing overflows at 320 / 768 / 1280
 */
import { createRequire } from 'node:module';
import { newPage, open, settle } from '../lib/browser.mjs';
import { pool, PREFIX } from '../lib/pages.mjs';
import { measure } from './overflow.mjs';
import { fits } from './popovers.mjs';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core/axe.min.js');

/** Pages that carry the most surfaces: glass, forms, tables, cards, night panels. */
const CONTRAST_PAGES = ['/', '/pricing/', '/contact/', '/teachers/', '/placement-test/', '/faq/', '/about/', '/blog/', '/family-portal/', '/resources/'];
const WIDTHS = [320, 390, 768, 1024, 1440];

const state = () => ({
  theme: document.documentElement.dataset.theme,
  stored: (() => {
    try {
      return localStorage.getItem('ua:theme');
    } catch {
      return null;
    }
  })(),
  meta: document.querySelector('meta[name="theme-color"]')?.content,
  colorScheme: getComputedStyle(document.documentElement).colorScheme,
});

/** Contrast only — the one axe rule a theme swap can break (full axe runs in `axe`). */
export async function darkContrast(page) {
  const has = await page.evaluate(() => typeof window.axe !== 'undefined');
  if (!has) await page.addScriptTag({ path: AXE_PATH });
  const res = await page.evaluate(() =>
    window.axe.run(document, {
      runOnly: { type: 'rule', values: ['color-contrast'] },
      resultTypes: ['violations'],
    })
  );
  return res.violations.flatMap((v) => v.nodes.slice(0, 3).map((n) => `${v.id}: ${n.target.join(' ')} — ${n.any?.[0]?.message ?? n.failureSummary ?? ''}`));
}

export default async function theme({ browser, base, opts }) {
  const failures = [];
  let checked = 0;

  /* 1 · the OS preference decides when nothing was chosen yet */
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await open(page, base + '/');
    checked += 1;
    const s = await page.evaluate(state);
    if (s.theme !== 'dark') failures.push({ page: '/', detail: `prefers-color-scheme: dark → data-theme is "${s.theme}", expected "dark"` });
    if (!s.colorScheme.includes('dark')) failures.push({ page: '/', detail: `color-scheme is "${s.colorScheme}" in dark mode (form controls and scrollbars stay light)` });
    await page.close();
  }

  /* 2 · the switch: flip, remember, keep across a navigation, flip back */
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    await open(page, base + '/');
    const toggle = '.site-header__actions [data-theme-toggle]';
    await page.click(toggle);
    checked += 1;
    let s = await page.evaluate(state);
    if (s.theme !== 'dark') failures.push({ page: '/', detail: `toggle → data-theme is "${s.theme}", expected "dark"` });
    if (s.stored !== 'dark') failures.push({ page: '/', detail: `toggle → localStorage ua:theme is ${JSON.stringify(s.stored)}, expected "dark"` });
    if (s.meta !== '#140e20') failures.push({ page: '/', detail: `toggle → theme-color meta is ${JSON.stringify(s.meta)}, expected "#140e20" (browser chrome stays light)` });
    const label = await page.$eval(toggle, (el) => el.getAttribute('aria-label'));
    if (!/light|hell|clair|chiaro|الفاتح/i.test(label ?? '')) failures.push({ page: '/', detail: `in dark mode the switch is still labelled ${JSON.stringify(label)} — it must describe the action it performs` });

    await page.click(`${toggle}`);
    s = await page.evaluate(state);
    if (s.theme !== 'light' || s.stored !== 'light') failures.push({ page: '/', detail: `second click → ${JSON.stringify(s)}, expected light/light` });

    // the choice outlives the page
    await page.click(toggle);
    await open(page, base + '/pricing/');
    s = await page.evaluate(state);
    checked += 1;
    if (s.theme !== 'dark') failures.push({ page: '/pricing/', detail: `navigating with ua:theme=dark → data-theme is "${s.theme}"` });
    await page.close();
  }

  /* 3 · phones: the row in the mobile sheet (the bar hides the switch below 860px) */
  for (const lang of opts.langs) {
    const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true, isolated: true });
    const url = PREFIX[lang] + '/';
    try {
      await open(page, base + url);
      // start from a known theme: the previous section may have left one in storage
      await page.evaluate(() => {
        document.documentElement.dataset.theme = 'light';
        try { localStorage.setItem('ua:theme', 'light'); } catch { /* ignore */ }
      });
      checked += 1;
      /* On a phone the switch has to be *visible and tappable in the bar*: a control nobody
         finds does not exist. The labelled row stays in the sheet as the second way in. */
      const bar = await page.evaluate(() => {
        const el = document.querySelector('.site-header__actions [data-theme-toggle]');
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const hit = r.width ? document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) : null;
        return { display: cs.display, w: Math.round(r.width), h: Math.round(r.height), clickable: !!hit && (hit === el || el.contains(hit)) };
      });
      if (!bar || bar.display === 'none') failures.push({ page: url, detail: 'no theme switch in the header bar on a phone' });
      else {
        if (bar.w < 40 || bar.h < 40) failures.push({ page: url, detail: `the phone switch is ${bar.w}x${bar.h} — under the 40px the other bar buttons use` });
        if (!bar.clickable) failures.push({ page: url, detail: 'the phone switch is covered by something else — a thumb cannot reach it' });
        await page.click('.site-header__actions [data-theme-toggle]');
        let s = await page.evaluate(state);
        if (s.theme !== 'dark') failures.push({ page: url, detail: `bar switch on a phone → data-theme is "${s.theme}", expected "dark"` });
        await page.click('.site-header__actions [data-theme-toggle]');
        s = await page.evaluate(state);
        if (s.theme !== 'light') failures.push({ page: url, detail: `second tap on the phone switch → "${s.theme}", expected "light"` });
      }

      await page.click('[data-menu-open]');
      await page.waitForSelector('[data-menu][open]');
      const row = await page.$('.mobile-menu [data-theme-toggle]');
      if (!row) {
        failures.push({ page: url, detail: 'no labelled theme row in the mobile sheet' });
      } else {
        await row.click();
        const s = await page.evaluate(state);
        if (s.theme !== 'dark') failures.push({ page: url, detail: `sheet row → data-theme is "${s.theme}", expected "dark"` });
      }
    } catch (e) {
      failures.push({ page: url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 4 · the surfaces that only exist while open: mega menu, language menu, mobile sheet */
  {
    const cases = [
      { name: 'mega menu', width: 1280, sel: '.mega__panel', open: async (page) => page.click('[data-mega-toggle]') },
      { name: 'language menu', width: 1280, sel: '.langmenu__panel', open: async (page) => page.click('[data-langmenu] summary') },
      { name: 'language sheet', width: 390, mobile: true, tall: true, sel: '.langchips', open: async (page) => page.click('[data-menu-open]') },
      { name: 'mobile menu', width: 390, mobile: true, tall: true, sel: '.mobile-menu__sheet', open: async (page) => page.click('[data-menu-open]') },
    ];
    for (const c of cases) {
      if (opts.only && !opts.only.some((o) => '/'.includes(o) || c.name.includes(o))) continue;
      const page = await newPage(browser, { width: c.width, height: c.mobile ? 844 : 900, mobile: !!c.mobile, touch: !!c.mobile });
      try {
        await open(page, base + '/pricing/');
        await settle(page);
        await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
        await c.open(page);
        await new Promise((r) => setTimeout(r, 350));
        checked += 1;
        for (const d of await page.evaluate(fits, c.sel, { children: true, tall: !!c.tall })) failures.push({ page: `/pricing/ · dark ${c.name}`, detail: d });
        for (const d of await darkContrast(page)) failures.push({ page: `/pricing/ · dark ${c.name}`, detail: d });
        if (c.tall) {
          // the sheet is allowed to be taller than the screen — but then it must scroll
          const scroll = await page.evaluate(() => {
            const sheet = document.querySelector('.mobile-menu__sheet');
            const box = sheet.closest('dialog') ?? sheet;
            const style = getComputedStyle(box);
            return { content: sheet.scrollHeight, box: box.clientHeight, overflowY: style.overflowY };
          });
          if (scroll.content > scroll.box + 2 && !['auto', 'scroll'].includes(scroll.overflowY)) {
            failures.push({ page: `/pricing/ · dark ${c.name}`, detail: `the sheet needs ${scroll.content}px in a ${scroll.box}px container but does not scroll (overflow-y: ${scroll.overflowY})` });
          }
        }
      } catch (e) {
        failures.push({ page: `/pricing/ · dark ${c.name}`, detail: `error: ${e.message}` });
      } finally {
        await page.close();
      }
    }
  }

  /* 5 + 6 · dark is legible and does not move the layout */
  const jobs = [];
  for (const lang of opts.langs) {
    for (const p of CONTRAST_PAGES) {
      jobs.push({ url: PREFIX[lang] + p });
    }
  }
  const wanted = jobs.filter((j) => !opts.only || opts.only.some((o) => j.url.includes(o)));
  await pool(wanted, opts.concurrency, async (job) => {
    const page = await newPage(browser, { width: 1280, height: 900 });
    try {
      await open(page, base + job.url);
      await settle(page);
      await page.evaluate(() => {
        document.documentElement.dataset.theme = 'dark';
        try {
          localStorage.setItem('ua:theme', 'dark');
        } catch {
          /* ignore */
        }
      });
      checked += 1;
      for (const d of await darkContrast(page)) failures.push({ page: job.url, detail: `dark · ${d}` });
      for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: 900 });
        for (const o of await page.evaluate(measure)) failures.push({ page: job.url, detail: `dark ${w}px · ${o}` });
      }
    } catch (e) {
      failures.push({ page: job.url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  });

  return { checked, unit: 'theme check', failures };
}
