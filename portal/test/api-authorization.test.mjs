import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

let child;
let base;
let temp;
let output = '';

async function freePort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((e) => e ? reject(e) : resolve()));
  return port;
}

async function request(route, { method = 'GET', cookie, body, customHeader = true, idempotencyKey } = {}) {
  const headers = {};
  if (cookie) headers.cookie = cookie;
  if (idempotencyKey) headers['idempotency-key'] = idempotencyKey;
  if (method === 'POST' || method === 'PATCH') {
    headers['content-type'] = 'application/json';
    if (customHeader) headers['x-ua-request'] = '1';
  }
  const response = await fetch(base + route, {
    method,
    headers,
    body: body === undefined || method === 'GET' || method === 'HEAD' ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: response.status, headers: response.headers, data };
}

async function login(email, password) {
  const result = await request('/api/auth/login', {
    method: 'POST', body: { email, password },
  });
  assert.equal(result.status, 200, JSON.stringify(result.data));
  const cookie = result.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie, 'login should issue a session cookie');
  return cookie;
}

before(async () => {
  temp = await mkdtemp(path.join(os.tmpdir(), 'ummah-portal-api-'));
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  child = spawn(process.execPath, ['portal/src/server.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORTAL_PORT: String(port),
      PORTAL_DATA: path.join(temp, 'store.json'),
      PORTAL_SECRET: 'test-only-secret-not-for-production',
      PORTAL_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (b) => { output += b.toString(); });
  child.stderr.on('data', (b) => { output += b.toString(); });
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`portal exited early: ${output}`);
    try {
      const r = await fetch(base + '/api/health');
      if (r.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`portal did not become ready: ${output}`);
});

after(async () => {
  if (child && child.exitCode === null) {
    child.kill('SIGTERM');
    await Promise.race([once(child, 'exit'), new Promise((resolve) => setTimeout(resolve, 2000))]);
  }
  if (temp) await rm(temp, { recursive: true, force: true });
});

const protectedRoutes = [
  ['GET','/api/me'], ['GET','/api/dashboard'], ['GET','/api/catalog'], ['GET','/api/search'],
  ['GET','/api/students'], ['GET','/api/students/stu_yusuf'], ['PATCH','/api/students/stu_yusuf'],
  ['GET','/api/families'], ['GET','/api/families/fam_rahman'], ['POST','/api/families'],
  ['GET','/api/teachers'], ['GET','/api/teachers/omneya-ali'],
  ['GET','/api/sessions'], ['POST','/api/sessions'], ['GET','/api/sessions/ses_yusuf_next'],
  ['POST','/api/sessions/ses_yusuf_next/confirm'], ['POST','/api/sessions/ses_yusuf_next/attendance'],
  ['POST','/api/sessions/ses_yusuf_next/complete'], ['POST','/api/sessions/ses_yusuf_next/report'],
  ['POST','/api/sessions/ses_yusuf_next/cancel'], ['POST','/api/sessions/ses_yusuf_next/reschedule'],
  ['POST','/api/sessions/ses_yusuf_next/no-show'], ['POST','/api/sessions/ses_yusuf_next/substitute'],
  ['GET','/api/sessions/ses_yusuf_next/room'], ['GET','/api/subscriptions'], ['GET','/api/subscriptions/sub_yusuf'],
  ['POST','/api/subscriptions/sub_yusuf/renew'], ['POST','/api/subscriptions/sub_yusuf/freeze'],
  ['POST','/api/subscriptions/sub_yusuf/resume'], ['POST','/api/subscriptions/sub_yusuf/cancel'],
  ['POST','/api/cycles/cyc_yusuf/adjust'], ['POST','/api/payments'], ['POST','/api/assignments'],
  ['GET','/api/follow-ups'], ['POST','/api/follow-ups'], ['GET','/api/follow-ups/fu_layla'],
  ['POST','/api/follow-ups/fu_layla/attempts'], ['POST','/api/follow-ups/fu_layla/transition'],
  ['POST','/api/requests'], ['GET','/api/audit'], ['GET','/api/integrity'], ['GET','/api/acceptance'],
  ['GET','/api/notifications'], ['POST','/api/notifications/notif_missing/read'],
  ['POST','/api/assets'], ['POST','/api/assets/ast_yusuf/token'], ['GET','/api/assets/ast_yusuf/content?token=invalid'],
  ['POST','/api/sessions/series'], ['POST','/api/guardians/grd_khalid/phone'],
  ['GET','/api/outbox'], ['POST','/api/outbox/drafts'], ['POST','/api/outbox/draft_missing'],
  ['GET','/api/invoices'], ['GET','/api/export/students'], ['POST','/api/admin/reset-demo'],
];

test('every inventoried protected API route rejects anonymous direct requests', async () => {
  for (const [method, route] of protectedRoutes) {
    const response = await request(route, { method, body: {}, customHeader: true });
    assert.equal(response.status, 401, `${method} ${route} should require a session; got ${response.status}`);
    assert.equal(response.headers.get('cache-control'), 'no-store', `${method} ${route} should not be cached`);
  }
});

test('state-changing API requests require the custom request header before handlers run', async () => {
  for (const [method, route] of [
    ['POST','/api/families'], ['PATCH','/api/students/stu_yusuf'],
    ['POST','/api/sessions/ses_yusuf_next/complete'], ['POST','/api/payments'],
    ['POST','/api/assets'], ['POST','/api/admin/reset-demo'],
  ]) {
    const response = await request(route, { method, body: {}, customHeader: false });
    assert.equal(response.status, 400, `${method} ${route} should reject a missing request header`);
    assert.equal(response.data?.error?.code, 'csrf');
  }
});

test('guardian API cannot read another family student by guessed ID and sees minimized teacher DTOs', async () => {
  const cookie = await login('fatima.rahman@example.com', 'Sakinah-Family-2026');
  const own = await request('/api/students', { cookie });
  assert.equal(own.status, 200);
  const ids = own.data.map((row) => row.id);
  assert.ok(ids.includes('stu_yusuf'));
  assert.ok(!ids.includes('stu_adam'));
  const guessed = await request('/api/students/stu_adam', { cookie });
  assert.ok([403, 404].includes(guessed.status), `cross-family student should be denied, got ${guessed.status}`);
  const teachers = await request('/api/teachers', { cookie });
  assert.equal(teachers.status, 200);
  for (const teacher of teachers.data) {
    assert.equal('userId' in teacher, false);
    assert.equal('activeStudents' in teacher, false);
  }
});

test('teacher API cannot read billing and only sees own teacher-directory row', async () => {
  const cookie = await login('omneya@ummahacademy.net', 'Sakinah-Teach-2026');
  const teachers = await request('/api/teachers', { cookie });
  assert.equal(teachers.status, 200);
  assert.ok(teachers.data.length <= 1, 'teacher role must not enumerate other teacher profiles');
  assert.ok(teachers.data.every((t) => t.id === 'omneya-ali'));
  const invoices = await request('/api/invoices', { cookie });
  assert.ok([403, 404].includes(invoices.status), `teacher must not read invoices, got ${invoices.status}`);
  const family = await request('/api/families/fam_rahman', { cookie });
  assert.ok([403, 404].includes(family.status), `teacher must not read family financial profile, got ${family.status}`);
});


test('API idempotency keys are isolated by operation route', async () => {
  const cookie = await login('admin@ummahacademy.net', 'Sakinah-Admin-2026');
  const key = 'same-client-key-across-routes';
  const before = await request('/api/payments', { cookie });
  assert.equal(before.status, 200);

  const session = await request('/api/sessions', {
    method: 'POST',
    cookie,
    idempotencyKey: key,
    body: {
      studentId: 'stu_yusuf',
      teacherId: 't_nour',
      startsAt: '2027-01-20T10:00:00.000Z',
      durationMin: 30,
    },
  });
  assert.equal(session.status, 201, JSON.stringify(session.data));

  const payment = await request('/api/payments', {
    method: 'POST',
    cookie,
    idempotencyKey: key,
    body: { subscriptionId: 'sub_yusuf', amount: 1, status: 'pending', reason: 'Idempotency route-scope test' },
  });
  assert.equal(payment.status, 201, JSON.stringify(payment.data));
  assert.ok(payment.data.payment?.id, 'payment endpoint must return a payment, not a replayed session result');
});
