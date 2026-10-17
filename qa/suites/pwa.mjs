/**
 * pwa — "install as an app" end to end.
 *  1. every page advertises the manifest (and the iOS meta tags Safari needs)
 *  2. the manifest is valid and installable: name, short_name, start_url, display,
 *     scope, colours, and real 192 / 512 / maskable icons that match their declared size
 *  3. the service worker is served, parses, and handles fetch (Chrome's installability rule)
 *  4. the pill: appears when the browser offers an install, stays inside the viewport,
 *     opens the card, and "Not now" is remembered
 *  5. an installed app never sees the pill again
 * The manifest/icon audit runs *in the page* so a canary can break the link and prove
 * the check still bites.
 */
import { newPage, open } from '../lib/browser.mjs';

/** Runs in the browser: reads <link rel=manifest>, validates it and every icon it lists. */
export function auditManifest() {
  const problems = [];
  const link = document.querySelector('link[rel="manifest"]');
  if (!link) return ['no <link rel="manifest">'];

  return fetch(link.href)
    .then(async (res) => {
      if (!res.ok) return [`${link.getAttribute('href')} → HTTP ${res.status}`];
      let m;
      try {
        m = await res.json();
      } catch {
        return [`${link.getAttribute('href')} is not valid JSON`];
      }
      if (!m.name) problems.push('manifest: no name');
      if (!m.short_name) problems.push('manifest: no short_name');
      else if (m.short_name.length > 12) problems.push(`manifest: short_name "${m.short_name}" is ${m.short_name.length} chars — launchers truncate past 12`);
      if (m.start_url !== '/') problems.push(`manifest: start_url is ${JSON.stringify(m.start_url)}, expected "/"`);
      if (!['standalone', 'fullscreen', 'minimal-ui'].includes(m.display)) problems.push(`manifest: display is ${JSON.stringify(m.display)} — it would open as a browser tab`);
      if (!m.background_color || !m.theme_color) problems.push('manifest: background_color / theme_color missing (splash + status bar fall back to white)');
      for (const shortcut of m.shortcuts ?? []) {
        const r = await fetch(new URL(shortcut.url, location.origin), { method: 'GET' });
        if (!r.ok) problems.push(`manifest: shortcut "${shortcut.name}" → ${shortcut.url} is HTTP ${r.status}`);
      }

      const icons = m.icons ?? [];
      const sizes = new Set(icons.flatMap((i) => (i.sizes ?? '').split(' ')));
      for (const need of ['192x192', '512x512']) {
        if (!sizes.has(need)) problems.push(`manifest: no ${need} icon (both are required to install)`);
      }
      if (!icons.some((i) => (i.purpose ?? 'any').split(' ').includes('maskable'))) {
        problems.push('manifest: no maskable icon — Android adaptive launchers crop the mark');
      }
      for (const icon of icons) {
        const url = new URL(icon.src, location.origin);
        const r = await fetch(url);
        if (!r.ok) {
          problems.push(`manifest: icon ${icon.src} → HTTP ${r.status}`);
          continue;
        }
        const bytes = await r.arrayBuffer();
        const kb = Math.round(bytes.byteLength / 1024);
        if (kb > 200) problems.push(`manifest: icon ${icon.src} is ${kb} KB (keep install assets light)`);
        const bmp = await createImageBitmap(new Blob([bytes]));
        const declared = (icon.sizes ?? '').split(' ')[0];
        if (declared && declared !== `${bmp.width}x${bmp.height}`) {
          problems.push(`manifest: icon ${icon.src} declares ${declared} but is ${bmp.width}x${bmp.height}`);
        }
        if ((icon.purpose ?? 'any').includes('maskable') && bmp.width < 512) {
          problems.push(`manifest: maskable icon ${icon.src} is ${bmp.width}px — maskables want 512`);
        }
        bmp.close?.();
      }
      return problems;
    })
    .catch((e) => [`manifest fetch failed: ${e.message}`]);
}

