# Operations Phase 4 — academic model audit

**Status:** Audit/specification started; no academic schema or production behavior changed.
**Requirement:** `OPS-004` in [the requirements ledger](21-requirements-ledger.md).
**Branch:** `phase-4/academic-model-audit` (independent of Phase 3; no PR merged).

## Purpose

Define the minimum academic operating model needed to manage placement, curriculum, learning goals, assessments, homework, submissions, and progress without conflating learning state with login, enrollment, or subscription state.

## Source-backed baseline

The current synthetic portal model already contains:
- Student-level free-text fields for `level`, `goals`, `strengths`, and `improvements`.
- Courses and enrollments, including a level field on enrollment.
- Session-linked teacher reports with free-text summary, homework, next step, strengths, and improvements.
- Attendance and session history, which can provide evidence for learning progress but are not assessments by themselves.
- A student DTO that exposes a `progress` projection built from student-level fields and session reports.

The inspected model does **not yet demonstrate** dedicated, versioned entities for curriculum units/lessons, placement attempts and rubric scores, learning objectives, assessment attempts, homework assignments/submissions/feedback, or a normalized progress event history. This is an audit finding, not proof that every UI route lacks all related behavior.

## Required conceptual boundaries

1. **Academic profile:** current level/placement summary, learning needs, and review date; it must not be the only historical record.
2. **Placement:** a dated attempt with course/track, rubric/version, assessor, evidence, outcome, and any recommended level. Reassessment must append history rather than overwrite the previous result.
3. **Curriculum:** versioned program/course → level → unit → lesson/objective structure. Existing course/enrollment identifiers remain stable; curriculum revisions must not silently rewrite completed learning history.
4. **Learning goals:** objective-linked goals with owner, target date, status, evidence, and review history. Avoid treating broad free text as measurable completion.
5. **Assessment:** a typed assessment definition/rubric and dated attempt with score/outcome, assessor, evidence, and correction history. Scores must have explicit scales and cannot be compared across incompatible rubric versions.
6. **Homework:** assignment tied to a student, enrollment/course objective, and optionally a session; due date, submission attempts, teacher feedback, and status history. An empty report field is not a homework record.
7. **Progress:** derived views must state their source, calculation, and as-of time. Attendance, subscription state, and lesson completion must not be interpreted as mastery.
8. **History and access:** actor/time/reason for consequential edits; teacher scope follows approved assignments; guardians see only linked children; student visibility is age/role appropriate; internal assessor notes require an explicit policy.
9. **Bilingual content:** Arabic and English labels/instructions are first-class where intended for families/teachers, with language fallback defined rather than silently duplicating untranslated text.

## Proposed implementation sequence

- **4A — Contract and decisions:** approve the academic vocabulary, rubric ownership, who can assess/approve placement, student/guardian visibility, and whether historical records are immutable or correctable with an audit trail.
- **4B — Domain schema:** add normalized academic entities and relationship validation; keep demo seed data synthetic. Do not migrate or create real student records.
- **4C — Domain tests:** unique IDs, valid references, version compatibility, append-only reassessment/submission history, and rollback on rejected cross-student/cross-enrollment mutations.
- **4D — API authorization:** tests for teacher assignment scope, guardian-child scope, student self-scope, admin/ops decisions, guessed IDs, and response minimization.
- **4E — Read/write journeys:** placement → enrollment level → lesson/report → homework → submission/feedback → goal review, with Arabic/English and empty/error states.
- **4F — Reconciliation and acceptance:** seed integrity, route-level tests, accessibility checks, documented metric definitions, and an explicit review of remaining gaps.

## Acceptance criteria

- No free-text field is silently deleted or reinterpreted during schema changes.
- Every academic record has stable identity, ownership, timestamps, and a defined relationship to student/course/enrollment/session where relevant.
- Cross-student and cross-family references are rejected without partial mutation.
- Placement and rubric changes preserve historical results and version context.
- Teachers, guardians, students, and staff receive only approved fields and records.
- Progress metrics are explainable and reproducible from source records.
- Tests run in CI and their exact run is linked before requirements are marked accepted.

## Blockers / decisions not guessed

- Approved curriculum hierarchy and naming across Quran/Tajweed, Arabic, Ummah Cubs, and Islamic Studies.
- Placement rubric, score scales, mastery thresholds, and who can approve a level change.
- Whether guardians can see internal teacher notes versus published feedback.
- Whether students can see their own assessments/homework and any age-based restrictions.
- Correction policy for finalized reports, assessment attempts, and submitted homework.
- Final admin/ops permission matrix remains a separate owner decision; this phase does not broaden or narrow it.

## Safety

This phase only records the source-backed baseline and proposed contract. No production database, migration, real student data, public sign-in URL, credentials, deployment configuration, or role matrix was changed. No PR was merged.
