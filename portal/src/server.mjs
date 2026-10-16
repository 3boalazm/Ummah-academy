/**
 * Operations portal HTTP server.
 * Bind 0.0.0.0 so the preview host can reach it. No frame-blocking headers.
 */
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { issueSession, readSession } from './domain/auth.mjs';
import { DomainError } from './domain/errors.mjs';
import { createStore } from './domain/store.mjs';
import { loadStateFile } from './domain/persistence.mjs';
import { sniffUpload } from './domain/ops.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const dataDir = path.join(root, 'data');
const filesDir = path.join(dataDir, 'files');
const dataFile = process.env.PORTAL_DATA || path.join(dataDir, 'store.json');
const secretFile = path.join(dataDir, 'secret');
const PORT = Number(process.env.PORTAL_PORT || 8787);
const HOST = '0.0.0.0';
const production = process.env.PORTAL_ENV === 'production';
if (production && !process.env.PORTAL_SECRET) {
  console.error('PORTAL_ENV=production requires PORTAL_SECRET. Refusing to start.');
  process.exit(1);
}
const SESSION_TTL = 12 * 60 * 60;

function loadSecret() {
  if (process.env.PORTAL_SECRET) return process.env.PORTAL_SECRET;
  fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, 'utf8').trim();
  const secret = randomBytes(32).toString('hex');
  fs.writeFileSync(secretFile, secret, { mode: 0o600 });
  return secret;
}

function saveState(state) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  const tmp = `${dataFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, dataFile);
}

const secret = loadSecret();
let existing;
try {
  existing = loadStateFile(dataFile, { production });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const store = createStore({
  secret,
  state: existing ?? undefined,
  onCommit: saveState,
  production,
});
if (!existing) saveState(store.snapshot());

const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const row = attempts.get(ip) ?? { n: 0, reset: now + 10 * 60 * 1000 };
  if (now > row.reset) {
    row.n = 0;
    row.reset = now + 10 * 60 * 1000;
  }
  row.n += 1;
  attempts.set(ip, row);
  return row.n > 20;
}

function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function readBody(req, max = 1_000_000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > max) {
        reject(new DomainError('validation', 413, 'Body too large.', 'الطلب أكبر من الحد المسموح.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        reject(new DomainError('validation', 400, 'Invalid JSON.', 'JSON غير صالح.'));
      }
    });
    req.on('error', reject);
  });
}

function send(res, status, data, headers = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  res.end(JSON.stringify(data));
}

function fail(res, err) {
  if (err instanceof DomainError) return send(res, err.status, { error: err.toJSON() });
  console.error(err);
  return send(res, 500, { error: { code: 'internal', message: 'Something went wrong.', messageAr: 'حدث خطأ غير متوقع.' } });
}

function actorFrom(req) {
  const payload = readSession(cookies(req).ua_portal, secret);
  if (!payload) return null;
  return store.actorById(payload.sub);
}

function sessionCookie(token, maxAge = SESSION_TTL) {
  return `ua_portal=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function serveStatic(req, res, pathname) {
  const rel = pathname === '/' ? '/index.html' : pathname;
  const file = path.normalize(path.join(publicDir, rel));
  if (!file.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, {
      'content-type': MIME[path.extname(file)] || 'application/octet-stream',
      'cache-control': file.endsWith('index.html') ? 'no-store' : 'public, max-age=300',
      'x-content-type-options': 'nosniff',
    });
    fs.createReadStream(file).pipe(res);
    return;
  }
  const index = path.join(publicDir, 'index.html');
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
  fs.createReadStream(index).pipe(res);
}

function q(url) {
  return Object.fromEntries(url.searchParams.entries());
}

function meta(req) {
  return {
    requestId: randomBytes(8).toString('hex'),
    idempotencyKey: req.headers['idempotency-key'] || null,
  };
}

