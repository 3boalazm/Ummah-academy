#!/usr/bin/env node
import { createVerifiedBackup, verifyRestoreCandidate } from '../portal/src/domain/backup-drill.mjs';

const [mode, first, second] = process.argv.slice(2);
try {
  if (mode === 'create' && first && second) {
    const result = createVerifiedBackup(first, second);
    console.log(JSON.stringify({ event: 'portal.backup.verified', ...result }));
    console.log('Backup created and verified. Store contents were not printed.');
  } else if (mode === 'verify' && first && !second) {
    const result = verifyRestoreCandidate(first);
    console.log(JSON.stringify({ event: 'portal.restore_candidate.verified', ...result }));
    console.log('Restore candidate passed structural validation. No restore was performed.');
  } else {
    console.error('Usage:\n  node scripts/portal-backup-drill.mjs create <store.json> <new-backup.json>\n  node scripts/portal-backup-drill.mjs verify <candidate.json>');
    process.exitCode = 2;
  }
} catch (error) {
  console.error(`Backup drill failed: ${error.message}`);
  process.exitCode = 1;
}
