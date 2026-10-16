/**
 * Academic domain contract for synthetic portal data.
 *
 * This module deliberately models learning records separately from login,
 * enrollment, subscription and attendance state. It does not decide business
 * policy (rubric scales, visibility, or who may approve a placement); callers
 * must authorize commands before invoking them.
 */
import { E } from './errors.mjs';
import { id as makeId } from './ids.mjs';

export const ACADEMIC_COLLECTIONS = Object.freeze([
  'curricula', 'curriculumLevels', 'curriculumUnits', 'lessons', 'objectives',
  'placementRubrics', 'placements', 'learningGoals', 'assessmentDefinitions',
  'assessmentAttempts', 'homeworkAssignments', 'homeworkSubmissions', 'progressEvents',
]);

export function ensureAcademicCollections(state) {
  for (const name of ACADEMIC_COLLECTIONS) {
    if (state[name] == null) state[name] = [];
    if (!Array.isArray(state[name])) {
      throw E.validation(`Academic collection "${name}" must be an array.`, `مجموعة البيانات الأكاديمية "${name}" يجب أن تكون قائمة.`);
    }
  }
  return state;
}

const find = (state, collection, key) => state[collection].find((row) => row.id === key) ?? null;
const required = (state, collection, key, label) => {
  const row = key ? find(state, collection, key) : null;
  if (!row) throw E.validation(`Invalid or missing ${label} reference.`, `مرجع ${label} غير موجود أو غير صالح.`);
  return row;
};
const fail = (message, ar) => { throw E.validation(message, ar); };

