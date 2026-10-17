import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IDS, DEMO_PASSWORD, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');

function boot() {
  const store = createStore({
    state: structuredClone(buildSeed(NOW)),
    now: () => new Date(NOW),
    secret: 'console-board-test-secret',
    onCommit() {},
  });
  const login = (email, password) => store.login(email, password);
  return {
    store,
    admin: () => login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
    omneya: () => login('omneya@ummahacademy.net', DEMO_PASSWORD.teacher),
    fatima: () => login('fatima.rahman@example.com', DEMO_PASSWORD.family),
  };
}

test('owner console maps WordPress jobs without installing plugins or inventing Stripe', () => {
  const { store, admin } = boot();
  const actor = admin();
  const home = store.consoleBoard(actor, 'workspace');
  assert.equal(home.view, 'workspace');
  assert.ok(home.glance.students >= 1);
  assert.equal(home.notices.some((n) => n.id === 'stripe' && /not connected|disconnected|مفصول/i.test(n.en)), true);
  assert.equal(JSON.stringify(home).includes('sk_live'), false);
  assert.equal(JSON.stringify(home).includes('re-connect'), false);

  const settings = store.consoleBoard(actor, 'settings');
  const stripe = settings.groups.find((g) => g.id === 'memberships').rows.find((r) => r.key === 'stripe');
  assert.equal(stripe.value, 'disconnected');
  assert.equal(stripe.editable, false);

  const stack = store.consoleBoard(actor, 'stack');
  assert.equal(stack.items.find((i) => i.id === 'elementor').status, 'never');
  assert.equal(stack.items.find((i) => i.id === 'academic').status, 'native');
  assert.equal(stack.items.find((i) => i.id === 'stripe').status, 'blocked');

  const academic = store.consoleBoard(actor, 'academic');
  assert.ok(academic.students.some((s) => s.id === IDS.yusuf && s.lastReport));

  const placements = store.consoleBoard(actor, 'placements');
  assert.deepEqual(placements.placements, []);

  const people = store.consoleBoard(actor, 'people');
  assert.ok(people.users.some((u) => u.role === 'teacher' && u.email === 'omneya@ummahacademy.net'));
  assert.equal(people.users.every((u) => !('passwordHash' in u)), true);
});

test('teacher and family cannot open the owner console', () => {
  const { store, omneya, fatima } = boot();
  assert.throws(() => store.consoleBoard(omneya(), 'workspace'), /access/i);
  assert.throws(() => store.consoleBoard(fatima(), 'settings'), /access/i);
  assert.throws(() => store.consoleBoard(omneya(), 'website'), /access/i);
  assert.throws(() => store.consoleBoard(fatima(), 'admissions'), /access/i);
});

test('Admin OS website manager does not write marketing files or invent a page builder', () => {
  const { store, admin } = boot();
  const web = store.consoleBoard(admin(), 'website');
  assert.equal(web.writesFromPortal, false);
  assert.equal(web.pageBuilder, 'never');
  assert.equal(web.dynamizePublicSite, false);
  assert.deepEqual(web.workflow, ['draft', 'preview', 'approval', 'publish']);
  assert.ok(web.collections.some((c) => c.id === 'articles_ar'));
  assert.ok(web.collections.some((c) => c.id === 'reviews'));
  assert.equal(JSON.stringify(web).includes('sk_live'), false);
});

test('admissions board is derived from portal records, not a CRM', () => {
  const { store, admin } = boot();
  const board = store.consoleBoard(admin(), 'admissions');
  assert.equal(board.crm, 'disconnected');
  assert.ok(board.columns.trial_booked.some((c) => c.id === IDS.layla));
  assert.ok(board.columns.paid.some((c) => c.id === IDS.yusuf));
  assert.equal(board.columns.lead.some((c) => c.id === IDS.yusuf), false);
});

test('governance matrix keeps login roles and does not invent Academic Manager', () => {
  const { store, admin } = boot();
  const gov = store.consoleBoard(admin(), 'governance');
  assert.deepEqual(gov.roles.map((r) => r.login), ['admin', 'ops', 'teacher', 'guardian', 'student']);
  assert.equal(gov.roles.some((r) => /academic.?manager/i.test(r.login)), false);
  const publish = gov.matrix.find((m) => m.action === 'website.publish');
  assert.equal(publish.portal, false);
  const approve = gov.matrix.find((m) => m.action === 'report.approve');
  assert.equal(approve.roles.includes('teacher'), false);
  assert.equal(approve.roles.includes('admin'), true);
});

test('family does not see a lesson report until ops or admin approve it', () => {
  const { store, admin, omneya, fatima } = boot();
  const teacher = omneya();
  const parent = fatima();
  store.completeSession(teacher, IDS.sesYusufNext, { attendance: 'present' });
  store.submitReport(teacher, IDS.sesYusufNext, {
    summary: 'New noon sakinah drill',
    homework: 'Circle three examples',
  });
  const pending = store.getSession(teacher, IDS.sesYusufNext);
  assert.equal(pending.report.reviewStatus, 'pending');
  assert.equal(store.getSession(parent, IDS.sesYusufNext).report, null);
  assert.equal(store.getProgress(parent, IDS.yusuf).child.lastReport.summary.toLowerCase().includes('idgham'), true);
  const home = store.consoleBoard(admin(), 'workspace');
  assert.ok(home.queues.pendingReview.some((s) => s.id === IDS.sesYusufNext));
  assert.throws(() => store.approveReport(teacher, IDS.sesYusufNext), /access/i);
  const approved = store.approveReport(admin(), IDS.sesYusufNext);
  assert.equal(approved.report.reviewStatus, 'approved');
  assert.equal(store.getSession(parent, IDS.sesYusufNext).report.summary, 'New noon sakinah drill');
  assert.equal(store.getProgress(parent, IDS.yusuf).child.lastReport.summary, 'New noon sakinah drill');
});
