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
| Branch protection | Branch listing metadata | `main` was reported as not protected; verify rulesets/permissions in GitHub settings |
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

### P1 — Resolve before production pilot

| ID | Finding | Required next step |
|---|---|---|
| P1-AUTH-01 | Session cookie is set as HttpOnly and SameSite=Lax, but the inspected cookie builder does not add the Secure attribute. | Make cookie attributes environment-aware; require Secure under HTTPS; test login/logout, expiry, rotation, invalidation, and proxy/TLS behavior. |
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

Fix and test **P0-DATA-01** first in an isolated branch: a pre-existing unreadable/corrupt store must stop startup with a clear error and must never be replaced automatically by seed data. Preserve the original file for recovery. Then establish the production database and security architecture before connecting the public site or entering real child data.
