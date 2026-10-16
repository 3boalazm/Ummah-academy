# Phase 5 — scheduling integrity and teacher operations

**Status:** In progress. First implementation slice is on a separate branch; do not merge until CI and review evidence are green.
**Requirements:** `OPS-005`, `SCH-001`, `SCH-002`, and `SCH-003` in [the requirements ledger](21-requirements-ledger.md).

## Slice 5.1 — scheduling integrity

### Implemented in this branch
- Validate session duration as a positive whole number of minutes in direct session creation.
- Validate recurring-series duration and IANA time-zone identifier before building sessions.
- Precompute all occurrences in a recurring series, validate conflicts against existing sessions and earlier planned occurrences, then insert the complete series only after all occurrences pass.
- A conflict in a later occurrence can no longer leave earlier sessions partially persisted.
- Added regression tests for invalid durations, invalid time zones, and no partial state/audit mutation when a later recurring occurrence conflicts.

### Commands and evidence
- Root test suite: `npm test`
- Portal test suite: `npm run test:portal`
- Focused file: `portal/test/domain-boundaries.test.mjs`
- CI must run on this branch/PR before this slice can be called verified. A local clone/test run could not be performed in the current execution environment because GitHub DNS/network access was unavailable.

## Remaining Phase 5 work — not claimed complete
1. Run the new tests in CI and fix any regressions.
2. Extend time-zone tests across IANA zones, DST gaps/overlaps, local wall-clock preservation, reschedules and date boundaries. Decide and document the policy for nonexistent/ambiguous local times before implementing a policy that silently shifts them.
3. Expand scheduling authorization and negative tests for every role, series, substitute and reschedule paths.
4. Verify session-history invariants: changing assignment must not rewrite past sessions; reschedule retains original time/reason and complete linkage.
5. Audit teacher profile, qualifications, availability/leave, workload, assignment history, quality and compensation fields. Do not invent compensation or approval policy; mark missing business decisions BLOCKED.
6. Add journey/browser/accessibility evidence for the portal after the API behavior is stable.

## Safety and scope
- Synthetic seeded data only.
- No real student data, production database, deployment settings, public sign-in URLs, or credentials changed.
- No PR merged.
- Phase 4 PR #17 remains separate and unmerged; this Phase 5 branch is based on `main` and does not depend on unmerged Phase 4 code.
