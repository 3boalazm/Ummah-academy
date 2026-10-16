import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSeed } from '../src/domain/seed.mjs';

const state = buildSeed(new Date('2026-10-16T10:00:00.000Z'));
const ids = (collection) => new Set((state[collection] ?? []).map((row) => row.id));
const ref = (collection, id, label) => {
  assert.ok(ids(collection).has(id), `${label} references missing ${collection} id: ${id}`);
};

test('each persisted entity collection has unique stable IDs', () => {
  const collections = [
    'users', 'teachers', 'families', 'guardians', 'students', 'courses', 'plans',
    'enrollments', 'subscriptions', 'cycles', 'sessions', 'payments', 'assignments',
    'attendance', 'reports', 'assets', 'followUps', 'attempts', 'audit', 'events',
    'notifications',
  ];
  for (const name of collections) {
    assert.ok(Array.isArray(state[name]), `missing collection: ${name}`);
    const rows = state[name];
    const rowIds = rows.map((row) => row.id);
    assert.equal(rowIds.every(Boolean), true, `${name} contains an entity without an id`);
    assert.equal(new Set(rowIds).size, rowIds.length, `${name} contains duplicate IDs`);
  }
});

test('student, guardian and family are distinct entities with explicit valid links', () => {
  for (const student of state.students) ref('families', student.familyId, `student ${student.id}`);
  for (const guardian of state.guardians) {
    ref('families', guardian.familyId, `guardian ${guardian.id}`);
    for (const studentId of guardian.studentIds ?? []) {
      ref('students', studentId, `guardian ${guardian.id}`);
      const student = state.students.find((row) => row.id === studentId);
      assert.equal(student.familyId, guardian.familyId, `guardian ${guardian.id} links a student from another family`);
    }
  }
  for (const user of state.users) {
    if (user.guardianId) ref('guardians', user.guardianId, `user ${user.id}`);
    if (user.studentId) ref('students', user.studentId, `user ${user.id}`);
    if (user.teacherId) ref('teachers', user.teacherId, `user ${user.id}`);
  }
});

test('enrollment, subscription and cycle links preserve their separate responsibilities', () => {
  for (const enrollment of state.enrollments) {
    ref('students', enrollment.studentId, `enrollment ${enrollment.id}`);
    ref('courses', enrollment.courseId, `enrollment ${enrollment.id}`);
    ref('teachers', enrollment.teacherId, `enrollment ${enrollment.id}`);
  }
  for (const subscription of state.subscriptions) {
    ref('students', subscription.studentId, `subscription ${subscription.id}`);
    ref('families', subscription.familyId, `subscription ${subscription.id}`);
    ref('courses', subscription.courseId, `subscription ${subscription.id}`);
    ref('plans', subscription.planId, `subscription ${subscription.id}`);
  }
  for (const cycle of state.cycles) {
    ref('subscriptions', cycle.subscriptionId, `cycle ${cycle.id}`);
    ref('plans', cycle.planId, `cycle ${cycle.id}`);
  }
});

test('sessions and teacher assignments reference existing domain entities consistently', () => {
  for (const assignment of state.assignments) {
    ref('students', assignment.studentId, `assignment ${assignment.id}`);
    ref('enrollments', assignment.enrollmentId, `assignment ${assignment.id}`);
    ref('teachers', assignment.teacherId, `assignment ${assignment.id}`);
    const enrollment = state.enrollments.find((row) => row.id === assignment.enrollmentId);
    assert.equal(enrollment.studentId, assignment.studentId, `assignment ${assignment.id} crosses student enrollment`);
  }
  for (const session of state.sessions) {
    ref('students', session.studentId, `session ${session.id}`);
    ref('families', session.familyId, `session ${session.id}`);
    ref('teachers', session.teacherId, `session ${session.id}`);
    ref('courses', session.courseId, `session ${session.id}`);
    ref('enrollments', session.enrollmentId, `session ${session.id}`);
    ref('subscriptions', session.subscriptionId, `session ${session.id}`);
    ref('cycles', session.cycleId, `session ${session.id}`);
    const student = state.students.find((row) => row.id === session.studentId);
    const enrollment = state.enrollments.find((row) => row.id === session.enrollmentId);
    const subscription = state.subscriptions.find((row) => row.id === session.subscriptionId);
    const cycle = state.cycles.find((row) => row.id === session.cycleId);
    assert.equal(student.familyId, session.familyId, `session ${session.id} family does not own its student`);
    assert.equal(enrollment.studentId, session.studentId, `session ${session.id} crosses enrollment/student`);
    assert.equal(subscription.studentId, session.studentId, `session ${session.id} crosses subscription/student`);
    assert.equal(cycle.subscriptionId, subscription.id, `session ${session.id} cycle belongs to another subscription`);
    if (session.rescheduledFromId) ref('sessions', session.rescheduledFromId, `session ${session.id}`);
    if (session.rescheduledToId) ref('sessions', session.rescheduledToId, `session ${session.id}`);
  }
});

test('financial, attendance, report, asset and follow-up records keep valid foreign references', () => {
  for (const payment of state.payments) {
    ref('families', payment.familyId, `payment ${payment.id}`);
    ref('subscriptions', payment.subscriptionId, `payment ${payment.id}`);
    ref('cycles', payment.cycleId, `payment ${payment.id}`);
    const subscription = state.subscriptions.find((row) => row.id === payment.subscriptionId);
    const cycle = state.cycles.find((row) => row.id === payment.cycleId);
    assert.equal(cycle.subscriptionId, subscription.id, `payment ${payment.id} crosses subscription/cycle`);
    assert.equal(subscription.familyId, payment.familyId, `payment ${payment.id} crosses family/subscription`);
  }
  for (const row of state.attendance) {
    ref('sessions', row.sessionId, `attendance ${row.id}`);
    ref('students', row.studentId, `attendance ${row.id}`);
    const session = state.sessions.find((item) => item.id === row.sessionId);
    assert.equal(session.studentId, row.studentId, `attendance ${row.id} belongs to another student`);
  }
  for (const row of state.reports) {
    ref('sessions', row.sessionId, `report ${row.id}`);
    ref('students', row.studentId, `report ${row.id}`);
    ref('teachers', row.teacherId, `report ${row.id}`);
  }
  for (const row of state.assets) {
    ref('students', row.studentId, `asset ${row.id}`);
    if (row.sessionId) ref('sessions', row.sessionId, `asset ${row.id}`);
    ref('courses', row.courseId, `asset ${row.id}`);
    ref('users', row.uploadedBy, `asset ${row.id}`);
  }
  for (const row of state.followUps) {
    if (row.familyId) ref('families', row.familyId, `follow-up ${row.id}`);
    if (row.studentId) ref('students', row.studentId, `follow-up ${row.id}`);
    if (row.teacherId) ref('teachers', row.teacherId, `follow-up ${row.id}`);
    if (row.subscriptionId) ref('subscriptions', row.subscriptionId, `follow-up ${row.id}`);
    if (row.sessionId) ref('sessions', row.sessionId, `follow-up ${row.id}`);
  }
});
