import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadStateFile } from './persistence.mjs';

function digest(filePath) {
  return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * Create a new, non-overwriting local backup and verify it can be parsed as a
 * production-shaped store. This is a rehearsal helper, not an encrypted or
 * off-site backup system. Store files may contain sensitive student data.
 */
export function createVerifiedBackup(sourcePath, backupPath) {
  const source = path.resolve(sourcePath);
  const backup = path.resolve(backupPath);
  if (source === backup) throw new Error('Source and backup paths must be different.');
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
    throw new Error('Source store does not exist as a regular file.');
  }

  // Refuse demo state and malformed stores before copying anything.
  loadStateFile(source, { production: true });
  if (fs.existsSync(backup)) throw new Error('Backup destination already exists; refusing to overwrite it.');

  fs.mkdirSync(path.dirname(backup), { recursive: true });
  fs.copyFileSync(source, backup, fs.constants.COPYFILE_EXCL);
  try {
    fs.chmodSync(backup, 0o600);
    loadStateFile(backup, { production: true });
    const sourceSha256 = digest(source);
    const backupSha256 = digest(backup);
    if (sourceSha256 !== backupSha256) throw new Error('Backup checksum mismatch.');
    return { sourceSha256, backupSha256, bytes: fs.statSync(backup).size, mode: '0600' };
  } catch (error) {
    // Only remove the destination created by this invocation.
    try { fs.unlinkSync(backup); } catch { /* preserve original verification error */ }
    throw error;
  }
}

/** Verify an existing candidate restore without changing the source or target. */
export function verifyRestoreCandidate(candidatePath) {
  const candidate = path.resolve(candidatePath);
  const state = loadStateFile(candidate, { production: true });
  return { valid: true, bytes: fs.statSync(candidate).size, demo: state.meta.demo === true };
}
