import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { readConfiguredSecret } from '../src/domain/secret.mjs';

const LONG = 'a1'.repeat(32);

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'secret-'));
}

test('the secret can come from the environment or from a file, and short ones do not count', () => {
  const dir = tmp();
  const file = path.join(dir, 'secret');
  fs.writeFileSync(file, `${LONG}\n`);
  assert.equal(readConfiguredSecret({ PORTAL_SECRET: LONG }), LONG);
  assert.equal(readConfiguredSecret({ PORTAL_SECRET_FILE: file }), LONG, 'trailing newline is trimmed');
  assert.equal(readConfiguredSecret({ PORTAL_SECRET: 'short' }), null);
  assert.equal(readConfiguredSecret({ PORTAL_SECRET: 'short', PORTAL_SECRET_FILE: file }), null, 'a bad direct value is not silently replaced');
  assert.equal(readConfiguredSecret({ PORTAL_SECRET_FILE: path.join(dir, 'missing') }), null);
  assert.equal(readConfiguredSecret({}), null);
  fs.writeFileSync(file, 'tiny');
  assert.equal(readConfiguredSecret({ PORTAL_SECRET_FILE: file }), null);
  fs.rmSync(dir, { recursive: true, force: true });
});

function provision(dir) {
  const data = path.join(dir, 'store.json');
  const made = spawnSync(process.execPath, ['portal/scripts/provision.mjs', '--out', data, '--credentials', path.join(dir, 'creds.txt')], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(made.status, 0, made.stderr);
  return data;
}

test('production refuses to start with a too-short secret file and starts with a good one', async () => {
  const dir = tmp();
  const data = provision(dir);
  const file = path.join(dir, 'secret');
  fs.writeFileSync(file, 'too-short');
  const refused = spawnSync(process.execPath, ['portal/src/server.mjs'], { cwd: process.cwd(), encoding: 'utf8', timeout: 8000, env: { ...process.env, PORT: '0', PORTAL_ENV: 'production', PORTAL_DATA: data, PORTAL_SECRET_FILE: file } });
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /requires PORTAL_SECRET/);

  fs.writeFileSync(file, LONG);
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const { port } = probe.address();
  await new Promise((r) => probe.close(r));
  const child = spawn(process.execPath, ['portal/src/server.mjs'], { cwd: process.cwd(), stdio: 'ignore', env: { ...process.env, PORT: String(port), PORTAL_ENV: 'production', PORTAL_DATA: data, PORTAL_SECRET_FILE: file } });
  try {
    let ready = null;
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline && !ready) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}/api/ready`);
        if (r.ok) ready = await r.json();
      } catch {}
      if (!ready) await new Promise((r) => setTimeout(r, 150));
    }
    assert.ok(ready, 'portal should become ready with a secret file');
    assert.equal(ready.checks.find((c) => c.id === 'production_secret').ok, true);
  } finally {
    child.kill('SIGTERM');
    await Promise.race([once(child, 'exit'), new Promise((r) => setTimeout(r, 1500))]);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
