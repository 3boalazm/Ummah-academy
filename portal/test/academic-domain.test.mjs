import assert from 'node:assert/strict';
import { test } from 'node:test';
import { appendAcademicRecord, ensureAcademicCollections, validateAcademicState } from '../src/domain/academic.mjs';
import { IDS, buildSeed } from '../src/domain/seed.mjs';

const NOW = new Date('2026-10-16T10:00:00.000Z');
function fixture() {
  const state = ensureAcademicCollections(buildSeed(NOW));
  const opts = { clock: () => NOW, makeId: (prefix) => `${prefix}_test` };
  return { state, opts };
}
function add(state, collection, record, opts) {
  return appendAcademicRecord(state, collection, record, opts);
}

test('academic collections are distinct from enrollment, subscription and attendance state', () => {
  const { state } = fixture();
  for (const name of ['curricula','curriculumLevels','curriculumUnits','lessons','objectives','placementRubrics','placements','learningGoals','assessmentDefinitions','assessmentAttempts','homeworkAssignments','homeworkSubmissions','progressEvents']) {
    assert.deepEqual(state[name], [], `${name} starts empty; no invented academic history`);
  }
  assert.ok(state.enrollments.length > 0);
  assert.ok(state.sessions.length > 0);
});

test('versioned curriculum hierarchy and objective references validate', () => {
  const { state, opts } = fixture();
  add(state, 'curricula', { id:'cur_quran_v1', program:'Quran & Tajweed', version:1, status:'published', name:'Foundations', nameAr:'التأسيس' }, opts);
  add(state, 'curriculumLevels', { id:'lvl_foundations_v1', curriculumId:'cur_quran_v1', code:'FOUND', name:'Foundations', nameAr:'التأسيس', order:1 }, opts);
  add(state, 'curriculumUnits', { id:'unit_makharij_v1', levelId:'lvl_foundations_v1', name:'Makharij', nameAr:'مخارج الحروف', order:1 }, opts);
  add(state, 'lessons', { id:'lesson_makharij_1', unitId:'unit_makharij_v1', name:'Articulation points', nameAr:'مخارج الحروف', order:1 }, opts);
  add(state, 'objectives', { id:'obj_makharij_1', lessonId:'lesson_makharij_1', name:'Identify articulation points', nameAr:'تمييز مخارج الحروف', order:1 }, opts);
  assert.equal(validateAcademicState(state).ok, true);
  assert.throws(() => add(state, 'curriculumUnits', { id:'unit_bad', levelId:'missing_level', name:'Invalid', nameAr:'غير صالح' }, opts), /Academic record rejected/);
  assert.equal(state.curriculumUnits.some((r) => r.id === 'unit_bad'), false, 'rejected append rolls back');
});

test('placement and assessment records retain rubric version and append-only history', () => {
  const { state, opts } = fixture();
  add(state, 'curricula', { id:'cur_v1', program:'Quran & Tajweed', version:1, status:'published' }, opts);
  add(state, 'curriculumLevels', { id:'lvl_v1', curriculumId:'cur_v1', code:'L1' }, opts);
  add(state, 'lessons', { id:'lesson_v1', unitId: 'unit_v1' }, opts);
  // A curriculum unit is required between level and lesson.
  add(state, 'curriculumUnits', { id:'unit_v1', levelId:'lvl_v1', name:'Unit 1', nameAr:'الوحدة ١' }, opts);
  add(state, 'objectives', { id:'obj_v1', lessonId:'lesson_v1', name:'Objective 1', nameAr:'هدف ١' }, opts);
  add(state, 'placementRubrics', { id:'rubric_v1', version:1, criteria:[{id:'accuracy',max:4}] }, opts);
  add(state, 'placements', { id:'place_1', studentId:IDS.yusuf, courseId:IDS.cTajweed, rubricId:'rubric_v1', assessorId:IDS.tSara, occurredAt:NOW.toISOString(), outcome:'placed', scores:[{criterionId:'accuracy',score:3}], recommendedLevelId:'lvl_v1' }, opts);
  add(state, 'placements', { id:'place_2', studentId:IDS.yusuf, courseId:IDS.cTajweed, rubricId:'rubric_v1', assessorId:IDS.tOmneya, occurredAt:new Date(NOW.getTime()+1000).toISOString(), outcome:'reassess', scores:[{criterionId:'accuracy',score:2}], supersedesId:'place_1' }, opts);
  add(state, 'assessmentDefinitions', { id:'assessment_v1', objectiveId:'obj_v1', rubricVersion:1, scale:[0,1,2,3,4] }, opts);
  add(state, 'assessmentAttempts', { id:'attempt_1', assessmentId:'assessment_v1', studentId:IDS.yusuf, assessorId:IDS.tSara, assessedAt:NOW.toISOString(), rubricVersion:1, score:3 }, opts);
  assert.deepEqual(state.placements.map((p) => p.id), ['place_1','place_2']);
  assert.equal(validateAcademicState(state).ok, true);
});

test('goals and homework require same-student relationships and reject partial writes', () => {
  const { state, opts } = fixture();
  add(state, 'curricula', { id:'cur_v1', program:'Arabic', version:1, status:'published' }, opts);
  add(state, 'curriculumLevels', { id:'lvl_v1', curriculumId:'cur_v1', code:'A1' }, opts);
  add(state, 'curriculumUnits', { id:'unit_v1', levelId:'lvl_v1' }, opts);
  add(state, 'lessons', { id:'lesson_v1', unitId:'unit_v1' }, opts);
  add(state, 'objectives', { id:'obj_v1', lessonId:'lesson_v1' }, opts);
  add(state, 'learningGoals', { id:'goal_1', studentId:IDS.yusuf, objectiveId:'obj_v1', status:'active', createdBy:IDS.tSara, createdAt:NOW.toISOString() }, opts);
  add(state, 'homeworkAssignments', { id:'hw_1', studentId:IDS.yusuf, enrollmentId:IDS.enrYusuf, sessionId:IDS.sesYusufDone, objectiveId:'obj_v1', title:'Practice', createdBy:IDS.tSara, createdAt:NOW.toISOString() }, opts);
  add(state, 'homeworkSubmissions', { id:'submission_1', assignmentId:'hw_1', studentId:IDS.yusuf, attemptNumber:1, status:'submitted', submittedAt:NOW.toISOString() }, opts);
  const before = structuredClone(state.homeworkSubmissions);
  assert.throws(() => add(state, 'homeworkSubmissions', { id:'submission_bad', assignmentId:'hw_1', studentId:IDS.layla, attemptNumber:1, status:'submitted', submittedAt:NOW.toISOString() }, opts), /Academic record rejected/);
  assert.deepEqual(state.homeworkSubmissions, before);
  assert.equal(validateAcademicState(state).ok, true);
});
