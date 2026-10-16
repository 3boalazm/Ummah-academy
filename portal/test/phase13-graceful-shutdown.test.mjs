import test from 'node:test';
import assert from 'node:assert/strict';
import { closeServerGracefully } from '../src/domain/graceful-shutdown.mjs';

test('graceful shutdown waits for server close callback', async () => {
  let callback;
  let idleClosed = false;
  let forceClosed = false;
  const server = {
    close(cb) { callback = cb; },
    closeIdleConnections() { idleClosed = true; },
    closeAllConnections() { forceClosed = true; },
  };
  const pending = closeServerGracefully(server, { timeoutMs: 1000 });
  assert.equal(idleClosed, true);
  assert.equal(forceClosed, false);
  callback();
  assert.deepEqual(await pending, { timedOut: false });
  assert.equal(forceClosed, false);
});

test('graceful shutdown force-closes connections after bounded timeout', async () => {
  let forceClosed = false;
  let timeoutNotified = false;
  const server = {
    close() {},
    closeAllConnections() { forceClosed = true; },
  };
  const result = await closeServerGracefully(server, {
    timeoutMs: 10,
    onTimeout() { timeoutNotified = true; },
  });
  assert.deepEqual(result, { timedOut: true });
  assert.equal(forceClosed, true);
  assert.equal(timeoutNotified, true);
});

test('shutdown helper tolerates servers without optional close methods', async () => {
  const server = { close(cb) { cb(); } };
  assert.deepEqual(await closeServerGracefully(server, { timeoutMs: 100 }), { timedOut: false });
});
