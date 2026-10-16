import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEMO_PASSWORD, IDS, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');

function boot() {
  const store = createStore({
    state: structuredClone(buildSeed(NOW)),
    now: () => NOW,
    secret: 'boundary-test-secret',
    onCommit() {},
  });
  return { store, admin: store.login('admin@ummahacademy.net', DEMO_PASSWORD.admin) };
}

function assertRejectedWithoutMutation(store, operation) {
  const before = store.snapshot();
  assert.throws(operation, (error) => error?.code === 'validation');
  assert.deepEqual(store.snapshot(), before, 'rejected command must not leave partial state changes');
}

test('session creation rejects an enrollment owned by a different student', () => {
  const { store, admin } = boot();
  assertRejectedWithoutMutation(store, () => store.createSession(admin, {
    studentId: IDS.yusuf,
    enrollmentId: IDS.enrOmar,
    teacherId: IDS.tNour,
    startsAt: '2026-10-20T12:00:00.000Z',
    durationMin: 30,
    reason: 'Boundary test',
  }));
});

test('session creation rejects a billing cycle from another subscription', () => {
  const { store, admin } = boot();
  assertRejectedWithoutMutation(store, () => store.createSession(admin, {
    studentId: IDS.yusuf,
    enrollmentId: IDS.enrYusuf,
    cycleId: IDS.cycOmar,
    teacherId: IDS.tNour,
    startsAt: '2026-10-20T12:00:00.000Z',
    durationMin: 30,
    reason: 'Boundary test',
  }));
});

test('payment recording rejects a billing cycle from another subscription', () => {
  const { store, admin } = boot();
  assertRejectedWithoutMutation(store, () => store.recordPayment(admin, {
    subscriptionId: IDS.subYusuf,
    cycleId: IDS.cycOmar,
    amount: 25,
    status: 'paid',
    reason: 'Boundary test',
  }));
});

test('follow-up creation rejects a student and family mismatch', () => {
  const { store, admin } = boot();
  assertRejectedWithoutMutation(store, () => store.createFollowUp(admin, {
    title: 'Wrong family follow-up',
    familyId: IDS.famMansouri,
    studentId: IDS.yusuf,
  }));
});

test('follow-up creation rejects a session and subscription mismatch', () => {
  const { store, admin } = boot();
  assertRejectedWithoutMutation(store, () => store.createFollowUp(admin, {
    title: 'Wrong subscription follow-up',
    studentId: IDS.yusuf,
    familyId: IDS.famRahman,
    subscriptionId: IDS.subYusuf,
    sessionId: IDS.sesOmarNext,
  }));
});
