/**
 * Ummah Academy — service worker.
 *
 * Two jobs: make the site installable (a registered worker with a fetch handler
 * is one of Chrome's installability criteria) and keep it usable offline.
 *
 *  - HTML navigations  network-first, with the cached copy as the offline fallback
 *  - /_astro/*         cache-first — content-hashed and served immutable, so a
 *                      deploy can never be masked by a stale asset
 *  - other same-origin GETs   stale-while-revalidate (images, PDFs, social cards)
 *  - /admin/*          never touched — the CMS must always talk to the network
 *
 * Bump VERSION whenever a cached response's shape changes; old caches are dropped
 * on activate. Registered from src/scripts/pwa.ts (secure contexts only, not in dev).
 */
const VERSION = 'ua-2026-10-17a';
const RUNTIME = `ua-runtime-${VERSION}`;
const MAX_CACHED_PAGES = 240;

/* Everything the installed app needs to open: the home page and its chrome. */
const SHELL = ['/', '/manifest.webmanifest', '/favicon.ico', '/apple-touch-icon.png', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME)
      // one by one: a single missing file must not fail the whole install
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => undefined))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ua-runtime-') && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never cache the CDN, WhatsApp, Google Meet…
  if (url.pathname.startsWith('/admin')) return; // the CMS editor is always live

  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, url));
    return;
  }
  event.respondWith(staleWhileRevalidate(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const fetched = fetch(request)
    .then((response) => {
      if (response.ok) put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached ?? (await fetched) ?? offlineResponse(request.url);
}

async function networkFirst(request, url) {
  try {
    const response = await fetch(request);
    if (response.ok) put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (url.pathname !== '/') {
      const home = await caches.match('/');
      if (home) return home; // offline: land on the cached home page rather than an error
    }
    return offlineResponse(url.href);
  }
}

function put(request, response) {
  caches.open(RUNTIME).then(async (cache) => {
    await cache.put(request, response);
    // keep the cache bounded: drop the oldest entries past the limit
    const keys = await cache.keys();
    if (keys.length > MAX_CACHED_PAGES) await Promise.all(keys.slice(0, keys.length - MAX_CACHED_PAGES).map((k) => cache.delete(k)));
  });
}

/** Last resort: no network and nothing cached — a tiny bilingual offline screen. */
function offlineResponse(url) {
  const html = `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#140e20"><title>Ummah Academy — offline</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;background:#140e20;color:#f4f0fb;font:16px/1.6 system-ui,sans-serif;text-align:center}
h1{font-size:1.35rem;margin:0 0 8px}p{margin:0 0 6px;color:#cec5e0}a{color:#d9bcff}</style></head>
<body><main><h1>You are offline · أنت غير متصل</h1>
<p>Reconnect to open this page. / أعد الاتصال لفتح هذه الصفحة.</p>
<p><a href="/">Home · الرئيسية</a> · <a href="${url}">Retry · إعادة المحاولة</a></p></main></body></html>`;
  return new Response(html, { status: 503, statusText: 'Offline', headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}
