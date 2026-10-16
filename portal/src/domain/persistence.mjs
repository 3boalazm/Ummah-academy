import fs from 'node:fs';

const REQUIRED_COLLECTIONS = [
  'users',
  'teachers',
  'families',
  'guardians',
  'students',
  'subscriptions',
  'cycles',
  'sessions',
];

function validateState(state, filePath) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    throw new Error(`Portal data file is not a valid state object: ${filePath}. Refusing to initialize or overwrite it.`);
  }
  if (!state.meta || typeof state.meta !== 'object' || Array.isArray(state.meta)) {
    throw new Error(`Portal data file has no valid metadata: ${filePath}. Refusing to initialize or overwrite it.`);
  }
  const missing = REQUIRED_COLLECTIONS.filter((key) => !Array.isArray(state[key]));
  if (missing.length) {
    throw new Error(`Portal data file is missing required collections (${missing.join(', ')}): ${filePath}. Refusing to initialize or overwrite it.`);
  }
  return state;
}

/**
 * Read existing portal state without treating corruption or I/O errors as a
 * first-run installation. Only ENOENT means "not initialized yet".
 *
 * Production deliberately has no implicit demo/bootstrap path: it must be
 * provisioned with an explicitly prepared, non-demo state file.
 */
export function loadStateFile(filePath, { production = false } = {}) {
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      if (production) {
        throw new Error('Production portal data is not initialized. Refusing to start with demo seed data.');
      }
      return null;
    }
    throw new Error(`Unable to read existing portal data file (${error?.code || 'I/O error'}). Refusing to initialize or overwrite it.`, { cause: error });
  }

  let state;
  try {
    state = JSON.parse(raw);
  } catch (error) {
    throw new Error('Existing portal data file contains invalid JSON. The original file was preserved; refusing to reset it.', { cause: error });
  }

  validateState(state, filePath);
  if (production && state.meta.demo === true) {
    throw new Error('Production portal data is marked as demo data. Refusing to start with demo records.');
  }
  return state;
}
