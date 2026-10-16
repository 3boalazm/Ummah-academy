# Phase 7.1 — subscription, credit and payment idempotency baseline

**Status:** Implementation and regression coverage expanded; final CI verification pending.
**Branch:** `phase-7/subscriptions-credits-idempotency`
**Scope:** Fix API idempotency-key collisions across different endpoints, add an API regression test, and establish Phase 7 acceptance gates.

## Implementation

- The HTTP request metadata now scopes a supplied `Idempotency-Key` by HTTP method and request path before passing it to domain commands.
- Reusing one client key on `POST /api/sessions` and `POST /api/payments` no longer lets the second route replay the first route's result.
- An API integration test checks that same-route retries replay the original session while the same key on another route creates a real payment response.
- Freeze, resume and cycle-adjustment commands now accept the route-scoped idempotency key; regression tests check that retries do not duplicate state changes or audit events.
- The floating install CTA and known dark-theme copy surfaces receive explicit contrast treatments after the pixel audit identified failures. Latest contrast CI still needs to confirm these changes; the audit is not yet accepted.
- Existing domain tests already cover payment replay without duplicate payment rows, keeping subscription status unchanged when a payment is recorded, cycle adjustment audit, and credit consumption rules for completed sessions, no-shows and cancellations. These tests still need a fresh successful CI run on this branch.

## Phase 7 requirements and gates

| Requirement | Current implementation/evidence | Remaining gate |
|---|---|---|
| SUB-001 — separate subscription, enrollment, payment and student states | Distinct collections and domain operations exist in source | Define and test allowed transition tables; prevent invalid combinations and stale state |
| SUB-002 — credit ledger | Balance is derived from cycle allocations, adjustments and eligible session outcomes; scheduled sessions do not consume credits | Reconcile all edge cases with the approved attendance/cancellation policy from Phase 6 |
| SUB-003 — idempotency | Domain commands replay keyed results; API keys include method + path + request-body fingerprint; session replay, changed-payload rejection, cross-route isolation, payment, freeze/resume and cycle-adjustment regression coverage exists | Durable uniqueness/transaction guarantees and webhook idempotency require a production DB/provider integration |
| FIN-001 — payments | Manual ledger records support pending/paid/failed/refunded statuses; invoice notes explicitly say this is not a card charge or tax document | Payment provider, webhook signatures, refund workflow, reconciliation, invoice/tax requirements and business approval remain open |
| FIN-002 — teacher compensation | No complete compensation engine is accepted | Business must approve rates, trials, substitutes, cancellation treatment, adjustments and approval authority |

## Safety boundaries

- No live payment provider, charge, refund or webhook is configured or claimed.
- No financial or attendance policy was invented.
- This branch is based on `main` and is independent of unmerged Phase 4–6 PRs.
- No merge, production data, public URL or deployment setting changed.

## Verification

Run:

```sh
npm run test:portal
npm test
npm run build
```

Do not mark Phase 7 accepted until CI passes and subscription/credit invariants have negative, edge, authorization and retry tests. The route-scope fix is not sufficient by itself to claim full idempotency: same-route key reuse with a different payload and database-level concurrency protection remain open.
