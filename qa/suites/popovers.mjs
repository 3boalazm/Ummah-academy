/**
 * popovers — everything that opens must fit and be accessible OPEN.
 * Phase 4 lesson: the mega-menu bug existed since v2 and every closed-state sweep missed it.
 *  - mega menu (≥ 860 px): panel inside the viewport, every child inside the panel, titles not clipped
 *  - language menu: header popover (≥ 860 px) and the bottom sheet below that
 *  - mobile menu <dialog>
 *  - language hint: shown in the visitor's language, inside the viewport
 * Each open state is also scanned with axe (scoped to the popover).
 */
import { newPage, open, settle } from '../lib/browser.mjs';
import { PREFIX } from '../lib/pages.mjs';
import { axeScoped } from './axe.mjs';

const MEGA_WIDTHS = [860, 900, 980, 1024, 1100, 1180, 1280, 1366, 1440];
const LANGMENU_WIDTHS = [320, 390, 768, 860, 1280];

export function fits(sel, { children = false } = {}) {
  const el = document.querySelector(sel);
  if (!el) return [`${sel} missing`];
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const r = el.getBoundingClientRect();
  const out = [];
  if (!r.width || !r.height) out.push(`${sel} not visible`);
  if (r.left < -1 || r.right > vw + 1) out.push(`${sel} outside viewport [${Math.round(r.left)}–${Math.round(r.right)} / ${vw}]`);
  if (r.bottom > vh + 1 && getComputedStyle(el).overflowY === 'visible') out.push(`${sel} taller than viewport and not scrollable`);
  if (children) {
    for (const c of el.querySelectorAll('*')) {
      const cr = c.getBoundingClientRect();
      if (!cr.width || !cr.height) continue;
      if (cr.left < r.left - 1 || cr.right > r.right + 1) {
        out.push(`child ${c.tagName.toLowerCase()}.${String(c.className).split(' ')[0]} outside ${sel}`);
        break;
      }
    }
    for (const t of el.querySelectorAll('.mega__title, .mega__from, .langmenu__name')) {
      if (t.scrollWidth > t.clientWidth + 1) {
        out.push(`clipped text: "${t.textContent.trim().slice(0, 40)}"`);
        break;
      }
    }
  }
  return out;
}

export default async function popovers({ browser, base, opts }) {
  const failures = [];
  let checked = 0;
  const record = (page, state, problems) => {
    checked++;
    problems.forEach((p) => failures.push({ page, detail: `${state}: ${p}` }));
  };

  for (const lang of opts.langs) {
    const url = `${base}${PREFIX[lang]}/`;
    const label = `${PREFIX[lang]}/`;

    // 1 · mega menu, opened by click (works for touch too)
    {
      const page = await newPage(browser, { width: 1280 });
      await open(page, url);
      await settle(page);
      for (const w of MEGA_WIDTHS) {
        await page.setViewport({ width: w, height: 900 });
        await page.evaluate(() => {
          const item = document.querySelector('[data-mega]');
          if (item && !item.hasAttribute('data-open')) item.querySelector('[data-mega-toggle]').click();
        });
        record(label, `mega @${w}`, await page.evaluate(fits, '.mega__panel', { children: true }));
      }
      const expanded = await page.evaluate(() => document.querySelector('[data-mega-toggle]').getAttribute('aria-expanded'));
      if (expanded !== 'true') record(label, 'mega', ['aria-expanded is not "true" when open']);
      record(label, 'mega axe', await axeScoped(page, '.mega'));
      // closes on Escape and on outside click
      await page.keyboard.press('Escape');
      await page.evaluate(() => document.querySelector('[data-mega-toggle]').focus());
      await page.click('[data-mega-toggle]');
      await page.mouse.click(5, 600);
      const stillOpen = await page.evaluate(() => document.querySelector('[data-mega]').hasAttribute('data-open'));
      record(label, 'mega', stillOpen ? ['does not close on outside click'] : []);
      await page.close();
    }

    // 2 · language menu: popover (≥ 860) / sheet (< 860)
    {
      const page = await newPage(browser, { width: 1280 });
      await open(page, url);
      await settle(page);
      for (const w of LANGMENU_WIDTHS) {
        await page.setViewport({ width: w, height: 800 });
        await page.evaluate(() => {
          const d = document.querySelector('.site-header [data-langmenu]');
          if (d) d.open = true;
        });
        const visibleMenu = await page.evaluate(() => {
          const d = document.querySelector('.site-header [data-langmenu]');
          return d && getComputedStyle(d).display !== 'none';
        });
        if (!visibleMenu) continue;
        record(label, `language menu @${w}`, await page.evaluate(fits, '.site-header [data-langmenu] .langmenu__panel', { children: true }));
        const count = await page.evaluate(() => document.querySelectorAll('.site-header [data-langmenu] [data-lang-choice]').length);
        if (count !== 5) record(label, `language menu @${w}`, [`${count} languages listed, expected 5`]);
      }
      record(label, 'language menu axe', await axeScoped(page, '.site-header [data-langmenu]'));
      await page.close();
    }

    // 3 · mobile menu dialog
    {
      const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
      await open(page, url);
      await settle(page);
      await page.click('[data-menu-open]');
      const isOpen = await page.evaluate(() => document.querySelector('[data-menu]')?.open === true);
      record(label, 'mobile menu', isOpen ? [] : ['dialog did not open']);
      if (isOpen) {
        record(label, 'mobile menu @390', await page.evaluate(fits, '.mobile-menu__sheet'));
        record(label, 'mobile menu axe', await axeScoped(page, '[data-menu]'));
        await page.keyboard.press('Escape');
        const closed = await page.evaluate(() => document.querySelector('[data-menu]')?.open === false);
        record(label, 'mobile menu', closed ? [] : ['Escape does not close the dialog']);
      }
      await page.close();
    }

    // 4 · language hint, offered in another language than the page's
    {
      const visitor = lang === 'de' ? 'fr-FR' : 'de-DE';
      for (const w of [320, 390, 1280]) {
        const page = await newPage(browser, { width: w, height: 800, hint: true, languages: [visitor, 'en'], isolated: true });
        await open(page, url);
        await page.waitForSelector('[data-lang-hint]:not([hidden])', { timeout: 4000 }).catch(() => null);
        await settle(page);
        const info = await page.evaluate(() => {
          const h = document.querySelector('[data-lang-hint]');
          return h && !h.hidden ? { lang: h.lang, text: h.textContent.trim().slice(0, 60) } : null;
        });
        if (!info) record(label, `language hint @${w}`, ['hint did not appear']);
        else {
          record(label, `language hint @${w}`, await page.evaluate(fits, '[data-lang-hint]'));
          if (info.lang !== visitor.slice(0, 2)) record(label, `language hint @${w}`, [`hint lang=${info.lang}, expected ${visitor.slice(0, 2)}`]);
          if (w === 1280) record(label, 'language hint axe', await axeScoped(page, '[data-lang-hint]'));
        }
        await page.close();
      }
    }
  }
  return { checked, unit: 'open state', failures };
}
