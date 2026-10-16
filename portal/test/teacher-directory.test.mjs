import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_PASSWORD, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';

const now = new Date('2026-10-16T10:00:00.000Z');

function boot() {
  const store = createStore({
    state: structuredClone(buildSeed(now)),
    now: () => now,
    secret: 'teacher-directory-test-secret',
    onCommit() {},
  });
  return {
    store,
    admin: store.login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
    teacher: store.login('sara@ummahacademy.net', DEMO_PASSWORD.teacher),
    guardian: store.login('fatima.rahman@example.com', DEMO_PASSWORD.family),
    student: store.login('omar.mansouri@example.com', DEMO_PASSWORD.student),
  };
}

test('guardian teacher directory returns public fields only', () => {
  const { store, guardian } = boot();
  const rows = store.listTeachers(guardian);
  assert.ok(rows.length > 0);
  for (const row of rows) {
    assert.deepEqual(Object.keys(row).sort(), [
      'id', 'ijazah', 'name', 'nameAr', 'role', 'roleAr', 'specialty', 'specialtyAr', 'timezone',
    ].sort());
    assert.equal('activeStudents' in row, false);
    assert.equal('userId' in row, false);
    assert.equal('status' in row, false);
    assert.equal('track' in row, false);
  }
});

test('student teacher directory returns public fields only', () => {
  const { store, student } = boot();
  const rows = store.listTeachers(student);
  assert.ok(rows.length > 0);
  assert.equal(rows.some((row) => 'activeStudents' in row || 'userId' in row), false);
});

test('teacher directory is scoped to the signed-in teacher', () => {
  const { store, teacher } = boot();
  const rows = store.listTeachers(teacher);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].id, teacher.teacherId);
  assert.equal('userId' in rows[0], true);
  assert.equal('activeStudents' in rows[0], true);
});

test('admin retains the detailed teacher directory required for operations', () => {
  const { store, admin } = boot();
  const rows = store.listTeachers(admin);
  assert.ok(rows.length > 1);
  assert.equal(rows.every((row) => typeof row.activeStudents === 'number'), true);
});

test('directory public projection stays aligned with teacher detail projection', () => {
  const { store, guardian } = boot();
  for (const row of store.listTeachers(guardian)) {
    assert.deepEqual(row, store.getTeacher(guardian, row.id).teacher);
  }
});
