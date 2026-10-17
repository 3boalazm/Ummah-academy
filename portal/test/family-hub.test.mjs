import assert from 'node:assert/strict';
import { test } from 'node:test';
import { IDS, DEMO_PASSWORD, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const seed = buildSeed(NOW);

function boot() {
  const store = createStore({
    state: structuredClone(seed),
    now: () => new Date(NOW),
    secret: 'family-hub-test-secret',
    onCommit() {},
  });
  const login = (email, password) => store.login(email, password);
  return {
    store,
    omneya: () => login('omneya@ummahacademy.net', DEMO_PASSWORD.teacher),
    khalid: () => login('khalid.rahman@example.com', DEMO_PASSWORD.family),
    fatima: () => login('fatima.rahman@example.com', DEMO_PASSWORD.family),
    omar: () => login('omar.mansouri@example.com', DEMO_PASSWORD.student),
    admin: () => login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
  };
}

function childIds(hub) {
  return hub.children.map((c) => c.student.id).sort();
}

test('Fatima’s family hub is Yusuf and Layla, never Adam, and hides invoices', () => {
  const { store, fatima } = boot();
  const hub = store.progressHub(fatima());
  assert.deepEqual(childIds(hub), [IDS.layla, IDS.yusuf].sort());
  assert.equal(hub.children.some((c) => c.student.id === IDS.adam), false);
  assert.equal(hub.role, 'guardian');
  for (const card of hub.children) {
    assert.equal(card.moneyVisible, false);
    assert.equal('priceUsd' in card.credits, false);
    assert.equal('payments' in card, false);
    assert.ok(card.credits.remaining != null);
    assert.ok(card.teacher);
  }
  assert.equal(JSON.stringify(hub).includes('invoice'), false);
  assert.throws(() => store.getProgress(fatima(), IDS.adam), /access/i);
  assert.throws(() => store.progressHub(fatima(), { familyId: IDS.famMansouri }), /access/i);
});

test('Khalid’s hub includes Adam and still keeps credits separate from invoices', () => {
  const { store, khalid } = boot();
  const hub = store.progressHub(khalid());
  assert.deepEqual(childIds(hub), [IDS.adam, IDS.layla, IDS.yusuf].sort());
  const yusuf = hub.children.find((c) => c.student.id === IDS.yusuf);
  assert.equal(yusuf.nextSession.id, IDS.sesYusufNext);
  assert.equal(yusuf.lastHeld.id, IDS.sesYusufPending);
  assert.equal(yusuf.lastHeld.pendingReport, true);
  assert.ok(yusuf.lastReport.summary.toLowerCase().includes('idgham'));
  assert.equal(yusuf.credits.remaining, 5);
  assert.equal(yusuf.moneyVisible, true);
  assert.equal('payments' in yusuf, false);
});

test('a student hub is only that student', () => {
  const { store, omar } = boot();
  const hub = store.progressHub(omar());
  assert.deepEqual(childIds(hub), [IDS.omarM]);
  assert.equal(hub.children[0].student.id, IDS.omarM);
  assert.throws(() => store.getProgress(omar(), IDS.yusuf), /access/i);
});

test('teachers use Teacher Day, not the family hub; staff need a family', () => {
  const { store, omneya, admin } = boot();
  assert.throws(() => store.progressHub(omneya()), /access/i);
  assert.throws(() => store.progressHub(admin()), /family or a student/i);
  const rahman = store.progressHub(admin(), { familyId: IDS.famRahman });
  assert.deepEqual(childIds(rahman), [IDS.adam, IDS.layla, IDS.yusuf].sort());
});

test('homework from a lesson report lands on the family hub without a second write', () => {
  const { store, omneya, fatima } = boot();
  const teacher = omneya();
  store.completeSession(teacher, IDS.sesYusufNext, { attendance: 'present' });
  store.submitReport(teacher, IDS.sesYusufNext, {
    summary: 'Idgham held',
    homework: 'Circle five idgham examples',
    nextStep: 'Ikhfa',
  });
  const yusuf = store.getProgress(fatima(), IDS.yusuf).child;
  assert.ok(yusuf.homework.some((h) => h.sessionId === IDS.sesYusufNext && h.open));
  assert.equal(yusuf.homework[0].title.includes('idgham') || yusuf.homework[0].instructions.includes('idgham'), true);
});
