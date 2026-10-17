import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

let child;
let base;
let temp;
let cookie;
let output = '';
let password;

async function freePort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  return port;
}

before(async () => {
  temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-prod-'));
  const data = path.join(temp, 'store.json');
  const cred = path.join(temp, 'creds.txt');
  const made = spawnSync(process.execPath, ['portal/scripts/provision.mjs', '--out', data, '--credentials', cred], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(made.status, 0, made.stderr);
  const text = fs.readFileSync(cred, 'utf8');
  password = /Admin password: (\S+)/.exec(text)[1];
  const secret = /PORTAL_SECRET[^:]*: ([0-9a-f]{64})/.exec(text)[1];
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['portal/src/server.mjs'], {
    cwd: process.cwd(),
    // PORT (not PORTAL_PORT) is what shared Node hosts inject; the portal must honour it.
    env: { ...process.env, PORT: String(port), PORTAL_DATA: data, PORTAL_SECRET: secret, PORTAL_ENV: 'production', PORTAL_TRUST_PROXY: '1', PORTAL_RUM_ORIGINS: 'https://ummahacademy.net' },
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
  if (temp) fs.rmSync(temp, { recursive: true, force: true });
});

const get = async (route) => {
  const r = await fetch(base + route, { headers: cookie ? { cookie } : {} });
  const text = await r.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: r.status, data, headers: r.headers };
};

test('production mode is ready, not demo, and hides the demo banner flag', async () => {
  const ready = await get('/api/ready');
  assert.equal(ready.status, 200, JSON.stringify(ready.data));
  assert.equal(ready.data.mode, 'production');
  const health = await get('/api/health');
  assert.equal(health.data.demo, false);
});

test('the admin signs in with the generated password and the session cookie is Secure', async () => {
  const bad = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-ua-request': '1' }, body: JSON.stringify({ email: 'admin@ummahacademy.net', password: 'Sakinah-Admin-2026' }) });
  assert.equal(bad.status, 401);
  const ok = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-ua-request': '1' }, body: JSON.stringify({ email: 'admin@ummahacademy.net', password }) });
  assert.equal(ok.status, 200);
  const set = ok.headers.get('set-cookie');
  assert.match(set, /Secure/);
  assert.match(set, /HttpOnly/);
  cookie = set.split(';')[0];
  const me = await get('/api/me');
  assert.equal(me.data.demo, false);
});

test('every read screen works on a completely empty academy', async () => {
  const routes = [
    '/api/dashboard', '/api/console?view=workspace', '/api/console?view=academic', '/api/console?view=admissions', '/api/console?view=placements',
    '/api/console?view=website', '/api/console?view=governance', '/api/console?view=assets', '/api/console?view=people', '/api/console?view=settings',
    '/api/console?view=stack', '/api/students', '/api/families', '/api/teachers', '/api/sessions', '/api/subscriptions',
    '/api/follow-ups', '/api/audit', '/api/integrity', '/api/acceptance', '/api/notifications', '/api/catalog', '/api/outbox', '/api/invoices',
    '/api/profile', '/api/performance', '/api/search?q=a', '/api/homework',
  ];
  for (const route of routes) {
    const r = await get(route);
    assert.equal(r.status, 200, `${route} → ${r.status} ${JSON.stringify(r.data).slice(0, 160)}`);
  }
  const profile = await get('/api/profile');
  assert.equal(profile.data.account.role, 'admin');
  assert.equal(JSON.stringify(profile.data).includes('scrypt$'), false);
});

test('the demo reset is not available and the beacon only accepts the configured site', async () => {
  const reset = await fetch(base + '/api/admin/reset-demo', { method: 'POST', headers: { cookie, 'x-ua-request': '1', 'content-type': 'application/json' }, body: '{}' });
  assert.notEqual(reset.status, 200, 'resetting must not wipe a production store');
  const body = JSON.stringify({ path: '/', lang: 'en', device: 'desktop', conn: 'fast', metrics: { lcp: 1200 } });
  const local = await fetch(base + '/api/rum', { method: 'POST', headers: { origin: 'http://localhost:4321', 'content-type': 'text/plain' }, body });
  assert.equal(local.status, 403, 'localhost origins are for development only');
  const site = await fetch(base + '/api/rum', { method: 'POST', headers: { origin: 'https://ummahacademy.net', 'content-type': 'text/plain' }, body });
  assert.equal(site.status, 204);
});

test('behind the proxy, rate limits count each visitor separately, not the proxy as one client', async () => {
  const attempt = (ip) => fetch(base + '/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-ua-request': '1', 'x-forwarded-for': `spoofed, ${ip}` }, body: JSON.stringify({ email: 'nobody@example.com', password: 'wrong-password-123' }) });
  // 24 different visitors, one wrong attempt each: nobody is blocked
  for (let i = 0; i < 24; i++) assert.equal((await attempt(`10.0.0.${i + 1}`)).status, 401);
  // one visitor hammering is blocked after the limit
  let blocked = 0;
  for (let i = 0; i < 25; i++) if ((await attempt(`10.9.9.9`)).status === 429) blocked += 1;
  assert.ok(blocked >= 1, 'a single address must still be rate limited');
});

test('production responses carry strict security headers, and the beacon route keeps its own CORS', async () => {
  for (const route of ['/login', '/api/health', '/app.css']) {
    const r = await fetch(base + route);
    assert.equal(r.headers.get('x-content-type-options'), 'nosniff', route);
    assert.equal(r.headers.get('x-frame-options'), 'DENY', route);
    assert.match(r.headers.get('content-security-policy'), /default-src 'self'/, route);
    assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/, route);
    assert.match(r.headers.get('strict-transport-security'), /max-age=/, route);
  }
  const beacon = await fetch(base + '/api/rum', { method: 'OPTIONS', headers: { origin: 'https://ummahacademy.net' } });
  assert.equal(beacon.status, 204);
  assert.equal(beacon.headers.get('access-control-allow-origin'), 'https://ummahacademy.net');
});
