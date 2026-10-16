import assert from 'node:assert/strict';
import { test } from 'node:test';
import { issueAssetToken } from '../src/domain/auth.mjs';
import { findHardConflicts } from '../src/domain/policy.mjs';
import { DEMO_PASSWORD, IDS, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';
import { localOn, localParts } from '../src/domain/time.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const seed = buildSeed(NOW);

function boot(secret = 'test-secret') {
  let t = new Date(NOW);
  const store = createStore({
    state: structuredClone(seed),
    now: () => t,
    secret,
    onCommit() {},
  });
  const login = (email, password) => store.login(email, password);
  return {
    store,
    secret,
    setNow(d) {
      t = new Date(d);
    },
    now: () => t,
    admin: () => login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
    ops: () => login('ops@ummahacademy.net', DEMO_PASSWORD.ops),
    omneya: () => login('omneya@ummahacademy.net', DEMO_PASSWORD.teacher),
    sara: () => login('sara@ummahacademy.net', DEMO_PASSWORD.teacher),
    nour: () => login('nour@ummahacademy.net', DEMO_PASSWORD.teacher),
    khalid: () => login('khalid.rahman@example.com', DEMO_PASSWORD.family),
    fatima: () => login('fatima.rahman@example.com', DEMO_PASSWORD.family),
    omar: () => login('omar.mansouri@example.com', DEMO_PASSWORD.student),
    yasmin: () => login('yasmin.dubois@example.com', DEMO_PASSWORD.family),
  };
}

test('Sydney 7:00 stays 7:00 across the October DST change', () => {
  const before = localOn(new Date('2026-10-03T00:00:00.000Z'), 0, 7, 0, 'Australia/Sydney');
  const after = localOn(new Date('2026-10-16T00:00:00.000Z'), 0, 7, 0, 'Australia/Sydney');
  assert.equal(localParts(before, 'Australia/Sydney').hour, 7);
  assert.equal(localParts(after, 'Australia/Sydney').hour, 7);
  assert.notEqual(before.toISOString(), after.toISOString());
  assert.equal(before.toISOString(), '2026-10-02T21:00:00.000Z');
  assert.equal(after.toISOString(), '2026-10-15T20:00:00.000Z');
});

test('a London 23:30 session is the next calendar day in Cairo', () => {
  const start = localOn(new Date('2026-10-16T12:00:00.000Z'), 0, 23, 30, 'Europe/London');
  const london = localParts(start, 'Europe/London');
  const cairo = localParts(start, 'Africa/Cairo');
  assert.equal(london.hour, 23);
  assert.equal(london.minute, 30);
  assert.ok(cairo.hour < 3, `expected after midnight in Cairo, got ${cairo.hour}:${cairo.minute}`);
  assert.notEqual(london.day, cairo.day);
});

test('seeded open sessions do not double-book a teacher or a student', () => {
  const open = seed.sessions.filter((s) => s.status === 'scheduled' || s.status === 'confirmed');
  const hits = [];
  for (const s of open) hits.push(...findHardConflicts(open, s).filter((h) => h.sessionId !== s.id));
  assert.equal(hits.length, 0);
});

test('Yusuf balance is derived: scheduled and policy cancellations are not consumed', () => {
  const { store, admin } = boot();
  const dto = store.getStudent(admin(), IDS.yusuf);
  const cycle = dto.balance.byCycle.find((c) => c.cycleId === IDS.cycYusuf);
  assert.equal(cycle.allocated, 8);
  assert.equal(cycle.delivered, 3);
  assert.equal(cycle.scheduledNotHeld, 2);
  assert.equal(cycle.remaining, 5);
  assert.equal(dto.axes.academicStatus, 'active');
  assert.equal(dto.axes.subscriptionStatus, 'active');
  assert.equal(dto.axes.loginEnabled, false);
  assert.ok(dto.balance.formulaAr.includes('لا يُخصم'));
});

test('renewal keeps the previous cycle and does not move its balance', () => {
  const { store, admin } = boot();
  const actor = admin();
  const before = store.getSubscription(actor, IDS.subAmina);
  const prev = before.cycles.find((c) => c.id === IDS.cycAminaPrev);
  assert.equal(prev.status, 'completed');
  assert.equal(prev.balance.remaining, 0);
  assert.equal(prev.balance.consumed, 4);
  const renewed = store.renewSubscription(actor, IDS.subAmina, { planId: 'gold', reason: 'Early renewal before the current end' });
  assert.equal(renewed.cycles.length, before.cycles.length + 1);
  const prevAfter = renewed.cycles.find((c) => c.id === IDS.cycAminaPrev);
  assert.equal(prevAfter.balance.consumed, 4);
  assert.equal(prevAfter.status, 'completed');
  const added = renewed.cycles.find((c) => c.status === 'scheduled');
  assert.ok(added);
  assert.equal(added.balance.consumed, 0);
});

test('freeze and resume keep remaining credits', () => {
  const { store, admin } = boot();
  const actor = admin();
  const before = store.getSubscription(actor, IDS.subYasmin);
  const frozen = before.cycles.find((c) => c.status === 'frozen');
  assert.equal(frozen.balance.remaining, 5);
  const resumed = store.resumeSubscription(actor, IDS.subYasmin, { reason: 'Travel ended' });
  assert.equal(resumed.remainingBefore, 5);
  assert.equal(resumed.remainingAfter, 5);
  assert.equal(resumed.subscription.status, 'active');
});

test('completing a session consumes one credit, and a second call does not', () => {
  const { store, admin } = boot();
  const actor = admin();
  const before = store.getStudent(actor, IDS.yusuf).balance.byCycle.find((c) => c.cycleId === IDS.cycYusuf).remaining;
  const key = 'complete-yusuf-next';
  const first = store.completeSession(actor, IDS.sesYusufNext, { attendance: 'present' }, { idempotencyKey: key });
  assert.equal(first.status, 'completed');
  const after = store.getStudent(actor, IDS.yusuf).balance.byCycle.find((c) => c.cycleId === IDS.cycYusuf).remaining;
  assert.equal(after, before - 1);
  const replay = store.completeSession(actor, IDS.sesYusufNext, { attendance: 'present' }, { idempotencyKey: key });
  assert.equal(replay.replayed, true);
  const still = store.getStudent(actor, IDS.yusuf).balance.byCycle.find((c) => c.cycleId === IDS.cycYusuf).remaining;
  assert.equal(still, after);
  assert.throws(() => store.completeSession(actor, IDS.sesYusufNext, {}), /Already completed/);
  assert.equal(store.getStudent(actor, IDS.yusuf).balance.byCycle.find((c) => c.cycleId === IDS.cycYusuf).remaining, after);
});

test('family late cancel consumes; early cancel and teacher cancel do not', () => {
  const { store, admin, setNow } = boot();
  const actor = admin();
  const mk = (hoursAhead, suffix) =>
    store.createSession(actor, {
      studentId: IDS.omarM,
      startsAt: new Date(NOW.getTime() + hoursAhead * 3600 * 1000).toISOString(),
      teacherId: IDS.tNour,
      durationMin: 30,
    }, { idempotencyKey: `mk-${suffix}` });
  const soon = mk(2, 'soon');
  const later = mk(48, 'later');
  const teacherSlot = mk(72, 'teacher');
  store.cancelSession(actor, soon.id, { party: 'family', reason: 'Forgot until the last hour' });
  store.cancelSession(actor, later.id, { party: 'family', reason: 'Travel planned two days ahead' });
  store.cancelSession(actor, teacherSlot.id, { party: 'teacher', reason: 'Teacher illness' });
  const snap = store.snapshot();
  const byId = (id) => snap.sessions.find((s) => s.id === id);
  assert.equal(byId(soon.id).lateCancel, true);
  assert.equal(byId(later.id).lateCancel, false);
  assert.equal(byId(teacherSlot.id).cancelledByRole, 'teacher');
  const bal = store.getStudent(actor, IDS.omarM).balance.byCycle.find((c) => c.cycleId === IDS.cycOmar);
  const soonLine = bal.lines.find((l) => l.sessionId === soon.id);
  const laterLine = bal.lines.find((l) => l.sessionId === later.id);
  const teacherLine = bal.lines.find((l) => l.sessionId === teacherSlot.id);
  assert.equal(soonLine.consumed, 1);
  assert.equal(laterLine.consumed, 0);
  assert.equal(teacherLine.consumed, 0);
  setNow(NOW);
});

test('reschedule keeps the original time and does not consume twice', () => {
  const { store, admin } = boot();
  const actor = admin();
  const before = store.getStudent(actor, IDS.yusuf).balance.total.consumed;
  const moved = store.rescheduleSession(actor, IDS.sesYusufNext, {
    startsAt: new Date(NOW.getTime() + 9 * 86400000).toISOString(),
    reason: 'Clinic appointment',
  });
  assert.equal(moved.from.status, 'rescheduled');
  assert.equal(moved.from.originalStartsAt, moved.to.originalStartsAt);
  assert.notEqual(moved.from.startsAt, moved.to.startsAt);
  const after = store.getStudent(actor, IDS.yusuf).balance.total.consumed;
  assert.equal(after, before);
  const line = store.getStudent(actor, IDS.yusuf).balance.byCycle.find((c) => c.cycleId === IDS.cycYusuf).lines.find((l) => l.sessionId === IDS.sesYusufNext);
  assert.equal(line.consumed, 0);
});

test('teacher overlap and student overlap are rejected; sibling overlap is only a warning', () => {
  const { store, admin } = boot();
  const actor = admin();
  const yusufNext = store.getSession(actor, IDS.sesYusufNext);
  assert.throws(
    () =>
      store.createSession(actor, {
        studentId: IDS.amina,
        teacherId: IDS.tOmneya,
        startsAt: yusufNext.startsAt,
        durationMin: 30,
      }),
    /overlaps/,
  );
  assert.throws(
    () =>
      store.createSession(actor, {
        studentId: IDS.yusuf,
        teacherId: IDS.tSara,
        startsAt: yusufNext.startsAt,
        durationMin: 30,
      }),
    /overlaps/,
  );
  const family = store.getFamily(actor, IDS.famRahman);
  assert.ok(family.overlaps.some((o) => o.studentA === IDS.yusuf || o.studentB === IDS.yusuf));
  assert.equal(store.snapshot().sessions.filter((s) => s.studentId === IDS.amina && s.startsAt === yusufNext.startsAt).length, 0);
});

test('changing teacher keeps history and does not rewrite the past session', () => {
  const { store, admin } = boot();
  const actor = admin();
  const pastBefore = store.snapshot().sessions.find((s) => s.id === IDS.sesYusufDone).teacherId;
  const result = store.changeTeacher(actor, {
    enrollmentId: IDS.enrYusuf,
    teacherId: IDS.tNour,
    reason: 'Family asked for a temporary academic move',
    moveFuture: false,
  });
  assert.ok(result.history.some((a) => a.teacherId === IDS.tSara && a.endAt));
  assert.ok(result.history.some((a) => a.teacherId === IDS.tOmneya && a.endAt));
  assert.ok(result.history.some((a) => a.teacherId === IDS.tNour && !a.endAt));
  assert.equal(store.snapshot().sessions.find((s) => s.id === IDS.sesYusufDone).teacherId, pastBefore);
  assert.equal(result.futureMoved.length, 0);
});

test('a one-session substitute does not end the primary assignment', () => {
  const { store, admin } = boot();
  const actor = admin();
  const primaryBefore = store.snapshot().assignments.find((a) => a.studentId === IDS.adam && a.kind === 'primary' && !a.endAt);
  store.substituteTeacher(actor, IDS.sesAdamNext, { teacherId: IDS.tSara, reason: 'Nour is at a training' });
  const primaryAfter = store.snapshot().assignments.find((a) => a.id === primaryBefore.id);
  assert.equal(primaryAfter.endAt, null);
  assert.equal(primaryAfter.teacherId, IDS.tNour);
  const session = store.snapshot().sessions.find((s) => s.id === IDS.sesAdamNext);
  assert.equal(session.teacherId, IDS.tSara);
  assert.equal(session.substituteFor, IDS.tNour);
});

test('payment replay does not post twice and does not flip subscription status', () => {
  const { store, admin } = boot();
  const actor = admin();
  const beforeStatus = store.getSubscription(actor, IDS.subAmina).status;
  const key = 'pay-amina-once';
  const first = store.recordPayment(actor, { subscriptionId: IDS.subAmina, cycleId: IDS.cycAmina, amount: 96, status: 'failed', failureReason: 'Issuer declined again' }, { idempotencyKey: key });
  const second = store.recordPayment(actor, { subscriptionId: IDS.subAmina, cycleId: IDS.cycAmina, amount: 96, status: 'paid' }, { idempotencyKey: key });
  assert.equal(second.replayed, true);
  assert.equal(second.payment.id, first.payment.id);
  assert.equal(second.subscriptionStatus, beforeStatus);
  const pays = store.snapshot().payments.filter((p) => p.idempotencyKey === key);
  assert.equal(pays.length, 1);
  assert.ok(store.snapshot().payments.some((p) => p.id === IDS.payAminaFail));
  assert.ok(store.snapshot().payments.some((p) => p.id === IDS.payAminaOk));
});

test('adjustment requires a reason and is audited', () => {
  const { store, admin } = boot();
  const actor = admin();
  assert.throws(() => store.adjustCycle(actor, IDS.cycYusuf, { delta: 1, reason: 'no' }), /reason/i);
  const before = store.snapshot().audit.length;
  const adjustment = { delta: 1, reason: 'Makeup credit after a platform outage' };
  store.adjustCycle(actor, IDS.cycYusuf, adjustment, { idempotencyKey: 'cycle-adjust-once' });
  store.adjustCycle(actor, IDS.cycYusuf, { ...adjustment, delta: 4 }, { idempotencyKey: 'cycle-adjust-once' });
  const cycle = store.getSubscription(actor, IDS.subYusuf).cycles.find((c) => c.id === IDS.cycYusuf);
  assert.equal(cycle.balance.allocated, 9);
  assert.equal(cycle.adjustments.filter((a) => a.reason === adjustment.reason).length, 1);
  assert.equal(cycle.balance.remaining, 6);
  const row = store.snapshot().audit.at(-1);
  assert.equal(row.action, 'cycle.adjusted');
  assert.equal(row.before.allocated, 8);
  assert.equal(row.after.allocated, 9);
  assert.ok(store.snapshot().audit.length > before);
});


test('subscription freeze and resume replay without repeating financial state changes', () => {
  const { store, admin } = boot();
  const actor = admin();
  const frozen = store.freezeSubscription(actor, IDS.subYusuf, { reason: 'Family travel' }, { idempotencyKey: 'freeze-yusuf-once' });
  const frozenAt = store.snapshot().cycles.find((c) => c.subscriptionId === IDS.subYusuf && c.status === 'frozen').frozenAt;
  const auditAfterFreeze = store.snapshot().audit.filter((a) => a.action === 'subscription.frozen').length;
  store.freezeSubscription(actor, IDS.subYusuf, { reason: 'Different retry payload must not apply twice' }, { idempotencyKey: 'freeze-yusuf-once' });
  assert.equal(store.snapshot().cycles.find((c) => c.subscriptionId === IDS.subYusuf && c.status === 'frozen').frozenAt, frozenAt);
  assert.equal(store.snapshot().audit.filter((a) => a.action === 'subscription.frozen').length, auditAfterFreeze);
  assert.equal(frozen.subscription.status, 'paused');

  store.resumeSubscription(actor, IDS.subYusuf, { reason: 'Family returned' }, { idempotencyKey: 'resume-yusuf-once' });
  const resumedAt = store.snapshot().cycles.find((c) => c.subscriptionId === IDS.subYusuf && c.status === 'active').resumedAt;
  const auditAfterResume = store.snapshot().audit.filter((a) => a.action === 'subscription.resumed').length;
  store.resumeSubscription(actor, IDS.subYusuf, { reason: 'Duplicate retry' }, { idempotencyKey: 'resume-yusuf-once' });
  assert.equal(store.snapshot().cycles.find((c) => c.subscriptionId === IDS.subYusuf && c.status === 'active').resumedAt, resumedAt);
  assert.equal(store.snapshot().audit.filter((a) => a.action === 'subscription.resumed').length, auditAfterResume);
});


test('follow-up attempts append, and closing requires an outcome', () => {
  const { store, ops } = boot();
  const actor = ops();
  const before = store.getFollowUp(actor, IDS.fuLayla).attempts.length;
  store.addAttempt(actor, IDS.fuLayla, { note: 'Third call, still deciding.', channel: 'call' }, { idempotencyKey: 'layla-followup-attempt-once' });
  store.addAttempt(actor, IDS.fuLayla, { note: 'Retry payload must not append again.', channel: 'call' }, { idempotencyKey: 'layla-followup-attempt-once' });
  const after = store.getFollowUp(actor, IDS.fuLayla);
  assert.equal(after.attempts.length, before + 1);
  assert.ok(after.attempts.some((a) => a.note.includes('Second call')) || after.attempts.length >= 3);
  assert.throws(() => store.transitionFollowUp(actor, IDS.fuLayla, { status: 'closed' }), /outcome/i);
  const closed = store.transitionFollowUp(actor, IDS.fuLayla, { status: 'closed', outcome: 'Family chose Launch and will pay tomorrow.' });
  assert.equal(closed.status, 'closed');
  assert.match(closed.outcome, /Launch/);
});

test('Fatima cannot see Adam, his recording, or the family invoices', () => {
  const { store, fatima, khalid } = boot();
  const mother = fatima();
  const father = khalid();
  assert.throws(() => store.getStudent(mother, IDS.adam), /access/i);
  const kids = store.listStudents(mother).map((s) => s.id);
  assert.deepEqual(kids.sort(), [IDS.layla, IDS.yusuf].sort());
  const family = store.getFamily(mother, IDS.famRahman);
  assert.equal(family.payments, null);
  assert.ok(!JSON.stringify(family).includes(IDS.adam));
  assert.throws(() => store.issueAssetToken(mother, IDS.astAdam), /access/i);
  const token = store.issueAssetToken(father, IDS.astAdam);
  assert.throws(() => store.readAsset(mother, IDS.astAdam, token.token), /access/i);
  const own = store.issueAssetToken(mother, IDS.astYusuf);
  const body = store.readAsset(mother, IDS.astYusuf, own.token);
  assert.equal(body.asset.id, IDS.astYusuf);
  assert.equal(body.demo, true);
});

test('a student cannot open a sibling recording by guessing the id', () => {
  const { store, omar } = boot();
  const child = omar();
  assert.throws(() => store.getStudent(child, IDS.yusuf), /access/i);
  assert.throws(() => store.issueAssetToken(child, IDS.astAdam), /access/i);
  assert.throws(() => store.readAsset(child, IDS.astAdam, 'not-a-token'), /access/i);
  assert.equal(store.getStudent(child, IDS.omarM).payments, null);
});

test('teacher sees academic history but not invoices', () => {
  const { store, omneya } = boot();
  const teacher = omneya();
  const dto = store.getStudent(teacher, IDS.yusuf);
  assert.equal(dto.payments, null);
  assert.equal(dto.moneyVisible, false);
  assert.ok(dto.assignments.some((a) => a.teacherId === IDS.tSara && a.endAt));
  assert.equal(dto.subscriptions[0].plan.price, null);
  assert.throws(() => store.getFamily(teacher, IDS.famRahman), /access/i);
  assert.throws(() => store.recordPayment(teacher, { subscriptionId: IDS.subYusuf, amount: 1, status: 'paid' }), /access/i);
  const dash = store.dashboard(teacher);
  assert.ok(dash.teaching.scheduled !== dash.teaching.completedThisWeek || dash.teaching.noteEn);
});

test('asset token expires and is bound to the user who asked for it', () => {
  const { store, khalid, setNow, secret } = boot();
  const father = khalid();
  const issued = store.issueAssetToken(father, IDS.astYusuf);
  setNow(new Date(NOW.getTime() + 16 * 60 * 1000));
  assert.throws(() => store.readAsset(father, IDS.astYusuf, issued.token), /access/i);
  setNow(NOW);
  const fresh = issueAssetToken(father.id, IDS.astYusuf, secret, 60, NOW.getTime());
  const mother = store.login('fatima.rahman@example.com', DEMO_PASSWORD.family);
  assert.throws(() => store.readAsset(mother, IDS.astYusuf, fresh.token), /access/i);
});

test('audit log has no secrets and cannot be edited by a later command', () => {
  const { store, admin } = boot();
  const actor = admin();
  assert.throws(() => store.login('admin@ummahacademy.net', 'wrong-password'), /incorrect/i);
  const failed = store.snapshot().audit.at(-1);
  assert.equal(failed.action, 'auth.login_failed');
  assert.equal(JSON.stringify(failed).includes('wrong-password'), false);
  assert.equal(JSON.stringify(store.snapshot().audit).includes('passwordHash'), false);
  const ids = store.snapshot().audit.map((a) => a.id);
  store.updateStudent(actor, IDS.yusuf, { academicStatus: 'paused', reason: 'Family travel for two weeks' });
  const after = store.snapshot().audit.map((a) => a.id);
  for (const id of ids) assert.ok(after.includes(id));
  assert.equal(store.snapshot().students.find((s) => s.id === IDS.yusuf).academicStatus, 'paused');
  assert.equal(store.snapshot().subscriptions.find((s) => s.id === IDS.subYusuf).status, 'active');
});

test('ops cannot reset the demo; a frozen plan cannot take a new session', () => {
  const { store, ops, admin } = boot();
  assert.throws(() => store.resetDemo(ops()), /access/i);
  assert.throws(
    () =>
      store.createSession(admin(), {
        studentId: IDS.yasmin,
        startsAt: new Date(NOW.getTime() + 5 * 86400000).toISOString(),
      }),
    /frozen/i,
  );
});

test('dashboard counts are the records behind them', () => {
  const { store, admin } = boot();
  const dash = store.dashboard(admin());
  const pending = dash.metrics.find((m) => m.id === 'pending_reports');
  const listed = store.listSessions(admin(), { pendingReport: '1' });
  assert.equal(pending.value, listed.length);
  assert.ok(listed.some((s) => s.id === IDS.sesYusufPending));
  const trials = store.listStudents(admin(), { status: 'trial' });
  assert.equal(dash.metrics.find((m) => m.id === 'trials').value, trials.length);
});

test('acceptance checklist passes on the seeded story', () => {
  const { store, admin } = boot();
  const report = store.acceptance(admin());
  assert.equal(report.pass, true, JSON.stringify(report.checks.filter((c) => !c.pass)));
  const health = store.integrity(admin());
  assert.equal(health.ok, true, JSON.stringify(health.issues.filter((i) => i.level === 'error')));
});

test('guardian schedule request becomes a family follow-up, not a silent edit', () => {
  const { store, khalid, ops } = boot();
  const req = store.createChangeRequest(khalid(), {
    studentId: IDS.yusuf,
    kind: 'schedule',
    reason: 'Please move Thursday after school.',
  });
  assert.equal(req.visibility, 'family');
  assert.equal(req.attempts.length, 1);
  const original = seed.sessions.find((s) => s.id === IDS.sesYusufNext).startsAt;
  assert.equal(store.snapshot().sessions.find((s) => s.id === IDS.sesYusufNext).startsAt, original);
  const seen = store.getFollowUp(ops(), req.id);
  assert.match(seen.attempts[0].note, /Thursday/);
});

test('no-show by the student consumes a credit; teacher no-show does not', () => {
  const { store, admin } = boot();
  const actor = admin();
  const cycle = store.getStudent(actor, IDS.amina).balance.byCycle.find((c) => c.cycleId === IDS.cycAminaPrev);
  const line = cycle.lines.find((l) => l.sessionId === IDS.sesAminaNoShow);
  assert.equal(line.consumed, 1);
  const slot = store.createSession(actor, {
    studentId: IDS.omarM,
    teacherId: IDS.tNour,
    startsAt: new Date(NOW.getTime() + 6 * 86400000).toISOString(),
    durationMin: 30,
  });
  const before = store.getStudent(actor, IDS.omarM).balance.total.consumed;
  store.markNoShow(actor, slot.id, { party: 'teacher', reason: 'Teacher lost power' });
  assert.equal(store.getStudent(actor, IDS.omarM).balance.total.consumed, before);
});


test('reschedule chains preserve the first original time and link every move', () => {
  const { store, admin } = boot();
  const actor = admin();
  const initial = store.snapshot().sessions.find((s) => s.id === IDS.sesYusufNext);
  const first = store.rescheduleSession(actor, initial.id, {
    startsAt: new Date(NOW.getTime() + 50 * 86400000).toISOString(),
    reason: 'First schedule change',
  });
  const second = store.rescheduleSession(actor, first.to.id, {
    startsAt: new Date(NOW.getTime() + 57 * 86400000).toISOString(),
    reason: 'Second schedule change',
  });
  const snapshot = store.snapshot();
  const byId = (id) => snapshot.sessions.find((s) => s.id === id);
  assert.equal(byId(initial.id).status, 'rescheduled');
  assert.equal(byId(initial.id).rescheduledToId, first.to.id);
  assert.equal(byId(first.to.id).status, 'rescheduled');
  assert.equal(byId(first.to.id).rescheduledFromId, initial.id);
  assert.equal(byId(first.to.id).rescheduledToId, second.to.id);
  assert.equal(byId(second.to.id).rescheduledFromId, first.to.id);
  assert.equal(byId(second.to.id).originalStartsAt, initial.startsAt);
  assert.equal(byId(first.to.id).originalStartsAt, initial.startsAt);
  assert.equal(byId(initial.id).originalStartsAt, initial.startsAt);
  const events = snapshot.audit.filter((row) => row.action === 'session.rescheduled');
  assert.ok(events.some((row) => row.reason === 'First schedule change'));
  assert.ok(events.some((row) => row.reason === 'Second schedule change'));
});

test('a conflicting reschedule leaves session history and audit unchanged', () => {
  const { store, admin } = boot();
  const actor = admin();
  const original = store.snapshot().sessions.find((s) => s.id === IDS.sesYusufNext);
  const occupied = store.createSession(actor, {
    studentId: IDS.amina,
    teacherId: original.teacherId,
    startsAt: new Date(NOW.getTime() + 60 * 86400000).toISOString(),
    durationMin: 30,
    reason: 'Create a slot to test conflict rollback',
  });
  const before = store.snapshot();
  assert.throws(() => store.rescheduleSession(actor, IDS.sesYusufNext, {
    startsAt: occupied.startsAt,
    reason: 'This move must be rejected',
  }), /overlaps/i);
  assert.deepEqual(store.snapshot(), before, 'failed reschedule must not mutate either session or audit history');
});

test('attendance accepts only declared statuses and invalid updates roll back', () => {
  const { store, admin } = boot();
  const actor = admin();
  const before = store.snapshot();
  assert.throws(() => store.markAttendance(actor, IDS.sesYusufNext, {
    status: 'maybe',
    reason: 'Invalid attendance state test',
  }), /attendance status/i);
  assert.deepEqual(store.snapshot(), before);

  assert.throws(() => store.completeSession(actor, IDS.sesYusufNext, {
    attendance: 'unknown',
  }), /attendance status/i);
  assert.deepEqual(store.snapshot(), before, 'invalid attendance must not complete a session, consume a credit or append audit');
});

test('report corrections preserve before/after content in audit without duplicating the report or submission event', () => {
  const { store, admin } = boot();
  const actor = admin();
  const sessionId = IDS.sesYusufNext;

  assert.throws(() => store.submitReport(actor, sessionId, {
    summary: 'A report cannot precede completion',
  }), /after the session is completed/i);

  store.completeSession(actor, sessionId, { attendance: 'present' });
  store.submitReport(actor, sessionId, {
    summary: 'Read short vowels accurately',
    homework: 'Practice the first page',
    nextStep: 'Introduce long vowels',
  });
  store.submitReport(actor, sessionId, {
    summary: 'Read short and long vowels accurately',
    homework: 'Practice the second page',
    nextStep: 'Review pronunciation',
    reason: 'Corrected after teacher review',
  });

  const snapshot = store.snapshot();
  const reports = snapshot.reports.filter((report) => report.sessionId === sessionId);
  assert.equal(reports.length, 1);
  assert.equal(reports[0].summary, 'Read short and long vowels accurately');
  assert.equal(reports[0].homework, 'Practice the second page');

  const changes = snapshot.audit.filter((row) => row.entityId === sessionId && ['report.submitted', 'report.corrected'].includes(row.action));
  assert.equal(changes.length, 2);
  assert.equal(changes[0].action, 'report.submitted');
  assert.equal(changes[0].before, null);
  assert.equal(changes[0].after.summary, 'Read short vowels accurately');
  assert.equal(changes[1].action, 'report.corrected');
  assert.equal(changes[1].reason, 'Corrected after teacher review');
  assert.equal(changes[1].before.summary, 'Read short vowels accurately');
  assert.equal(changes[1].before.homework, 'Practice the first page');
  assert.equal(changes[1].after.summary, 'Read short and long vowels accurately');
  assert.equal(changes[1].after.homework, 'Practice the second page');
  assert.equal(snapshot.events.filter((event) => event.type === 'report.submitted' && event.entityId === sessionId).length, 1);
});
