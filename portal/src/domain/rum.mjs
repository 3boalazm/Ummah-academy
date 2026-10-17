/**
 * Real-user performance profiling for the marketing site (Core Web Vitals).
 *
 * Privacy: the browser sends five numbers plus a page path, a language and a
 * coarse device/connection class. No cookie, no IP, no user agent, no query
 * string, no identifier of any kind is stored. Aggregates are histograms per
 * day, so there is nothing to join back to a person.
 *
 * This module is independent from the domain store on purpose: a beacon per page
 * view must not rewrite the whole academy state file.
 */
import fs from 'node:fs';
import path from 'node:path';

export const METRICS = Object.freeze({
  // [good ≤, poor >] follow web.dev thresholds. Values: ms, except cls (unitless).
  lcp: { good: 2500, poor: 4000, max: 60000, bounds: [500, 1000, 1500, 2000, 2500, 3000, 4000, 6000, 10000] },
  inp: { good: 200, poor: 500, max: 30000, bounds: [50, 100, 150, 200, 300, 500, 800, 1500, 3000] },
  cls: { good: 0.1, poor: 0.25, max: 10, bounds: [0.01, 0.025, 0.05, 0.1, 0.15, 0.25, 0.4, 0.7, 1.5] },
  fcp: { good: 1800, poor: 3000, max: 60000, bounds: [400, 800, 1200, 1800, 2400, 3000, 4500, 7000, 12000] },
  ttfb: { good: 800, poor: 1800, max: 60000, bounds: [100, 200, 400, 600, 800, 1200, 1800, 3000, 6000] },
});

export const LANGS = new Set(['en', 'ar', 'de', 'fr', 'it']);
export const DEVICES = new Set(['mobile', 'tablet', 'desktop']);
export const CONNECTIONS = new Set(['slow', 'fast', 'unknown']);
const KEEP_DAYS = 30;
const MAX_KEYS_PER_DAY = 600;
const PATH_RE = /^\/[a-z0-9\-_/%.]{0,198}$/i;

const emptyHist = (metric) => ({ n: 0, sum: 0, bins: new Array(METRICS[metric].bounds.length + 1).fill(0) });

function binIndex(metric, value) {
  const { bounds } = METRICS[metric];
  const i = bounds.findIndex((b) => value <= b);
  return i === -1 ? bounds.length : i;
}

/** Percentile from a histogram, linearly interpolated inside the bin. */
export function percentile(metric, hist, p) {
  if (!hist || !hist.n) return null;
  const { bounds } = METRICS[metric];
  const target = hist.n * p;
  let seen = 0;
  for (let i = 0; i < hist.bins.length; i++) {
    const c = hist.bins[i];
    if (seen + c >= target && c > 0) {
      const lo = i === 0 ? 0 : bounds[i - 1];
      const hi = i < bounds.length ? bounds[i] : bounds[bounds.length - 1] * 1.5;
      const frac = (target - seen) / c;
      return lo + (hi - lo) * Math.min(1, Math.max(0, frac));
    }
    seen += c;
  }
  return bounds[bounds.length - 1];
}

function share(metric, hist) {
  if (!hist?.n) return null;
  const { bounds, good, poor } = METRICS[metric];
  let g = 0;
  let b = 0;
  hist.bins.forEach((c, i) => {
    const upper = i < bounds.length ? bounds[i] : Infinity;
    if (upper <= good) g += c;
    else if (i === 0 ? false : bounds[i - 1] >= poor) b += c;
  });
  return { good: g / hist.n, poor: b / hist.n, needsImprovement: 1 - (g + b) / hist.n };
}

