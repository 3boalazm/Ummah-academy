import test from 'node:test';
import assert from 'node:assert/strict';
import { buildHealthReport } from '../src/domain/health.mjs';

const state = (demo = false) => ({
  meta: { demo },
  users: [], teachers: [], families: [], guardians: [], students: [],
  subscriptions: [], cycles: [], sessions: [],
});

test('development health is ready for a structurally valid store', () => {
  const report = buildHealthReport({ state: state(), production: false, secretConfigured: false });
  assert.equal(report.status, 'ready');
  assert.equal(report.ready, true);
  assert.equal(report.mode, 'development');
});

test('production readiness requires secret and a non-demo valid store', () => {
  assert.equal(buildHealthReport({ state: state(), production: true, secretConfigured: false }).ready, false);
  assert.equal(buildHealthReport({ state: state(true), production: true, secretConfigured: true }).ready, false);
  assert.equal(buildHealthReport({ state: state(), production: true, secretConfigured: true }).ready, true);
});

test('missing or malformed state fails closed without leaking paths or data', () => {
  for (const stateValue of [null, { meta: {}, users: [] }]) {
    const report = buildHealthReport({ state: stateValue, production: true, secretConfigured: true });
    assert.equal(report.ready, false);
    assert.equal(JSON.stringify(report).includes('students'), false);
    assert.equal(JSON.stringify(report).includes('/'), false);
  }
});

test('unreadable data file is a critical readiness failure', () => {
  const report = buildHealthReport({ state: state(), production: false, secretConfigured: true, dataFileReadable: false });
  assert.equal(report.ready, false);
  assert.equal(report.checks.find((check) => check.id === 'data_file_readable').severity, 'critical');
});
