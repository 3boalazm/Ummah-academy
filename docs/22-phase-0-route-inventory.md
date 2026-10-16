# Phase 0 — Portal API route inventory

**Status:** Source inventory captured; role/resource authorization is not yet fully accepted.  
**Audited ref:** `main` at `bf7c751d3da261a69c3431c86b77a140f649eba6`  
**Source:** `portal/src/server.mjs`, `portal/src/domain/permissions.mjs`, `portal/src/domain/store.mjs`

## Global HTTP behavior found in source

- Requests under `/api/` are matched against a centralized method/path route table.
- Except for login, logout, and health, API routes require an actor resolved from the signed `ua_portal` cookie.
- All POST/PATCH API requests require `x-ua-request: 1`; the CSV export handler checks it too. This is a custom-request-header gate, not a substitute for testing CSRF/origin behavior and CORS on the actual host.
- JSON request bodies are limited by `readBody` (default 1,000,000 bytes; asset upload route uses 2,000,000 bytes).
- JSON responses default to `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`.
- Unknown API routes return JSON 404. Non-GET/HEAD requests to non-API paths return 405.
- The session cookie has HttpOnly and SameSite=Lax but lacks an explicit Secure attribute in the inspected source.
- The auth token is stateless; logout expires the browser cookie but does not visibly revoke a copied token server-side before expiry.

## Route inventory

This list is intended to ensure every route is included in the next authorization and acceptance pass. It does not imply that every route is appropriate for every role.

| Method | Route | Domain action / acceptance focus |
|---|---|---|
| POST | `/api/auth/login` | Login validation, throttling, production/demo boundary, cookie flags |
| POST | `/api/auth/logout` | Cookie clearing, copied-token/session-revocation policy |
| GET | `/api/health` | Public response minimization and deployment health semantics |
| GET | `/api/me` | Current actor only; no credential/hash leakage |
| GET | `/api/dashboard` | Role-scoped counts and summaries |
| GET | `/api/catalog` | Publicly safe course/plan data by authenticated role |
| GET | `/api/search` | Search result scoping and data leakage |
| GET | `/api/students` | List scoping, filters, pagination and export parity |
| GET/PATCH | `/api/students/:id` | Record-level read/write scope, allowed fields, audit reason |
| POST | `/api/families` | Staff-controlled onboarding, duplicate prevention, trial policy, no accidental login grant |
| GET | `/api/families` | Guardian/family scoping and PII minimization |
| GET | `/api/families/:id` | Guardian relationship and billing/recording scopes |
| GET | `/api/teachers` | Staff/teacher visibility and profile data minimization |
| GET | `/api/teachers/:id` | Assigned/self profile scope |
| GET | `/api/sessions` | Teacher assignment and guardian-child scoping, filters |
| POST | `/api/sessions` | Create authorization, conflict checks, idempotency |
| GET | `/api/sessions/:id` | Resource-level visibility |
| POST | `/api/sessions/:id/confirm` | Allowed transition, actor, audit, replay |
| POST | `/api/sessions/:id/attendance` | Attendance state machine, correction history, balance invariants |
| POST | `/api/sessions/:id/complete` | Report/attendance requirements, credit consumption, idempotency |
| POST | `/api/sessions/:id/report` | Teacher assignment, report completion/correction audit |
| POST | `/api/sessions/:id/cancel` | Cancellation authority, notice window, credit policy |
| POST | `/api/sessions/:id/reschedule` | Conflict checks, original history, series/time-zone rules |
| POST | `/api/sessions/:id/no-show` | Correct party/state, balance and audit |
| POST | `/api/sessions/:id/substitute` | Assignment authorization and immutable past records |
| GET | `/api/sessions/:id/room` | Session access; explicitly not a real video provider |
| GET | `/api/subscriptions` | Role scope, balance/price visibility |
| GET | `/api/subscriptions/:id` | Family/student scope, cycle history |
| POST | `/api/subscriptions/:id/renew` | Renewal rules, prior-cycle retention, idempotency |
| POST | `/api/subscriptions/:id/freeze` | Approval/policy, preserve credits/history |
| POST | `/api/subscriptions/:id/resume` | State transition and balance preservation |
| POST | `/api/subscriptions/:id/cancel` | Cancellation policy, financial/academic state separation |
| POST | `/api/cycles/:id/adjust` | Reason, approval thresholds, ledger and audit |
| POST | `/api/payments` | Manual payment authorization, idempotency and reconciliation |
| POST | `/api/assignments` | Teacher assignment authority, effective dates/history |
| GET | `/api/follow-ups` | Role, visibility and ownership scoping |
| POST | `/api/follow-ups` | Assignment/ownership, required due date and reason |
| GET | `/api/follow-ups/:id` | Record-level visibility |
| POST | `/api/follow-ups/:id/attempts` | Append-only communication history |
| POST | `/api/follow-ups/:id/transition` | Valid state transitions and ownership |
| POST | `/api/requests` | Guardian change request; approval vs direct mutation boundary |
| GET | `/api/audit` | Restricted roles, redaction, immutable records |
| GET | `/api/integrity` | Staff-only integrity diagnostics; no sensitive details to low-privilege roles |
| GET | `/api/acceptance` | Demo/test-only surface must not expose internal data in production |
| GET | `/api/notifications` | Current actor's notifications only |
| POST | `/api/notifications/:id/read` | Must only mark current actor's notification |
| POST | `/api/assets` | Upload authorization, byte signature, size, partial-failure cleanup |
| POST | `/api/assets/:id/token` | Actor/resource access and short-lived user-bound token |
| GET | `/api/assets/:id/content` | Re-check actor and token, expiry/revocation, no public storage URL |
| POST | `/api/sessions/series` | Whole-series conflict validation, rollback, DST and idempotency |
| POST | `/api/guardians/:id/phone` | Family contact scope, validation, consent and audit |
| GET | `/api/outbox` | Staff-only drafts; do not claim actual delivery |
| POST | `/api/outbox/drafts` | Draft generation idempotency and locale/consent rules |
| POST | `/api/outbox/:id` | Allowed draft status transitions; no false delivery claim |
| GET | `/api/invoices` | Finance permission and derived invoice correctness |
| GET | `/api/export/:type` | Role allowlist, field allowlist, CSV injection, audit and rate limits |
| POST | `/api/admin/reset-demo` | Admin-only and unavailable in production |
| GET/HEAD | Static portal files | Path traversal, cache policy, production demo surface |

