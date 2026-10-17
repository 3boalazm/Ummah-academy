import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IDS, DEMO_PASSWORD, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';
import { localParts } from '../src/domain/time.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const seed = buildSeed(NOW);

function boot() {
  let t = new Date(NOW);
  const store = createStore({
    state: structuredClone(seed),
    now: () => t,
    secret: 'teacher-day-test-secret',
    onCommit() {},
  });
  const login = (email, password) => store.login(email, password);
  return {
    store,
    omneya: () => login('omneya@ummahacademy.net', DEMO_PASSWORD.teacher),
    sara: () => login('sara@ummahacademy.net', DEMO_PASSWORD.teacher),
    nour: () => login('nour@ummahacademy.net', DEMO_PASSWORD.teacher),
    khalid: () => login('khalid.rahman@example.com', DEMO_PASSWORD.family),
    omar: () => login('omar.mansouri@example.com', DEMO_PASSWORD.student),
    admin: () => login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
  };
}

function ids(rows, key = 'id') {
  return rows.map((row) => (key.includes('.') ? row.student.id : row[key])).sort();
}

test('teacher day is the calendar day in the teacher timezone and lists only that teacher’s lessons', () => {
  const { store, omneya, sara } = boot();
  const day = store.teacherDay(omneya());
  const cairo = localParts(NOW, 'Africa/Cairo');
  assert.equal(day.picker, false);
  assert.equal(day.teacher.id, IDS.tOmneya);
  assert.equal(day.date, `${cairo.year}-${String(cairo.month).padStart(2, '0')}-${String(cairo.day).padStart(2, '0')}`);
  assert.ok(day.today.some((s) => s.id === IDS.sesYusufNext));
  assert.equal(day.today.some((s) => s.studentId === IDS.layla), false);
  assert.equal(day.today.some((s) => s.teacherId !== IDS.tOmneya), false);

  const saraDay = store.teacherDay(sara());
  assert.ok(saraDay.today.some((s) => s.id === IDS.sesLaylaNext));
  assert.equal(saraDay.today.some((s) => s.id === IDS.sesYusufNext), false);
});

test('teacher roster is the current assignment, not ended history or another teacher’s students', () => {
  const { store, omneya, sara } = boot();
  const omneyaRoster = ids(store.teacherDay(omneya()).roster, 'student.id');
  assert.deepEqual(omneyaRoster, [IDS.alfarsi, IDS.amina, IDS.yusuf].sort());
  assert.equal(omneyaRoster.includes(IDS.layla), false);
  assert.equal(omneyaRoster.includes(IDS.adam), false);

  const yusuf = store.teacherDay(omneya()).roster.find((row) => row.student.id === IDS.yusuf);
  assert.equal(yusuf.isPrimary, true);
  assert.equal(yusuf.assignment.kind, 'primary');
  assert.ok(yusuf.nextSession);
  assert.equal(yusuf.nextSession.id, IDS.sesYusufNext);

  const saraRoster = ids(store.teacherDay(sara()).roster, 'student.id');
  assert.deepEqual(saraRoster, [IDS.layla, IDS.yasmin].sort());
  assert.equal(saraRoster.includes(IDS.yusuf), false, 'ended assignment must not keep Yusuf on Sara’s day roster');
});

test('pending reports stay on teacher day until submitted, separate from attendance and completion', () => {
  const { store, omneya } = boot();
  const day = store.teacherDay(omneya());
  assert.ok(day.pendingReports.some((s) => s.id === IDS.sesYusufPending));
  assert.equal(day.pendingReports.every((s) => s.pendingReport), true);
  const pending = store.getSession(omneya(), IDS.sesYusufPending);
  assert.equal(pending.status, 'completed');
  assert.equal(pending.pendingReport, true);
  assert.equal(pending.actions.complete, false);
  assert.equal(pending.actions.report, true);
});

