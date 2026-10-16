const ID_SEGMENTS = new Set([
  'students', 'families', 'guardians', 'teachers', 'sessions', 'subscriptions',
  'outbox', 'invoices', 'follow-ups', 'assets', 'notifications', 'cycles',
  'payments', 'users', 'reports',
]);

/** Remove query strings and redact resource identifiers before a path is logged. */
export function safeLogPath(input) {
  const pathname = String(input || '/').split('?')[0] || '/';
  const parts = pathname.split('/');
  for (let i = 1; i < parts.length - 1; i += 1) {
    if (ID_SEGMENTS.has(parts[i]) && parts[i + 1]) parts[i + 1] = ':id';
  }
  return parts.join('/');
}

/** Build a structured, low-PII HTTP access record. Never include headers or bodies. */
export function requestLogRecord({ requestId, method, pathname, statusCode, durationMs }) {
  const status = Number(statusCode) || 0;
  return {
    event: 'http.request',
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    requestId: String(requestId || ''),
    method: String(method || 'UNKNOWN').toUpperCase(),
    path: safeLogPath(pathname),
    statusCode: status,
    durationMs: Math.max(0, Math.round(Number(durationMs) || 0)),
  };
}