/** State of both placements: the pill in the bottom-left dock and the row in the mobile sheet. */
const pillState = () => {
  const roots = [...document.querySelectorAll('[data-install]')];
  const pick = (v) => roots.find((r) => r.dataset.installVariant === v) ?? roots[0];
  const root = pick('pill');
  const rowRoot = pick('row');
  const visibleIn = (r) => {
    if (!r) return false;
    const cs = getComputedStyle(r);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && !!r.offsetHeight;
  };
  const rowState = {
    exists: !!rowRoot,
    inSheet: !!rowRoot?.closest('[data-menu]'),
    shown: visibleIn(rowRoot),
    displayed: rowRoot ? getComputedStyle(rowRoot).display !== 'none' : false,
    label: rowRoot?.querySelector('[data-install-open]')?.textContent?.trim() ?? '',
    // expansion is per placement: each root keeps its own aria-expanded and card
    expanded: rowRoot?.querySelector('[data-install-open]')?.getAttribute('aria-expanded') ?? null,
    cardHidden: rowRoot?.querySelector('[data-install-card]')?.hidden ?? null,
    clickable: (() => {
      const b = rowRoot?.querySelector('[data-install-open]');
      if (!b) return false;
      const r = b.getBoundingClientRect();
      if (!r.width) return false;
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && (hit === b || b.contains(hit));
    })(),
  };
  const pill = root?.querySelector('[data-install-open]');
  const card = root?.querySelector('[data-install-card]');
  const r = pill?.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  return {
    visible: visibleIn(root),
    pill: r ? { x: r.x, y: r.y, w: r.width, h: r.height, inView: r.width > 0 && r.height >= 40 && r.left >= 0 && r.right <= vw + 1 && r.bottom <= vh + 1 } : null,
    pillDisplayed: root ? getComputedStyle(root).display !== 'none' : false,
    row: rowState,
    expanded: pill?.getAttribute('aria-expanded'),
    cardHidden: card?.hidden,
    dismissed: (() => {
      try {
        return localStorage.getItem('ua:install');
      } catch {
        return null;
      }
    })(),
  };
};

/** Pretend Chrome offered an install. */
const offerInstall = () => {
  const ev = new Event('beforeinstallprompt');
  ev.prompt = async () => undefined;
  ev.userChoice = Promise.resolve({ outcome: 'accepted' });
  window.dispatchEvent(ev);
};

