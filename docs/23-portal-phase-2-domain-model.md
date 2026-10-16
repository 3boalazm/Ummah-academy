# Operations Phase 2 — Domain model contract

**Status:** In progress — the latest GitHub Actions static gate passed (run 57); full repository QA is not green because the marketing-site pixel-contrast job failed and two browser jobs were still running at last check.  
**Scope:** The operations portal under `portal/`, not the already-shipped marketing-site Phase 2 redesign.  
**Requirement:** `OPS-003` in [the requirements ledger](21-requirements-ledger.md).

## Objective

Verify that the current operations domain keeps distinct entities distinct and that core relationships cannot silently cross student, family, enrollment, subscription, cycle, session, or payment boundaries. This is a source-backed contract baseline, not a production database migration or a claim that all academy workflows are complete.

## Work started

- Added `portal/test/model-contract.test.mjs` for synthetic-seed IDs and relationship integrity.
- Added `portal/test/domain-boundaries.test.mjs` for negative command tests: cross-student enrollment, cross-subscription cycle/payment, and cross-family/session follow-up references must be rejected without leaving partial state.
- Added unique-ID checks for the principal persisted collections.
- Added relationship checks for:
  - guardian → family and guardian → authorized students;
  - user account → optional guardian/student/teacher profile;
  - student → family;
  - enrollment → student/course/teacher;
  - subscription → student/family/course/plan;
  - cycle → subscription/plan;
  - assignment → student/enrollment/teacher;
  - session → student/family/teacher/course/enrollment/subscription/cycle, including reschedule links;
  - payment → family/subscription/cycle;
  - attendance → session/student;
  - report → session/student/teacher;
  - asset and follow-up references where the current model defines them.
- Added both suites to `npm test` and `npm run test:portal`.

## Acceptance boundaries

These checks currently exercise the **synthetic seed model**. They do not prove that arbitrary persisted production data is valid, that all mutation handlers preserve every invariant, or that the JSON store is safe for concurrent writes.

Before this requirement can be accepted:
1. CI must execute the new suite and report all checks passing.
2. Expand negative mutation tests across every mutation family; the initial cross-entity cases are now implemented, but still require runtime acceptance.
3. Review which relationships are historical snapshots versus live foreign keys (especially teacher assignment history, session substitutions, and reschedules).
4. Move the accepted invariants into a production persistence schema with database constraints and migration/rollback tests once the database/runtime decision is approved.

## Not changed

- No production or demo data was edited.
- No role policy was guessed or narrowed.
- No real student data, database, credentials, public CTA, or deployment settings were changed.
- No pull request was merged.