/** Normalise a path: no query, no hash, collapse duplicate slashes, drop trailing file noise. */
export function normalisePath(raw) {
  if (typeof raw !== 'string') return null;
  const clean = raw.split(/[?#]/)[0].replace(/\/{2,}/g, '/');
  if (!PATH_RE.test(clean)) return null;
  return clean.length > 1 ? clean.replace(/\/+$/, '') + '/' : '/';
}

export function validateBeacon(body) {
  if (!body || typeof body !== 'object') return null;
  const p = normalisePath(body.path);
  if (!p) return null;
  const lang = LANGS.has(body.lang) ? body.lang : null;
  if (!lang) return null;
  const device = DEVICES.has(body.device) ? body.device : 'desktop';
  const conn = CONNECTIONS.has(body.conn) ? body.conn : 'unknown';
  const metrics = {};
  for (const name of Object.keys(METRICS)) {
    const v = body.metrics?.[name];
    if (v === undefined || v === null) continue;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > METRICS[name].max) continue;
    metrics[name] = v;
  }
  if (!Object.keys(metrics).length) return null;
  return { path: p, lang, device, conn, metrics };
}

export function createRum({ file = null, clock = () => new Date() } = {}) {
  let days = {};
  let dirty = false;

  if (file && fs.existsSync(file)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (parsed && typeof parsed.days === 'object') days = parsed.days;
    } catch {
      days = {};
    }
  }

  const today = () => clock().toISOString().slice(0, 10);

  function prune() {
    const keys = Object.keys(days).sort();
    while (keys.length > KEEP_DAYS) delete days[keys.shift()];
  }

  function record(beacon) {
    const clean = validateBeacon(beacon);
    if (!clean) return false;
    const day = (days[today()] ??= {});
    const key = `${clean.path}|${clean.lang}|${clean.device}|${clean.conn}`;
    if (!day[key] && Object.keys(day).length >= MAX_KEYS_PER_DAY) return false;
    const row = (day[key] ??= { views: 0, m: {} });
    row.views += 1;
    for (const [name, value] of Object.entries(clean.metrics)) {
      const h = (row.m[name] ??= emptyHist(name));
      h.n += 1;
      h.sum += value;
      h.bins[binIndex(name, value)] += 1;
    }
    dirty = true;
    return true;
  }

  function merge(rows) {
    const total = { views: 0, m: {} };
    for (const row of rows) {
      total.views += row.views;
      for (const [name, h] of Object.entries(row.m)) {
        const t = (total.m[name] ??= emptyHist(name));
        t.n += h.n;
        t.sum += h.sum;
        h.bins.forEach((c, i) => { t.bins[i] += c; });
      }
    }
    return total;
  }

  const summarise = (agg) => {
    const out = {};
    for (const name of Object.keys(METRICS)) {
      const h = agg.m[name];
      out[name] = h?.n
        ? { samples: h.n, p50: percentile(name, h, 0.5), p75: percentile(name, h, 0.75), p95: percentile(name, h, 0.95), ...share(name, h) }
        : null;
    }
    return out;
  };

  function report({ range = 7 } = {}) {
    const span = Math.min(Math.max(Number(range) || 7, 1), KEEP_DAYS);
    const keys = Object.keys(days).sort().slice(-span);
    const rows = keys.flatMap((d) => Object.entries(days[d]).map(([k, v]) => ({ day: d, key: k, ...v })));
    const parse = (r) => { const [p, lang, device, conn] = r.key.split('|'); return { path: p, lang, device, conn }; };

    const by = (pick) => {
      const groups = new Map();
      for (const r of rows) {
        const g = pick(parse(r));
        (groups.get(g) ?? groups.set(g, []).get(g)).push(r);
      }
      return groups;
    };

    const pages = [...by((r) => r.path)].map(([p, list]) => {
      const agg = merge(list);
      return { path: p, views: agg.views, ...summarise(agg) };
    }).sort((a, b) => b.views - a.views);

    const slice = (pick) => Object.fromEntries([...by(pick)].map(([k, list]) => {
      const agg = merge(list);
      return [k, { views: agg.views, ...summarise(agg) }];
    }));

    const daily = keys.map((d) => {
      const agg = merge(Object.values(days[d]));
      return { day: d, views: agg.views, lcp: summarise(agg).lcp?.p75 ?? null, inp: summarise(agg).inp?.p75 ?? null, cls: summarise(agg).cls?.p75 ?? null };
    });

    const all = merge(rows);
    const worst = pages
      .filter((p) => p.views >= 5 && p.lcp)
      .sort((a, b) => b.lcp.p75 - a.lcp.p75)
      .slice(0, 5)
      .map((p) => ({ path: p.path, views: p.views, lcpP75: p.lcp.p75 }));

    return {
      rangeDays: span,
      from: keys[0] ?? null,
      to: keys.at(-1) ?? null,
      views: all.views,
      overall: summarise(all),
      byLang: slice((r) => r.lang),
      byDevice: slice((r) => r.device),
      byConnection: slice((r) => r.conn),
      pages: pages.slice(0, 40),
      worst,
      daily,
      thresholds: Object.fromEntries(Object.entries(METRICS).map(([k, v]) => [k, { good: v.good, poor: v.poor }])),
    };
  }

  function flush() {
    if (!file || !dirty) return false;
    prune();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify({ version: 1, days }));
    fs.renameSync(tmp, file);
    dirty = false;
    return true;
  }

  return { record, report, flush, _days: () => days };
}
