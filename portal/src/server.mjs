/**
 * Operations portal HTTP server.
 * Bind 0.0.0.0 so the preview host can reach it. No frame-blocking headers.
 */
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { issueSession, readSession } from './domain/auth.mjs';
import { DomainError, E } from './domain/errors.mjs';
import { createRum } from './domain/rum.mjs';
import { readConfiguredSecret } from './domain/secret.mjs';
import { createStore } from './domain/store.mjs';
import { loadStateFile } from './domain/persistence.mjs';
import { sniffUpload } from './domain/ops.mjs';
import { securityHeaders, sessionCookie } from './domain/http-security.mjs';
import { requestLogRecord } from './domain/observability.mjs';
import { buildHealthReport } from './domain/health.mjs';
import { closeServerGracefully } from './domain/graceful-shutdown.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
// PORTAL_DATA may point outside the app folder, so a redeploy of the code never replaces the data.
// Uploads and the secret file live next to it.
const dataFile = process.env.PORTAL_DATA || path.join(root, 'data', 'store.json');
const dataDir = path.dirname(dataFile);
const filesDir = path.join(dataDir, 'files');
const secretFile = path.join(dataDir, 'secret');
const PORT = Number(process.env.PORTAL_PORT || process.env.PORT || 8787);
const HOST = '0.0.0.0';
const production = process.env.PORTAL_ENV === 'production';
const configuredSecret = readConfiguredSecret(process.env);
if (production && !configuredSecret) {
  console.error('PORTAL_ENV=production requires PORTAL_SECRET (or PORTAL_SECRET_FILE) of at least 32 characters. Refusing to start.');
  // Operator diagnostics only: never the secret itself.
  const sf = process.env.PORTAL_SECRET_FILE;
  console.error(JSON.stringify({ diag: 'secret', cwd: process.cwd(), home: process.env.HOME || null, secretFileSet: Boolean(sf), secretFileExists: sf ? fs.existsSync(sf) : false, dataDirExists: fs.existsSync(path.dirname(dataFile)), rootEntries: (() => { try { return fs.readdirSync('/').slice(0, 30); } catch { return null; } })() }));
  process.exit(1);
}
const SESSION_TTL = 12 * 60 * 60;
const SECURITY_HEADERS = securityHeaders({ production });

