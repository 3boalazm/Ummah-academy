import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createVerifiedBackup, verifyRestoreCandidate } from '../src/domain/backup-drill.mjs';

function validState({ demo = false } = {}) {
  return {
    meta: { demo },
    users: [], teachers: [], families: [], guardians: [], students: [],
    subscriptions: [], cycles: [], sessions: [],
  };
}

test('backup drill creates a mode-0600 byte-identical, production-shaped copy', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-backup-drill-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'store.json');
  const backup = path.join(dir, 'backups', 'store-verified.json');
  fs.writeFileSync(source, JSON.stringify(validState()));
  const result = createVerifiedBackup(source, backup);
  assert.equal(result.sourceSha256, result.backupSha256);
  assert.equal(result.mode, '0600');
  assert.equal(fs.statSync(backup).mode & 0o777, 0o600);
  assert.deepEqual(JSON.parse(fs.readFileSync(backup, 'utf8')), validState());
  assert.deepEqual(verifyRestoreCandidate(backup), {
    valid: true, bytes: fs.statSync(backup).size, demo: false,
  });
});

test('backup drill refuses to overwrite an existing destination', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-backup-drill-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'store.json');
  const backup = path.join(dir, 'backup.json');
  fs.writeFileSync(source, JSON.stringify(validState()));
  fs.writeFileSync(backup, 'keep-this');
  assert.throws(() => createVerifiedBackup(source, backup), /refusing to overwrite/i);
  assert.equal(fs.readFileSync(backup, 'utf8'), 'keep-this');
});

test('backup drill refuses demo or malformed source without creating a backup', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-backup-drill-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const source = path.join(dir, 'store.json');
  const backup = path.join(dir, 'backup.json');
  fs.writeFileSync(source, JSON.stringify(validState({ demo: true })));
  assert.throws(() => createVerifiedBackup(source, backup), /demo data/i);
  assert.equal(fs.existsSync(backup), false);
  fs.writeFileSync(source, '{not json');
  assert.throws(() => createVerifiedBackup(source, backup), /invalid JSON/i);
  assert.equal(fs.existsSync(backup), false);
});

test('restore candidate validation never changes the candidate bytes', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-backup-drill-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const candidate = path.join(dir, 'candidate.json');
  const bytes = JSON.stringify(validState());
  fs.writeFileSync(candidate, bytes);
  assert.equal(verifyRestoreCandidate(candidate).valid, true);
  assert.equal(fs.readFileSync(candidate, 'utf8'), bytes);
});
