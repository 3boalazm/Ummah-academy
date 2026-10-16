import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requestLogRecord, safeLogPath } from '../src/domain/observability.mjs';

test('access log redacts record IDs and drops query strings', () => {
  assert.equal(safeLogPath('/api/students/stu_private_123?token=secret'), '/api/students/:id');
  assert.equal(safeLogPath('/api/families/fam_rahman/whatsapp-consent'), '/api/families/:id/whatsapp-consent');
  assert.equal(safeLogPath('/api/health?debug=1'), '/api/health');
});

test('request logs are structured and classify HTTP failures without request content', () => {
  const row = requestLogRecord({
    requestId: 'req-test-1',
    method: 'post',
    pathname: '/api/students/stu_private_123?email=private@example.com',
    statusCode: 403,
    durationMs: 12.6,
  });
  assert.deepEqual(row, {
    event: 'http.request',
    level: 'warn',
    requestId: 'req-test-1',
    method: 'POST',
    path: '/api/students/:id',
    statusCode: 403,
    durationMs: 13,
  });
  assert.equal(JSON.stringify(row).includes('private'), false);
  assert.equal(JSON.stringify(row).includes('email'), false);
  assert.equal(requestLogRecord({ statusCode: 503 }).level, 'error');
  assert.equal(requestLogRecord({ statusCode: 200 }).level, 'info');
});
