import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashPassword } from '../src/domain/auth.mjs';
import { DEMO_PASSWORD, IDS, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';
import { editableFields, passwordProblem } from '../src/domain/profiles.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const seed = buildSeed(NOW);

function boot(extra = {}) {
  const store = createStore({ state: structuredClone(seed), now: () => NOW, secret: 'test-secret', onCommit() {}, ...extra });
  return {
    store,
    admin: () => store.login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
    omneya: () => store.login('omneya@ummahacademy.net', DEMO_PASSWORD.teacher),
    sara: () => store.login('sara@ummahacademy.net', DEMO_PASSWORD.teacher),
    khalid: () => store.login('khalid.rahman@example.com', DEMO_PASSWORD.family),
    fatima: () => store.login('fatima.rahman@example.com', DEMO_PASSWORD.family),
    omar: () => store.login('omar.mansouri@example.com', DEMO_PASSWORD.student),
  };
}

test('a family profile lists only the children that guardian is granted', () => {
  const { store, fatima, khalid } = boot();
  const f = store.getProfile(fatima());
  assert.deepEqual(f.children.map((c) => c.id).sort(), [IDS.layla, IDS.yusuf].sort());
  assert.equal(f.guardian.canViewBilling, false);
  assert.equal(f.family.id, IDS.famRahman);
  const k = store.getProfile(khalid());
  assert.equal(k.children.length, 3);
  assert.equal(JSON.stringify(f).includes('passwordHash'), false);
});

test('a teacher profile shows workload and can edit only the bio, language and time zone', () => {
  const { store, omneya } = boot();
  const actor = omneya();
  const p = store.getProfile(actor);
  assert.equal(p.teacher.id, IDS.tOmneya);
  assert.ok(p.load.students >= 1);
  assert.deepEqual(p.editable.sort(), ['bio', 'bioAr', 'locale', 'timezone']);
  store.updateProfile(actor, { bio: 'Tajweed teacher with a patient pace.', locale: 'en' });
  const after = store.getProfile(actor);
  assert.equal(after.teacher.bio, 'Tajweed teacher with a patient pace.');
  assert.equal(after.account.locale, 'en');
  assert.throws(() => store.updateProfile(actor, { name: 'Someone Else' }), /cannot change/i);
  assert.throws(() => store.updateProfile(actor, { bio: '<script>x</script>' }), /markup/i);
});

test('a student cannot rename themselves and a bad time zone is refused', () => {
  const { store, omar } = boot();
  const actor = omar();
  assert.deepEqual(editableFields(actor).sort(), ['locale', 'timezone']);
  assert.throws(() => store.updateProfile(actor, { nameAr: 'اسم آخر' }), /cannot change/i);
  assert.throws(() => store.updateProfile(actor, { timezone: 'Mars/Olympus' }), /time zone/i);
  assert.throws(() => store.updateProfile(actor, { locale: 'xx' }), /ar or en/i);
  store.updateProfile(actor, { timezone: 'Europe/London' });
  assert.ok(store.snapshot().audit.some((a) => a.action === 'profile.updated' && a.entityId === actor.id));
});

test('a guardian renaming themselves updates their guardian record too', () => {
  const { store, fatima } = boot();
  const actor = fatima();
  store.updateProfile(actor, { name: 'Fatima R. Rahman' });
  const snap = store.snapshot();
  assert.equal(snap.users.find((u) => u.id === actor.id).name, 'Fatima R. Rahman');
  assert.equal(snap.guardians.find((g) => g.id === actor.guardianId).name, 'Fatima R. Rahman');
});

test('changing a password needs the current one, enforces strength, and signs older sessions out', () => {
  const { store, fatima } = boot();
  const actor = fatima();
  assert.equal(store.sessionVersion(actor.id), 0);
  assert.throws(() => store.changePassword(actor, { current: 'wrong-password', next: 'A-new-long-passphrase-9' }), /incorrect/i);
  assert.throws(() => store.changePassword(actor, { current: DEMO_PASSWORD.family, next: 'short' }), /at least/i);
  assert.throws(() => store.changePassword(actor, { current: DEMO_PASSWORD.family, next: 'fatima.rahman-2026' }), /email/i);
  const out = store.changePassword(actor, { current: DEMO_PASSWORD.family, next: 'A-new-long-passphrase-9' });
  assert.equal(out.sessionVersion, 1);
  assert.equal(store.sessionVersion(actor.id), 1);
  assert.throws(() => store.login('fatima.rahman@example.com', DEMO_PASSWORD.family), /incorrect/i);
  assert.equal(store.login('fatima.rahman@example.com', 'A-new-long-passphrase-9').id, actor.id);
  const audit = JSON.stringify(store.snapshot().audit);
  assert.equal(audit.includes('A-new-long-passphrase-9'), false, 'passwords must never reach the audit log');
});

test('production refuses a published demo password as the new password', () => {
  const state = structuredClone(seed);
  const fatimaUser = state.users.find((u) => u.email === 'fatima.rahman@example.com');
  fatimaUser.passwordHash = hashPassword('A-real-production-pass-1');
  const store = createStore({ state, now: () => NOW, secret: 'test-secret', onCommit() {}, production: true });
  const actor = store.login('fatima.rahman@example.com', 'A-real-production-pass-1');
  assert.throws(() => store.changePassword(actor, { current: 'A-real-production-pass-1', next: DEMO_PASSWORD.family }), /demo password/i);
  assert.equal(store.changePassword(actor, { current: 'A-real-production-pass-1', next: 'Another-real-pass-2' }).sessionVersion, 1);
});

test('password rules reject reuse, echoes of the email name and trivial strings', () => {
  assert.ok(passwordProblem('short'));
  assert.ok(passwordProblem('aaaaaaaaaaaa'));
  assert.ok(passwordProblem('password1234'));
  assert.ok(passwordProblem('khalid.rahman-2026-x', { email: 'khalid.rahman@example.com' }));
  assert.ok(passwordProblem('same-long-password-1', { current: 'same-long-password-1' }));
  assert.equal(passwordProblem('a-perfectly-fine-phrase-77', { email: 'khalid.rahman@example.com', current: 'old' }), null);
});

test('a learning profile follows the same access rules as the student record', () => {
  const { store, fatima, omar, khalid } = boot();
  const yusuf = store.learningProfile(fatima(), IDS.yusuf);
  assert.equal(yusuf.student.id, IDS.yusuf);
  assert.ok(yusuf.attendance.marked >= 1);
  assert.equal(yusuf.attendance.rate, 100);
  assert.ok(yusuf.lessons.completed >= 1);
  assert.throws(() => store.learningProfile(fatima(), IDS.adam), /do not have access/i);
  assert.equal(store.learningProfile(khalid(), IDS.adam).student.id, IDS.adam);
  assert.equal(store.learningProfile(omar(), IDS.omarM).student.id, IDS.omarM);
  assert.throws(() => store.learningProfile(omar(), IDS.yusuf), /do not have access/i);
});

test('placement rubric scores and assessor notes stay with staff', () => {
  const state = structuredClone(seed);
  state.placements = [{
    id: 'plc_1', studentId: IDS.yusuf, courseId: IDS.cTajweed, rubricId: 'rub_1', assessorId: IDS.omneyaUser,
    occurredAt: '2026-09-01T10:00:00.000Z', outcome: 'recommended', recommendedLevelId: null,
    scores: [{ criterion: 'makharij', score: 3 }], notes: 'Internal: rushes the ghunnah.',
  }];
  const store = createStore({ state, now: () => NOW, secret: 'test-secret', onCommit() {} });
  const family = store.learningProfile(store.login('fatima.rahman@example.com', DEMO_PASSWORD.family), IDS.yusuf);
  assert.equal(family.placement.outcome, 'recommended');
  assert.equal(family.placement.scores, undefined);
  assert.equal(family.placement.notes, undefined);
  const teacher = store.learningProfile(store.login('omneya@ummahacademy.net', DEMO_PASSWORD.teacher), IDS.yusuf);
  assert.equal(teacher.placement.scores.length, 1);
  assert.match(teacher.placement.notes, /ghunnah/);
});

test('every profile is serialisable without secrets for all roles', () => {
  const { store, admin, omneya, khalid, omar } = boot();
  for (const actor of [admin(), omneya(), khalid(), omar()]) {
    const text = JSON.stringify(store.getProfile(actor));
    assert.equal(/passwordHash|scrypt\$/.test(text), false, actor.role);
  }
});
