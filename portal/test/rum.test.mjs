import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { createRum, normalisePath, percentile, validateBeacon } from '../src/domain/rum.mjs';

const clockAt = (iso) => () => new Date(iso);
const beacon = (over = {}) => ({ path: '/pricing/', lang: 'en', device: 'mobile', conn: 'fast', metrics: { lcp: 1800, cls: 0.02, inp: 120, fcp: 900, ttfb: 300 }, ...over });

test('paths are normalised and anything that looks like a query, token or script is dropped', () => {
  assert.equal(normalisePath('/pricing?utm_source=x#top'), '/pricing/');
  assert.equal(normalisePath('//de//pricing//'), '/de/pricing/');
  assert.equal(normalisePath('/'), '/');
  assert.equal(normalisePath('/a b'), null);
  assert.equal(normalisePath('https://evil.example/'), null);
  assert.equal(normalisePath('/<script>'), null);
  assert.equal(normalisePath('x'.repeat(300)), null);
});

test('a beacon needs a page, a known language and at least one sane metric', () => {
  assert.ok(validateBeacon(beacon()));
  assert.equal(validateBeacon(beacon({ lang: 'xx' })), null);
  assert.equal(validateBeacon(beacon({ path: 'nope' })), null);
  assert.equal(validateBeacon(beacon({ metrics: {} })), null);
  assert.equal(validateBeacon(beacon({ metrics: { lcp: -5 } })), null);
  assert.equal(validateBeacon(beacon({ metrics: { lcp: 'fast' } })), null);
  assert.equal(validateBeacon(beacon({ metrics: { lcp: 999999999 } })), null);
  assert.equal(validateBeacon(null), null);
  const clean = validateBeacon(beacon({ extra: 'x', userAgent: 'Mozilla', ip: '1.2.3.4', metrics: { lcp: 1000, bogus: 5 } }));
  assert.deepEqual(Object.keys(clean).sort(), ['conn', 'device', 'lang', 'metrics', 'path']);
  assert.deepEqual(Object.keys(clean.metrics), ['lcp']);
  assert.equal(validateBeacon(beacon({ device: 'tv', conn: 'weird' })).device, 'desktop');
});

test('what is stored holds numbers only: no ip, agent, query or identifier', () => {
  const rum = createRum({ clock: clockAt('2026-10-17T10:00:00Z') });
  rum.record(beacon({ path: '/pricing/?email=a@b.c', ip: '9.9.9.9', userAgent: 'UA', id: 'abc' }));
  const text = JSON.stringify(rum._days());
  assert.equal(/9\.9\.9\.9|UA|abc|email|a@b/.test(text), false);
});

test('percentiles come from the histogram and land in the right bin', () => {
  const rum = createRum({ clock: clockAt('2026-10-17T10:00:00Z') });
  for (let i = 0; i < 80; i++) rum.record(beacon({ metrics: { lcp: 1200 } }));
  for (let i = 0; i < 20; i++) rum.record(beacon({ metrics: { lcp: 5000 } }));
  const r = rum.report();
  assert.equal(r.views, 100);
  assert.ok(r.overall.lcp.p50 > 1000 && r.overall.lcp.p50 <= 1500, `p50 ${r.overall.lcp.p50}`);
  assert.ok(r.overall.lcp.p95 > 4000 && r.overall.lcp.p95 <= 6000, `p95 ${r.overall.lcp.p95}`);
  assert.ok(Math.abs(r.overall.lcp.good - 0.8) < 1e-9);
  assert.ok(Math.abs(r.overall.lcp.poor - 0.2) < 1e-9);
  assert.equal(percentile('lcp', { n: 0, bins: [] }, 0.75), null);
});

test('the report slices by page, language, device and connection and names the slowest pages', () => {
  const rum = createRum({ clock: clockAt('2026-10-17T10:00:00Z') });
  for (let i = 0; i < 6; i++) rum.record(beacon({ path: '/', lang: 'en', device: 'desktop', metrics: { lcp: 900 } }));
  for (let i = 0; i < 6; i++) rum.record(beacon({ path: '/ar/blog/', lang: 'ar', device: 'mobile', conn: 'slow', metrics: { lcp: 7000 } }));
  const r = rum.report();
  assert.equal(r.pages[0].views, 6);
  assert.equal(r.byLang.ar.views, 6);
  assert.equal(r.byDevice.desktop.views, 6);
  assert.equal(r.byConnection.slow.views, 6);
  assert.equal(r.worst[0].path, '/ar/blog/');
  assert.equal(r.daily.length, 1);
});

test('a flood of distinct paths cannot grow a day without limit', () => {
  const rum = createRum({ clock: clockAt('2026-10-17T10:00:00Z') });
  let accepted = 0;
  for (let i = 0; i < 2000; i++) if (rum.record(beacon({ path: `/p${i}/` }))) accepted += 1;
  assert.equal(accepted, 600);
  assert.equal(rum.record(beacon({ path: '/p1/' })), true, 'existing keys keep counting');
});

test('data survives a restart and old days are pruned to thirty', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rum-'));
  const file = path.join(dir, 'rum.json');
  let now = new Date('2026-08-01T10:00:00Z');
  const rum = createRum({ file, clock: () => now });
  for (let d = 0; d < 40; d++) {
    now = new Date(Date.UTC(2026, 7, 1 + d, 10));
    rum.record(beacon());
  }
  assert.equal(rum.flush(), true);
  assert.equal(rum.flush(), false, 'nothing new to write');
  const again = createRum({ file, clock: () => now });
  assert.equal(Object.keys(again._days()).length, 30);
  assert.equal(again.report({ range: 7 }).daily.length, 7);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a corrupt data file starts empty instead of crashing the portal', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rum-'));
  const file = path.join(dir, 'rum.json');
  fs.writeFileSync(file, '{not json');
  const rum = createRum({ file });
  assert.equal(rum.report().views, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});