## Required authorization review output

For every row above, the next review must record:

1. Exact store/domain method and its `can(actor, action, resource, state)` call.
2. Explicit role matrix: admin, ops, teacher, guardian, student.
3. Record-scope rule (student, family, teacher assignment, or current actor).
4. Sensitive fields returned and any price/payment/recording restrictions.
5. State transition and required reason/approval.
6. Idempotency and concurrent-request behavior.
7. Positive and negative automated tests, including guessed IDs and direct API calls.
8. Final status and test evidence. Hidden UI controls do not count as authorization.

## Source-review concerns already identified

- Teacher and guardian list permissions return broad list-level access decisions in `permissions.mjs`; the store must be checked to prove the returned rows are filtered before response.
- Student list is also allowed at the action level for teacher, guardian, and student; prove the actual list implementation never returns other students.
- `/api/acceptance` and `/api/integrity` require explicit production behavior, not only role checks.
- **Critical finding:** `resetDemo(actor)` previously allowed an admin to replace state with demo seed data even in production. PR #9 adds a production guard and a regression test; do not consider this closed until CI and review pass.
- Upload metadata is committed before file bytes are written. A disk-write failure can leave a record without a file; the route needs compensation/cleanup and a regression test.
- A custom header is checked for POST/PATCH, but no comprehensive deployed CSRF/CORS/origin test is recorded yet.
- The in-memory rate limiter is per-process, and logout does not visibly revoke a previously copied signed session token.

## Phase 0 status

**Route enumeration: source-captured. Route-by-route authorization acceptance: OPEN.** This document does not certify the API as secure and must not be used as a substitute for negative tests.
