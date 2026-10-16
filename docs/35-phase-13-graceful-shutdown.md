# Phase 13 — Graceful shutdown and process lifecycle

**Status:** Source changes and unit tests added; CI pending.
**Branch:** `phase-13/graceful-shutdown-operations`
**Parent:** Phase 12 health/readiness diagnostics.

## Implemented
- Handle SIGTERM and SIGINT once; repeated signals do not start overlapping shutdown flows.
- Stop accepting new connections and allow in-flight requests to finish.
- Close idle connections when supported by the Node runtime.
- Apply a bounded grace period configurable through `PORTAL_SHUTDOWN_TIMEOUT_MS` (default 10 seconds); after expiry, close remaining connections and mark process exit as unsuccessful.
- Emit structured start, timeout and completion lifecycle events without logging request payloads, cookies, identifiers or store contents.
- Add unit tests for clean close, timeout/forced close, and compatibility with minimal server interfaces.

## Operator notes
- Deployments must send SIGTERM and allow the configured grace period before force-killing the process.
- Choose the platform termination grace period to exceed the portal timeout plus enough time for the process to exit.
- This does not make JSON persistence transactional. A forced timeout can interrupt in-flight requests; reconcile any affected operation using audit/idempotency evidence before retrying.
- No production data, live service, public URL, deployment settings, or main branch was changed.

## Exit criteria
- [x] Signal handlers and bounded shutdown helper added.
- [x] Tests added to repository test commands.
- [ ] Full CI and browser/runtime suites pass on exact head.
- [ ] Target runtime's SIGTERM behavior verified in staging.
- [ ] Transactional database and remaining Phase 9 production gates closed.

**Decision:** Lifecycle handling improved, but production remains NO-GO pending the documented runtime, data, security and privacy gates.
