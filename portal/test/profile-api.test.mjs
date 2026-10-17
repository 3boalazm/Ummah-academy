import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

let child;
let base;
let temp;
let output = '';
const SITE = 'http://localhost:4321';

async function freePort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  return port;
}

async function request(route, { method = 'GET', cookie, body, headers = {}, raw = false } = {}) {
  const h = { ...headers };
  if (cookie) h.cookie = cookie;
  if ((method === 'POST' || method === 'PATCH') && !raw) {
    h['content-type'] = 'application/json';
    h['x-ua-request'] = '1';
  }
  const response = await fetch(base + route, {
    method,
    headers: h,
    body: body === undefined || method === 'GET' ? undefined : raw ? body : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, headers: response.headers, data };
}

async function login(email, password) {
  const r = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.headers.get('set-cookie').split(';')[0];
}

before(async () => {
  temp = await mkdtemp(path.join(os.tmpdir(), 'ummah-portal-profile-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['portal/src/server.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORTAL_PORT: String(port), PORTAL_DATA: path.join(temp, 'store.json'), PORTAL_SECRET: 'test-only-secret-not-for-production', PORTAL_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (b) => { output += b.toString(); });
  child.stderr.on('data', (b) => { output += b.toString(); });
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`portal exited early: ${output}`);
    try { if ((await fetch(base + '/api/health')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`portal did not become ready: ${output}`);
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([once(child, 'exit'), new Promise((r) => setTimeout(r, 2000))]);
  }
  if (temp) await rm(temp, { recursive: true, force: true });
});

test('profile endpoints return the signed-in person and never a password hash', async () => {
  const cookie = await login('fatima.rahman@example.com', 'Sakinah-Family-2026');
  const r = await request('/api/profile', { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.data.account.role, 'guardian');
  assert.equal(r.data.children.length, 2);
  assert.equal(JSON.stringify(r.data).includes('scrypt$'), false);
  const patched = await request('/api/profile', { method: 'PATCH', cookie, body: { locale: 'en' } });
  assert.equal(patched.status, 200);
  const refused = await request('/api/profile', { method: 'PATCH', cookie, body: { role: 'admin' } });
  assert.equal(refused.status, 400);
  const again = await request('/api/profile', { cookie });
  assert.equal(again.data.account.role, 'guardian');
  assert.equal(again.data.account.locale, 'en');
});

test('changing the password signs out the old cookie and keeps the new one', async () => {
  const old = await login('sarah.mansouri@example.com', 'Sakinah-Family-2026');
  const weak = await request('/api/profile/password', { method: 'POST', cookie: old, body: { current: 'Sakinah-Family-2026', next: 'short' } });
  assert.equal(weak.status, 400);
  const ok = await request('/api/profile/password', { method: 'POST', cookie: old, body: { current: 'Sakinah-Family-2026', next: 'A-brand-new-passphrase-31' } });
  assert.equal(ok.status, 200, JSON.stringify(ok.data));
  const fresh = ok.headers.get('set-cookie').split(';')[0];
  assert.notEqual(fresh, old);
  assert.equal((await request('/api/profile', { cookie: old })).status, 401, 'older session must stop working');
  assert.equal((await request('/api/profile', { cookie: fresh })).status, 200);
  const relogin = await request('/api/auth/login', { method: 'POST', body: { email: 'sarah.mansouri@example.com', password: 'A-brand-new-passphrase-31' } });
  assert.equal(relogin.status, 200);
});

test('learning profile respects family boundaries over HTTP', async () => {
  const cookie = await login('fatima.rahman@example.com', 'Sakinah-Family-2026');
  assert.equal((await request('/api/students/stu_yusuf/learning', { cookie })).status, 200);
  const other = await request('/api/students/stu_adam/learning', { cookie });
  assert.ok([403, 404].includes(other.status), `got ${other.status}`);
});

test('the performance beacon only accepts the marketing site origin and stores no identifiers', async () => {
  const good = { path: '/pricing/?x=1', lang: 'en', device: 'mobile', conn: 'fast', metrics: { lcp: 1700, cls: 0.01, inp: 90, fcp: 800, ttfb: 250 } };
  const denied = await request('/api/rum', { method: 'POST', raw: true, body: JSON.stringify(good), headers: { origin: 'https://evil.example', 'content-type': 'text/plain' } });
  assert.equal(denied.status, 403);
  const noOrigin = await request('/api/rum', { method: 'POST', raw: true, body: JSON.stringify(good), headers: { 'content-type': 'text/plain' } });
  assert.equal(noOrigin.status, 403);

  const pre = await request('/api/rum', { method: 'OPTIONS', headers: { origin: SITE, 'access-control-request-method': 'POST' } });
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('access-control-allow-origin'), SITE);

  // sendBeacon sends text/plain and cannot add the CSRF header; that is why this route is special.
  const sent = await request('/api/rum', { method: 'POST', raw: true, body: JSON.stringify(good), headers: { origin: SITE, 'content-type': 'text/plain;charset=UTF-8' } });
  assert.equal(sent.status, 204);
  assert.equal(sent.headers.get('access-control-allow-origin'), SITE);
  const junk = await request('/api/rum', { method: 'POST', raw: true, body: '{not json', headers: { origin: SITE, 'content-type': 'text/plain' } });
  assert.equal(junk.status, 204, 'bad beacons are dropped silently');
  const huge = await request('/api/rum', { method: 'POST', raw: true, body: JSON.stringify({ ...good, pad: 'x'.repeat(5000) }), headers: { origin: SITE, 'content-type': 'text/plain' } });
  assert.equal(huge.status, 413, 'oversized beacons are refused before they are read');

  const staff = await login('admin@ummahacademy.net', 'Sakinah-Admin-2026');
  const report = await request('/api/performance?range=7', { cookie: staff });
  assert.equal(report.status, 200);
  assert.equal(report.data.views, 1);
  assert.equal(report.data.pages[0].path, '/pricing/');
  assert.equal(report.data.byDevice.mobile.views, 1);
  assert.equal(JSON.stringify(report.data).includes('x=1'), false);

  // the aggregate reaches disk within a few seconds, without waiting for shutdown
  const file = path.join(temp, 'rum.json');
  const deadline = Date.now() + 9000;
  while (!existsSync(file) && Date.now() < deadline) await new Promise((r) => setTimeout(r, 250));
  assert.ok(existsSync(file), 'rum.json should be written shortly after a beacon');
  assert.equal(readFileSync(file, 'utf8').includes('x=1'), false);
});

test('only staff can read the performance report', async () => {
  for (const [email, password] of [
    ['fatima.rahman@example.com', 'Sakinah-Family-2026'],
    ['omneya@ummahacademy.net', 'Sakinah-Teach-2026'],
    ['omar.mansouri@example.com', 'Sakinah-Student-2026'],
  ]) {
    const cookie = await login(email, password);
    assert.equal((await request('/api/performance', { cookie })).status, 403, email);
  }
  const ops = await login('ops@ummahacademy.net', 'Sakinah-Ops-2026');
  assert.equal((await request('/api/performance', { cookie: ops })).status, 200);
});
