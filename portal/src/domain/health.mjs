const REQUIRED_COLLECTIONS = [
  'users', 'teachers', 'families', 'guardians', 'students',
  'subscriptions', 'cycles', 'sessions',
];

export function buildHealthReport({ state, production = false, secretConfigured = false, dataFileReadable = true }) {
  const checks = [
    { id: 'data_file_readable', ok: dataFileReadable, severity: 'critical' },
    { id: 'store_shape', ok: Boolean(state && typeof state === 'object' && REQUIRED_COLLECTIONS.every((key) => Array.isArray(state[key]))), severity: 'critical' },
    { id: 'production_secret', ok: !production || secretConfigured, severity: 'critical' },
    { id: 'non_demo_store', ok: !production || state?.meta?.demo !== true, severity: 'critical' },
  ];
  const ready = checks.every((check) => check.ok);
  return {
    status: ready ? 'ready' : 'not_ready',
    ready,
    mode: production ? 'production' : 'development',
    checks,
  };
}
