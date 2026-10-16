# Ummah Academy — Requirements & Acceptance Ledger

**Status:** Initial baseline; not all requirements are business-approved.  
**Date:** 2026-10-16  
**Companion:** [Phase 0 baseline audit](20-phase-0-baseline.md)

## How to use this ledger

- One stable ID per independently testable requirement.
- `OPEN` means the business decision or evidence is missing; it is not permission to guess.
- `SOURCE-VERIFIED` means visible in repository source, not necessarily runtime-tested.
- `TEST-REPORTED` means a prior document reports a test; it has not been rerun in this audit.
- `ACCEPTED` is only allowed when implementation, automated tests, negative/edge cases, and evidence are linked.
- Never mark a requirement done because a page exists or a build succeeds.
- Every requirement must ultimately link to its source file/API, owner, test(s), and evidence. Add rows rather than reusing IDs.

## Status vocabulary

| Status | Meaning |
|---|---|
| OPEN | Not investigated or no decision/evidence yet |
| SOURCE-VERIFIED | Behavior/structure found in code; runtime not verified |
| TEST-REPORTED | Test result documented by a prior run, not reproduced in this phase |
| IN-PROGRESS | Actively being implemented or validated |
| BLOCKED | Depends on an unresolved business or technical decision |
| ACCEPTED | Meets all acceptance criteria with evidence |
| DEFERRED | Explicitly deferred with owner, reason, risk, and target phase |

## Initial requirements inventory

