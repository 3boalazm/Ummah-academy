import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadStateFile } from '../src/domain/persistence.mjs';
import { sessionCookie } from '../src/domain/http-security.mjs';

function temp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-phase9-'));
  return { dir, file: path.join(dir, 'store.json'), cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}
function validState(demo = false) {
  return {
    meta: { demo },
    users: [], teachers: [], families: [], guardians: [], students: [],
    subscriptions: [], cycles: [], sessions: [],
  };
}

test('only a missing development store permits first-run initialization', () => {
  const t = temp();
  try {
    assert.equal(loadStateFile(t.file), null);
    assert.throws(() => loadStateFile(t.file, { production: true }), /not initialized/i);
    assert.equal(fs.existsSync(t.file), false);
  } finally { t.cleanup(); }
});

test('corrupt existing store fails closed and preserves the exact original bytes', () => {
  const t = temp();
  const bytes = Buffer.from('{ definitely not valid JSON }\n');
  try {
    fs.writeFileSync(t.file, bytes);
    assert.throws(() => loadStateFile(t.file), /invalid JSON/i);
    assert.deepEqual(fs.readFileSync(t.file), bytes);
  } finally { t.cleanup(); }
});

test('invalid schema and production demo state are rejected', () => {
  const t = temp();
  try {
    fs.writeFileSync(t.file, JSON.stringify({ meta: {}, users: [] }));
    assert.throws(() => loadStateFile(t.file), /missing required collections/i);
    fs.writeFileSync(t.file, JSON.stringify(validState(true)));
    assert.throws(() => loadStateFile(t.file, { production: true }), /demo data/i);
    assert.equal(loadStateFile(t.file).meta.demo, true);
  } finally { t.cleanup(); }
});

test('session cookie has Secure only in production and preserves safety attributes', () => {
  const dev = sessionCookie('test-token', 120);
  const prod = sessionCookie('test-token', 120, { production: true });
  assert.match(dev, /^ua_portal=test-token;/);
  assert.match(dev, /HttpOnly/);
  assert.match(dev, /SameSite=Lax/);
  assert.match(dev, /Path=\//);
  assert.match(dev, /Max-Age=120/);
  assert.doesNotMatch(dev, /; Secure(?:;|$)/);
  assert.match(prod, /; Secure(?:;|$)/);
});
