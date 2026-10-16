# Phase 9 — Production readiness validation

**Status:** Source-level hardening implemented; production readiness is **NO-GO** until the external/runtime gates in this document have evidence.
**Branch:** `phase-9/production-readiness-validation`
**Parent:** Phase 8 consent-gated outbox.
**Scope:** Reproduce safety assumptions in automated tests, harden production session-cookie attributes, and issue an evidence-based go/no-go decision. This phase does not provision infrastructure or migrate real records.

## Changes in this phase

- Extract session-cookie construction to `portal/src/domain/http-security.mjs`.
- Apply `Secure` to the session cookie whenever `PORTAL_ENV=production`, including login and logout cookie updates. Development/test mode remains usable on localhost.
- Add `portal/test/phase9-production-readiness.test.mjs` to the standard test suites.
- Verify that only `ENOENT` in development permits first-run initialization; production refuses a missing store.
- Verify malformed JSON is rejected without changing the original bytes.
- Verify invalid store shape and demo-marked state are rejected for production.
- Verify cookie `HttpOnly`, `SameSite=Lax`, path and lifetime, with `Secure` enabled only for production.

## Verification gate

The CI run on this branch is the source of truth. The test file is wired into both `npm test` and `npm run test:portal`. Do not mark Phase 9 accepted based on a commit existing or a workflow starting; require successful build/static gates, the complete portal suite, the consent browser journey, all marketing browser suites, and contrast audit.

## Production decision: NO-GO

These are not safely closable by source-only changes; the academy owner/operator must provision and verify them before real student, guardian, financial or recording data is used:

| Gate | Evidence required | Status |
|---|---|---|
| Durable transactional DB | Approved provider, versioned schema/migrations, unique constraints, concurrent-write tests, rollback rehearsal | BLOCKED — current store remains local JSON |
| Backup and restore | Encrypted backup schedule, access controls, retention, restore drill with measured recovery | BLOCKED — no production backup system evidenced |
| Runtime/deployment | Supported always-on Node runtime, persistent storage or DB connectivity, TLS/proxy configuration, health monitoring, rollback | BLOCKED — portal is not deployed by the static Vercel build |
| Initial admin and secrets | Secure admin bootstrap, managed `PORTAL_SECRET`, rotation and recovery process, demo users/passwords excluded | BLOCKED — no deployment proof |
| Session revocation | Invalidate existing sessions on logout/account disablement/role changes/secret rotation | OPEN — cookie clearing alone does not revoke a copied stateless token |
| Authorization and CSRF | Full role × route × mutation/export/upload/download matrix, CSRF/origin checks, deployed CORS and headers | OPEN |
| Child privacy and retention | Owner/legal approval of notices, consent, correction/deletion, recording retention, communications policy | BLOCKED — policy sign-off required |
| Messaging and payments | Provider signatures/webhooks, retries, reconciliation, evidence and idempotency under DB transactions | BLOCKED — no provider integration |

## Exit criteria

- [x] Production cookie helper supports the `Secure` attribute and server login/logout use the environment-aware helper.
- [x] Fail-closed persistence and cookie-policy regression tests added to both test entry points.
- [ ] Latest CI passes on the exact branch head.
- [ ] DB, restore, deployment, auth, privacy, and provider evidence above exists.
- [ ] Owner approves a written production go/no-go.

**Decision:** Phase 9 source work can be reviewed, but operational production readiness is not accepted. Keep the public sign-in URL unchanged and do not import real student data.