test('teacher day flow: attendance, complete, then mandatory report that writes homework onto the student', () => {
  const { store, omneya } = boot();
  const teacher = omneya();
  const beforeHw = store.snapshot().homeworkAssignments.length;

  store.markAttendance(teacher, IDS.sesYusufNext, { status: 'present' });
  const attending = store.getSession(teacher, IDS.sesYusufNext);
  assert.equal(attending.attendance.at(-1).status, 'present');
  assert.equal(attending.status, 'confirmed');

  store.completeSession(teacher, IDS.sesYusufNext, { attendance: 'present' });
  const completed = store.teacherDay(teacher);
  assert.ok(completed.pendingReports.some((s) => s.id === IDS.sesYusufNext));
  assert.equal(store.getSession(teacher, IDS.sesYusufNext).pendingReport, true);

  assert.throws(
    () => store.submitReport(teacher, IDS.sesYusufNext, { summary: 'ok' }),
    /Summary is required|ملخص/i,
  );

  const reported = store.submitReport(teacher, IDS.sesYusufNext, {
    summary: 'Idgham is cleaner today',
    homework: 'Read the idgham page twice before next lesson',
    nextStep: 'Introduce iqlab',
  });
  assert.equal(reported.pendingReport, false);
  assert.ok(reported.homeworkAssignment);
  assert.equal(reported.homeworkAssignment.studentId, IDS.yusuf);
  assert.equal(reported.homeworkAssignment.sessionId, IDS.sesYusufNext);
  assert.equal(store.snapshot().homeworkAssignments.length, beforeHw + 1);

  const file = store.getStudent(teacher, IDS.yusuf);
  assert.ok(file.homework.some((h) => h.sessionId === IDS.sesYusufNext && h.open));
  const listed = store.listHomework(teacher, { studentId: IDS.yusuf });
  assert.ok(listed.some((h) => h.sessionId === IDS.sesYusufNext));

  store.submitReport(teacher, IDS.sesYusufNext, {
    summary: 'Idgham is cleaner today — restated',
    homework: 'Read the same page three times',
    nextStep: 'Introduce iqlab',
    reason: 'Clarified the homework wording',
  });
  assert.equal(store.snapshot().homeworkAssignments.filter((h) => h.sessionId === IDS.sesYusufNext).length, 1);
  assert.equal(store.teacherDay(teacher).pendingReports.some((s) => s.id === IDS.sesYusufNext), false);
});

test('a report without homework does not invent an academic assignment', () => {
  const { store, omneya } = boot();
  const teacher = omneya();
  store.completeSession(teacher, IDS.sesYusufNext, { attendance: 'present' });
  store.submitReport(teacher, IDS.sesYusufNext, { summary: 'Held the lesson; no homework this time' });
  assert.equal(store.snapshot().homeworkAssignments.some((h) => h.sessionId === IDS.sesYusufNext), false);
  assert.equal(store.getStudent(teacher, IDS.yusuf).homework.length, 0);
});

test('teacher day and attendance are forbidden outside the assigned relationship', () => {
  const { store, omneya, sara, nour, khalid, omar, admin } = boot();
  assert.throws(() => store.teacherDay(khalid()), /access/i);
  assert.throws(() => store.teacherDay(omar()), /access/i);
  assert.throws(() => store.teacherDay(sara(), { teacherId: IDS.tOmneya }), /access/i);
  assert.throws(() => store.markAttendance(nour(), IDS.sesYusufNext, { status: 'present' }), /access/i);
  assert.throws(() => store.completeSession(nour(), IDS.sesYusufNext, { attendance: 'present' }), /access/i);
  assert.throws(() => store.getStudent(nour(), IDS.yusuf), /access/i);

  const picker = store.teacherDay(admin());
  assert.equal(picker.picker, true);
  assert.ok(picker.teachers.some((t) => t.id === IDS.tOmneya && t.today >= 1));

  const asOmneya = store.teacherDay(admin(), { teacherId: IDS.tOmneya });
  assert.equal(asOmneya.teacher.id, IDS.tOmneya);
  assert.ok(asOmneya.today.some((s) => s.id === IDS.sesYusufNext));

  const self = store.teacherDay(omneya(), { teacherId: IDS.tOmneya });
  assert.equal(self.teacher.id, IDS.tOmneya);
});
