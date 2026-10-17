/**
 * Website intake ("طلبات الموقع") — the link between the marketing site forms
 * and the operations board: public write path, staff-only work path.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createStore } from '../src/domain/store.mjs';

const T = new Date('2026-10-16T12:00:00.000Z');
const store = createStore({ now: () => T, secret: 'test-secret' });
const admin = () => store.login('admin@ummahacademy.net', 'Sakinah-Admin-2026');
const ops = () => store.login('ops@ummahacademy.net', 'Sakinah-Ops-2026');
const guardian = () => store.login('fatima.rahman@example.com', 'Sakinah-Family-2026');
const teacher = () => store.login('omneya@ummahacademy.net', 'Sakinah-Teach-2026');

function trial(extra = {}) {
  return {
    kind: 'trial',
    name: 'Nadia Ali',
    email: 'nadia.ali@example.com',
    phone: '+201009876543',
    course: 'Quran Recitation',
    level: 'Beginner',
    learner: 'Me',
    message: 'Evening slots please',
    lang: 'ar',
    source: '/ar/contact/',
    payload: { days: 'Sun,Tue', time: '18:00' },
    submitted_at: '2026-10-16T11:00:00.000Z',
    ...extra,
  };
}

test('seeded board is not empty: the demo already contains website requests', () => {
  const list = store.listSiteRequests(admin());
  assert.ok(list.rows.length >= 4);
  assert.ok(list.counts.levelTest >= 1, 'the level-tests tab has at least one result');
  assert.ok(list.counts.open >= 1);
});

test('public intake creates a new website request and notifies ops', () => {
  const row = store.createSiteRequest(trial(), { requestId: 'req-1' });
  assert.match(row.id, /^sreq_/);
  assert.equal(row.status, 'new');
  assert.equal(row.kind, 'trial');
  assert.equal(row.email, 'nadia.ali@example.com');
  assert.equal(row.payload.days, 'Sun,Tue');
  const adminRow = admin();
  const auditRows = store.listAudit(adminRow).filter((a) => a.entityId === row.id);
  assert.ok(auditRows.some((a) => a.action === 'site_request.received'));
  const notes = store.notifications(store.login('ops@ummahacademy.net', 'Sakinah-Ops-2026'));
  assert.ok(notes.some((n) => n.href.includes(row.id)), 'ops gets a notification pointing at the request');
});

test('public intake rejects unknown kinds and empty anonymous blobs, and silently drops bots', () => {
  assert.throws(() => store.createSiteRequest({ kind: 'invoice' }), /Unknown request kind/);
  assert.throws(() => store.createSiteRequest({ kind: 'contact' }), /required/);
  const dropped = store.createSiteRequest(trial({ website: 'http://spam.example' }));
  assert.equal(dropped.dropped, true);
  const before = store.listSiteRequests(admin()).rows.length;
  store.createSiteRequest(trial({ website: 'http://spam.example', email: 'bot@example.com' }));
  assert.equal(store.listSiteRequests(admin()).rows.length, before, 'honeypot submissions are not stored');
});

test('anonymous level tests are accepted — the placement test has no contact gate', () => {
  const row = store.createSiteRequest({
    kind: 'level-test', course: 'Noor Al-Bayan', level: 'Beginner',
    payload: { track: 'quran', percent: 40 }, submitted_at: '2026-10-16T11:20:00.000Z',
    submissionId: 'sub-anon-pt',
  });
  assert.equal(row.kind, 'level-test');
  assert.equal(row.name, null);
  assert.equal(row.status, 'new');
});

test('submissionId makes browser retries idempotent', () => {
  const first = store.createSiteRequest(trial({ submissionId: 'sub-123' }));
  const second = store.createSiteRequest(trial({ submissionId: 'sub-123' }));
  assert.equal(second.id, first.id);
  assert.equal(second.replayed, true);
});

test('board is staff-only: guardians and teachers cannot read website requests', () => {
  assert.throws(() => store.listSiteRequests(guardian()), /access|permission|صلاحية/i);
  assert.throws(() => store.listSiteRequests(teacher()), /access|permission|صلاحية/i);
  const rows = store.listSiteRequests(ops());
  assert.ok(rows.rows.length > 0, 'ops sees the board');
});

test('filters narrow by kind and status, and counts cover the board tabs', () => {
  store.createSiteRequest(trial({ submissionId: 'sub-t1' }));
  store.createSiteRequest({
    kind: 'level-test', name: 'Test Taker', course: 'Tajweed Rules', level: 'Intermediate',
    payload: { track: 'quran', percent: 71 }, submitted_at: '2026-10-16T11:30:00.000Z',
  });
  const trials = store.listSiteRequests(admin(), { kind: 'trial' });
  assert.ok(trials.rows.every((r) => r.kind === 'trial'));
  assert.ok(trials.counts.trial >= 2);
  assert.ok(trials.counts.levelTest >= 2);
  const open = store.listSiteRequests(admin(), { status: 'open' });
  assert.ok(open.rows.every((r) => r.status !== 'closed'));
});

test('staff work a request: contact, note, close with an outcome', () => {
  const row = store.createSiteRequest(trial({ submissionId: 'sub-work' }));
  const actor = ops();
  const contacted = store.updateSiteRequest(actor, row.id, {
    status: 'contacted', note: 'Called at 18:10, trial booked Sunday',
  });
  assert.equal(contacted.status, 'contacted');
  assert.equal(contacted.notes.length, 1);
  assert.throws(
    () => store.updateSiteRequest(actor, row.id, { status: 'closed' }),
    /outcome/i,
    'closing without an outcome is refused',
  );
  const closed = store.updateSiteRequest(actor, row.id, { status: 'closed', outcome: 'won' });
  assert.equal(closed.status, 'closed');
  assert.equal(closed.outcome, 'won');
  assert.ok(closed.closedAt);
});

test('a website request converts into the regular follow-up flow exactly once', () => {
  const row = store.createSiteRequest({
    kind: 'training', name: 'Ustadh Kareem', email: 'kareem@example.com',
    message: 'Ijazah in Hifz, 6 years teaching', submitted_at: '2026-10-16T11:45:00.000Z',
    submissionId: 'sub-convert',
  });
  const actor = admin();
  const result = store.siteRequestToFollowUp(actor, row.id, {});
  assert.match(result.followUp.id, /^fu_/);
  assert.equal(result.request.followUpId, result.followUp.id);
  assert.equal(result.request.status, 'contacted');
  const follow = store.getFollowUp(actor, result.followUp.id);
  assert.ok(follow.title.includes('Kareem') || follow.titleAr.includes('Kareem'));
  assert.throws(
    () => store.siteRequestToFollowUp(actor, row.id, {}),
    /already|converte/i,
    'a second conversion is refused',
  );
});
