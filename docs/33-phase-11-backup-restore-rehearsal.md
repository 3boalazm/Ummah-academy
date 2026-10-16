# Phase 11 — Backup and restore rehearsal

**Status:** Local, verified backup tooling added; operational disaster recovery is not yet accepted.
**Branch:** `phase-11/backup-restore-rehearsal`
**Parent:** Phase 10 observability and operations.
**Goal:** Make a backup exercise reproducible without exposing store contents or silently overwriting an existing backup.

## Implemented

- `node scripts/portal-backup-drill.mjs create <store.json> <new-backup.json>` validates a production-shaped, non-demo store before copying it.
- The command refuses an existing destination, creates the backup with restrictive `0600` permissions, validates the copied store, and compares SHA-256 digests.
- `node scripts/portal-backup-drill.mjs verify <candidate.json>` checks that a candidate is structurally valid without restoring or modifying it.
- Tests cover successful copy/checksum/permissions, refusal to overwrite, demo/corrupt source rejection, and non-mutating candidate validation.
- Output contains only operational metadata; it does not print store records.

## Safety and limits

- The current portal store remains a JSON file. This phase does **not** make concurrent writes transactional and is not a substitute for a production database.
- Backups may contain sensitive child/student and guardian data. Store them only in approved, access-controlled locations; this helper does not encrypt, upload, rotate, or retain backups.
- Do not run against production data until an authorized operator has approved the source, destination, access controls and handling policy.
- A valid JSON/schema check is not a complete restore drill. It does not prove application-level consistency, external file availability, recovery time, or recovery point objectives.

## Exit criteria

- [x] Backup command refuses to overwrite a destination.
- [x] Source and copied store must pass production-mode validation.
- [x] Backup bytes are checksummed and permissions are restricted on POSIX systems.
- [x] Automated tests cover core success and refusal paths.
- [ ] CI succeeds on the exact Phase 11 head.
- [ ] Operator-defined encrypted/off-site storage, retention, and access control are implemented.
- [ ] Restore is rehearsed in an isolated environment, including linked uploaded files and application-level integrity.
- [ ] Transactional database and concurrency acceptance gates are closed.

**Decision:** Phase 11 delivers a local rehearsal tool only. Production remains NO-GO; no production store, deployment setting, or public URL was changed.
