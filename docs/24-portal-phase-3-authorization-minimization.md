# Operations Phase 3 — authorization response minimization

**Status:** In progress — role-specific teacher directory projections and response-shape tests added; CI pending.  
**Scope:** Authenticated operations portal APIs under `portal/`. This is separate from the marketing-site redesign phases.  
**Requirement:** `AUTH-011` in [the requirements ledger](21-requirements-ledger.md).

## Problem verified in source

Before this change, `listTeachers(actor)` returned the complete teacher record plus `activeStudents` for every role allowed to read the teacher directory. By contrast, `getTeacher(actor, teacherId)` already returned a narrower public projection for guardians and students and denied teachers access to another teacher's detail. The list endpoint therefore exposed more fields than the detail endpoint needed to.

## Change in this phase

- Guardian and student teacher-directory responses now use the same minimal public field set as the existing detail endpoint: ID, bilingual name, specialty, role, ijazah flag, and timezone.
- Teacher-role directory results are limited to the signed-in teacher's own profile.
- Admin/ops continue to receive the operational directory with active-student counts; this phase does not silently narrow the business-approved-but-not-yet-defined ops permission matrix.
- Added `portal/test/teacher-directory.test.mjs` for guardian/student response shape, teacher self-scope, admin operational access, and parity with the detail projection.
- Added the suite to `npm test` and `npm run test:portal`.

## Acceptance gates still open

1. CI must pass the new tests and existing portal suites.
2. Run route-by-route API authorization tests for every GET, mutation, upload, and download route in [the route inventory](22-phase-0-route-inventory.md).
3. The owner must approve the ops/admin permission matrix before any further privilege reduction.
4. Audit other DTOs for unnecessary student/guardian contact details, billing fields, recording metadata, and cross-family identifiers.

## Not changed

- No user role policy was invented beyond narrowing the teacher-directory response to the existing public projection and limiting teachers to their own profile.
- No production data, credentials, public URL, database, or deployment settings changed.
- No PR was merged.