function loadSecret() {
  if (configuredSecret) return configuredSecret;
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

function makeLimiter(limit, windowMs) {
  const rows = new Map();
  return (ip) => {
    const now = Date.now();
    const row = rows.get(ip) ?? { n: 0, reset: now + windowMs };
    if (now > row.reset) {
      row.n = 0;
      row.reset = now + windowMs;
    }
    row.n += 1;
    rows.set(ip, row);
    if (rows.size > 5000) for (const [k, v] of rows) if (now > v.reset) rows.delete(k);
    return row.n > limit;
  };
}
// Behind the host’s reverse proxy every request arrives from the proxy’s address, which would put all
// visitors in one rate-limit bucket. With PORTAL_TRUST_PROXY=1 the address the proxy appended
// (the last X-Forwarded-For entry) is used instead. Never enable it on a directly exposed port.
const TRUST_PROXY = process.env.PORTAL_TRUST_PROXY === '1';
function clientIp(req) {
  if (TRUST_PROXY) {
    const hops = String(req.headers['x-forwarded-for'] || '').split(',').map((h) => h.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return req.socket.remoteAddress || 'local';
}
const rateLimited = makeLimiter(20, 10 * 60 * 1000);
const passwordLimited = makeLimiter(8, 10 * 60 * 1000);
const beaconLimited = makeLimiter(240, 60 * 1000);
const registerLimited = makeLimiter(5, 60 * 60 * 1000);

// Real-user performance beacons from the marketing site. Aggregates only; see domain/rum.mjs.
const rum = createRum({ file: path.join(path.dirname(dataFile), 'rum.json') });
let rumTimer = null;
// Beacons are batched: write at most once every 5 seconds after the first one, plus on shutdown.
function scheduleRumFlush() {
  if (rumTimer) return;
  rumTimer = setTimeout(() => {
    rumTimer = null;
    try { rum.flush(); } catch (error) { console.error('rum flush failed', error.message); }
  }, 5_000);
  rumTimer.unref();
}
const RUM_ORIGINS = new Set(
  String(process.env.PORTAL_RUM_ORIGINS || 'https://ummahacademy.net,https://www.ummahacademy.net')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);
if (!production) for (const o of ['http://localhost:4321', 'http://127.0.0.1:4321', 'http://localhost:8787']) RUM_ORIGINS.add(o);

function rumCors(req) {
  const origin = String(req.headers.origin || '');
  return RUM_ORIGINS.has(origin)
    ? { 'access-control-allow-origin': origin, vary: 'Origin', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'access-control-max-age': '86400' }
    : null;
}

async function handleBeacon(req, res) {
  const cors = rumCors(req);
  if (!cors) return send(res, 403, { error: { code: 'forbidden', message: 'Origin not allowed.', messageAr: 'المصدر غير مسموح.' } });
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    return res.end();
  }
  if (beaconLimited(clientIp(req))) {
    res.writeHead(204, cors);
    return res.end();
  }
  if (Number(req.headers['content-length'] || 0) > 2048) {
    res.writeHead(413, cors);
    return res.end();
  }
  let body;
  try {
    body = await readBody(req, 2048);
  } catch {
    res.writeHead(204, cors);
    return res.end();
  }
  if (rum.record(body)) scheduleRumFlush();
  res.writeHead(204, cors);
  res.end();
}

function staffOnly(actor) {
  if (actor.role !== 'admin' && actor.role !== 'ops') throw E.forbidden();
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
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        req.bodyFingerprint = createHash('sha256').update(JSON.stringify(parsed)).digest('hex');
        resolve(parsed);
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
  // A password change bumps the user's session version, which signs every older cookie out.
  if ((payload.pv ?? 0) !== store.sessionVersion(payload.sub)) return null;
  return store.actorById(payload.sub);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
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
      'cache-control': file.endsWith('index.html') ? 'no-store' : production ? 'public, max-age=300' : 'no-cache',
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
  const suppliedKey = String(req.headers['idempotency-key'] || '').trim();
  // Idempotency is scoped to the HTTP operation so reusing a client key on a
  // different endpoint cannot replay an unrelated command result.
  const pathname = req.url instanceof URL ? req.url.pathname : new URL(req.url, 'http://localhost').pathname;
  return {
    requestId: randomBytes(8).toString('hex'),
    idempotencyKey: suppliedKey ? {
      key: `${req.method}:${pathname}:${suppliedKey}`,
      fingerprint: req.bodyFingerprint || null,
    } : null,
  };
}

const routes = [
  ['POST', /^\/api\/auth\/login$/, async (req, res) => {
    const ip = clientIp(req);
    if (rateLimited(ip)) return send(res, 429, { error: { code: 'rate_limited', message: 'Too many attempts.', messageAr: 'محاولات كثيرة. انتظر قليلًا.' } });
    const body = await readBody(req);
    const user = store.login(body.email, body.password);
    const token = issueSession(user.id, secret, SESSION_TTL, Date.now(), store.sessionVersion(user.id));
    send(res, 200, { user, demo: store.demo }, { 'set-cookie': sessionCookie(token, SESSION_TTL, { production }) });
  }],
  ['GET', /^\/api\/signup\/options$/, async (_req, res) => send(res, 200, store.signupOptions())],
  ['POST', /^\/api\/auth\/register$/, async (req, res) => {
    if (registerLimited(clientIp(req))) {
      return send(res, 429, { error: { code: 'rate_limited', message: 'Too many sign-ups from this address. Try again later.', messageAr: 'محاولات تسجيل كثيرة من هذا العنوان. حاول لاحقًا.' } });
    }
    const created = store.register(await readBody(req), meta(req));
    const token = issueSession(created.user.id, secret, SESSION_TTL, Date.now(), store.sessionVersion(created.user.id));
    send(res, 201, { user: created.user, demo: store.demo }, { 'set-cookie': sessionCookie(token, SESSION_TTL, { production }) });
  }],
  ['POST', /^\/api\/auth\/logout$/, async (_req, res) => {
    send(res, 200, { ok: true }, { 'set-cookie': sessionCookie('', 0, { production }) });
  }],
  ['GET', /^\/api\/health$/, async (_req, res) => send(res, 200, { ok: true, demo: store.demo })],
  ['GET', /^\/api\/ready$/, async (_req, res) => {
    let dataFileReadable = false;
    try {
      dataFileReadable = fs.statSync(dataFile).isFile();
      if (dataFileReadable) fs.accessSync(dataFile, fs.constants.R_OK);
    } catch {
      dataFileReadable = false;
    }
    const report = buildHealthReport({
      state: store.snapshot(),
      production,
      secretConfigured: Boolean(configuredSecret),
      dataFileReadable,
    });
    return send(res, report.ready ? 200 : 503, report);
  }],
  ['GET', /^\/api\/me$/, async (req, res, actor) => send(res, 200, { ...actor, demo: store.demo })],
  ['GET', /^\/api\/profile$/, async (_req, res, actor) => send(res, 200, store.getProfile(actor))],
  ['PATCH', /^\/api\/profile$/, async (req, res, actor) => send(res, 200, store.updateProfile(actor, await readBody(req), meta(req)))],
  ['POST', /^\/api\/profile\/password$/, async (req, res, actor) => {
    if (passwordLimited(`${actor.id}|${clientIp(req)}`)) {
      return send(res, 429, { error: { code: 'rate_limited', message: 'Too many attempts.', messageAr: 'محاولات كثيرة. انتظر قليلًا.' } });
    }
    const result = store.changePassword(actor, await readBody(req), meta(req));
    const token = issueSession(actor.id, secret, SESSION_TTL, Date.now(), result.sessionVersion);
    send(res, 200, { ok: true }, { 'set-cookie': sessionCookie(token, SESSION_TTL, { production }) });
  }],
  ['GET', /^\/api\/students\/([^/]+)\/learning$/, async (_req, res, actor, m) => send(res, 200, store.learningProfile(actor, m[1]))],
  ['GET', /^\/api\/performance$/, async (req, res, actor) => {
    staffOnly(actor);
    send(res, 200, rum.report({ range: q(req.url).range }));
  }],
  ['GET', /^\/api\/dashboard$/, async (_req, res, actor) => send(res, 200, store.dashboard(actor))],
  ['GET', /^\/api\/console$/, async (req, res, actor) => send(res, 200, store.consoleBoard(actor, q(req.url).view || 'workspace'))],
  ['GET', /^\/api\/teacher\/day$/, async (req, res, actor) => send(res, 200, store.teacherDay(actor, q(req.url)))],
  ['GET', /^\/api\/homework$/, async (req, res, actor) => send(res, 200, store.listHomework(actor, q(req.url)))],
  ['GET', /^\/api\/homework\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getHomework(actor, m[1]))],
  ['GET', /^\/api\/progress$/, async (req, res, actor) => send(res, 200, store.progressHub(actor, q(req.url)))],
  ['GET', /^\/api\/progress\/([^/]+)$/, async (req, res, actor, m) => send(res, 200, store.getProgress(actor, m[1]))],
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
  ['POST', /^\/api\/sessions\/([^/]+)\/report\/approve$/, async (req, res, actor, m) => send(res, 200, store.approveReport(actor, m[1], { ...meta(req), ...(await readBody(req)) }))],
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
  ['POST', /^\/api\/guardians\/([^/]+)\/whatsapp-consent$/, async (req, res, actor, m) => send(res, 200, store.setGuardianMessagingConsent(actor, m[1], await readBody(req), meta(req)))],
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
  const requestId = randomBytes(8).toString('hex');
  const startedAt = process.hrtime.bigint();
  res.setHeader('x-request-id', requestId);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const record = requestLogRecord({
      requestId,
      method: req.method,
      pathname: req.url instanceof URL ? req.url.pathname : String(req.url || '/').split('?')[0],
      statusCode: res.statusCode,
      durationMs,
    });
    console.log(JSON.stringify(record));
  });
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    req.url = url;
    if (pathname === '/api/rum' && (req.method === 'POST' || req.method === 'OPTIONS')) return await handleBeacon(req, res);
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
        if (pathname === '/api/auth/login' || pathname === '/api/auth/register' || pathname === '/api/signup/options' || pathname === '/api/auth/logout' || pathname === '/api/health' || pathname === '/api/ready') return await handler(req, res);
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

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(JSON.stringify({ event: 'portal.shutdown.started', signal }));
  const result = await closeServerGracefully(server, {
    timeoutMs: Number(process.env.PORTAL_SHUTDOWN_TIMEOUT_MS || 10_000),
    onTimeout: () => console.error(JSON.stringify({ event: 'portal.shutdown.timeout' })),
  });
  rum.flush();
  console.log(JSON.stringify({ event: 'portal.shutdown.finished', timedOut: result.timedOut }));
  if (result.timedOut) process.exitCode = 1;
}

process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
process.on('SIGINT', () => { void shutdown('SIGINT'); });
