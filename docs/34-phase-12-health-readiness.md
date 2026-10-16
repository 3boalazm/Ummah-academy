# Phase 12 — Health and readiness diagnostics

**Status:** Implementation added; CI and browser/runtime verification pending.
**Branch:** `phase-12/health-readiness-diagnostics`
**Parent:** Phase 11 backup/restore rehearsal.

## Implemented
- Keep `GET /api/health` as a lightweight liveness probe.
- Add `GET /api/ready` as a separate readiness probe. It returns HTTP 200 only when its configured checks pass, otherwise HTTP 503.
- Readiness checks cover store structure, store-file presence/readability, production secret configuration, and rejection of demo state in production.
- Response contains only check identifiers, pass/fail flags and severity; it does not return student, guardian, path, credential, or store contents.
- Unit tests cover healthy development state, production secret/demo gates, malformed/missing state and unreadable data.
- CI uses synthetic fixtures only.

## Boundaries
- This is a process-local diagnostic, not a dependency health check for a transactional database, message provider, storage service, or monitoring system.
- Because the current application uses a JSON store, a successful readiness response does not prove safe concurrent writes or production-grade availability.
- The endpoint is unauthenticated but deliberately reveals only a small set of coarse operational check results. Review exposure requirements before production use.
- No live environment, deployment settings, production data, or main branch was changed.

## Exit criteria
- [x] Liveness and readiness have separate semantics.
- [x] Readiness returns fail-closed status for missing critical conditions.
- [x] Response excludes private data and file paths.
- [x] Unit tests added to the repository test suites.
- [ ] Exact branch CI and browser suites pass.
- [ ] Security review accepts unauthenticated readiness response for intended deployment.
- [ ] Database, backups, secrets, monitoring and privacy gates from Phase 9 are closed.

**Decision:** Phase 12 adds diagnostics only. Production remains NO-GO until external/runtime gates are evidenced.
