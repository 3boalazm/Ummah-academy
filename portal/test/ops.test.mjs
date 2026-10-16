import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { localParts } from '../src/domain/time.mjs';
import { sniffUpload, waDraftLink } from '../src/domain/ops.mjs';
import { DEMO_PASSWORD, buildSeed } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';
import { loadStateFile } from '../src/domain/persistence.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
const seed = buildSeed(NOW);

function boot(extra = {}) {
  const store = createStore({
    state: structuredClone(seed),
    now: () => NOW,
    secret: 'test-secret',
    onCommit() {},
    ...extra,
  });
  return {
    store,
    admin: () => store.login('admin@ummahacademy.net', DEMO_PASSWORD.admin),
    teacher: () => store.login('sara@ummahacademy.net', DEMO_PASSWORD.teacher),
    fatima: () => store.login('fatima.rahman@example.com', DEMO_PASSWORD.family),
  };
}

test('enrolling a family opens a two-lesson trial and does not grant login', () => {
  const { store, admin, fatima } = boot();
  const actor = admin();
  const created = store.enrollFamily(actor, {
    email: 'new.parent@example.com',
    password: 'a-real-looking-pass',
    guardianName: 'New Parent',
    guardianNameAr: 'ولي جديد',
    studentName: 'New Child',
    studentNameAr: 'طفل جديد',
    birthYear: 2017,
    city: 'Mansoura',
    country: 'EG',
    timezone: 'Africa/Cairo',
    courseId: 'crs_tajweed',
    teacherId: 'omneya-ali',
    phone: '+20 100 000 0000',
    reason: 'Walk-in trial from the contact form',
  }, { idempotencyKey: 'enroll-once' });
  const dto = store.getStudent(actor, created.studentId);
  assert.equal(dto.axes.academicStatus, 'trial');
  assert.equal(dto.axes.subscriptionStatus, 'trial');
  assert.equal(dto.axes.loginEnabled, false);
  assert.equal(dto.balance.total.allocated, 2);
  assert.equal(dto.balance.total.remaining, 2);
  assert.equal(JSON.stringify(store.snapshot()).includes('a-real-looking-pass'), false);
  assert.equal(JSON.stringify(store.snapshot().audit).includes('scrypt$'), false);
  assert.throws(() => store.getStudent(fatima(), created.studentId), /access/i);
  const replay = store.enrollFamily(actor, {
    email: 'other@example.com',
    password: 'another-pass-ok',
    guardianName: 'Other',
    studentName: 'Other child',
    birthYear: 2016,
    courseId: 'crs_tajweed',
    teacherId: 'omneya-ali',
    reason: 'Should replay the first key',
  }, { idempotencyKey: 'enroll-once' });
  assert.equal(replay.replayed, true);
  assert.equal(replay.studentId, created.studentId);
  assert.equal(store.snapshot().users.filter((u) => u.email === 'other@example.com').length, 0);
});

test('a weekly series keeps the local clock across the Sydney DST change and rolls back on conflict', () => {
  const { store, admin } = boot();
  const actor = admin();
  const first = new Date('2026-10-02T21:00:00.000Z');
  assert.equal(localParts(first, 'Australia/Sydney').hour, 7);
  const series = store.createSeries(actor, {
    studentId: 'stu_alfarsi',
    teacherId: 'omneya-ali',
    startsAt: first.toISOString(),
    count: 2,
    durationMin: 30,
    timeZone: 'Australia/Sydney',
    reason: 'DST-safe weekly slot',
  });
  assert.equal(series.sessions.length, 2);
  assert.equal(localParts(new Date(series.sessions[0].startsAt), 'Australia/Sydney').hour, 7);
  assert.equal(localParts(new Date(series.sessions[1].startsAt), 'Australia/Sydney').hour, 7);
  assert.notEqual(series.sessions[0].startsAt.slice(11, 13), series.sessions[1].startsAt.slice(11, 13));
  const before = store.snapshot().sessions.length;
  assert.throws(
    () =>
      store.createSeries(actor, {
        studentId: 'stu_amina',
        teacherId: 'omneya-ali',
        startsAt: series.sessions[0].startsAt,
        count: 2,
        durationMin: 30,
        timeZone: 'Australia/Sydney',
      }),
    /overlaps/,
  );
  assert.equal(store.snapshot().sessions.length, before);
});