export function validateAcademicState(input) {
  const state = ensureAcademicCollections(input);
  const issues = [];
  const push = (collection, row, message) => issues.push({ collection, id: row?.id ?? null, message });
  for (const collection of ACADEMIC_COLLECTIONS) {
    const seen = new Set();
    for (const row of state[collection]) {
      if (!row?.id) push(collection, row, 'Missing stable id');
      else if (seen.has(row.id)) push(collection, row, 'Duplicate id');
      seen.add(row?.id);
    }
  }
  const check = (collection, row, refCollection, refId, label) => {
    if (!refId || !find(state, refCollection, refId)) push(collection, row, `Missing ${label} reference: ${refId ?? '(empty)'}`);
  };
  for (const row of state.curricula) {
    if (!row.program || !row.version || !['draft', 'published', 'retired'].includes(row.status)) push('curricula', row, 'Invalid program/version/status');
  }
  for (const row of state.curriculumLevels) check('curriculumLevels', row, 'curricula', row.curriculumId, 'curriculum');
  for (const row of state.curriculumUnits) check('curriculumUnits', row, 'curriculumLevels', row.levelId, 'level');
  for (const row of state.lessons) check('lessons', row, 'curriculumUnits', row.unitId, 'unit');
  for (const row of state.objectives) check('objectives', row, 'lessons', row.lessonId, 'lesson');
  for (const row of state.placementRubrics) {
    if (!row.version || !Array.isArray(row.criteria) || !row.criteria.length) push('placementRubrics', row, 'Rubric needs a version and criteria');
  }
  for (const row of state.placements) {
    check('placements', row, 'students', row.studentId, 'student');
    check('placements', row, 'courses', row.courseId, 'course');
    check('placements', row, 'placementRubrics', row.rubricId, 'rubric');
    if (row.recommendedLevelId) check('placements', row, 'curriculumLevels', row.recommendedLevelId, 'recommended level');
    if (!row.assessorId || !row.occurredAt || !row.outcome || !Array.isArray(row.scores)) push('placements', row, 'Placement needs assessor, date, outcome and rubric scores');
    if (row.enrollmentId) {
      check('placements', row, 'enrollments', row.enrollmentId, 'enrollment');
      const student = find(state, 'students', row.studentId);
      const enrollment = find(state, 'enrollments', row.enrollmentId);
      if (student && enrollment && enrollment.studentId !== student.id) push('placements', row, 'Enrollment belongs to another student');
    }
  }
  for (const row of state.learningGoals) {
    check('learningGoals', row, 'students', row.studentId, 'student');
    check('learningGoals', row, 'objectives', row.objectiveId, 'objective');
    if (!row.status || !row.createdAt || !row.createdBy) push('learningGoals', row, 'Goal needs status and creation provenance');
  }
  for (const row of state.assessmentDefinitions) {
    check('assessmentDefinitions', row, 'objectives', row.objectiveId, 'objective');
    if (!row.rubricVersion || !Array.isArray(row.scale) || row.scale.length < 2) push('assessmentDefinitions', row, 'Assessment needs rubric version and explicit scale');
  }
  for (const row of state.assessmentAttempts) {
    check('assessmentAttempts', row, 'assessmentDefinitions', row.assessmentId, 'assessment');
    check('assessmentAttempts', row, 'students', row.studentId, 'student');
    if (!row.assessedAt || !row.assessorId || !row.rubricVersion || row.score == null) push('assessmentAttempts', row, 'Attempt needs score, rubric version, assessor and date');
  }
  for (const row of state.homeworkAssignments) {
    check('homeworkAssignments', row, 'students', row.studentId, 'student');
    if (row.enrollmentId) check('homeworkAssignments', row, 'enrollments', row.enrollmentId, 'enrollment');
    if (row.objectiveId) check('homeworkAssignments', row, 'objectives', row.objectiveId, 'objective');
    if (row.sessionId) check('homeworkAssignments', row, 'sessions', row.sessionId, 'session');
    if (!row.title || !row.createdAt || !row.createdBy) push('homeworkAssignments', row, 'Homework needs title and creation provenance');
    const enrollment = find(state, 'enrollments', row.enrollmentId);
    if (enrollment && enrollment.studentId !== row.studentId) push('homeworkAssignments', row, 'Enrollment belongs to another student');
    const session = find(state, 'sessions', row.sessionId);
    if (session && session.studentId !== row.studentId) push('homeworkAssignments', row, 'Session belongs to another student');
  }
  for (const row of state.homeworkSubmissions) {
    check('homeworkSubmissions', row, 'homeworkAssignments', row.assignmentId, 'homework assignment');
    check('homeworkSubmissions', row, 'students', row.studentId, 'student');
    if (!row.submittedAt || !row.status || !row.attemptNumber || row.attemptNumber < 1) push('homeworkSubmissions', row, 'Submission needs attempt number, status and date');
    const assignment = find(state, 'homeworkAssignments', row.assignmentId);
    if (assignment && assignment.studentId !== row.studentId) push('homeworkSubmissions', row, 'Submission belongs to another student');
  }
  for (const row of state.progressEvents) {
    check('progressEvents', row, 'students', row.studentId, 'student');
    if (!row.sourceType || !row.sourceId || !row.occurredAt || !row.actorId) push('progressEvents', row, 'Progress event needs source and provenance');
  }
  return { ok: issues.length === 0, issues };
}

/**
 * Append one academic record atomically. Callers must perform authorization
 * before calling. Existing rows are never overwritten; correction is a new
 * record/event so historical placement and submission attempts remain intact.
 */
export function appendAcademicRecord(state, collection, input, options = {}) {
  ensureAcademicCollections(state);
  if (!ACADEMIC_COLLECTIONS.includes(collection)) fail('Unknown academic collection.', 'مجموعة أكاديمية غير معروفة.');
  const before = structuredClone(state[collection]);
  const record = {
    ...structuredClone(input),
    id: input.id ?? (options.makeId ?? makeId)(collection.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)),
    createdAt: input.createdAt ?? (options.clock ?? (() => new Date()))().toISOString(),
  };
  if (state[collection].some((row) => row.id === record.id)) fail('Academic record ID already exists.', 'معرّف السجل الأكاديمي مستخدم بالفعل.');
  state[collection].push(record);
  const validation = validateAcademicState(state);
  if (!validation.ok) {
    state[collection] = before;
    fail(`Academic record rejected: ${validation.issues[0].message}`, `تم رفض السجل الأكاديمي: ${validation.issues[0].message}`);
  }
  return structuredClone(record);
}
