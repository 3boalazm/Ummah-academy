import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildProductionState, generatePassword } from '../scripts/provision.mjs';
import { loadStateFile } from '../src/domain/persistence.mjs';
import { buildHealthReport } from '../src/domain/health.mjs';
import { DEMO_PASSWORD } from '../src/domain/seed.mjs';
import { createStore } from '../src/domain/store.mjs';

const PW = 'Zq7-kitchen-orbit-4412';

test('a provisioned state has one admin, the catalogue, and no demo people', () => {
  const state = buildProductionState({ email: 'Admin@UmmahAcademy.net', name: 'Owner', nameAr: 'المالك', password: PW });
  assert.equal(state.meta.demo, false);
  assert.equal(state.users.length, 1);
  assert.equal(state.users[0].role, 'admin');
  assert.equal(state.users[0].email, 'admin@ummahacademy.net');
  for (const key of ['teachers', 'families', 'guardians', 'students', 'enrollments', 'subscriptions', 'cycles', 'payments', 'sessions', 'attendance', 'reports', 'assets', 'followUps', 'audit', 'events', 'notifications']) {
    assert.equal(state[key].length, 0, `${key} must start empty`);
  }
  assert.ok(state.plans.length >= 3 && state.courses.length >= 3, 'real catalogue is kept');
  assert.equal(JSON.stringify(state).includes(PW), false, 'plain password is never stored');
  assert.equal(/example\.com|Rahman|Yusuf/.test(JSON.stringify(state)), false, 'no demo person survives');
});

test('production boots from it, signs the admin in, and refuses every published demo password', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prov-'));
  const file = path.join(dir, 'store.json');
  fs.writeFileSync(file, JSON.stringify(buildProductionState({ email: 'admin@ummahacademy.net', name: 'Owner', nameAr: 'المالك', password: PW })));
  const loaded = loadStateFile(file, { production: true });
  const store = createStore({ state: loaded, secret: 's'.repeat(40), production: true, onCommit() {} });
  const admin = store.login('admin@ummahacademy.net', PW);
  assert.equal(admin.role, 'admin');
  for (const demo of Object.values(DEMO_PASSWORD)) assert.throws(() => store.login('admin@ummahacademy.net', demo));
  const report = buildHealthReport({ state: store.snapshot(), production: true, secretConfigured: true, dataFileReadable: true });
  assert.equal(report.ready, true, JSON.stringify(report.checks));
  assert.equal(store.getProfile(admin).account.role, 'admin');
  assert.equal(store.getProfile(admin).staff.can.includes('demo.reset'), false, 'production hides the demo reset');
  assert.equal(store.listStudents(admin, {}).length, 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('weak admin passwords and bad emails are refused', () => {
  assert.throws(() => buildProductionState({ email: 'a@b.co', name: 'x', nameAr: 'x', password: 'short' }), /rejected/);
  assert.throws(() => buildProductionState({ email: 'not-an-email', name: 'x', nameAr: 'x', password: PW }), /email/i);
  assert.throws(() => buildProductionState({ email: 'admin@ummahacademy.net', name: 'x', nameAr: 'x', password: 'admin-admin-admin-1' }), /rejected/);
});

test('generated passwords are long and different every time', () => {
  const a = generatePassword();
  const b = generatePassword();
  assert.equal(a.length, 24);
  assert.notEqual(a, b);
});

test('the command writes credentials to a file, never to the terminal, and will not overwrite', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prov-cli-'));
  const out = path.join(dir, 'store.json');
  const cred = path.join(dir, 'creds.txt');
  const run = () => spawnSync(process.execPath, ['portal/scripts/provision.mjs', '--out', out, '--credentials', cred], { cwd: process.cwd(), encoding: 'utf8' });
  const first = run();
  assert.equal(first.status, 0, first.stderr);
  const text = fs.readFileSync(cred, 'utf8');
  const password = /Admin password: (\S+)/.exec(text)[1];
  assert.equal(password.length, 24);
  assert.equal(first.stdout.includes(password), false, 'password must not be printed');
  assert.match(text, /PORTAL_SECRET[^:]*: [0-9a-f]{64}/);
  const state = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.equal(state.meta.demo, false);
  const second = run();
  assert.equal(second.status, 1);
  assert.match(second.stderr, /Refusing to overwrite/);
  fs.rmSync(dir, { recursive: true, force: true });
});
