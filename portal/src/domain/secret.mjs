import fs from 'node:fs';

export const MIN_SECRET_LENGTH = 32;

/**
 * The session-signing secret an operator configured, or null.
 * Either PORTAL_SECRET, or PORTAL_SECRET_FILE: a path to a file holding it. The file form lets a
 * host keep the secret out of control-panel forms and environment dumps. A secret shorter than
 * 32 characters is treated as not configured.
 */
export function readConfiguredSecret(env = process.env) {
  const direct = String(env.PORTAL_SECRET || '').trim();
  if (direct) return direct.length >= MIN_SECRET_LENGTH ? direct : null;
  const file = env.PORTAL_SECRET_FILE;
  if (!file) return null;
  try {
    const value = fs.readFileSync(file, 'utf8').trim();
    return value.length >= MIN_SECRET_LENGTH ? value : null;
  } catch {
    return null;
  }
}
