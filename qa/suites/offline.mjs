/**
 * offline — the installed app keeps working without a network.
 * Service workers need a secure context; browsers treat 127.0.0.1 as one, which is exactly
 * how the QA server serves `dist/`. What is proved here:
 *  1. the worker registers on first load and controls the page after a navigation
 *  2. a visited page and the stylesheet are in the cache (an offline page must be styled)
 *  3. with the network cut, an already visited page still opens with its real content
 *  4. with the network cut, an unvisited URL still lands on a real page — not the browser's
 *     error page — while /admin/* is never answered from the cache
 *  5. the network coming back restores normal behaviour (the worker is not a trap)
 */
import { newPage, open } from '../lib/browser.mjs';

/** Which caches hold each of these URLs (runs in the page). */
const cacheHits = async (urls) => {
  const keys = await caches.keys();
  const out = {};
  for (const url of urls) {
    out[url] = [];
    for (const k of keys) {
      const cache = await caches.open(k);
      if (await cache.match(url)) out[url].push(k);
    }
  }
  return out;
};

export default async function offline({ browser, base }) {
  const failures = [];
  let checked = 0;
  const page = await newPage(browser, { width: 1280, height: 900 });

  try {
    /* 1 · register, then navigate once so the worker controls the page */
    await open(page, base + '/');
    const ready = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return { supported: false };
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      return { supported: true, scope: reg?.scope ?? null, script: reg?.active?.scriptURL ?? null };
    });
    checked += 1;
    if (!ready.supported) {
      failures.push({ page: '/', detail: 'serviceWorker is unavailable in this Chrome — the suite cannot run' });
      return { checked, unit: 'offline check', failures };
    }
    if (!ready.script) failures.push({ page: '/', detail: `the service worker never became active (registration: ${JSON.stringify(ready)})` });

    const homeTitle = await page.title();
    await open(page, base + '/pricing/');
    const pricingTitle = await page.title();
    checked += 1;
    if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) {
      failures.push({ page: '/pricing/', detail: 'the page is not controlled by the service worker after a navigation' });
    }

    /* 2 · what actually got cached */
    await new Promise((r) => setTimeout(r, 500));
    const sheet = await page.evaluate(() => document.querySelector('link[rel="stylesheet"]')?.href ?? null);
    const hits = await page.evaluate(cacheHits, [base + '/', base + '/pricing/', sheet].filter(Boolean));
    checked += 1;
    if (!hits[base + '/']?.length) failures.push({ page: '/', detail: 'the home page was not cached (the app shell is what an installed app opens)' });
    if (!hits[base + '/pricing/']?.length) failures.push({ page: '/pricing/', detail: 'a visited page was not cached — offline navigation would fail' });
    if (sheet && !hits[sheet]?.length) failures.push({ page: '/pricing/', detail: 'the stylesheet was not cached — an offline page would render unstyled' });

    /* 3 · offline: a visited page still opens with its own content */
    await page.setOfflineMode(true);
    const res = await page.goto(base + '/pricing/', { waitUntil: 'load' }).catch(() => null);
    const offlineTitle = await page.title();
    checked += 1;
    if (!res) failures.push({ page: '/pricing/ (offline)', detail: 'navigation failed offline' });
    else if (offlineTitle !== pricingTitle) failures.push({ page: '/pricing/ (offline)', detail: `offline title is "${offlineTitle}", expected "${pricingTitle}"` });

    /* 4 · offline: an unvisited URL, and the CMS */
    const fallback = await page.goto(base + '/some-unvisited-page/', { waitUntil: 'load' }).catch(() => null);
    checked += 1;
    if (!fallback) failures.push({ page: '/some-unvisited-page/ (offline)', detail: 'no response offline' });
    else {
      const body = await page.evaluate(() => document.body.innerText);
      if (!body.trim()) failures.push({ page: '/some-unvisited-page/ (offline)', detail: 'the offline fallback rendered an empty page' });
      else if (!/Ummah Academy/.test(body)) failures.push({ page: '/some-unvisited-page/ (offline)', detail: `the offline fallback is not a real page: "${body.slice(0, 80)}"` });
    }
    if (homeTitle && !offlineTitle) failures.push({ page: '/ (offline)', detail: 'the home page has no title offline' });

    const admin = await page.goto(base + '/admin/', { waitUntil: 'domcontentloaded' }).catch(() => null);
    checked += 1;
    if (admin && /offline/i.test(await page.title())) {
      failures.push({ page: '/admin/ (offline)', detail: 'the CMS was answered by the offline fallback — /admin must never be cached or replaced' });
    }

    /* 5 · back online */
    await page.setOfflineMode(false);
    const fresh = await page.goto(base + '/', { waitUntil: 'load' }).catch(() => null);
    checked += 1;
    if (!fresh || !fresh.ok()) failures.push({ page: '/ (back online)', detail: 'the site did not recover after the network came back' });
    else if ((await page.title()) !== homeTitle) failures.push({ page: '/ (back online)', detail: 'the home page came back wrong' });
  } catch (e) {
    failures.push({ page: '/', detail: `error: ${e.message}` });
  } finally {
    await page.close();
  }

  return { checked, unit: 'offline check', failures };
}