const routes = [
  ['POST', /^\/api\/auth\/login$/, async (req, res) => {
    const ip = req.socket.remoteAddress || 'local';
    if (rateLimited(ip)) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many attempts.', messageAr: 'محاولات كثيرة. انتظر قليلًا.' } });
    const body = await readBody(req);
    const user = store.login(body.email, body.password);
    const token = issueSession(user.id, secret, SESSION_TTL);
    send(res, 200, { user, demo: store.demo }, { 'set-cookie': sessionCookie(token) });
  }],
  ['POST', /^\/api\/auth\/logout$/, async (_req, res) => {
    send(res, 200, { ok: true }, { 'set-cookie': sessionCookie('', 0) });
  }],
  ['GET', /^\/api\/health$/, async (_req, res) => send(res, 200, { ok: true, demo: store.demo })],
  ['GET', /^\/api\/me$/, async (req, res, actor) => send(res, 200, { ...actor, demo: store.demo })],
  ['GET', /^\/api\/dashboard$/, async (_req, res, actor) => send(res, 200, store.dashboard(actor))],
  ['GET', /^\/api\/catalog$/, async (_req, res, actor) => send(res, 200, store.catalog(actor))],
  ['GET', /^\/api\/search$/, async (req, res, actor) => send(res, 200, store.search(actor, q(req.url).q || ''))],
  ['GET', /^\/api\/students$/, async (req, res, actor) => send(res, 200, store.listStudents(actor, q(req.url)))],
  ['GET', /^\/api\/students\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getStudent(actor, m[1]))],
  ['PATCH', /^\/api\/students\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.updateStudent(actor, m[1], await readBody(req), meta(req)))],
  ['GET', /^\/api\/families$/, async (_req, res, actor) => send(res, 200, store.listFamilies(actor))],
  ['GET', /^\/api\/families\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getFamily(actor, m[1]))],
  ['GET', /^\/api\/teachers$/, async (_req, res, actor) => send(res, 200, store.listTeachers(actor))],
  ['GET', /^\/api\/teachers\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getTeacher(actor, m[1]))],
  ['GET', /^\/api\/sessions$/, async (req, res, actor) => send(res, 200, store.listSessions(actor, q(req.url)))],
  ['POST', /^\/api\/sessions$/, async (req, res, actor) => send(res, 201, store.createSession(actor, await readBody(req), meta(req)))],
  ['GET', /^\/api\/sessions\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getSession(actor, m[1]))],
  ['POST', /^\/api\/sessions\/([^/]+)\/confirm$/, async (req, res, actor, m) => send(res, 200, store.confirmSession(actor, m[1], meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/attendance$/, async (req, res, actor, m) => send(res, 200, store.markAttendance(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/complete$/, async (req, res, actor, m) => send(res, 200, store.completeSession(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/report$/, async (req, res, actor, m) => send(res, 200, store.submitReport(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/cancel$/, async (req, res, actor, m) => send(res, 200, store.cancelSession(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/reschedule$/, async (req, res, actor, m) => send(res, 200, store.rescheduleSession(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/no-show$/, async (req, res, actor, m) => send(res, 200, store.markNoShow(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/([^/]+)\/substitute$/, async (req, res, actor, m) => send(res, 200, store.substituteTeacher(actor, m[1], await readBody(req), meta(req)))],
  ['GET', /^\/api\/sessions\/([^/]+)\/room$/, async (req, res, actor, m) => room(req, res, actor, m[1])],
  ['GET', /^\/api\/subscriptions$/, async (req, res, actor) => send(res, 200, store.listSubscriptions(actor, q(req.url)))],
  ['GET', /^\/api\/subscriptions\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getSubscription(actor, m[1]))],
  ['POST', /^\/api\/subscriptions\/([^/]+)\/renew$/, async (req, res, actor, m) => send(res, 200, store.renewSubscription(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/subscriptions\/([^/]+)\/freeze$/, async (req, res, actor, m) => send(res, 200, store.freezeSubscription(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/subscriptions\/([^/]+)\/resume$/, async (req, res, actor, m) => send(res, 200, store.resumeSubscription(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/subscriptions\/([^/]+)\/cancel$/, async (req, res, actor, m) => send(res, 200, store.cancelSubscription(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/cycles\/([^/]+)\/adjust$/, async (req, res, actor, m) => send(res, 200, store.adjustCycle(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/payments$/, async (req, res, actor) => send(res, 201, store.recordPayment(actor, await readBody(req), meta(req)))],
  ['POST', /^\/api\/assignments$/, async (req, res, actor) => send(res, 201, store.changeTeacher(actor, await readBody(req), meta(req)))],
  ['GET', /^\/api\/follow-ups$/, async (req, res, actor) => send(res, 200, store.listFollowUps(actor, q(req.url)))],
  ['POST', /^\/api\/follow-ups$/, async (req, res, actor) => send(res, 201, store.createFollowUp(actor, await readBody(req), meta(req)))],
  ['GET', /^\/api\/follow-ups\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getFollowUp(actor, m[1]))],
  ['POST', /^\/api\/follow-ups\/([^/]+)\/attempts$/, async (req, res, actor, m) => send(res, 200, store.addAttempt(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/follow-ups\/([^/]+)\/transition$/, async (req, res, actor, m) => send(res, 200, store.transitionFollowUp(actor, m[1], await readBody(req), meta(req)))],
  ['POST', /^\/api\/requests$/, async (req, res, actor) => send(res, 201, store.createChangeRequest(actor, await readBody(req), meta(req)))],
  ['GET', /^\/api\/audit$/, async (req, res, actor) => send(res, 200, store.listAudit(actor, q(req.url)))],
  ['GET', /^\/api\/integrity$/, async (_req, res, actor) => send(res, 200, store.integrity(actor))],
  ['GET', /^\/api\/acceptance$/, async (_req, res, actor) => send(res, 200, store.acceptance(actor))],
  ['GET', /^\/api\/notifications$/, async (_req, res, actor) => send(res, 200, store.notifications(actor))],
  ['POST', /^\/api\/notifications\/([^/]+)\/read$/, async (req, res, actor, m) => send(res, 200, store.markNotificationRead(actor, m[1]))],
  ['POST', /^\/api\/assets\/([^/]+)\/token$/, async (req, res, actor, m) => send(res, 200, store.issueAssetToken(actor, m[1]))],
  ['GET', /^\/api\/assets\/([^/]+)\/content$/, async (req, res, actor, m) => assetContent(req, res, actor, m[1])],
  ['POST', /^\/api\/families$/, async (req, res, actor) => send(res, 201, store.enrollFamily(actor, await readBody(req), meta(req)))],
  ['POST', /^\/api\/sessions\/series$/, async (req, res, actor) => send(res, 201, store.createSeries(actor, await readBody(req), meta(req)))],
  ['POST', /^\/api\/guardians\/([^/]+)\/phone$/, async (req, res, actor, m) => send(res, 200, store.setGuardianPhone(actor, m[1], await readBody(req), meta(req)))],
  ['GET', /^\/api\/outbox$/, async (_req, res, actor) => send(res, 200, store.listOutbox(actor))],
  ['POST', /^\/api\/outbox\/drafts$/, async (req, res, actor) => send(res, 200, store.generateDrafts(actor, meta(req)))],
  ['POST', /^\/api\/outbox\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.markOutbox(actor, m[1], await readBody(req), meta(req)))],
  ['GET', /^\/api\/invoices$/, async (_req, res, actor) => send(res, 200, store.listInvoices(actor))],
  ['GET', /^\/api\/export\/([^/]+)$/, async (req, res, actor, m) => {
    if (req.headers['x-ua-request'] !== '1') return send(res, 400, { error: { code: 'csrf', message: 'Missing request header.', messageAr: 'ترويسة الطلب ناقصة.' } });
    return csv(res, store.exportCsv(actor, m[1]));
  }],
  ['POST', /^\/api\/assets$/, async (req, res, actor) => upload(req, res, actor)],
  ['POST', /^\/api\/admin\/reset-demo$/, async (req, res, actor) => send(res, 200, store.resetDemo(actor))],
];

function escHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function csv(res, file) {
  const name = String(file.filename || 'export.csv').replace(/[^a-z0-9._-]/gi, '');
  res.writeHead(200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': `attachment; filename="${name || 'export.csv'}"`,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(file.csv);
}

async function upload(req, res, actor) {
  const body = await readBody(req, 2_000_000);
  const raw = Buffer.from(String(body.dataBase64 || ''), 'base64');
  const mime = sniffUpload(raw);
  if (!mime) {
    throw new DomainError('validation', 400, 'Only PDF, PNG, JPEG or plain text. Video is not accepted.', 'المسموح PDF أو PNG أو JPEG أو نص. الفيديو مرفوض.');
  }
  const saved = store.registerUpload(actor, {
    studentId: body.studentId,
    sessionId: body.sessionId || null,
    filename: body.filename,
    mime,
  }, meta(req));
  fs.mkdirSync(filesDir, { recursive: true });
  const dest = path.resolve(filesDir, saved.id);
  if (!dest.startsWith(path.resolve(filesDir) + path.sep)) {
    throw new DomainError('validation', 400, 'Bad file id.', 'معرّف الملف غير صالح.');
  }
  fs.writeFileSync(dest, raw, { mode: 0o600 });
  send(res, 201, { id: saved.id, mime });
}

function assetContent(req, res, actor, id) {
  const token = q(req.url).token || '';
  const file = store.assetDownload(actor, id, token);
  if (!file) return send(res, 200, store.readAsset(actor, id, token));
  const dest = path.resolve(filesDir, file.id);
  if (!dest.startsWith(path.resolve(filesDir) + path.sep) || !fs.existsSync(dest)) {
    return send(res, 404, { error: { code: 'not_found', message: 'File missing.', messageAr: 'الملف غير موجود على القرص.' } });
  }
  const ext = { 'application/pdf': '.pdf', 'image/png': '.png', 'image/jpeg': '.jpg', 'text/plain': '.txt' }[file.mime] || '';
  res.writeHead(200, {
    'content-type': file.mime || 'application/octet-stream',
    'content-disposition': `attachment; filename="${file.id}${ext}"`,
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  fs.createReadStream(dest).pipe(res);
}

function room(_req, res, actor, sessionId) {
  const session = store.getSession(actor, sessionId);
  const name = escHtml(session.student?.nameAr || session.student?.name || '');
  const html = `<!doctype html><meta charset="utf-8"><title>غرفة الحصة</title>
  <body style="font-family:sans-serif;background:#1e1530;color:#f4f0fb;display:grid;place-items:center;min-height:100vh;margin:0">
  <main style="max-width:36rem;padding:2rem">
  <p>Ummah Academy</p>
  <h1>غرفة الحصة التجريبية</h1>
  <p>هذه ليست مكالمة حقيقية. مزوّد الاجتماعات غير موصول بعد، والدخول مقصور على من لديه صلاحية هذه الحصة.</p>
  <p>${name} · ${session.startsAt}</p>
  <p><a style="color:#d9bcff" href="/app/sessions/${session.id}">العودة إلى السجل</a></p>
  </main></body>`;
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    req.url = url;
    if (pathname.startsWith('/api/')) {
      if (req.method === 'POST' || req.method === 'PATCH') {
        if (req.headers['x-ua-request'] !== '1') {
          return send(res, 400, { error: { code: 'csrf', message: 'Missing request header.', messageAr: 'ترويسة الطلب ناقصة.' } });
        }
      }
      for (const [method, re, handler] of routes) {
        if (req.method !== method) continue;
        const match = pathname.match(re);
        if (!match) continue;
        if (pathname === '/api/auth/login' || pathname === '/api/auth/logout' || pathname === '/api/health') return await handler(req, res);
        const actor = actorFrom(req);
        if (!actor) return send(res, 401, { error: { code: 'unauthorized', message: 'Sign in required.', messageAr: 'يلزم تسجيل الدخول.' } });
        return await handler(req, res, actor, match);
      }
      return send(res, 404, { error: { code: 'not_found', message: 'Unknown API route.', messageAr: 'المسار غير موجود.' } });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end('Method not allowed');
      return;
    }
    serveStatic(req, res, pathname);
  } catch (err) {
    if (!res.headersSent) fail(res, err);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`portal listening on http://${HOST}:${PORT}`);
});
