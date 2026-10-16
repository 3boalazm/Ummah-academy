# Operations Phase 4 — academic domain implementation

**Status:** Core academic data contract implemented on a separate branch. No merge or deployment.
**Requirement:** `OPS-004` in [the requirements ledger](21-requirements-ledger.md).

## Delivered in this branch

- `portal/src/domain/academic.mjs` defines explicit academic collections independent of login, enrollment, subscription, and attendance.
- Versioned curriculum hierarchy: program/curriculum version → level → unit → lesson → objective.
- Versioned placement rubrics and append-only placement attempts with assessor, date, scores, outcome, optional enrollment, and recommended curriculum level.
- Objective-linked learning goals with lifecycle/provenance fields.
- Versioned assessment definitions and dated attempts carrying the rubric version used.
- Student-scoped homework assignments and append-only submissions/attempt numbers.
- Progress events require a source record and actor/time provenance; attendance or subscription state is not automatically mastery.
- Store startup initializes absent academic collections without inventing academic history. Existing records and free-text fields are preserved.
- `appendAcademicRecord` rejects missing references, duplicate IDs, cross-student homework/enrollment/session links, and malformed academic records. Failed append restores the target collection.
- `portal/test/academic-domain.test.mjs` covers empty baseline, curriculum references, placement/assessment history, homework ownership, and rollback. Root `test` and `test:portal` include it.

## Boundaries and non-goals

This is the first normalized academic domain layer, not a production database migration. JSON remains the current storage adapter. The new collections start empty for existing synthetic seeds: no placement, assessment, goal, curriculum, or homework history is fabricated. Existing free-text student and session-report fields remain intact.

The module validates domain relationships; it is not an HTTP authorization layer. API routes must authorize each actor and record scope before calling domain commands. No role permissions were broadened.

## Acceptance and unresolved owner decisions

The following policy decisions remain deliberately unguessed and block declaring OPS-004 fully accepted:

1. Approved curriculum hierarchy and names across Quran/Tajweed, Arabic, Ummah Cubs, and Islamic Studies.
2. Placement rubric criteria/scales, mastery thresholds, and who may approve level changes.
3. Guardian visibility of internal assessor notes versus published feedback.
4. Student access to assessments/homework and age-based restrictions.
5. Correction policy for finalized placement/assessment/report records and submitted homework.
6. Final admin/ops/teacher/guardian/student permission matrix.

## Required next work before production use

- Add API routes and role-by-role positive/negative tests for academic read/write scopes.
- Build the placement → enrollment-level update → lesson/report → homework → submission/feedback → goal-review journeys and Arabic/English empty/error states.
- Define a production database/migration path, database-level foreign keys/uniqueness, backup/restore, and migration rollback; do not treat JSON validation as a database constraint.
- Add progress metric definitions with explicit rubric/threshold provenance and as-of time, then test reproducibility.
- Complete route/browser/accessibility QA and attach the exact passing CI run.

## Safety

Only synthetic fixtures are used in tests. No real student data, database migration, public sign-in URL, credentials, deployment configuration, or production data was changed. No PR was merged.