export default async function pwa({ browser, base, pages }) {
  const failures = [];
  let checked = 0;

  /* 1 · every page advertises the app */
  for (const pg of pages) {
    if (!pg.url.endsWith('/') || pg.url.split('/').filter(Boolean).length > 1) continue; // one page per language is enough
    const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
    try {
      await open(page, base + pg.url);
      checked += 1;
      const missing = await page.evaluate(() => {
        const out = [];
        if (!document.querySelector('link[rel="manifest"]')) out.push('no manifest link');
        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) out.push('no apple-mobile-web-app-capable (iOS "Add to Home Screen" loses full screen)');
        if (!document.querySelector('link[rel="apple-touch-icon"]')) out.push('no apple-touch-icon');
        if (document.querySelectorAll('[data-install]').length < 2) out.push('install markup: expected a desktop pill and a row for the mobile sheet');
        return out;
      });
      missing.forEach((d) => failures.push({ page: pg.url, detail: d }));

      /* 2 · manifest + icons */
      for (const d of await page.evaluate(auditManifest)) failures.push({ page: pg.url, detail: d });
      checked += 1;
    } catch (e) {
      failures.push({ page: pg.url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 3 · the worker */
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    try {
      await open(page, base + '/');
      checked += 1;
      const res = await page.evaluate(async () => {
        const r = await fetch('/sw.js');
        const src = await r.text();
        return { status: r.status, type: r.headers.get('content-type'), bytes: src.length, listens: /addEventListener\(\s*['"]fetch['"]/.test(src), caches: /caches\.(open|match)/.test(src) };
      });
      if (res.status !== 200) failures.push({ page: '/sw.js', detail: `HTTP ${res.status}` });
      if (!/javascript/.test(res.type ?? '')) failures.push({ page: '/sw.js', detail: `served as ${res.type} — the browser refuses to register it` });
      if (!res.listens) failures.push({ page: '/sw.js', detail: 'no fetch handler — Chrome will not offer the install' });
      if (!res.caches) failures.push({ page: '/sw.js', detail: 'no cache usage — offline would still fail' });
    } catch (e) {
      failures.push({ page: '/sw.js', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 4 · the dock pill: always on the page (no install offer needed), inside the viewport, stacked
         under the language button, its card never covers that button, "Not now" only closes the
         card, and the whole thing goes away once the app is installed */
  {
    const page = await newPage(browser, { width: 1280, height: 900, isolated: true });
    try {
      await open(page, base + '/');
      let s = await page.evaluate(pillState);
      checked += 1;
      if (!s.visible) failures.push({ page: '/', detail: 'the install button is not on the page (it must show without any install offer)' });
      if (s.pill && !s.pill.inView) failures.push({ page: '/', detail: `pill outside the viewport / too small: ${JSON.stringify(s.pill)}` });

      // the dock: the language button sits directly above the install button, on the same edge
      const stacked = await page.evaluate(() => {
        const lang = document.querySelector('[data-dock] .langmenu__btn')?.getBoundingClientRect();
        const pill = document.querySelector('[data-dock] .install__pill')?.getBoundingClientRect();
        return lang && pill ? { above: lang.bottom <= pill.top + 1, gap: Math.round(pill.top - lang.bottom), sameEdge: Math.abs(lang.left - pill.left) < 2 } : null;
      });
      if (!stacked || !stacked.above || !stacked.sameEdge || stacked.gap > 24) failures.push({ page: '/', detail: `the language button is not stacked above the install button: ${JSON.stringify(stacked)}` });

      // no install offer yet: the card points at the browser's own menu
      await page.click('.install--pill [data-install-open]');
      s = await page.evaluate(pillState);
      if (s.expanded !== 'true' || s.cardHidden !== false) failures.push({ page: '/', detail: `tapping the pill did not open the card: ${JSON.stringify(s)}` });
      const manual = await page.evaluate(() => {
        const m = document.querySelector('.install--pill [data-install-manual]');
        return !!m && !m.hidden;
      });
      if (!manual) failures.push({ page: '/', detail: 'without an install offer the card must explain the browser-menu route' });
      const geometry = await page.evaluate(() => {
        const c = document.querySelector('.install--pill [data-install-card]').getBoundingClientRect();
        const l = document.querySelector('[data-dock] .langmenu__btn').getBoundingClientRect();
        return {
          inView: c.width > 200 && c.left >= 0 && c.right <= document.documentElement.clientWidth + 1 && c.top >= 0 && c.bottom <= document.documentElement.clientHeight + 1,
          coversLanguage: !(c.bottom <= l.top + 1 || c.top >= l.bottom - 1 || c.right <= l.left + 1 || c.left >= l.right - 1),
        };
      });
      if (!geometry.inView) failures.push({ page: '/', detail: 'the install card leaves the viewport' });
      if (geometry.coversLanguage) failures.push({ page: '/', detail: 'the open install card covers the language button' });

      // "Not now" closes the card; the button stays and nothing is remembered
      await page.click('.install--pill [data-install-manual]:not([hidden]) [data-install-dismiss]');
      s = await page.evaluate(pillState);
      if (!s.visible || s.cardHidden !== true || s.dismissed === 'dismissed') failures.push({ page: '/', detail: `"Not now" must only close the card (button stays, nothing remembered): ${JSON.stringify(s)}` });

      // the browser offers an install: the card now carries the real "Install" button
      await page.evaluate(offerInstall);
      await new Promise((r) => setTimeout(r, 150));
      await page.click('.install--pill [data-install-open]');
      const native = await page.evaluate(() => {
        const n = document.querySelector('.install--pill [data-install-native]');
        return !!n && !n.hidden;
      });
      checked += 1;
      if (!native) failures.push({ page: '/', detail: 'beforeinstallprompt fired but the card does not offer the Install button' });
      await page.keyboard.press('Escape');

      // installed: the install button goes away and the language button drops to the corner
      await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
      s = await page.evaluate(pillState);
      if (s.visible) failures.push({ page: '/', detail: 'the install button is still on the page after the app was installed' });
      const fromBottom = await page.evaluate(() => Math.round(document.documentElement.clientHeight - document.querySelector('[data-dock] .langmenu__btn').getBoundingClientRect().bottom));
      if (fromBottom > 20) failures.push({ page: '/', detail: `the language button did not drop to the corner once the install button went away (${fromBottom}px from the bottom)` });

      await open(page, base + '/pricing/');
      s = await page.evaluate(pillState);
      checked += 1;
      if (s.visible) failures.push({ page: '/pricing/', detail: 'the install button came back on the next page after the app was installed' });
    } catch (e) {
      failures.push({ page: '/', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 4b · phones: the same pill rides in the dock (above the sticky bar), and the mobile menu sheet
         carries an install row. The row must be tappable, expand in place and never overflow. */
  {
    const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true, isolated: true });
    try {
      await open(page, base + '/');
      checked += 1;
      let s = await page.evaluate(pillState);
      if (s.row.shown) failures.push({ page: '/ (phone)', detail: 'the install row shows in a closed menu sheet' });
      if (!s.visible || !s.pill?.inView) failures.push({ page: '/ (phone)', detail: `the install button is missing or off-screen on a phone: ${JSON.stringify(s.pill)}` });

      await page.click('[data-menu-open]');
      await new Promise((r) => setTimeout(r, 350));
      s = await page.evaluate(pillState);
      checked += 1;
      if (!s.row.shown) failures.push({ page: '/ (phone)', detail: 'no install row inside the mobile menu' });
      if (!s.row.inSheet) failures.push({ page: '/ (phone)', detail: 'the install row lives outside the menu sheet' });
      if (!s.row.clickable) failures.push({ page: '/ (phone)', detail: 'the install row is covered by something else — a tap would not reach it' });

      await page.click('[data-menu] [data-install-open]');
      await new Promise((r) => setTimeout(r, 200));
      s = await page.evaluate(pillState);
      if (s.row.expanded !== 'true' || s.row.cardHidden !== false) {
        failures.push({ page: '/ (phone)', detail: `tapping the row did not open the install card: ${JSON.stringify({ expanded: s.row.expanded, cardHidden: s.row.cardHidden })}` });
      }
      const inside = await page.evaluate(() => {
        const card = document.querySelector('[data-menu] [data-install-card]');
        const sheet = card.closest('.mobile-menu__sheet');
        const r = card.getBoundingClientRect();
        const sr = sheet.getBoundingClientRect();
        return { withinSheetWidth: r.left >= sr.left - 1 && r.right <= sr.right + 1, inView: r.left >= -1 && r.right <= document.documentElement.clientWidth + 1, sheetScrolls: getComputedStyle(sheet).overflowY !== 'visible' };
      });
      if (!inside.withinSheetWidth || !inside.inView) failures.push({ page: '/ (phone)', detail: `the install card overflows the sheet or the viewport: ${JSON.stringify(inside)}` });
      if (!inside.sheetScrolls) failures.push({ page: '/ (phone)', detail: 'the sheet cannot scroll with the install card open' });

      await page.click('[data-menu] [data-install-manual]:not([hidden]) [data-install-dismiss]');
      s = await page.evaluate(pillState);
      checked += 1;
      if (!s.row.shown || s.row.cardHidden !== true) failures.push({ page: '/ (phone)', detail: `"Not now" in the sheet must only close the card (row stays): ${JSON.stringify({ shown: s.row.shown, cardHidden: s.row.cardHidden })}` });
    } catch (e) {
      failures.push({ page: '/', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 5 · an installed app is never asked again (iOS reports navigator.standalone,
        Chrome/Android the display-mode media feature — neither placement may show) */
  {
    const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true, isolated: true });
    try {
      await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'standalone', { value: true, configurable: true });
      });
      await open(page, base + '/');
      await page.evaluate(offerInstall);
      await new Promise((r) => setTimeout(r, 150));
      checked += 1;
      const s = await page.evaluate(pillState);
      if (s.visible || s.row.shown) failures.push({ page: '/', detail: `the install offer shows inside the installed app (navigator.standalone): ${JSON.stringify({ pill: s.visible, row: s.row.shown })}` });
    } catch (e) {
      failures.push({ page: '/', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  return { checked, unit: 'pwa check', failures };
}
