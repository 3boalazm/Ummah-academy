# Phase 5.2 — reschedule history acceptance

**Status:** Implemented as regression coverage; CI verification pending.
**Branch:** `phase-5/scheduling-integrity`
**Related requirements:** `SCH-003`, plus the reschedule/conflict part of `SCH-001`.

## Added coverage

- `portal/test/domain.test.mjs`: a second reschedule must preserve the very first `originalStartsAt`, keep each `rescheduledFromId` / `rescheduledToId` link, and retain separate audit reasons for both moves.
- `portal/test/domain.test.mjs`: a move into an occupied teacher slot must reject without changing either session or appending audit history.
- Existing coverage remains in place for a single reschedule and a weekly series crossing Sydney's DST transition.

## Run

```sh
npm run test:portal
npm test
```

No test result is claimed until a CI run or reproducible local output is available.

## Remaining gates

1. Verify these tests and the full portal suite in CI.
2. Add route/API authorization checks for rescheduling by each role and for cross-record scope.
3. Expand time-zone coverage for multiple IANA zones and DST boundaries. Nonexistent and ambiguous local times need an explicit owner-approved policy before the conversion helper is changed; do not silently invent a policy.
4. Inspect browser journey and accessible reschedule feedback after API gates pass.

## Scope

Synthetic seed data only. No merge, no `main` changes, no production data or deployment settings changed.
