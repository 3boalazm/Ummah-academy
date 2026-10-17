import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildProductionState } from '../scripts/provision.mjs';
import { DEMO_PASSWORD, IDS, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';
import { SIGNUP_DAILY_CAP } from '../src/domain/signup.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const PW = 'Orange-lantern-5521';

function demo(extra = {}) {
  return createStore({ state: structuredClone(buildSeed(NOW)), now: () => NOW, secret: 'x'.repeat(40), onCommit() {}, ...extra });
}
function prod() {
  const state = buildProductionState({ email: 'admin@ummahacademy.net', name: 'Owner', nameAr: 'المالك', password: 'Zq7-kitchen-orbit-4412', now: NOW });
  return createStore({ state, now: () => NOW, secret: 'x'.repeat(40), production: true, onCommit() {} });
}
const parent = (over = {}) => ({
  guardianName: 'Huda Salem', guardianNameAr: 'هدى سالم', email: 'huda.salem@example.org', password: PW, accept: 'on',
  for: 'child', studentName: 'Maryam Salem', studentNameAr: 'مريم سالم', birthYear: 2016, relation: 'mother', phone: '+971501112233',
  timezone: 'Asia/Dubai', courseId: IDS.cCubs, ...over,
});

test('a parent signs up: account, family, child and an internal lead for staff, and nothing for the child to log in with', () => {
  const store = demo();
  const out = store.register(parent());
  assert.equal(out.user.role, 'guardian');
  assert.equal(JSON.stringify(out).includes('passwordHash'), false);
  const snap = store.snapshot();
  const student = snap.students.find((s) => s.id === out.studentId);
  assert.equal(student.loginEnabled, false);
  assert.equal(student.academicStatus, 'trial');
  assert.equal(snap.enrollments.some((e) => e.studentId === out.studentId), false, 'staff enrol later');
  assert.equal(snap.subscriptions.some((s) => s.studentId === out.studentId), false);
  const lead = snap.followUps.find((f) => f.studentId === out.studentId);
  assert.equal(lead.type, 'sales');
  assert.equal(lead.visibility, 'internal');
  assert.ok(snap.audit.some((a) => a.action === 'auth.registered' && a.entityId === out.user.id));
  assert.ok(snap.notifications.some((n) => n.title === 'New sign-up'));
  // consent is on the record
  assert.ok(snap.users.find((u) => u.id === out.user.id).signup.consentAt);

  const actor = store.login('huda.salem@example.org', PW);
  const profile = store.getProfile(actor);
  assert.equal(profile.children.length, 1);
  assert.equal(profile.children[0].name, 'Maryam Salem');
  assert.equal(profile.guardian.relation, 'mother');
  assert.equal(store.learningProfile(actor, out.studentId).student.id, out.studentId);
  assert.equal(store.progressHub(actor, {}).children.length, 1);
  assert.ok(store.dashboard(actor));
});

test('a new family sees nothing of any other family and the lead stays internal', () => {
  const store = demo();
  const out = store.register(parent());
  const actor = store.login('huda.salem@example.org', PW);
  assert.throws(() => store.getStudent(actor, IDS.yusuf), /do not have access/i);
  assert.throws(() => store.learningProfile(actor, IDS.adam), /do not have access/i);
  const visible = store.listFollowUps(actor, {});
  assert.equal(visible.some((f) => f.studentId === out.studentId), false, 'internal lead is not shown to the family');
  assert.equal(store.listStudents(actor, {}).length, 1);
});

test('an adult signs up for themselves and gets their own login; under 16 is refused', () => {
  const store = demo();
  const out = store.register(parent({ for: 'self', guardianName: 'Sami Idris', guardianNameAr: 'سامي إدريس', email: 'sami@example.org', birthYear: 1990, studentName: '' }));
  const snap = store.snapshot();
  const student = snap.students.find((s) => s.id === out.studentId);
  assert.equal(student.userId, out.user.id);
  assert.equal(student.loginEnabled, true);
  assert.equal(snap.guardians.find((g) => g.userId === out.user.id).relation, 'self');
  const actor = store.login('sami@example.org', PW);
  assert.equal(actor.studentId, out.studentId);
  assert.equal(store.getStudent(actor, out.studentId).student.id, out.studentId);
  assert.throws(() => store.register(parent({ for: 'self', email: 'kid@example.org', birthYear: 2013 })), /16\+/);
});

test('bad input is refused with a clear reason', () => {
  const store = demo();
  const bad = (over, pattern) => assert.throws(() => store.register(parent({ email: `u${Math.random()}@example.org`, ...over })), pattern);
  bad({ accept: '' }, /accept/i);
  bad({ email: 'not-an-email' }, /valid email/i);
  bad({ password: 'short' }, /at least/i);
  bad({ password: 'huda.salem-pass-1', email: 'huda.salem@example.org' }, /email/i);
  bad({ guardianName: '<b>x</b>' }, /name/i);
  bad({ studentName: '' }, /child/i);
  bad({ birthYear: 2030 }, /birth year/i);
  bad({ birthYear: 1800 }, /birth year/i);
  bad({ phone: '12345' }, /international/i);
  bad({ phone: '+971 50 276 0242' }, /academy WhatsApp/i);
  bad({ courseId: 'crs_missing' }, /course/i);
  bad({ website: 'http://spam.example' }, /Could not create/i);
  store.register(parent());
  assert.throws(() => store.register(parent({ email: 'HUDA.SALEM@example.org' })), /already has an account/i);
  assert.equal(store.snapshot().users.filter((u) => u.email === 'huda.salem@example.org').length, 1);
});

test('a failed sign-up leaves no half-built records behind', () => {
  const store = demo();
  const before = store.snapshot();
  assert.throws(() => store.register(parent({ phone: 'nope' })));
  const after = store.snapshot();
  for (const key of ['users', 'families', 'guardians', 'students', 'followUps', 'audit']) assert.equal(after[key].length, before[key].length, key);
});

test('a daily cap stops a flood of sign-ups', () => {
  const store = demo();
  for (let i = 0; i < SIGNUP_DAILY_CAP; i++) store.register(parent({ email: `family${i}@example.org` }));
  assert.throws(() => store.register(parent({ email: 'one-too-many@example.org' })), (e) => e.status === 429 && e.code === 'signups_paused');
});

test('passwords are hashed, the demo accounts are untouched and sign-in still works for them', () => {
  const store = demo();
  store.register(parent());
  assert.equal(JSON.stringify(store.snapshot().audit).includes(PW), false);
  assert.equal(store.login('fatima.rahman@example.com', DEMO_PASSWORD.family).role, 'guardian');
});

test('production: a sign-up goes to the owner, and staff and family requests work without any demo user', () => {
  const store = prod();
  const out = store.register(parent());
  const owner = store.login('admin@ummahacademy.net', 'Zq7-kitchen-orbit-4412');
  const leads = store.listFollowUps(owner, {});
  assert.equal(leads.length, 1);
  assert.equal(leads[0].assigneeId, 'usr_owner');
  assert.ok(store.notifications(owner).some((n) => n.title === 'New sign-up'));
  assert.equal(store.getFamily(owner, out.familyId).family.id, out.familyId);
  assert.equal(store.getStudent(owner, out.studentId).student.id, out.studentId);

  // staff create a follow-up with no assignee given: it lands on the owner, not on a demo user that does not exist
  const made = store.createFollowUp(owner, { title: 'Call the family', type: 'sales', studentId: out.studentId });
  assert.equal(made.assigneeId, 'usr_owner');
  // the family asks for a change: it reaches the owner too
  const family = store.login('huda.salem@example.org', PW);
  const req = store.createChangeRequest(family, { studentId: out.studentId, kind: 'schedule', reason: 'Evenings only please' });
  assert.equal(req.assigneeId, 'usr_owner');
  assert.ok(store.notifications(owner).some((n) => n.title === 'Family request'));
  assert.equal(store.snapshot().users.filter((u) => u.role === 'ops').length, 0);
});
