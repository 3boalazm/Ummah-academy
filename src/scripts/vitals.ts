/**
 * Real-user Core Web Vitals → the academy portal (first-party, cookieless).
 *
 * Off unless PUBLIC_RUM_ENDPOINT is set at build time, so a default build ships
 * nothing extra. Sends one small JSON beacon per page view when the page is
 * hidden: path, language, a coarse device class, a coarse connection class and
 * up to five numbers. No cookie, no storage, no user id, no query string. It
 * respects Global Privacy Control and Do Not Track. Server side: portal/src/domain/rum.mjs.
 */
type Metrics = Partial<Record<'lcp' | 'cls' | 'inp' | 'fcp' | 'ttfb', number>>;

const endpoint = (import.meta.env.PUBLIC_RUM_ENDPOINT as string | undefined) || '';
const sample = Number(import.meta.env.PUBLIC_RUM_SAMPLE ?? 1);

function allowed(): boolean {
  if (!endpoint || import.meta.env.DEV) return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || nav.doNotTrack === '1') return false;
  if (!('PerformanceObserver' in window)) return false;
  if (document.visibilityState === 'hidden' || (document as Document & { prerendering?: boolean }).prerendering) return false;
  return Math.random() < (Number.isFinite(sample) ? sample : 1);
}

function start(): void {
  const m: Metrics = {};
  let clsValue = 0;
  let clsWindow = 0;
  let clsFirst = 0;
  let clsLast = 0;
  const interactions = new Map<number, number>();

  const observe = (type: string, cb: (entries: PerformanceEntry[]) => void, extra: Record<string, unknown> = {}) => {
    try {
      const po = new PerformanceObserver((list) => cb(list.getEntries()));
      po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    } catch {
      /* metric unsupported in this browser */
    }
  };

  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (nav && nav.responseStart > 0) m.ttfb = nav.responseStart;

  observe('paint', (entries) => {
    for (const e of entries) if (e.name === 'first-contentful-paint') m.fcp = e.startTime;
  });
  observe('largest-contentful-paint', (entries) => {
    const last = entries[entries.length - 1];
    if (last) m.lcp = last.startTime;
  });
  observe('layout-shift', (entries) => {
    for (const e of entries as unknown as Array<{ hadRecentInput: boolean; value: number; startTime: number }>) {
      if (e.hadRecentInput) continue;
      // session window: shifts less than 1s apart, window capped at 5s
      if (clsWindow && e.startTime - clsLast < 1000 && e.startTime - clsFirst < 5000) {
        clsWindow += e.value;
      } else {
        clsWindow = e.value;
        clsFirst = e.startTime;
      }
      clsLast = e.startTime;
      if (clsWindow > clsValue) clsValue = clsWindow;
      m.cls = clsValue;
    }
  });
  observe(
    'event',
    (entries) => {
      for (const e of entries as unknown as Array<{ interactionId?: number; duration: number }>) {
        if (!e.interactionId) continue;
        interactions.set(e.interactionId, Math.max(interactions.get(e.interactionId) ?? 0, e.duration));
      }
      if (interactions.size) m.inp = Math.max(...interactions.values());
    },
    { durationThreshold: 40 },
  );

  let sent = false;
  const send = () => {
    if (sent) return;
    const metrics: Metrics = {};
    for (const [k, v] of Object.entries(m)) if (typeof v === 'number' && Number.isFinite(v)) metrics[k as keyof Metrics] = k === 'cls' ? Math.round(v * 10000) / 10000 : Math.round(v);
    if (!Object.keys(metrics).length) return;
    sent = true;
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
    const body = JSON.stringify({
      path: location.pathname,
      lang: (document.documentElement.lang || 'en').slice(0, 2).toLowerCase(),
      device: matchMedia('(max-width: 767px)').matches ? 'mobile' : matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop',
      conn: !conn?.effectiveType ? 'unknown' : conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType) ? 'slow' : 'fast',
      metrics,
    });
    // text/plain keeps this a "simple" cross-origin request: no preflight, and sendBeacon can carry it.
    if (!navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'text/plain' }))) {
      void fetch(endpoint, { method: 'POST', body, keepalive: true, mode: 'cors', credentials: 'omit', headers: { 'content-type': 'text/plain' } }).catch(() => {});
    }
  };

  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') send();
  });
  addEventListener('pagehide', send);
}

if (allowed()) start();
