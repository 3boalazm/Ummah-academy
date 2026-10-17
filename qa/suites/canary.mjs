/**
 * canary — proves the checks can fail. Each canary injects one known bug into a real
 * page and asserts the matching check reports it. If a refactor ever blinds a check
 * (renamed selector, wrong measurement), this suite fails instead of the QA going
 * silently green. Runs first, takes seconds.
 */
import { newPage, open, settle } from '../lib/browser.mjs';
import { measure } from './overflow.mjs';
import { check } from './header.mjs';
import { fits } from './popovers.mjs';
import { audit } from './touch.mjs';
import { axeScoped } from './axe.mjs';
import { darkContrast } from './theme.mjs';
import { auditManifest } from './pwa.mjs';
import { audit as auditText } from './typography.mjs';

const CANARIES = [
  {
    name: 'overflow sees a too-wide element',
    width: 320,
    css: '.site-footer p { width: 520px !important; max-width: none !important; }',
    run: (page) => page.evaluate(measure),
  },
  {
    name: 'header sees an action block wider than the bar',
    width: 390,
    css: '.site-header__actions { min-width: 600px !important; flex: none !important; }',
    run: (page) => page.evaluate(check),
  },
  {
    name: 'header sees an overflowing bar',
    width: 1024,
    css: '.site-header__brand { min-width: 900px !important; }',
    run: (page) => page.evaluate(check),
  },
  {
    name: 'popovers see a mega panel outside the viewport',
    width: 1024,
    css: '.mega__panel { width: 1500px !important; max-width: none !important; }',
    run: async (page) => {
      await page.click('[data-mega-toggle]');
      return page.evaluate(fits, '.mega__panel', { children: true });
    },
  },
  {
    name: 'touch sees a tiny crowded tap target',
    width: 375,
    mobile: true,
    css: '.site-header__actions { gap: 0 !important; } .menu-btn { width: 14px !important; height: 14px !important; min-width: 0 !important; min-height: 0 !important; padding: 0 !important; }',
    run: (page) => page.evaluate(audit, true),
  },
  {
    name: 'touch sees a form field iOS would zoom into',
    width: 375,
    mobile: true,
    path: '/contact/',
    css: '#bk-first, .input { font-size: 13px !important; }',
    before: (page) => page.evaluate(() => document.querySelectorAll('[data-bstep]').forEach((s) => s.classList.add('is-active'))),
    run: (page) => page.evaluate(audit, true),
  },
  {
    name: 'typography sees a paragraph with one word left on the last line',
    width: 1280,
    before: (page) =>
      page.evaluate(() => {
        const p = document.createElement('p');
        p.id = 'canary-orphan';
        p.style.cssText = 'width:190px;text-wrap:wrap;margin:12px 0';
        p.textContent = 'A deliberately narrow paragraph whose final line is guaranteed to hold only a lonely word or two';
        document.querySelector('main')?.appendChild(p);
      }),
    run: (page) => page.evaluate(auditText, 2),
  },
  {
    name: 'theme sees dark-on-dark text in dark mode',
    width: 1280,
    css: '.lead { color: #241a34 !important; }',
    before: (page) => page.evaluate(() => (document.documentElement.dataset.theme = 'dark')),
    run: (page) => darkContrast(page),
  },
  {
    name: 'offline sees a page that was never cached',
    width: 1280,
    path: '/pricing/',
    css: '',
    before: (page) => page.evaluate(() => caches.keys().then((ks) => Promise.all(ks.map((k) => caches.delete(k))))),
    run: (page) =>
      page.evaluate(async () => {
        const keys = await caches.keys();
        const hits = [];
        for (const k of keys) {
          const c = await caches.open(k);
          if (await c.match('/pricing/')) hits.push(k);
        }
        return hits.length ? [] : ['the visited page is not in any cache — an offline visit would fail'];
      }),
  },
  {
    name: 'pwa sees a broken manifest',
    width: 390,
    mobile: true,
    css: '',
    before: (page) => page.evaluate(() => (document.querySelector('link[rel="manifest"]').href = '/does-not-exist.webmanifest')),
    run: (page) => page.evaluate(auditManifest),
  },
  {
    name: 'axe sees an image without alt text',
    width: 1280,
    css: '',
    before: (page) =>
      page.evaluate(() => {
        const img = document.createElement('img');
        img.src = '/icons/icon-192.png';
        img.width = 40;
        img.height = 40;
        img.id = 'canary-img';
        document.querySelector('main').prepend(img);
      }),
    run: (page) => axeScoped(page, '#canary-img'),
  },
];

export default async function canary({ browser, base }) {
  const failures = [];
  for (const c of CANARIES) {
    const page = await newPage(browser, { width: c.width, height: 900, mobile: !!c.mobile, touch: !!c.mobile });
    try {
      await open(page, base + (c.path ?? '/'));
      await settle(page);
      if (c.css) await page.addStyleTag({ content: c.css });
      if (c.before) await c.before(page);
      const found = await c.run(page);
      if (!found.length) failures.push({ page: c.path ?? '/', detail: `blind check — ${c.name}` });
    } catch (e) {
      failures.push({ page: c.path ?? '/', detail: `${c.name}: error ${e.message}` });
    } finally {
      await page.close();
    }
  }
  return { checked: CANARIES.length, unit: 'canary', failures };
}
