# Phase 0 — Operations platform baseline audit

**Status:** In progress — repository/source review completed to the extent visible through GitHub; runtime verification and deployment checks remain open.  
**Date:** 2026-10-16  
**Repository:** [3boalazm/Ummah-academy](https://github.com/3boalazm/Ummah-academy)  
**Audited ref:** `main` at `bf7c751d3da261a69c3431c86b77a140f649eba6`  
**Purpose:** Establish a verified baseline before building more academy operations features. This document is not a production-readiness certification.

## 1. Executive decision

The repository now contains two distinct products:

1. **Public marketing website:** Astro static output, deployed through Vercel.
2. **Operations portal:** a separate Node.js HTTP process under `portal/`, with a file-backed store and demo seed data.

The portal has meaningful domain logic and automated tests, but it is **not safe to treat as production infrastructure for real student/guardian data yet**. Do not point the public sign-in CTA at this portal or onboard real families until the production foundation and launch gates below are met.

No application feature work should start ahead of resolving the critical data-durability concern in §4.1 and confirming the real deployment/security posture.

## 2. Repository and delivery baseline

| Area | Source evidence | Baseline finding |
|---|---|---|
| Default branch | GitHub repository metadata | `main`; latest inspected head `bf7c751d3da261a69c3431c86b77a140f649eba6` |
| Recent activity | Commit history | Latest merge adds the operations portal (PR #6) |
| Open pull requests | GitHub pull request listing | None open at audit time |
| Branches | GitHub branch listing | `main` plus four remaining `arena/*` branches; inspect whether stale before deleting any |
| Branch protection | GitHub branch-protection endpoint | Current connection returned 403 for branch-protection inspection; protection/ruleset status remains unverified and must be checked in repository settings |
| Marketing build | `package.json`, `vercel.json` | Astro build to `dist/`; Vercel runs build + static verification |
| CI | `.github/workflows/qa.yml` | Static QA plus browser QA matrix; docs-only pull requests are ignored by the workflow path filter |
| Portal runtime | `package.json`, `portal/README.md` | `npm run portal`; independent Node process, not included in the Astro/Vercel build |
| Portal tests | `package.json`, `portal/test/*` | `npm run test:portal`; `npm test` includes portal domain and operations tests |
| Production DB | `portal/src/server.mjs`, `portal/README.md` | JSON file store; no multi-server database |
| Public CTA | `src/data/site.ts`, `.env.example`, audit doc #19 | `PUBLIC_PORTAL_URL` still points to the WordPress domain by default |
| Demo data | `portal/src/domain/seed.mjs`, `portal/README.md` | Synthetic identities and public demo login details are part of the demonstration experience |

**Verification limitation:** This review inspected source files and GitHub metadata. It did not execute `npm ci`, build, tests, live HTTP checks, Vercel deployment inspection, or database recovery in a runtime. Results claimed in previous project documents are recorded as prior reports, not newly reproduced results.

## 3. Current system map

### A. Marketing surface

- Astro static site with English, Arabic, German, French, and Italian routes.
- Content, course/teacher/pricing data, localization, SEO, PWA, and analytics controls live in `src/` and `public/`.
- Contact/trial requests are handed to WhatsApp or the optional `PUBLIC_LEAD_ENDPOINT`.
- The marketing site and CMS do not provide an operational student database or staff authorization system.
- Vercel's configured build outputs the static site; it does not start the portal process.

### B. Operations portal

- HTTP entry point: `portal/src/server.mjs`.
- Domain modules: `auth.mjs`, `permissions.mjs`, `policy.mjs`, `seed.mjs`, `store.mjs`, `time.mjs`, `ops.mjs`, `errors.mjs`, and `ids.mjs`.
- UI: `portal/public/`.
- Tests: `portal/test/domain.test.mjs`, `portal/test/ops.test.mjs`.
- Persistent data path defaults to `portal/data/store.json`; assets are under the portal data directory. Both are local filesystem state, not a shared transactional database.
- The code describes server-side permission checks, signed sessions, a derived session-credit ledger, subscription cycles, follow-ups, audit/event records, temporary asset tokens, staff CSV export, and WhatsApp drafts.

### C. Documented portal routes and workflows

The existing operations audit (document #19) describes login, overview, student/family/teacher profiles, schedule/session management, subscriptions, follow-ups, audit, health/acceptance, onboarding, WhatsApp draft outbox, invoices, and in-app notifications.

These are **source-documented routes and behaviors**. Each still needs runtime/API acceptance testing before being marked production-verified.

## 4. Risks and blockers

Severity definitions: **P0** = stop production cut-over; **P1** = resolve before the affected workflow is used with real data; **P2** = resolve before broad rollout or as scheduled hardening.

### P0 — Must resolve before real data

| ID | Finding | Why it matters | Required evidence to close |
|---|---|---|---|
| P0-DATA-01 | `loadState()` in `portal/src/server.mjs` catches every read/JSON-parse error and returns `null`; startup then initializes the seed and writes it to the configured data file. | A corrupt or unreadable existing store may be treated as a fresh install and overwritten with seed state. This risks silent loss of operational records. | Change startup to fail closed on an existing but unreadable/invalid store; preserve the original bytes; test malformed JSON, permission errors, backup/recovery, and ensure no seed overwrite occurs. |
| P0-ENV-01 | Demo identities and passwords are documented in a public repository and shown in demo mode. | They are public demonstration credentials, not secrets. Any reachable demo instance can be accessed by anyone who knows them. | Verify production startup rejects demo credentials and seeded demo users, prove no public deployment uses demo mode, and document a controlled initial-admin bootstrap. |
| P0-DEPLOY-01 | Portal is a separate process and is not part of the Vercel static build. The current public portal URL remains pointed at WordPress. | Deploying the marketing site does not deploy or operate the portal. A link cut-over alone would not create a production-ready service. | Select and deploy a supported persistent runtime; prove health checks, TLS, environment configuration, data persistence, backup/restore, and rollback. Keep public CTA unchanged until then. |
| P0-DB-01 | Operational state is stored in a local JSON file without multi-server transactional guarantees. | Concurrent writes, process restarts, filesystem loss, and horizontal scaling can threaten consistency and availability. | Approve a persistent transactional database, migration/rollback plan, concurrency tests, and a tested restore procedure before real student/financial data. |
| P0-RESET-01 | `resetDemo(actor)` in the inspected source allowed an admin to replace the current store with demo seed data even when `production: true`. | A production admin could overwrite live operational records with demo data from the demo-reset route. | PR #9 adds a production-mode refusal and a regression test that asserts the state remains unchanged; acceptance awaits CI and code review. |

### P1 — Resolve before production pilot

| ID | Finding | Required next step |
|---|---|---|
| P1-AUTH-01 | Session cookie is set as HttpOnly and SameSite=Lax, but the inspected cookie builder does not add the Secure attribute. | Make cookie attributes environment-aware; require Secure under HTTPS; test login/logout, expiry, rotation, invalidation, and proxy/TLS behavior. |
| P1-AUTH-04 | Logout clears the browser cookie, but sessions are signed/stateless and the inspected auth module has no server-side revocation list. A copied token can remain valid until expiry (12 hours in the server configuration). | Add a revocation/version strategy or shorten/rotate sessions according to an explicit threat model; test logout, account disablement, role changes and secret rotation against previously issued tokens. |
| P1-AUTH-05 | `can()` in `portal/src/domain/permissions.mjs` returns `action !== 'demo.reset'` for the ops role before applying the denylist used for lower roles. This effectively grants ops broad access to most admin/finance/assignment actions. | Confirm the intended operations-vs-finance-vs-academic authority matrix with the owner, then replace broad role bypass with explicit least-privilege permissions and negative API tests. Do not silently narrow workflows without policy approval. |
| P1-AUTH-06 | `listTeachers()` returns the full teacher object plus `activeStudents` to any role allowed by `teacher.read`, including guardians, students, and teachers. The single-teacher endpoint returns a narrower projection to guardians/students, so the list and detail response policies are inconsistent. | Define a public/staff teacher DTO and ensure the list endpoint returns only fields required by each role; add response-shape tests for guardian, student, teacher, ops and admin. |
| P1-AUTH-02 | Login throttling uses an in-memory per-process map. | Define proxy/IP trust rules and distributed rate limiting or an explicitly constrained single-instance control; test bypass and reset behavior. |
| P1-AUTH-03 | CSRF protection, origin checks, security headers/CSP, and authorization coverage have not been fully verified across every mutation route. | Build a route/mutation inventory and test direct API access, CSRF, session fixation, IDOR, role boundaries, and file access. Do not infer coverage from UI hiding. |
| P1-DATA-02 | File-backed storage and asset files have no demonstrated backup/restore or retention lifecycle. | Define storage ownership, encryption, backups, restore drills, access logs, retention, deletion, and orphan cleanup. |
| P1-FIN-01 | No real card charging/payment provider is implemented. | Decide provider, currency/tax/invoice requirements, idempotency, signed webhooks, refunds, reconciliation, and failure states. |
| P1-COMMS-01 | WhatsApp is a draft/manual handoff, not an integrated delivery channel. | Select provider and consent/template rules; distinguish drafted, queued, sent, delivered, read, and failed states where supported. |
| P1-OPS-01 | Teacher payroll, academic supervision, support-ticket/SLA handling, and detailed CRM stages are not evidenced as complete workflows. | Confirm operational policies and add explicit requirements; do not create UI-only placeholders. |
| P1-PRIV-01 | Children and family data require policy decisions across jurisdictions served. | Obtain business/legal confirmation for consent/guardianship, data minimization, retention, deletion/access requests, recording consent, and incident response. |

### P2 — Before broad rollout

- Add production observability: structured redacted logs, correlation IDs, metrics, alerts, and an incident runbook.
- Add documented environment parity, release approval, migration checks, and rollback procedure.
- Evaluate dependency/security scanning, secret scanning, and automated repository checks.
- Decide the lifecycle and review process for old `arena/*` branches; do not delete them as part of the audit without checking whether their work is retained.
- Ensure documentation-only pull requests receive at least a lightweight documentation/consistency check if CI path filters otherwise skip all checks.

## 5. Business decisions still open

These decisions must be recorded, not silently guessed in code:

1. Subscription model: calendar-month plan, credit pack, or hybrid.
2. Credit rules: attendance states that consume credit; cancellation/no-show thresholds; make-ups; freeze/resume; expiry; manual adjustments and approval limits.
3. Scheduling: staff-managed, family self-service, or hybrid; time-zone ownership; teacher matching rules; recurring-series behavior on conflicts.
4. Teacher compensation: per delivered session, monthly salary, or contract-specific hybrid; treatment of cancellations, trials, substitutes, and corrections.
5. Payment provider, currencies, refunds, failed payments, tax/legal invoice requirements, and reconciliation owner.
6. WhatsApp/email providers, approved templates, consent, delivery states, and who may send messages.
7. Live-class provider and whether recording is allowed, for whom, with what consent, storage, retention, and deletion rules.
8. Initial launch countries and language priorities; applicable child/privacy/legal requirements.
9. Role/permission matrix and who may approve financial, academic, guardian, and data-export actions.
10. Existing data sources and migration scope; whether the initial production database starts empty or imports cleaned records.

Until each item is decided, label it **OPEN** and avoid implementing irreversible assumptions.

## 6. Phase 0 deliverables

- [x] Confirm repository, default branch, recent head, and open PR state through GitHub metadata.
- [x] Map marketing site versus separate operations process.
- [x] Identify portal source modules, tests, seed/demo boundary, storage model, and current URL configuration.
- [x] Record initial blockers, risks, and business decisions.
- [ ] Run install/build/verification/tests against a checkout of the audited commit.
- [ ] Inspect complete HTTP route inventory and permissions for every read/write/export/upload endpoint.
- [ ] Reproduce storage corruption/recovery behavior in an isolated test.
- [ ] Inspect actual Vercel/runtime configuration, environment variables, logs, domains, and current deployment behavior.
- [ ] Verify GitHub rulesets/branch protection and CI outcomes; distinguish current results from prior reports.
- [ ] Finalize requirements ledger with evidence links and acceptance criteria for each workflow.
- [ ] Obtain decisions listed in §5 or record explicit deferrals.

## 7. Phase 0 exit criteria

Phase 0 is **not complete** until every unchecked deliverable above is either completed with evidence or explicitly deferred with an owner and accepted risk; the requirements ledger exists; no P0 blocker is left unacknowledged; and Phase 1 architecture choices are documented.

## 8. Recommended immediate action

**Implementation started:** Pull request [#9](https://github.com/3boalazm/Ummah-academy/pull/9) adds a fail-closed state loader, rejects missing/demo state in production, disables the destructive demo-reset operation in production, and adds regression tests for missing, malformed, invalid-schema, unreadable, demo-marked, and production-reset cases. It is open and has not been merged. On the latest commit, GitHub Actions **Build + static gates passed**, which includes the repository's `npm run qa` and test command; browser QA suites are still running. Vercel's separate status remains failed due to a build-rate-limit/plan page. Do not mark the fix accepted until the complete workflow passes and the diff is reviewed.

After the state-loader fix is accepted, establish the production database and security architecture before connecting the public site or entering real child data.


## 9. Live pull-request check observed after opening this audit

- Pull request [#8](https://github.com/3boalazm/Ummah-academy/pull/8) is open and contains documentation-only changes.
- The combined commit status currently reports the **Vercel check as failed**. Its status target identifies a Vercel build-rate-limit/plan limit page.
- The repository QA workflow filters out documentation-only pull requests, so the normal static/browser QA jobs may not run for this PR. This is a CI coverage gap for docs-only changes, not proof that application tests passed or failed.
- No application test suite was executed by this audit. Do not interpret the observed Vercel status as an application regression: it indicates the deployment/check could not pass because of the reported build-rate limit, but the actual Vercel project configuration and deployment logs still need direct inspection.
- Phase 0 remains open until the build limit and CI behavior are confirmed, and the remaining verification tasks in §6 are completed or explicitly deferred.


## 10. API and authentication surface — source review

The HTTP server has a centralized route table and, for API routes, requires an authenticated actor except for login, logout, and health. POST/PATCH API requests require the custom `x-ua-request: 1` header; the CSV export route checks it as well. This is a useful baseline control, but it does not replace full CSRF, origin, authorization, and deployment-header verification.

### Route groups found in `portal/src/server.mjs`

- Identity: login, logout, current actor (`/api/me`), health.
- Read surfaces: dashboard, catalog, search, students, families, teachers, sessions, subscriptions, follow-ups, audit, integrity, acceptance, notifications, invoices, outbox.
- Student/session operations: student PATCH; create/confirm/attendance/complete/report/cancel/reschedule/no-show/substitute sessions; recurring series; room.
- Subscription/finance operations: renew/freeze/resume/cancel subscriptions, cycle adjustments, record payment.
- Staff operations: change teacher assignment, create follow-ups, add attempts, transition follow-ups, change requests, guardian phone updates, generate/update WhatsApp drafts, CSV export, demo reset.
- Assets: upload, issue temporary asset token, read asset content.

The route table is a first-pass inventory, not proof that every route's resource-level authorization is correct. The next audit step must map each route to its domain action, allowed roles, resource scope, mutation invariants, idempotency behavior, and tests.

### Specific source-level notes

- Password hashing uses Node `scryptSync`; session and asset tokens use HMAC-SHA256 signatures and expiry claims.
- Session cookie builder includes `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Max-Age`, but not `Secure`.
- Logout expires the cookie in the response; there is no evident server-side session revocation in the inspected token module.
- Login rate limiting is held in a process-local `Map`, so it is not shared between instances or durable across restarts.
- `/api/health` is intentionally unauthenticated and returns `ok` plus a demo-mode boolean; verify this is acceptable for the chosen host.
- Upload handling registers the asset record and then writes file bytes. Failure handling should be tested so a disk write failure cannot leave misleading metadata or untracked files.
- The public UI and routes support a demonstration “room”; source explicitly says it is not a real video call.

These observations require runtime/negative testing before they become final security conclusions.


## 11. QA finding outside the portal patch

The latest GitHub Actions run for PR #9 passed **Build + static gates**, including `npm run qa` and the automated tests. One browser QA job, **pixel contrast (both themes)**, failed on unchanged marketing-site UI: the Arabic “حمّل التطبيق” install CTA measured 1.15:1 on one route and 1.41:1 on another, below the 4.5:1 AA target for normal-sized text. A third measurement was 3.71:1. The PR changes only portal code/tests and portal README, so this failure is unrelated to the portal fix, but it remains a repository QA blocker and should be corrected in a focused UI change. Browser suites for flows/touch/typography, popovers/axe, theme/PWA/offline, and CMS have since passed; canary/overflow/header remains in progress. The overall workflow is not yet complete.