| ID | Domain | Requirement / acceptance condition | Priority | Initial status | Phase / evidence needed |
|---|---|---|---|---|---|
| BASE-001 | Scope | Keep marketing site and authenticated operations portal as distinct deployable surfaces unless an architecture decision explicitly changes this. | P0 | SOURCE-VERIFIED | P0: Astro static build and portal Node process are separate in source/docs. |
| BASE-002 | Public links | Do not change public sign-in links to the portal until production launch gates pass. | P0 | SOURCE-VERIFIED | P0: `PUBLIC_PORTAL_URL` currently defaults to WordPress domain. |
| DATA-001 | Persistence | Existing data that is unreadable or invalid must never be silently replaced with seed/demo state. Startup must fail closed and preserve the original file. | P0 | IN-PROGRESS | PR #9 adds fail-closed loading, schema checks, production missing/demo-state rejection, and regression tests. Await QA completion/review; add unreadable-file and explicit recovery/backup tests before ACCEPTED. |
| DATA-002 | Database | Production records must live in a durable transactional database suitable for concurrent operations; schema changes must be versioned and reversible where feasible. | P0 | OPEN | P1 architecture: select DB and migration strategy; test concurrency and restore. |
| DATA-003 | Integrity | Core entities must have stable IDs, validated relations, and database-level constraints where applicable. | P0 | OPEN | P1: schema and integrity tests. |
| DATA-004 | History | Critical changes preserve actor, timestamp, reason, and relevant before/after values without logging passwords or secrets. | P0 | SOURCE-VERIFIED | P0: inspect audit implementation and verify redaction/immutability. |
| DATA-005 | Backups | Production backup and restore are documented and restore is periodically tested. | P0 | OPEN | P1: evidence from restore drill. |
| DATA-009 | Demo reset safety | Destructive demo reset is unavailable in production and cannot overwrite live records. | P0 | IN-PROGRESS | PR #9 rejects reset when production=true and adds a state-unchanged regression test; await CI/review. |
| AUTH-001 | Authentication | Passwords are securely hashed; demo credentials and seeded demo accounts are impossible to use in production. | P0 | SOURCE-VERIFIED | P0: production guard exists in source/docs; test deployment configuration and bootstrap flow. |
| AUTH-002 | Sessions | Cookies, expiry, logout, rotation, invalidation, TLS and proxy behavior are verified. | P0 | IN-PROGRESS | P1: cookie currently lacks an explicit Secure attribute; logout clears the cookie but no server-side token revocation was found; verify complete lifecycle. |
| AUTH-003 | Authorization | Every read/write/export/upload/download checks server-side role and record-level scope. | P0 | SOURCE-VERIFIED | P0/P1: route-by-route positive and negative API tests required. |
| AUTH-004 | Family isolation | A guardian can access only children and financial data explicitly linked and authorized to them. | P0 | TEST-REPORTED | P1: reproduce API tests for multiple guardians/children and changed permissions. |
| AUTH-005 | Teacher scope | A teacher sees only assigned students/sessions and cannot access family billing or unrelated students. | P0 | TEST-REPORTED | P1: route-by-route negative tests. |
| AUTH-006 | Rate limiting | Login and sensitive operations resist brute force and abuse across the actual deployment topology. | P1 | SOURCE-VERIFIED | P1: current login limiter is in-memory/per-process; verify proxy handling and deployment. |
| AUTH-009 | Session revocation | Logout, account disablement, role changes and secret rotation invalidate previously issued session tokens within the approved security window. | P1 | OPEN | P1: inspected session tokens are stateless and have expiry claims; design revocation/version strategy and tests. |
| AUTH-010 | Ops least privilege | Ops permissions are explicitly limited by an approved matrix and cannot perform finance/admin/assignment actions unless explicitly granted. | P1 | BLOCKED | Source currently grants ops all actions except demo reset; owner must approve role policy before narrowing or preserving these privileges. |
| AUTH-011 | Teacher directory minimization | Teacher list responses expose only role-appropriate fields; guardian/student responses do not include internal user IDs or active-student counts unless explicitly approved. | P1 | OPEN | Source `listTeachers` returns the spread teacher record and `activeStudents`, while `getTeacher` returns a narrower guardian/student projection. Add role-specific response-shape tests. |
| AUTH-007 | CSRF | State-changing cookie-authenticated requests are protected against cross-site request forgery. | P0 | OPEN | P1: inventory mutations and add negative tests; verify origin/token strategy. |
| AUTH-008 | Headers | HTTPS-only production, Secure cookies, content-type protections, suitable CSP/frame policy and no-store for sensitive responses. | P1 | IN-PROGRESS | P1: inspect complete headers and test deployed responses. |
| PRIV-001 | Children | Guardian consent, privacy notice, access/correction/deletion process and data minimization are defined for target jurisdictions. | P0 | OPEN | P1: business/legal sign-off before real data. |
| PRIV-002 | Recording | Recording access requires authorization and consent; retention and deletion are explicit. | P0 | OPEN | P1: no real recording storage/provider is established in current baseline. |
| PRIV-003 | Retention | Student, guardian, session, payment, asset, audit, and communication data each have approved retention/deletion rules. | P1 | OPEN | P1: policy and implementation tests. |
| OPS-001 | Lead CRM | Capture source, consent, owner, stage, next action, timestamps, and history from inquiry through conversion. | P1 | OPEN | Phase 3: requirements and end-to-end lead tests. |
| OPS-002 | Trials | Trial policy supports the published two-trial offer, scheduling, attendance, outcome, follow-up, and conversion without duplicate records. | P1 | SOURCE-VERIFIED | Phase 3: portal onboarding creates a two-lesson trial; verify full journey/API. |
| OPS-003 | Student/family | User, student, guardian, teacher, enrollment, and subscription remain distinct entities with explicit relationships. | P0 | SOURCE-VERIFIED | Phase 2: validate model against approved domain requirements. |
| OPS-004 | Academic | Programs, levels, placement, curriculum, goals, assessments, homework, submissions and progress have defined owners and history. | P1 | IN-PROGRESS | Phase 4A: source-backed baseline and proposed contract in [academic model audit](25-phase-4-academic-model-audit.md); schema and business decisions remain open. |
| OPS-005 | Teachers | Profile, qualifications, availability, leave, workload, assignment history, quality and compensation policy are supported. | P1 | PARTIAL | Phase 5: current teacher profiles/assignments exist; HR/payroll completeness not proven. |
| SCH-001 | Scheduling | Student/teacher conflicts are rejected on the server, including recurring series; a failed series leaves no partial sessions. | P0 | TEST-REPORTED | Phase 5: reproduce tests and route-level acceptance. |
| SCH-002 | Time zones | Store absolute instants safely and display correct local time; recurring lessons preserve local wall-clock time across DST. | P0 | TEST-REPORTED | Phase 5: test multiple IANA zones, DST gaps/overlaps, date boundaries, and reschedules. |
| SCH-003 | Session history | Changing a teacher/time does not silently rewrite past sessions; changes are attributable and reviewable. | P0 | TEST-REPORTED | Phase 5/6: acceptance tests. |
| CLS-001 | Attendance | Attendance distinguishes present, student/teacher absence, cancellation and reschedule according to approved policy. | P0 | PARTIAL | Phase 6: approve state machine and test every transition. |
| CLS-002 | Reports | Required post-session reports are tracked, overdue reports surfaced, and corrections audited. | P1 | SOURCE-VERIFIED | Phase 6: verify report completion, access scope and correction flow. |
| CLS-003 | Learning | Teacher feedback, learning goals, homework and progress are visible to the correct roles only. | P1 | OPEN | Phase 6/9: data model, UI and permission tests. |
| SUB-001 | Subscriptions | Subscription, enrollment, payment, and student status are separate state machines. | P0 | SOURCE-VERIFIED | Phase 7: state-transition tests and documented invariants. |
| SUB-002 | Credits | Remaining credits are derived from allocation, adjustments and eligible consumption events; scheduled sessions do not consume credits. | P0 | TEST-REPORTED | Phase 7: reconcile ledger against all attendance/cancellation policies. |
| SUB-003 | Idempotency | Retried commands and duplicate webhooks cannot create duplicate enrollments, sessions, charges or credit consumption. | P0 | PARTIAL | Phase 7: current source uses idempotency in some operations; inventory every mutation/integration. |
| FIN-001 | Payments | Payment attempts, success/failure, refunds, reconciliation and invoice states are traceable and idempotent. | P0 | BLOCKED | Phase 7: no live payment provider; provider and legal invoice requirements OPEN. |
| FIN-002 | Teacher compensation | Compensation rules cover delivered classes, trials, cancellations, substitutes and adjustments. | P1 | OPEN | Phase 7: business decision required. |
| MSG-001 | Messaging | Drafted, queued, attempted, sent and delivered states are distinct; failures and retries are logged. | P1 | PARTIAL | Phase 8: current WhatsApp flow is a manual draft; no automated delivery confirmed. |
| MSG-002 | Consent | Communication preferences, opt-outs, locale and approved templates are honored. | P1 | OPEN | Phase 8: provider and consent policy required. |
| MSG-003 | Follow-up | Follow-ups have an owner, due date, status, result and append-only attempt history. | P1 | SOURCE-VERIFIED | Phase 8: runtime and permission tests. |
| FILE-001 | Upload | Upload validates size, content/signature, allowed types and actor permission; rejects traversal and malformed files. | P0 | PARTIAL | Phase 11: source documents 1 MB PDF/PNG/JPEG/text; require adversarial tests. |
| FILE-002 | Download | Private assets never expose storage keys/public permanent URLs; access is checked when opened and tokens expire. | P0 | TEST-REPORTED | Phase 11: test token binding, expiry, revocation and permission changes. |
| FILE-003 | Storage | File storage has backup, retention, malware/content scanning policy where appropriate, and orphan cleanup. | P1 | OPEN | Phase 11: production storage architecture. |
| PORTAL-001 | Role portals | Admin/ops/finance/academic staff, teachers, guardians and students have complete role-appropriate journeys. | P1 | PARTIAL | Phase 9: detailed permission matrix and journey acceptance. |
| PORTAL-002 | Accessibility | UI supports keyboard use, visible focus, responsive mobile layouts, localization, and WCAG 2.2 AA goals. | P1 | TEST-REPORTED | Phase 9: existing marketing QA is not evidence of portal accessibility; separate portal audit needed. |
| UI-001 | Marketing contrast regression | Arabic app-install CTA meets 4.5:1 contrast for normal-sized text in dark and light themes across audited routes. | P2 | BLOCKED | PR #9 browser QA measured 1.15:1 and 1.41:1 on two routes and 3.71:1 on another for “حمّل التطبيق”; marketing files are unchanged in PR #9. Fix in a focused UI PR and rerun contrast audit. |
| OBS-001 | Operations | Health checks, structured redacted logs, alerts, correlation IDs, incident runbook and recovery ownership exist. | P1 | OPEN | Phase 1: runtime/operations design and test. |
| OBS-002 | Releases | CI checks build, domain tests, security checks and migration compatibility; releases can be rolled back safely. | P1 | PARTIAL | Phase 1/12: current marketing CI exists; verify portal test inclusion and add deployment gates. |
| DATA-008 | Reporting | Dashboard metrics have documented definitions, source queries, refresh times and role restrictions. | P2 | OPEN | Phase 10: metric dictionary and reconciliation tests. |
| AI-001 | AI controls | AI suggestions are explainable, scoped to permitted data, logged where appropriate, and cannot autonomously perform high-impact financial/child-data actions. | P2 | OPEN | Phase 13: only after reliable production data and policy controls. |

## Acceptance evidence template

For each requirement, add:

- **Implementation:** exact path/API/component or migration.
- **Test:** exact test file/name and command.
- **Negative/edge cases:** unauthorized access, invalid input, retries, concurrency, time zones, failure recovery as relevant.
- **Evidence:** CI run, reproducible output, deployment check or signed business acceptance.
- **Owner:** named role/person responsible.
- **Decision:** approved rule or linked decision record.
- **Risk/deferral:** explicit rationale and expiry/review date if not delivered.

## Gate to Phase 1

Do not start production data migration or public sign-in cut-over until the P0 requirements have evidence and the following architecture decisions are recorded: database/runtime, identity/bootstrap, permission model, backup/restore, logging/monitoring, migration/rollback, and child-data privacy baseline.
