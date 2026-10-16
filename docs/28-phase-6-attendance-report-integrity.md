# Phase 6.1 — attendance and lesson-report integrity

**Status:** Implementation and regression tests committed on the feature branch; final CI/contrast verification pending.
**Branch:** `phase-6/attendance-reports-integrity`
**Scope:** First implementation slice for `CLS-001` and `CLS-002`.

## Changes

- Attendance writes and session completion now accept only the existing domain statuses: `present`, `late`, `absent`, `excused`. Invalid values are rejected before mutation; the command transaction restores state on rejection.
- First report submission is audited as `report.submitted`; editing an existing report is audited as `report.corrected` with the previous and new report fields and the supplied reason.
- A correction updates the existing report record instead of creating a duplicate report.
- The one-time `report.submitted` event is not emitted again when the same report is corrected.
- Regression tests cover invalid attendance rollback, report-before-completion rejection, correction history, report uniqueness, and event behavior.
- API negative coverage now checks that guardians and a teacher without authority cannot submit a report against another session.

## Tests

```sh
npm run test:portal
npm test
```

CI must confirm these commands before the slice is accepted. No test pass is claimed from source edits alone.

## Explicitly not decided or completed

- The business-approved attendance state machine is still required to distinguish student absence, teacher absence, excused attendance, cancellation, late cancellation, and rescheduling. This slice validates only the currently implemented attendance enum; it does not invent new policy.
- Overdue-report thresholds, reminder cadence, correction approval, guardian notification on correction, and report finalization rules need owner decisions.
- Learning goals, assessments, homework submissions, progress history and their UI/API authorization remain outside this slice (`CLS-003`).
- Full role-by-role route authorization, browser journeys, accessibility and correction/revocation scenarios remain required. The new report-write test is only one targeted negative slice, not a complete role matrix.
- The existing site-wide contrast gate exposed a low-contrast floating install CTA on `/blog/` and `/courses/`; the branch now gives the CTA an opaque light surface and dark text so the gate can be rerun. This is a QA-blocker fix, not a claim that contrast has passed.
- This branch is based on `main` and is independent of unmerged Phase 4/5 PRs. No merge, production data, public URLs, or deployment settings changed.