test('WhatsApp drafts never use a missing phone and never claim delivery', () => {
  assert.equal(waDraftLink('', 'hello'), null);
  assert.equal(waDraftLink('+20 100 000 0000', 'مرحبا').startsWith('https://wa.me/201000000000?text='), true);
  assert.equal(waDraftLink('+971 50 276 0242', 'x'), null);
  const { store, admin } = boot();
  const actor = admin();
  const first = store.generateDrafts(actor);
  assert.equal(first.created > 0, true);
  const rows = store.listOutbox(actor);
  assert.equal(rows.every((r) => r.deliveryConfirmed === false), true);
  assert.equal(rows.every((r) => r.phone == null || r.waUrl?.includes(r.phone.replace('+', ''))), true);
  assert.equal(rows.some((r) => r.status === 'needs_phone' && r.waUrl == null), true);
  const second = store.generateDrafts(actor);
  assert.equal(second.created, 0);
  const queued = rows.find((r) => r.status === 'needs_phone');
  assert.throws(
    () => store.setGuardianPhone(actor, 'grd_khalid', { phone: '+971 50 276 0242', reason: 'This is the academy sender' }),
    /academy|sender/i,
  );
  store.setGuardianPhone(actor, 'grd_khalid', { phone: '+1 555 010 0199', reason: 'Father added a demo number' });
  const marked = store.markOutbox(actor, queued.id, { status: 'sent', reason: 'Staff opened WhatsApp themselves' });
  assert.equal(marked.deliveryConfirmed, false);
  assert.equal(marked.status, 'sent');
});

test('export has no secrets and teachers cannot download the ledger', () => {
  const { store, admin, teacher } = boot();
  const csv = store.exportCsv(admin(), 'students').csv;
  assert.equal(csv.includes('password'), false);
  assert.equal(csv.includes('scrypt'), false);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.throws(() => store.exportCsv(teacher(), 'invoices'), /access/i);
  const invoices = store.listInvoices(admin());
  assert.ok(invoices.some((i) => i.paymentId === 'pay_amina_fail' && i.status === 'failed'));
  assert.ok(invoices.some((i) => i.paymentId === 'pay_amina_ok' && i.status === 'issued'));
});

test('upload bytes reject video even when the name says text', () => {
  assert.equal(sniffUpload(Buffer.from('%PDF-1.4\nnotes')), 'application/pdf');
  assert.equal(sniffUpload(Buffer.from('worksheet notes')), 'text/plain');
  const mp4 = Buffer.alloc(16);
  mp4.write('ftyp', 4);
  assert.equal(sniffUpload(mp4), null);
  const { store, admin } = boot();
  assert.throws(
    () => store.registerUpload(admin(), { studentId: 'stu_yusuf', filename: 'clip.mp4', mime: 'video/mp4' }),
    /PDF|video|plain/i,
  );
});

test('production mode refuses the published demo passwords', () => {
  const store = createStore({
    state: structuredClone(seed),
    now: () => NOW,
    production: true,
    onCommit() {},
  });
  assert.throws(() => store.login('admin@ummahacademy.net', DEMO_PASSWORD.admin), /incorrect/i);
});


test('missing portal state is first-run only outside production', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-portal-state-'));
  const file = path.join(dir, 'store.json');
  try {
    assert.equal(loadStateFile(file), null);
    assert.throws(() => loadStateFile(file, { production: true }), /not initialized/i);
    assert.equal(fs.existsSync(file), false);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('corrupt portal state fails closed and preserves original bytes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-portal-state-'));
  const file = path.join(dir, 'store.json');
  const original = Buffer.from('{"meta": "incomplete"');
  try {
    fs.writeFileSync(file, original);
    assert.throws(() => loadStateFile(file), /invalid JSON/i);
    assert.deepEqual(fs.readFileSync(file), original);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('valid JSON with an invalid portal schema is not treated as first run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-portal-state-'));
  const file = path.join(dir, 'store.json');
  const original = Buffer.from(JSON.stringify({ meta: {}, users: [] }));
  try {
    fs.writeFileSync(file, original);
    assert.throws(() => loadStateFile(file), /missing required collections/i);
    assert.deepEqual(fs.readFileSync(file), original);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('production rejects demo-marked portal state without modifying it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ua-portal-state-'));
  const file = path.join(dir, 'store.json');
  const state = buildSeed(NOW);
  const original = Buffer.from(JSON.stringify(state));
  try {
    fs.writeFileSync(file, original);
    assert.throws(() => loadStateFile(file, { production: true }), /marked as demo/i);
    assert.deepEqual(fs.readFileSync(file), original);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
