import { verifyPassword } from './auth.mjs';
import { issueAssetToken, readAssetToken } from './auth.mjs';
import { E } from './errors.mjs';
import { id } from './ids.mjs';
import { can, currentPrimary, guardianOf, grantedStudentIds } from './permissions.mjs';
import {
  POLICY,
  cycleBalance,
  findFamilyOverlaps,
  findHardConflicts,
  isLateCancel,
  sumBalances,
} from './policy.mjs';
import { IDS, DEMO_PASSWORD, buildSeed } from './seed.mjs';
import { attachOps } from './ops.mjs';
import { attachProfiles } from './profiles.mjs';
import { attachSignup } from './signup.mjs';
import { addMs, localParts } from './time.mjs';
import { appendAcademicRecord, ensureAcademicCollections } from './academic.mjs';

const DEMO_PASSWORDS = new Set(Object.values(DEMO_PASSWORD));

const SECRET_KEY = /password|secret|token|cvv|card|pan/i;
const OPEN = new Set(['scheduled', 'confirmed']);
const ATTENDANCE_STATUSES = new Set(['present', 'late', 'absent', 'excused']);

const WEBSITE_COLLECTIONS = [
  { id: 'articles_en', folder: 'src/content/blog', en: 'Articles · English', ar: 'مقالات · الإنجليزية' },
  { id: 'articles_ar', folder: 'src/content/blog', en: 'Articles · Arabic', ar: 'مقالات · العربية' },
  { id: 'articles_de', folder: 'src/content/blog', en: 'Articles · German', ar: 'مقالات · الألمانية' },
  { id: 'articles_fr', folder: 'src/content/blog', en: 'Articles · French', ar: 'مقالات · الفرنسية' },
  { id: 'articles_it', folder: 'src/content/blog', en: 'Articles · Italian', ar: 'مقالات · الإيطالية' },
  { id: 'faq', folder: 'src/data', en: 'FAQ page', ar: 'صفحة الأسئلة' },
  { id: 'reviews', folder: 'src/data', en: 'Family stories', ar: 'قصص الأسر' },
  { id: 'settings', folder: 'src/data', en: 'Prices / site settings', ar: 'الأسعار وإعدادات الموقع' },
];

const GOVERNANCE_ACTIONS = [
  { action: 'website.publish', portal: false, roles: [], en: 'Sveltia Save → GitHub PR → Vercel preview → merge to main. The portal does not write marketing files.', ar: 'حفظ سفيلتيا → طلب GitHub → معاينة Vercel → دمج في main. البوابة لا تكتب ملفات التسويق.' },
  { action: 'report.approve', portal: true, roles: ['admin', 'ops'], en: 'Approve a submitted lesson report before the family sees it.', ar: 'اعتماد تقرير الحصة قبل أن تراه الأسرة.' },
  { action: 'session.report', portal: true, roles: ['admin', 'ops', 'teacher'], en: 'Teacher submits after attendance and complete. Assigned session only.', ar: 'المعلم يرفع بعد الحضور والإتمام. حصته المسندة فقط.' },
  { action: 'people.admin', portal: true, roles: ['admin', 'ops'], en: 'Users, families, teachers. Not a WordPress user list.', ar: 'المستخدمون والأسر والمعلمون. ليست قائمة مستخدمي ووردبريس.' },
  { action: 'payment.write', portal: true, roles: ['admin', 'ops'], en: 'Manual ledger only. Stripe is not connected.', ar: 'دفتر يدوي فقط. Stripe غير موصول.' },
  { action: 'audit.read', portal: true, roles: ['admin', 'ops'], en: 'Append-only audit. Teachers and families cannot open it.', ar: 'تدقيق يُضاف ولا يُمسح. المعلمون والأسر لا يفتحونه.' },
  { action: 'demo.reset', portal: true, roles: ['admin'], en: 'Demo store reset. Ops cannot.', ar: 'إعادة ضبط العرض. التشغيل لا يستطيع.' },
];

export function createStore(options = {}) {
  const clock = options.now ?? (() => new Date());
  const secret = options.secret ?? 'dev-portal-secret-change-me';
  const onCommit = options.onCommit ?? (() => {});
  let state = structuredClone(options.state ?? buildSeed(clock()));
  ensureAcademicCollections(state);
  state.outbox ??= [];
  for (const g of state.guardians) g.phone ??= null;
  for (const f of state.families) f.phone ??= null;

  function commit() {
    onCommit(state);
  }

  function allow(actor, action, resource) {
    if (!actor) throw E.unauthorized();
    if (!can(actor, action, resource, state)) throw E.forbidden();
  }

  function reportIsApproved(report) {
    return Boolean(report && report.status === 'submitted' && report.reviewStatus === 'approved');
  }

  function reportVisibleTo(actor, report) {
    if (!report) return false;
    if (actor.role === 'admin' || actor.role === 'ops' || actor.role === 'teacher') return true;
    return reportIsApproved(report);
  }

  function admissionStage(student) {
    const sub = state.subscriptions.find((s) => s.studentId === student.id) ?? null;
    const enrollment = state.enrollments.find((e) => e.studentId === student.id && !e.endAt)
      ?? state.enrollments.filter((e) => e.studentId === student.id).at(-1)
      ?? null;
    const sessions = state.sessions.filter((s) => s.studentId === student.id);
    const trialish = student.academicStatus === 'trial' || sub?.status === 'trial' || enrollment?.status === 'trial';
    if (sub?.status === 'active' && student.academicStatus === 'active') return 'paid';
    if (sub?.status === 'paused' || student.academicStatus === 'paused') return 'paid';
    if (trialish) {
      const booked = sessions.some((s) => OPEN.has(s.status));
      const completed = sessions.some((s) => s.status === 'completed');
      if (booked) return 'trial_booked';
      if (completed) return 'trial_completed';
      return 'lead';
    }
    if (!sub) return 'lead';
    return 'paid';
  }

  function admissionCard(student, actor) {
    const sub = state.subscriptions.find((s) => s.studentId === student.id) ?? null;
    const enrollment = state.enrollments.find((e) => e.studentId === student.id) ?? null;
    const follow = state.followUps.filter((f) => f.studentId === student.id && !['resolved', 'closed'].includes(f.status));
    const next = nextSession(student.id, actor);
    return {
      id: student.id,
      name: student.name,
      nameAr: student.nameAr,
      stage: admissionStage(student),
      academicStatus: student.academicStatus,
      subscriptionStatus: sub?.status ?? null,
      enrollmentStatus: enrollment?.status ?? null,
      teacher: teacherBrief(currentPrimary(state, student.id)?.teacherId),
      nextSession: next ? { id: next.id, startsAt: next.startsAt, status: next.status } : null,
      followUps: follow.map((f) => ({ id: f.id, type: f.type, title: f.title, titleAr: f.titleAr, status: f.status, dueAt: f.dueAt, href: `/app/follow-ups/${f.id}` })),
      href: `/app/students/${student.id}`,
    };
  }

  function requireReason(reason) {
    if (!reason || String(reason).trim().length < 3) throw E.reason();
    return String(reason).trim();
  }

  function scrub(value) {
    if (Array.isArray(value)) return value.map(scrub);
    if (value && typeof value === 'object') {
      const out = {};
      for (const [k, v] of Object.entries(value)) {
        if (SECRET_KEY.test(k)) continue;
        out[k] = scrub(v);
      }
      return out;
    }
    return value ?? null;
  }

  function audit(actor, action, entityType, entityId, before, after, reason, requestId = null) {
    const rec = {
      id: id('aud'),
      actorId: actor?.id ?? 'system',
      action,
      entityType,
      entityId,
      occurredAt: clock().toISOString(),
      before: scrub(before),
      after: scrub(after),
      reason: reason ?? null,
      requestId,
    };
    state.audit.push(rec);
    return rec;
  }

  function event(actor, type, fields) {
    state.events.push({
      id: id('evt'),
      type,
      occurredAt: clock().toISOString(),
      actorId: actor?.id ?? 'system',
      studentId: fields.studentId ?? null,
      familyId: fields.familyId ?? null,
      entityType: fields.entityType,
      entityId: fields.entityId,
      summary: fields.summary,
      summaryAr: fields.summaryAr,
    });
  }

  function notify(userId, title, titleAr, body, bodyAr, href) {
    if (!userId) return;
    state.notifications.unshift({
      id: id('ntf'),
      userId,
      title,
      titleAr,
      body,
      bodyAr,
      href,
      read: false,
      createdAt: clock().toISOString(),
    });
  }

  function replay(actor, keyInput) {
    if (!keyInput) return null;
    const key = typeof keyInput === 'object' ? keyInput.key : keyInput;
    const fingerprint = typeof keyInput === 'object' ? keyInput.fingerprint : null;
    if (!key) return null;
    const hit = state.idempotency.find((i) => i.key === key && i.actorId === actor.id);
    if (!hit) return null;
    if (fingerprint && hit.fingerprint && hit.fingerprint !== fingerprint) {
      throw E.badState(
        'This idempotency key was already used with a different request payload.',
        'استُخدم مفتاح منع التكرار هذا سابقًا مع بيانات طلب مختلفة.',
      );
    }
    return structuredClone(hit.result);
  }

  function command(actor, keyInput, fn) {
    const key = keyInput && typeof keyInput === 'object' ? keyInput.key : keyInput;
    const fingerprint = keyInput && typeof keyInput === 'object' ? keyInput.fingerprint : null;
    const hit = replay(actor, keyInput);
    if (hit) return { ...hit, replayed: true };
    const snapshot = structuredClone(state);
    try {
      const result = fn();
      if (key) {
        state.idempotency.push({
          key,
          fingerprint: fingerprint || null,
          actorId: actor.id,
          result: structuredClone(result),
          createdAt: clock().toISOString(),
        });
      }
      commit();
      return result;
    } catch (err) {
      state = snapshot;
      throw err;
    }
  }

  function byId(list, entityId) {
    return list.find((x) => x.id === entityId) ?? null;
  }
  function must(list, entityId) {
    const row = byId(list, entityId);
    if (!row) throw E.notFound();
    return row;
  }

  function publicUser(user) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  function nameOf(row) {
    return row ? { id: row.id, name: row.name, nameAr: row.nameAr } : null;
  }

  function teacherBrief(teacherId) {
    return nameOf(byId(state.teachers, teacherId));
  }

  function studentBrief(studentId) {
    const s = byId(state.students, studentId);
    return s ? { id: s.id, name: s.name, nameAr: s.nameAr, familyId: s.familyId, timezone: s.timezone, academicStatus: s.academicStatus } : null;
  }

  function courseBrief(courseId) {
    const c = byId(state.courses, courseId);
    return c ? { id: c.id, name: c.name, nameAr: c.nameAr, track: c.track } : null;
  }

  function planBrief(planId) {
    const p = state.plans.find((x) => x.id === planId);
    return p ? { id: p.id, name: p.name, nameAr: p.nameAr, minutes: p.minutes, sessionsPerMonth: p.sessionsPerMonth, price: p.price } : null;
  }

  function seesMoney(actor, studentId, familyId) {
    return can(actor, 'payment.read', { type: 'payment', studentId, familyId }, state);
  }

  function isCurrentTeacher(actor, studentId) {
    return actor?.role === 'teacher' && currentPrimary(state, studentId)?.teacherId === actor.teacherId;
  }

  function sessionVisible(actor, session) {
    if (!can(actor, 'session.read', { type: 'session', id: session.id, studentId: session.studentId, teacherId: session.teacherId }, state)) {
      return false;
    }
    if (actor.role === 'teacher' && !isCurrentTeacher(actor, session.studentId) && session.teacherId !== actor.teacherId) return false;
    return true;
  }

  function visibleSessions(actor, rows) {
    return rows.filter((s) => sessionVisible(actor, s));
  }

  function balanceView(studentId) {
    const subs = state.subscriptions.filter((s) => s.studentId === studentId);
    const cycles = state.cycles.filter((c) => subs.some((s) => s.id === c.subscriptionId));
    const sessions = state.sessions.filter((s) => s.studentId === studentId);
    const byCycle = cycles.map((c) => ({
      ...cycleBalance(c, sessions),
      subscriptionId: c.subscriptionId,
      status: c.status,
      planId: c.planId,
      start: c.start,
      end: c.end,
      priceUsd: c.priceUsd,
    }));
    const countable = byCycle.filter((b) => b.status !== 'cancelled');
    return {
      byCycle,
      total: sumBalances(countable),
      allTime: sumBalances(byCycle),
      formulaAr: 'المتبقي = المخصص + التسويات − المنعقد − غياب الطالب − الإلغاء المتأخر. المجدول لا يُخصم، والاشتراك السابق لا يُمسح عند التجديد.',
      formulaEn: 'remaining = allocated + adjustments − delivered − student no-shows − late family cancellations. Scheduled sessions are not subtracted, and renewal does not erase the previous cycle.',
    };
  }

  function stripMoney(balance, allowed) {
    if (allowed || !balance) return balance;
    return {
      ...balance,
      byCycle: balance.byCycle.map(({ priceUsd, ...rest }) => rest),
    };
  }

  function assetMeta(asset) {
    const { storageKey, ...rest } = asset;
    return rest;
  }

  function subscriptionStatusFor(studentId) {
    const subs = state.subscriptions.filter((s) => s.studentId === studentId);
    if (subs.some((s) => s.status === 'active')) return 'active';
    if (subs.some((s) => s.status === 'trial')) return 'trial';
    if (subs.some((s) => s.status === 'paused')) return 'paused';
    if (subs.some((s) => s.status === 'cancelled')) return 'cancelled';
    return 'none';
  }

  function nextSession(studentId, actor) {
    const rows = visibleSessions(actor, state.sessions.filter((s) => s.studentId === studentId && OPEN.has(s.status)));
    return rows.sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0] ?? null;
  }

  function decorateSession(session, actor) {
    const attendance = state.attendance.filter((a) => a.sessionId === session.id);
    const report = state.reports.find((r) => r.sessionId === session.id) ?? null;
    const assets = state.assets.filter((a) => a.sessionId === session.id && a.studentId === session.studentId).map(assetMeta);
    const money = seesMoney(actor, session.studentId, session.familyId);
    return {
      ...session,
      student: studentBrief(session.studentId),
      teacher: teacherBrief(session.teacherId),
      substituteForTeacher: session.substituteFor ? teacherBrief(session.substituteFor) : null,
      course: courseBrief(session.courseId),
      attendance,
      report: report && reportVisibleTo(actor, report) ? { ...report } : null,
      assets,
      pendingReport: session.status === 'completed' && (!report || report.status !== 'submitted'),
      pendingReview: Boolean(report && report.status === 'submitted' && report.reviewStatus !== 'approved'),
      homeworkAssignment: (state.homeworkAssignments || []).find((h) => h.sessionId === session.id) ?? null,
      actions: {
        confirm: OPEN.has(session.status) && can(actor, 'session.write', session, state),
        attend: can(actor, 'session.write', session, state) && session.status !== 'cancelled' && session.status !== 'rescheduled',
        complete: OPEN.has(session.status) && can(actor, 'session.write', session, state),
        report: session.status === 'completed' && can(actor, 'session.report', session, state),
        approveReport: Boolean(report && report.status === 'submitted' && report.reviewStatus !== 'approved' && can(actor, 'report.approve', session, state)),
        cancel: OPEN.has(session.status) && can(actor, 'session.cancel', session, state),
        reschedule: OPEN.has(session.status) && can(actor, 'session.create', null, state),
        substitute: OPEN.has(session.status) && can(actor, 'teacher.assign', null, state),
        room: OPEN.has(session.status),
      },
      revealsMoney: money,
    };
  }

  function dayStamp(instant, timeZone) {
    const parts = localParts(new Date(instant), timeZone);
    return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
  }

  function currentAssignmentsFor(teacherId) {
    return state.assignments.filter((a) => a.teacherId === teacherId && !a.endAt);
  }

  function homeworkDto(row) {
    const submissions = (state.homeworkSubmissions || []).filter((s) => s.assignmentId === row.id);
    return {
      ...row,
      submissions,
      open: !submissions.some((s) => s.status === 'submitted' || s.status === 'reviewed'),
    };
  }

  function homeworkForStudent(studentId) {
    return (state.homeworkAssignments || [])
      .filter((h) => h.studentId === studentId)
      .map(homeworkDto)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function attachHomeworkFromReport(actor, session, report) {
    const text = String(report.homework || '').trim();
    if (!text) return null;
    allow(actor, 'homework.write', {
      type: 'homework',
      studentId: session.studentId,
      sessionId: session.id,
      teacherId: session.teacherId,
    });
    const existing = (state.homeworkAssignments || []).find((h) => h.sessionId === session.id);
    if (existing) return structuredClone(existing);
    const record = appendAcademicRecord(state, 'homeworkAssignments', {
      id: id('hw'),
      studentId: session.studentId,
      enrollmentId: session.enrollmentId ?? null,
      sessionId: session.id,
      title: text.slice(0, 120),
      titleAr: String(report.homeworkAr || text).slice(0, 120),
      instructions: text,
      instructionsAr: report.homeworkAr || text,
      dueAt: addMs(clock().toISOString(), 7 * 86400000),
      status: 'assigned',
      createdBy: actor.id,
    }, { clock, makeId: id });
    appendAcademicRecord(state, 'progressEvents', {
      id: id('pev'),
      studentId: session.studentId,
      sourceType: 'homework',
      sourceId: record.id,
      occurredAt: clock().toISOString(),
      actorId: actor.id,
      kind: 'homework_assigned',
      summary: text.slice(0, 120),
    }, { clock, makeId: id });
    return record;
  }

  function rosterRow(actor, assignment) {
    const student = must(state.students, assignment.studentId);
    const sessions = visibleSessions(actor, state.sessions.filter((s) => s.studentId === student.id))
      .slice()
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    const lastHeld = sessions.find((s) => s.status === 'completed' || s.status === 'no_show') ?? null;
    const next = nextSession(student.id, actor);
    const homework = homeworkForStudent(student.id);
    const lastReport = lastHeld
      ? state.reports.find((r) => r.sessionId === lastHeld.id) ?? null
      : sessions.map((s) => state.reports.find((r) => r.sessionId === s.id)).find(Boolean) ?? null;
    return {
      student: studentBrief(student.id),
      assignment: {
        id: assignment.id,
        kind: assignment.kind,
        startAt: assignment.startAt,
        enrollmentId: assignment.enrollmentId,
      },
      isPrimary: assignment.kind === 'primary',
      nextSession: next ? decorateSession(next, actor) : null,
      lastHeld: lastHeld ? decorateSession(lastHeld, actor) : null,
      lastReport: lastReport ? { ...lastReport } : null,
      homework,
      openHomework: homework.filter((h) => h.open).length,
    };
  }

  function teacherDay(actor, filters = {}) {
    if (actor.role === 'guardian' || actor.role === 'student') throw E.forbidden();
    const requested = filters.teacherId || null;
    if (actor.role === 'teacher') {
      if (requested && requested !== actor.teacherId) throw E.forbidden();
    }
    if ((actor.role === 'admin' || actor.role === 'ops') && !requested) {
      allow(actor, 'teacher.day', { type: 'teacher' });
      return {
        picker: true,
        role: actor.role,
        teachers: state.teachers.map((teacher) => {
          const day = teacherDayFor(actor, teacher.id);
          return {
            ...teacherBrief(teacher.id),
            timezone: teacher.timezone,
            today: day.today.length,
            pendingReports: day.pendingReports.length,
            students: day.roster.length,
          };
        }),
      };
    }
    const teacherId = actor.role === 'teacher' ? actor.teacherId : requested;
    const teacher = must(state.teachers, teacherId);
    allow(actor, 'teacher.day', { type: 'teacher', id: teacher.id });
    return teacherDayFor(actor, teacher.id);
  }

  function teacherDayFor(actor, teacherId) {
    const teacher = must(state.teachers, teacherId);
    const zone = teacher.timezone || actor.timezone || 'UTC';
    const todayKey = dayStamp(clock(), zone);
    const mine = state.sessions.filter((s) => s.teacherId === teacherId);
    const today = mine
      .filter((s) => dayStamp(s.startsAt, zone) === todayKey)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .map((s) => decorateSession(s, actor));
    const pendingReports = mine
      .filter((s) => s.status === 'completed' && !state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted'))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
      .map((s) => decorateSession(s, actor));
    const roster = currentAssignmentsFor(teacherId)
      .map((a) => rosterRow(actor, a))
      .sort((a, b) => String(a.student.name).localeCompare(String(b.student.name)));
    return {
      picker: false,
      role: actor.role,
      teacher: { ...teacherBrief(teacher.id), timezone: zone, specialty: teacher.specialty, specialtyAr: teacher.specialtyAr },
      date: todayKey,
      timezone: zone,
      today,
      pendingReports,
      roster,
      counts: {
        today: today.length,
        pendingReports: pendingReports.length,
        students: roster.length,
        openHomework: roster.reduce((sum, row) => sum + row.openHomework, 0),
      },
      noteEn: 'Attendance, then complete, then a report with homework. Scheduled is not delivered.',
      noteAr: 'حضور ثم إتمام ثم تقرير مع واجب. المجدول ليس هو المنعقد.',
    };
  }

  function compactSession(session, actor) {
    const d = decorateSession(session, actor);
    const latest = d.attendance?.at(-1) ?? null;
    return {
      id: d.id,
      startsAt: d.startsAt,
      endsAt: d.endsAt,
      status: d.status,
      durationMin: d.durationMin,
      student: d.student,
      teacher: d.teacher,
      course: d.course,
      timezone: d.student?.timezone ?? null,
      attendance: latest ? latest.status : null,
      pendingReport: d.pendingReport,
      report: d.report
        ? {
          summary: d.report.summary,
          summaryAr: d.report.summaryAr,
          homework: d.report.homework,
          homeworkAr: d.report.homeworkAr,
          nextStep: d.report.nextStep,
          nextStepAr: d.report.nextStepAr,
          submittedAt: d.report.submittedAt,
        }
        : null,
    };
  }

  function progressCard(actor, student) {
    allow(actor, 'student.read', { type: 'student', id: student.id, studentId: student.id, familyId: student.familyId });
    const money = seesMoney(actor, student.id, student.familyId);
    const nowIso = clock().toISOString();
    const rows = visibleSessions(actor, state.sessions.filter((s) => s.studentId === student.id))
      .slice()
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    const upcoming = rows
      .filter((s) => OPEN.has(s.status) && s.startsAt >= nowIso)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 3)
      .map((s) => compactSession(s, actor));
    const lastHeldRow = rows.find((s) => s.status === 'completed' || s.status === 'no_show') ?? null;
    const lastHeld = lastHeldRow ? compactSession(lastHeldRow, actor) : null;
    const lastReportRow = rows.find((s) => state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted' && reportVisibleTo(actor, r))) ?? null;
    const lastReport = lastReportRow ? compactSession(lastReportRow, actor).report : null;
    const reports = rows
      .map((s) => {
        const report = state.reports.find((r) => r.sessionId === s.id && r.status === 'submitted' && reportVisibleTo(actor, r));
        return report ? { sessionId: s.id, startsAt: s.startsAt, ...compactSession(s, actor).report } : null;
      })
      .filter(Boolean)
      .slice(0, 3);
    const homework = homeworkForStudent(student.id)
      .filter((h) => h.open)
      .map((h) => ({
        id: h.id,
        title: h.title,
        titleAr: h.titleAr,
        instructions: h.instructions,
        instructionsAr: h.instructionsAr,
        dueAt: h.dueAt,
        sessionId: h.sessionId ?? null,
        open: true,
      }));
    const balance = stripMoney(balanceView(student.id), money);
    const primary = currentPrimary(state, student.id);
    const followUps = state.followUps
      .filter((f) => f.studentId === student.id && followVisible(actor, f) && !['resolved', 'closed'].includes(f.status))
      .map((f) => ({
        id: f.id,
        title: f.title,
        titleAr: f.titleAr,
        status: f.status,
        dueAt: f.dueAt,
        visibility: f.visibility,
      }))
      .slice(0, 3);
    const recordings = state.assets.filter((a) => a.studentId === student.id && a.status === 'ready' && can(actor, 'asset.read', { type: 'asset', id: a.id, studentId: a.studentId }, state)).length;
    return {
      student: {
        ...studentBrief(student.id),
        level: student.level,
        goals: student.goals,
      },
      axes: {
        academicStatus: student.academicStatus,
        subscriptionStatus: subscriptionStatusFor(student.id),
        loginEnabled: student.loginEnabled,
      },
      teacher: teacherBrief(primary?.teacherId),
      nextSession: upcoming[0] ?? null,
      upcoming,
      lastHeld,
      lastReport,
      reports,
      homework,
      credits: {
        remaining: balance.total.remaining,
        delivered: balance.total.delivered,
        scheduledNotHeld: balance.total.scheduledNotHeld,
        allocated: balance.total.allocated,
      },
      moneyVisible: money,
      openFollowUps: followUps,
      recordings,
    };
  }

  function progressHub(actor, filters = {}) {
    if (actor.role === 'teacher') throw E.forbidden();
    allow(actor, 'student.list', null);
    let students;
    if (actor.role === 'student') {
      students = [must(state.students, actor.studentId)];
    } else if (actor.role === 'guardian') {
      if (filters.familyId && filters.familyId !== actor.familyId) throw E.forbidden();
      if (filters.studentId && !grantedStudentIds(state, actor).has(filters.studentId)) throw E.forbidden();
      const granted = grantedStudentIds(state, actor);
      students = state.students.filter((s) => granted.has(s.id));
      if (filters.studentId) students = students.filter((s) => s.id === filters.studentId);
    } else {
      if (filters.studentId) {
        students = [must(state.students, filters.studentId)];
      } else if (filters.familyId) {
        students = state.students.filter((s) => s.familyId === filters.familyId);
      } else {
        throw E.validation('Choose a family or a student.', 'اختر أسرة أو طالبًا.');
      }
    }
    const cards = students
      .map((s) => progressCard(actor, s))
      .sort((a, b) => String(a.student.name).localeCompare(String(b.student.name)));
    const familyId = actor.familyId || students[0]?.familyId || null;
    const family = familyId ? byId(state.families, familyId) : null;
    const upcoming = cards
      .flatMap((c) => c.upcoming.map((s) => ({ ...s, student: c.student })))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 6);
    const recentReports = cards
      .flatMap((c) => (c.reports || []).map((r) => ({ ...r, student: c.student })))
      .sort((a, b) => String(b.startsAt).localeCompare(String(a.startsAt)))
      .slice(0, 4);
    const openSessions = visibleSessions(actor, state.sessions.filter((s) => students.some((st) => st.id === s.studentId)));
    return {
      role: actor.role,
      family: family ? { id: family.id, name: family.name, nameAr: family.nameAr, timezone: family.timezone, city: family.city } : null,
      children: cards,
      upcoming,
      recentReports,
      overlaps: findFamilyOverlaps(openSessions),
      counts: {
        children: cards.length,
        upcoming: upcoming.length,
        openHomework: cards.reduce((sum, c) => sum + c.homework.length, 0),
        remaining: cards.reduce((sum, c) => sum + (c.credits.remaining || 0), 0),
      },
      noteEn: 'Next lesson, last report, homework and remaining credits. Invoices stay off this screen.',
      noteAr: 'الحصة الجاية، آخر تقرير، الواجب، والرصيد المتبقي. الفواتير ليست هنا.',
    };
  }

  function followVisible(actor, row) {
    return can(actor, 'followup.read', { ...row, type: row.type, visibility: row.visibility }, state);
  }

  function studentDto(actor, student) {
    allow(actor, 'student.read', { type: 'student', id: student.id, studentId: student.id, familyId: student.familyId });
    const money = seesMoney(actor, student.id, student.familyId);
    const family = byId(state.families, student.familyId);
    const guardians = state.guardians
      .filter((g) => g.studentIds.includes(student.id))
      .map((g) => {
        const base = {
          id: g.id,
          name: g.name,
          nameAr: g.nameAr,
          relation: g.relation,
          verified: g.verified,
        };
        if (actor.role === 'admin' || actor.role === 'ops') {
          return { ...g, user: publicUser(byId(state.users, g.userId)) };
        }
        return base;
      });
    const enrollments = state.enrollments
      .filter((e) => e.studentId === student.id)
      .map((e) => ({ ...e, course: courseBrief(e.courseId), teacher: teacherBrief(e.teacherId) }));
    const assignments = state.assignments
      .filter((a) => a.studentId === student.id)
      .map((a) => ({ ...a, teacher: teacherBrief(a.teacherId) }))
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
    const sessions = visibleSessions(actor, state.sessions.filter((s) => s.studentId === student.id))
      .map((s) => decorateSession(s, actor))
      .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    const balance = stripMoney(balanceView(student.id), money);
    const subscriptions = state.subscriptions
      .filter((s) => s.studentId === student.id)
      .map((s) => subscriptionDto(actor, s, money));
    const payments = money
      ? state.payments.filter((p) => p.subscriptionId && subscriptions.some((s) => s.id === p.subscriptionId))
      : null;
    const followUps = state.followUps.filter((f) => f.studentId === student.id && followVisible(actor, f)).map((f) => followDto(f));
    const assets = state.assets
      .filter((a) => a.studentId === student.id && can(actor, 'asset.read', { type: 'asset', id: a.id, studentId: a.studentId }, state))
      .map(assetMeta);
    const timeline = state.events
      .filter((e) => e.studentId === student.id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const auditRows =
      can(actor, 'audit.read', { type: 'audit' }, state)
        ? state.audit.filter((a) => a.entityId === student.id || sessions.some((s) => s.id === a.entityId) || subscriptions.some((s) => s.id === a.entityId) || enrollments.some((e) => e.id === a.entityId))
        : null;
    const primary = currentPrimary(state, student.id);
    const next = nextSession(student.id, actor);
    const nextFollow = followUps
      .filter((f) => ['open', 'in_progress', 'waiting'].includes(f.status))
      .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))[0] ?? null;
    return {
      student: { ...student },
      axes: {
        academicStatus: student.academicStatus,
        subscriptionStatus: subscriptionStatusFor(student.id),
        loginEnabled: student.loginEnabled,
      },
      family: family
        ? { id: family.id, name: family.name, nameAr: family.nameAr, status: family.status, timezone: family.timezone, city: family.city, country: family.country }
        : null,
      guardians,
      enrollments,
      assignments,
      sessions,
      homework: homeworkForStudent(student.id),
      progress: {
        level: student.level,
        goals: student.goals,
        strengths: student.strengths,
        improvements: student.improvements,
        reports: sessions.map((s) => s.report).filter(Boolean),
      },
      subscriptions,
      payments,
      balance,
      followUps,
      assets,
      timeline,
      audit: auditRows,
      primaryTeacher: primary ? teacherBrief(primary.teacherId) : null,
      nextSession: next ? decorateSession(next, actor) : null,
      nextFollowUp: nextFollow,
      moneyVisible: money,
    };
  }

  function subscriptionDto(actor, sub, money = seesMoney(actor, sub.studentId, sub.familyId)) {
    allow(actor, 'subscription.read', { type: 'subscription', id: sub.id, studentId: sub.studentId, familyId: sub.familyId });
    const cycles = state.cycles
      .filter((c) => c.subscriptionId === sub.id)
      .map((c) => {
        const bal = cycleBalance(c, state.sessions.filter((s) => s.studentId === sub.studentId));
        const row = { ...c, balance: bal };
        if (!money) delete row.priceUsd;
        return row;
      })
      .sort((a, b) => a.start.localeCompare(b.start));
    const plan = planBrief(sub.planId);
    const payments = money ? state.payments.filter((p) => p.subscriptionId === sub.id) : null;
    const latest = payments?.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
    return {
      ...sub,
      plan: money ? plan : plan ? { ...plan, price: null } : null,
      cycles,
      payments,
      paymentStatus: latest?.status ?? null,
      hasFailedPayment: Boolean(payments?.some((p) => p.status === 'failed')),
      student: studentBrief(sub.studentId),
      course: courseBrief(sub.courseId),
    };
  }

  function followDto(row) {
    const attempts = state.attempts.filter((a) => a.followUpId === row.id).sort((a, b) => a.at.localeCompare(b.at));
    return {
      ...row,
      attempts,
      assignee: publicUser(byId(state.users, row.assigneeId)),
      student: row.studentId ? studentBrief(row.studentId) : null,
      overdue: ['open', 'in_progress', 'waiting'].includes(row.status) && row.dueAt && row.dueAt < clock().toISOString(),
    };
  }

  function familyDto(actor, family) {
    allow(actor, 'family.read', { type: 'family', id: family.id, familyId: family.id });
    const g = actor.role === 'guardian' ? guardianOf(state, actor) : null;
    const children = state.students.filter((s) => {
      if (s.familyId !== family.id) return false;
      if (actor.role === 'guardian') return g.studentIds.includes(s.id);
      if (actor.role === 'student') return s.id === actor.studentId;
      return true;
    });
    const childIds = new Set(children.map((c) => c.id));
    const sessions = state.sessions
      .filter((s) => childIds.has(s.studentId))
      .filter((s) => sessionVisible(actor, s))
      .map((s) => decorateSession(s, actor))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    const money = actor.role === 'guardian' ? Boolean(g?.canViewBilling) : seesMoney(actor, children[0]?.id, family.id);
    const subscriptions = state.subscriptions
      .filter((s) => childIds.has(s.studentId))
      .map((s) => subscriptionDto(actor, s, money));
    const payments = money ? state.payments.filter((p) => p.familyId === family.id && subscriptions.some((s) => s.id === p.subscriptionId)) : null;
    const followUps = state.followUps
      .filter((f) => f.familyId === family.id && followVisible(actor, f) && (!f.studentId || childIds.has(f.studentId)))
      .map(followDto);
    const overlaps = findFamilyOverlaps(sessions);
    return {
      family,
      myGuardian: g ? {
        id: g.id,
        whatsappConsent: g.whatsappConsent || 'unknown',
        consentSource: g.consentSource || null,
        consentAt: g.consentAt || null,
      } : null,
      guardians: state.guardians
        .filter((x) => x.familyId === family.id)
        .filter((x) => actor.role !== 'guardian' || x.id === g.id || x.studentIds.some((id) => childIds.has(id)))
        .map((x) => ({
          id: x.id,
          name: x.name,
          nameAr: x.nameAr,
          relation: x.relation,
          verified: x.verified,
          phone: actor.role === 'admin' || actor.role === 'ops' || x.userId === actor.id ? x.phone || null : undefined,
          studentIds: x.studentIds.filter((id) => childIds.has(id) || actor.role === 'admin' || actor.role === 'ops'),
          canViewBilling: actor.role === 'admin' || actor.role === 'ops' ? x.canViewBilling : undefined,
          canViewRecordings: actor.role === 'admin' || actor.role === 'ops' ? x.canViewRecordings : undefined,
        })),
      children: children.map((c) => ({
        ...c,
        primaryTeacher: teacherBrief(currentPrimary(state, c.id)?.teacherId),
        axes: { academicStatus: c.academicStatus, subscriptionStatus: subscriptionStatusFor(c.id), loginEnabled: c.loginEnabled },
        nextSession: (() => {
          const n = nextSession(c.id, actor);
          return n ? { id: n.id, startsAt: n.startsAt, teacher: teacherBrief(n.teacherId), course: courseBrief(n.courseId) } : null;
        })(),
        balance: stripMoney(balanceView(c.id), money)?.total ?? null,
      })),
      sessions,
      overlaps,
      subscriptions,
      payments,
      followUps,
      timeline: state.events.filter((e) => e.familyId === family.id && (!e.studentId || childIds.has(e.studentId))).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
      moneyVisible: money,
    };
  }

  function listStudents(actor, filters = {}) {
    allow(actor, 'student.list', null);
    return state.students
      .filter((s) => can(actor, 'student.read', { type: 'student', id: s.id, studentId: s.id, familyId: s.familyId }, state))
      .filter((s) => !filters.status || s.academicStatus === filters.status)
      .filter((s) => !filters.q || `${s.name} ${s.nameAr} ${s.id}`.toLowerCase().includes(String(filters.q).toLowerCase()))
      .map((s) => ({
        ...s,
        family: nameOf(byId(state.families, s.familyId)),
        primaryTeacher: teacherBrief(currentPrimary(state, s.id)?.teacherId),
        axes: { academicStatus: s.academicStatus, subscriptionStatus: subscriptionStatusFor(s.id), loginEnabled: s.loginEnabled },
        nextSession: (() => {
          const n = nextSession(s.id, actor);
          return n ? { id: n.id, startsAt: n.startsAt } : null;
        })(),
      }));
  }

  function dashboard(actor) {
    allow(actor, 'dashboard.read', null);
    const nowIso = clock().toISOString();
    const in24 = new Date(clock().getTime() + 24 * 3600 * 1000).toISOString();
    const in14 = new Date(clock().getTime() + 14 * 86400000).toISOString();
    if (actor.role === 'teacher') return teacherDashboard(actor, nowIso, in24);
    if (actor.role === 'guardian') return guardianDashboard(actor, nowIso);
    if (actor.role === 'student') return studentDashboard(actor, nowIso);
    const students = listStudents(actor);
    const sessions = state.sessions;
    const pending = sessions.filter((s) => s.status === 'completed' && !state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted'));
    const pendingReviewRows = state.reports.filter((r) => r.status === 'submitted' && r.reviewStatus !== 'approved');
    const upcoming = sessions.filter((s) => OPEN.has(s.status) && s.startsAt >= nowIso && s.startsAt <= in24);
    const overdue = state.followUps.filter((f) => ['open', 'in_progress', 'waiting'].includes(f.status) && f.dueAt && f.dueAt < nowIso);
    const renewals = state.cycles.filter((c) => c.status === 'active' && c.end >= nowIso && c.end <= in14);
    const trials = students.filter((s) => s.academicStatus === 'trial');
    const active = students.filter((s) => s.academicStatus === 'active');
    const failedPays = state.payments.filter((p) => p.status === 'failed');
    const overlaps = findFamilyOverlaps(sessions.filter((s) => OPEN.has(s.status)));
    const metric = (id, value, href, rows) => ({ id, value, href, ids: rows.map((r) => r.id) });
    return {
      role: actor.role,
      metrics: [
        metric('active_students', active.length, '/app/students?status=active', active),
        metric('trials', trials.length, '/app/admissions', trials),
        metric('upcoming_sessions', upcoming.length, '/app/schedule?window=24h', upcoming),
        metric('pending_reports', pending.length, '/app/schedule?pendingReport=1', pending),
        metric('pending_review', pendingReviewRows.length, '/app?queue=review', pendingReviewRows),
        metric('overdue_followups', overdue.length, '/app/follow-ups?overdue=1', overdue),
        metric('renewals_14d', renewals.length, '/app/subscriptions?renewing=14', renewals),
        metric('failed_payments', failedPays.length, '/app/subscriptions?payment=failed', failedPays),
      ],
      queues: {
        pendingReports: pending.slice(0, 8).map((s) => decorateSession(s, actor)),
        pendingReview: pendingReviewRows.slice(0, 8).map((r) => {
          const session = byId(state.sessions, r.sessionId);
          return session ? decorateSession(session, actor) : null;
        }).filter(Boolean),
        overdueFollowUps: overdue.slice(0, 8).map(followDto),
        upcoming: upcoming.slice(0, 8).map((s) => decorateSession(s, actor)),
        renewals: renewals.slice(0, 8).map((c) => ({ id: c.id, subscriptionId: c.subscriptionId, end: c.end, planId: c.planId })),
        conflicts: overlaps.slice(0, 8),
      },
      notifications: state.notifications.filter((n) => n.userId === actor.id).slice(0, 8),
    };
  }

  function teacherDashboard(actor, nowIso, in24) {
    const mine = state.sessions.filter((s) => s.teacherId === actor.teacherId);
    const today = mine.filter((s) => OPEN.has(s.status) && s.startsAt >= new Date(clock().getTime() - 6 * 3600000).toISOString() && s.startsAt <= in24);
    const students = listStudents(actor).filter((s) => isCurrentTeacher(actor, s.id) || state.assignments.some((a) => a.teacherId === actor.teacherId && a.studentId === s.id && !a.endAt));
    const pending = mine.filter((s) => s.status === 'completed' && !state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted'));
    const weekAgo = new Date(clock().getTime() - 7 * 86400000).toISOString();
    const completedWeek = mine.filter((s) => s.status === 'completed' && s.startsAt >= weekAgo);
    const marked = state.attendance.filter((a) => mine.some((s) => s.id === a.sessionId) && a.markedAt >= weekAgo);
    const present = marked.filter((a) => a.status === 'present' || a.status === 'late').length;
    const hours = completedWeek.reduce((sum, s) => sum + s.durationMin, 0) / 60;
    return {
      role: 'teacher',
      metrics: [
        { id: 'today', value: today.length, href: '/app/today', ids: today.map((s) => s.id) },
        { id: 'students', value: students.length, href: '/app/today', ids: students.map((s) => s.id) },
        { id: 'pending_reports', value: pending.length, href: '/app/today?queue=reports', ids: pending.map((s) => s.id) },
        { id: 'completed_week', value: completedWeek.length, href: '/app/schedule?status=completed', ids: completedWeek.map((s) => s.id) },
      ],
      teaching: {
        scheduled: mine.filter((s) => OPEN.has(s.status)).length,
        completedThisWeek: completedWeek.length,
        hoursThisWeek: Math.round(hours * 10) / 10,
        attendanceRate: marked.length ? Math.round((present / marked.length) * 100) : null,
        pendingReports: pending.length,
        noteEn: 'Scheduled and completed are counted separately.',
        noteAr: 'المجدول والمكتمل يُحسبان منفصلين.',
      },
      queues: {
        today: today.map((s) => decorateSession(s, actor)),
        pendingReports: pending.map((s) => decorateSession(s, actor)),
      },
      notifications: state.notifications.filter((n) => n.userId === actor.id).slice(0, 8),
    };
  }

  function guardianDashboard(actor) {
    const family = byId(state.families, actor.familyId);
    const hub = familyDto(actor, family);
    const unreadReports = hub.sessions.filter((s) => s.report && s.startsAt > new Date(clock().getTime() - 7 * 86400000).toISOString());
    return {
      role: 'guardian',
      family: hub.family,
      children: hub.children,
      overlaps: hub.overlaps,
      moneyVisible: hub.moneyVisible,
      metrics: [
        { id: 'children', value: hub.children.length, href: '/app/home', ids: hub.children.map((c) => c.id) },
        { id: 'upcoming', value: hub.sessions.filter((s) => OPEN.has(s.status) && s.startsAt >= clock().toISOString()).length, href: '/app/home', ids: [] },
        { id: 'recent_reports', value: unreadReports.length, href: '/app/home', ids: unreadReports.map((s) => s.id) },
        { id: 'open_followups', value: hub.followUps.filter((f) => !['resolved', 'closed'].includes(f.status)).length, href: '/app/home', ids: [] },
      ],
      next: hub.sessions.find((s) => OPEN.has(s.status) && s.startsAt >= clock().toISOString()) ?? null,
      notifications: state.notifications.filter((n) => n.userId === actor.id).slice(0, 8),
    };
  }

  function studentDashboard(actor) {
    const dto = studentDto(actor, must(state.students, actor.studentId));
    return {
      role: 'student',
      student: dto.student,
      axes: dto.axes,
      nextSession: dto.nextSession,
      balance: dto.balance.total,
      homework: (dto.homework?.length
        ? dto.homework.slice(0, 5).map((h) => ({
          id: h.id,
          homework: h.instructions || h.title,
          homeworkAr: h.instructionsAr || h.titleAr,
          dueAt: h.dueAt,
        }))
        : dto.progress.reports.filter((r) => r.homework).slice(0, 3)),
      metrics: [
        { id: 'remaining', value: dto.balance.total.remaining, href: '/app/me?tab=subscriptions', ids: [] },
        { id: 'delivered', value: dto.balance.total.delivered, href: '/app/me?tab=sessions', ids: [] },
      ],
      notifications: state.notifications.filter((n) => n.userId === actor.id).slice(0, 8),
    };
  }

  function assertOpen(session) {
    if (!OPEN.has(session.status)) {
      throw E.badState(`Session is ${session.status}.`, `الحصة في حالة «${session.status}» ولا تقبل هذا الإجراء.`);
    }
  }

  function activeCycle(studentId) {
    const subs = state.subscriptions.filter((s) => s.studentId === studentId);
    const cycles = state.cycles.filter((c) => subs.some((s) => s.id === c.subscriptionId));
    return cycles.find((c) => c.status === 'active') ?? cycles.find((c) => c.status === 'frozen') ?? null;
  }

  function assertSchedulable(studentId) {
    const sub = state.subscriptions.find((s) => s.studentId === studentId && (s.status === 'active' || s.status === 'trial'));
    if (!sub) {
      const paused = state.subscriptions.find((s) => s.studentId === studentId && s.status === 'paused');
      if (paused) throw E.frozen();
      throw E.badState('No active subscription.', 'لا يوجد اشتراك سارٍ.');
    }
    const frozen = state.cycles.find((c) => c.subscriptionId === sub.id && c.status === 'frozen');
    if (frozen) throw E.frozen();
    return sub;
  }

  function assertNoConflict(candidate, ignoreIds = []) {
    const hits = findHardConflicts(
      state.sessions.filter((s) => !ignoreIds.includes(s.id)),
      candidate,
    );
    if (hits.length) throw E.conflict({ conflicts: hits });
  }

  /** The person new leads and family requests go to: the demo ops user if present, else any active ops, else any active admin. */
  function defaultAssignee(fallbackActor = null) {
    const active = (u) => u && u.status === 'active';
    const demoOps = byId(state.users, IDS.ops);
    if (active(demoOps)) return demoOps.id;
    const staff = state.users.find((u) => u.role === 'ops' && active(u)) ?? state.users.find((u) => u.role === 'admin' && active(u));
    return staff?.id ?? fallbackActor?.id ?? null;
  }

  const api = {
    demo: !options.production,
    secret,
    publicUser,
    actorById(userId) {
      return publicUser(byId(state.users, userId));
    },
    snapshot() {
      return structuredClone(state);
    },

    login(email, password) {
      const user = state.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
      if (options.production && DEMO_PASSWORDS.has(String(password || ''))) {
        audit(user, 'auth.login_failed', 'user', user?.id ?? 'unknown', null, { email: String(email || ''), ok: false, reason: 'demo_password_blocked' }, null);
        commit();
        throw E.credentials();
      }
      const ok = Boolean(user && user.status === 'active' && verifyPassword(password, user.passwordHash));
      audit(
        user,
        ok ? 'auth.login' : 'auth.login_failed',
        'user',
        user?.id ?? 'unknown',
        null,
        { email: String(email || ''), ok },
        null,
      );
      commit();
      if (!ok) throw E.credentials();
      return publicUser(user);
    },

    dashboard,
    consoleBoard(actor, view = 'workspace') {
      if (actor.role !== 'admin' && actor.role !== 'ops') throw E.forbidden();
      allow(actor, 'dashboard.read', null);
      if (view === 'workspace') {
        const dash = dashboard(actor);
        const health = this.integrity(actor);
        const weekAgo = new Date(clock().getTime() - 7 * 86400000).toISOString();
        const subs = state.subscriptions;
        return {
          view: 'workspace',
          role: actor.role,
          glance: {
            students: state.students.length,
            families: state.families.length,
            teachers: state.teachers.length,
            sessionsOpen: state.sessions.filter((s) => OPEN.has(s.status)).length,
            pendingReports: dash.metrics.find((m) => m.id === 'pending_reports')?.value ?? 0,
            pendingReview: dash.metrics.find((m) => m.id === 'pending_review')?.value ?? 0,
            trials: dash.metrics.find((m) => m.id === 'trials')?.value ?? 0,
            overdueFollowUps: dash.metrics.find((m) => m.id === 'overdue_followups')?.value ?? 0,
            renewals: dash.metrics.find((m) => m.id === 'renewals_14d')?.value ?? 0,
          },
          memberships: {
            active: subs.filter((s) => s.status === 'active').length,
            trial: subs.filter((s) => s.status === 'trial').length,
            paused: subs.filter((s) => s.status === 'paused').length,
            failedPayments: state.payments.filter((p) => p.status === 'failed').length,
            noteEn: 'Counts of agreements. Stripe is not connected; these are ledger rows.',
            noteAr: 'عدّادات الاتفاقات. Stripe غير موصول؛ هذه سطور دفتر.',
          },
          health: { ok: health.ok, issues: health.issues.length, href: '/app/health' },
          activity: state.events.slice().sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, 10).map((e) => ({
            id: e.id,
            occurredAt: e.occurredAt,
            type: e.type,
            summary: e.summary,
            summaryAr: e.summaryAr,
            href: e.entityType === 'session' ? `/app/sessions/${e.entityId}` : e.entityType === 'student' ? `/app/students/${e.entityId}` : '/app',
          })),
          notices: [
            { id: 'store', level: 'warn', en: 'This JSON store is a demo. Do not enter real children.', ar: 'هذا مخزن JSON للعرض. لا تُدخل أطفالًا حقيقيين.' },
            { id: 'hubspot', level: 'warn', en: 'CRM is not connected. External leads wait on questionnaire §3.', ar: 'الـ CRM غير موصول. الليدز الخارجية تنتظر الاستبيان §3.' },
            { id: 'stripe', level: 'danger', en: 'Card payments are disconnected. Manual ledger only — Stripe is not installed.', ar: 'دفع البطاقة مفصول. الدفتر اليدوي فقط — Stripe غير مثبت.' },
            { id: 'smtp', level: 'warn', en: 'Transactional email is not configured. WhatsApp remains the staff channel.', ar: 'بريد المعاملات غير مضبوط. واتساب يبقى قناة التشغيل.' },
            { id: 'chat', level: 'info', en: 'Live chat is not installed. WhatsApp is the public channel.', ar: 'لا شات حي. واتساب هو القناة العامة.' },
          ],
          notifications: dash.notifications,
          queues: dash.queues,
          shell: 'admin-os',
        };
      }
      if (view === 'website') {
        return {
          view: 'website',
          engine: 'astro+sveltia',
          writesFromPortal: false,
          pageBuilder: 'never',
          dynamizePublicSite: false,
          cmsPath: '/admin/',
          cmsLive: 'https://ummahacademy.net/admin/',
          guide: 'docs/16-cms-guide.md',
          workflow: ['draft', 'preview', 'approval', 'publish'],
          collections: WEBSITE_COLLECTIONS,
          noteEn: 'Website edits stay on the Astro site. Save in Sveltia opens a GitHub pull request; Vercel builds a preview; merge to main publishes. This portal does not write marketing files and does not list live PRs.',
          noteAr: 'تعديل الموقع يبقى على Astro. الحفظ في سفيلتيا يفتح طلب GitHub؛ Vercel يبني معاينة؛ الدمج في main ينشر. هذه البوابة لا تكتب ملفات التسويق ولا تعرض طلبات حية.',
        };
      }
      if (view === 'admissions') {
        const cards = state.students.map((s) => admissionCard(s, actor));
        const column = (stage) => cards.filter((c) => c.stage === stage);
        return {
          view: 'admissions',
          crm: 'disconnected',
          noteEn: 'Pipeline is derived from students, subscriptions and sessions already in the portal. There is no HubSpot list and no invented leads.',
          noteAr: 'المسار يُشتق من الطلاب والاشتراكات والحصص الموجودة. ليست قائمة HubSpot ولا ليدز مخترعة.',
          columns: {
            lead: column('lead'),
            trial_booked: column('trial_booked'),
            trial_completed: column('trial_completed'),
            paid: column('paid'),
          },
          counts: {
            lead: column('lead').length,
            trial_booked: column('trial_booked').length,
            trial_completed: column('trial_completed').length,
            paid: column('paid').length,
          },
        };
      }
      if (view === 'governance') {
        return {
          view: 'governance',
          noteEn: 'Login roles stay admin / ops / teacher / guardian / student. Academic Manager is not a separate login until the owner splits ops.',
          noteAr: 'أدوار الدخول تبقى أدمن / تشغيل / معلم / ولي / طالب. مدير أكاديمي ليس حسابًا منفصلًا حتى يفصل المالك التشغيل.',
          roles: [
            { login: 'admin', os: 'Super Admin', osAr: 'مدير أعلى', portal: true },
            { login: 'ops', os: 'Operations', osAr: 'تشغيل', portal: true },
            { login: 'teacher', os: 'Teacher', osAr: 'معلم', portal: true },
            { login: 'guardian', os: 'Family Hub', osAr: 'متابعة الأسرة', portal: true },
            { login: 'student', os: 'Student file', osAr: 'ملف الطالب', portal: true },
          ],
          matrix: GOVERNANCE_ACTIONS,
        };
      }
      if (view === 'people') {
        allow(actor, 'people.admin', null);
        return {
          view: 'people',
          users: state.users.map((u) => ({ ...publicUser(u), studentId: u.studentId || null, teacherId: u.teacherId || null, familyId: u.familyId || null, guardianId: u.guardianId || null })),
        };
      }
      if (view === 'academic') {
        return {
          view: 'academic',
          students: listStudents(actor).map((s) => {
            const reports = state.reports.filter((r) => r.studentId === s.id && r.status === 'submitted').sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
            const hw = homeworkForStudent(s.id).filter((h) => h.open);
            return {
              id: s.id,
              name: s.name,
              nameAr: s.nameAr,
              axes: s.axes,
              teacher: s.primaryTeacher,
              nextSession: s.nextSession,
              lastReport: reports[0] ? { summary: reports[0].summary, summaryAr: reports[0].summaryAr, submittedAt: reports[0].submittedAt, homework: reports[0].homework } : null,
              openHomework: hw.length,
            };
          }),
        };
      }
      if (view === 'placements') {
        return {
          view: 'placements',
          placements: structuredClone(state.placements || []),
          noteEn: 'Placement reviews append; they do not overwrite. The academic store starts empty — no invented exams.',
          noteAr: 'مراجعات التحديد تُضاف ولا تُستبدل. المخزن الأكاديمي يبدأ فارغًا — لا اختبارات مخترعة.',
        };
      }
      if (view === 'assets') {
        return {
          view: 'assets',
          assets: state.assets
            .filter((a) => can(actor, 'asset.read', { type: 'asset', id: a.id, studentId: a.studentId }, state))
            .map((a) => ({ ...assetMeta(a), student: studentBrief(a.studentId) })),
        };
      }
      if (view === 'settings') {
        return {
          view: 'settings',
          demo: Boolean(options.demo ?? !options.production),
          production: Boolean(options.production),
          groups: [
            { id: 'general', en: 'General', ar: 'عام', rows: [
              { key: 'academy', value: 'Ummah Academy', editable: false },
              { key: 'mode', value: options.production ? 'production' : 'demo', editable: false },
            ] },
            { id: 'memberships', en: 'Memberships / payments', ar: 'العضويات / الدفع', status: 'disconnected', rows: [
              { key: 'stripe', value: 'disconnected', editable: false, reasonEn: 'Owner has not chosen a payment provider (questionnaire §1).', reasonAr: 'المالك لم يختر مزوّد دفع (الاستبيان §1).' },
              { key: 'ledger', value: 'manual', editable: false },
            ] },
            { id: 'mail', en: 'Mail', ar: 'البريد', status: 'disconnected', rows: [
              { key: 'smtp', value: 'disconnected', editable: false, reasonEn: 'No SMTP provider (questionnaire §2). WhatsApp is the staff channel.', reasonAr: 'لا SMTP (الاستبيان §2). واتساب قناة التشغيل.' },
            ] },
            { id: 'crm', en: 'CRM / leads', ar: 'الليدز', status: 'disconnected', rows: [
              { key: 'hubspot', value: 'disconnected', editable: false, reasonEn: 'Lead endpoint is empty (questionnaire §3).', reasonAr: 'رابط الليدز فاضي (الاستبيان §3).' },
            ] },
            { id: 'discussion', en: 'Discussion', ar: 'المراسلة', rows: [
              { key: 'live_chat', value: 'off', editable: false, reasonEn: 'WhatsApp stays the public channel.', reasonAr: 'واتساب يبقى القناة العامة.' },
              { key: 'whatsapp', value: 'manual_outbox', editable: false },
            ] },
            { id: 'media', en: 'Media', ar: 'الملفات', rows: [
              { key: 'upload', value: 'pdf_image_text_1mb', editable: false },
              { key: 'recordings', value: 'token_bound', editable: false },
            ] },
            { id: 'security', en: 'Security', ar: 'الأمان', rows: [
              { key: 'csp', value: 'on', editable: false },
              { key: 'two_factor', value: 'not_configured', editable: false, reasonEn: 'AUTH-012 waits on product design.', reasonAr: 'التحقق بخطوتين ينتظر تصميم المنتج.' },
            ] },
          ],
        };
      }
      if (view === 'stack') {
        return {
          view: 'stack',
          items: [
            { id: 'dashboard', status: 'native', wp: 'Dashboard', en: 'At a Glance, activity, health, membership counts.', ar: 'نظرة سريعة، نشاط، سلامة، عدّادات الاشتراك.' },
            { id: 'academic', status: 'native', wp: 'Academic Progress', en: 'Per-student last report, homework, next lesson.', ar: 'آخر تقرير وواجب والحصة الجاية لكل طالب.' },
            { id: 'placements', status: 'native', wp: 'Placement Reviews', en: 'Append-only placement records. Empty until a real review is entered.', ar: 'سجلات تحديد تُضاف ولا تُمسح. فارغة حتى إدخال مراجعة حقيقية.' },
            { id: 'memberships', status: 'native', wp: 'MemberPress', en: 'Subscriptions and ledger invoices. Not a card gateway.', ar: 'اشتراكات وفواتير دفترية. ليست بوابة بطاقة.' },
            { id: 'users', status: 'native', wp: 'Users', en: 'Portal roles: admin, ops, teacher, guardian, student.', ar: 'أدوار البوابة: أدمن، تشغيل، معلم، ولي، طالب.' },
            { id: 'files', status: 'native', wp: 'Media / File Manager', en: 'Tokenised assets. Not a disk browser.', ar: 'ملفات برمز. ليست متصفح أقراص.' },
            { id: 'tools', status: 'native', wp: 'Tools / UpdraftPlus', en: 'CSV export and local backup drill. Not a host backup plugin.', ar: 'تصدير CSV وتدريب النسخ. ليس بلجن استضافة.' },
            { id: 'health', status: 'native', wp: 'Site Health / Wordfence', en: 'Integrity + CSP. Not a WAF plugin.', ar: 'سلامة السجل وCSP. ليس بلجن جدار نار.' },
            { id: 'settings', status: 'native', wp: 'Settings', en: 'Comparable option groups. Disconnected providers stay disconnected.', ar: 'مجموعات إعدادات مقابلة. المزوّد المفصول يبقى مفصولًا.' },
            { id: 'stripe', status: 'blocked', wp: 'Stripe', en: 'Questionnaire §1 unanswered.', ar: 'الاستبيان §1 بلا إجابة.' },
            { id: 'smtp', status: 'blocked', wp: 'WP Mail SMTP', en: 'Questionnaire §2 unanswered.', ar: 'الاستبيان §2 بلا إجابة.' },
            { id: 'crm', status: 'blocked', wp: 'HubSpot', en: 'Questionnaire §3 unanswered.', ar: 'الاستبيان §3 بلا إجابة.' },
            { id: 'seo', status: 'blocked', wp: 'All in One SEO / Site Kit', en: 'Questionnaire §4 unanswered. Marketing SEO is the Astro site.', ar: 'الاستبيان §4 بلا إجابة. السيو على موقع Astro.' },
            { id: 'elementor', status: 'never', wp: 'Elementor / Astra / Templately / ElementsKit / Royal Addons', en: 'Page builders are not ported.', ar: 'منشئات الصفحات لا تُنقل.' },
            { id: 'angie', status: 'never', wp: 'Angie', en: 'Not ported.', ar: 'لا تُنقل.' },
            { id: 'litespeed', status: 'never', wp: 'LiteSpeed Cache', en: 'Not ported.', ar: 'لا تُنقل.' },
            { id: 'chat', status: 'never', wp: 'Live chat', en: 'WhatsApp stays the public channel.', ar: 'واتساب يبقى القناة العامة.' },
          ],
        };
      }
      throw E.validation('Unknown console view.', 'عرض لوحة غير معروف.');
    },
    teacherDay,
    progressHub,
    getProgress(actor, studentId) {
      const student = must(state.students, studentId);
      return { child: progressCard(actor, student) };
    },
    listHomework(actor, filters = {}) {
      allow(actor, 'homework.list', null);
      return (state.homeworkAssignments || [])
        .filter((h) => can(actor, 'homework.read', { type: 'homework', id: h.id, studentId: h.studentId }, state))
        .filter((h) => !filters.studentId || h.studentId === filters.studentId)
        .filter((h) => !filters.sessionId || h.sessionId === filters.sessionId)
        .map(homeworkDto)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    },
    getHomework(actor, homeworkId) {
      const row = must(state.homeworkAssignments || [], homeworkId);
      allow(actor, 'homework.read', { type: 'homework', id: row.id, studentId: row.studentId });
      return homeworkDto(row);
    },
    catalog(actor) {
      allow(actor, 'catalog.read', null);
      return {
        courses: state.courses,
        plans: state.plans.map((p) => (actor.role === 'admin' || actor.role === 'ops' || seesMoney(actor, null, actor.familyId) ? p : { ...p, price: null })),
        teachers: state.teachers.map((t) => ({ id: t.id, name: t.name, nameAr: t.nameAr, specialty: t.specialty, specialtyAr: t.specialtyAr, timezone: t.timezone, ijazah: t.ijazah })),
        students: listStudents(actor).map((s) => ({ id: s.id, name: s.name, nameAr: s.nameAr, timezone: s.timezone })),
      };
    },
    search(actor, q) {
      allow(actor, 'dashboard.read', null);
      const query = String(q || '').trim().toLowerCase();
      if (query.length < 1) return { students: [], families: [], sessions: [], followUps: [] };
      const students = listStudents(actor, { q: query }).slice(0, 8);
      const families =
        actor.role === 'admin' || actor.role === 'ops'
          ? state.families.filter((f) => `${f.name} ${f.nameAr} ${f.id}`.toLowerCase().includes(query)).slice(0, 6)
          : actor.familyId && `${byId(state.families, actor.familyId)?.name} ${byId(state.families, actor.familyId)?.nameAr}`.toLowerCase().includes(query)
            ? [byId(state.families, actor.familyId)]
            : [];
      const sessions = visibleSessions(actor, state.sessions)
        .filter((s) => {
          const st = byId(state.students, s.studentId);
          return `${s.id} ${st?.name} ${st?.nameAr}`.toLowerCase().includes(query);
        })
        .slice(0, 8)
        .map((s) => decorateSession(s, actor));
      const followUps = state.followUps.filter((f) => followVisible(actor, f) && `${f.title} ${f.titleAr} ${f.id}`.toLowerCase().includes(query)).slice(0, 6);
      return { students, families, sessions, followUps };
    },
    listStudents,
    getStudent(actor, studentId) {
      return studentDto(actor, must(state.students, studentId));
    },
    updateStudent(actor, studentId, patch, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const student = must(state.students, studentId);
        allow(actor, 'student.write', { type: 'student', id: student.id, studentId: student.id });
        const before = { academicStatus: student.academicStatus, loginEnabled: student.loginEnabled, level: student.level, goals: student.goals, timezone: student.timezone };
        const sensitive = patch.academicStatus !== undefined || patch.loginEnabled !== undefined;
        const reason = sensitive ? requireReason(patch.reason ?? meta.reason) : patch.reason ?? null;
        for (const key of ['academicStatus', 'loginEnabled', 'level', 'goals', 'strengths', 'improvements', 'timezone', 'language']) {
          if (patch[key] !== undefined) student[key] = patch[key];
        }
        audit(actor, 'student.updated', 'student', student.id, before, { academicStatus: student.academicStatus, loginEnabled: student.loginEnabled, level: student.level, goals: student.goals, timezone: student.timezone }, reason, meta.requestId);
        event(actor, 'student.updated', { studentId: student.id, familyId: student.familyId, entityType: 'student', entityId: student.id, summary: 'Student profile updated', summaryAr: 'تم تحديث ملف الطالب' });
        return studentDto(actor, student);
      });
    },
    listFamilies(actor) {
      allow(actor, 'people.admin', null);
      return state.families.map((f) => ({
        ...f,
        children: state.students.filter((s) => s.familyId === f.id).length,
      }));
    },
    getFamily(actor, familyId) {
      return familyDto(actor, must(state.families, familyId));
    },
    listTeachers(actor) {
      allow(actor, 'teacher.read', null);
      const publicTeacher = (t) => ({
        id: t.id,
        name: t.name,
        nameAr: t.nameAr,
        specialty: t.specialty,
        specialtyAr: t.specialtyAr,
        role: t.role,
        roleAr: t.roleAr,
        ijazah: t.ijazah,
        timezone: t.timezone,
      });
      if (actor.role === 'guardian' || actor.role === 'student') {
        return state.teachers.map(publicTeacher);
      }
      if (actor.role === 'teacher') {
        return state.teachers
          .filter((t) => t.id === actor.teacherId)
          .map((t) => ({
            ...t,
            activeStudents: state.assignments.filter((a) => a.teacherId === t.id && a.kind === 'primary' && !a.endAt).length,
          }));
      }
      return state.teachers.map((t) => ({
        ...t,
        activeStudents: state.assignments.filter((a) => a.teacherId === t.id && a.kind === 'primary' && !a.endAt).length,
      }));
    },
    getTeacher(actor, teacherId) {
      const teacher = must(state.teachers, teacherId);
      if (actor.role === 'teacher' && actor.teacherId !== teacherId) throw E.forbidden();
      if (actor.role === 'guardian' || actor.role === 'student') {
        return { teacher: { id: teacher.id, name: teacher.name, nameAr: teacher.nameAr, specialty: teacher.specialty, specialtyAr: teacher.specialtyAr, role: teacher.role, roleAr: teacher.roleAr, ijazah: teacher.ijazah, timezone: teacher.timezone }, public: true };
      }
      allow(actor, 'teacher.read', { type: 'teacher', id: teacherId });
      const sessions = state.sessions.filter((s) => s.teacherId === teacherId);
      const pending = sessions.filter((s) => s.status === 'completed' && !state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted'));
      return {
        teacher,
        students: state.students.filter((s) => state.assignments.some((a) => a.teacherId === teacherId && a.studentId === s.id && !a.endAt)).map((s) => studentBrief(s.id)),
        pendingReports: pending.map((s) => decorateSession(s, actor)),
        assignments: state.assignments.filter((a) => a.teacherId === teacherId).map((a) => ({ ...a, student: studentBrief(a.studentId) })),
      };
    },
    listSessions(actor, filters = {}) {
      allow(actor, 'session.list', null);
      return visibleSessions(actor, state.sessions)
        .filter((s) => !filters.status || s.status === filters.status)
        .filter((s) => !filters.teacherId || s.teacherId === filters.teacherId)
        .filter((s) => !filters.studentId || s.studentId === filters.studentId)
        .filter((s) => !filters.from || s.startsAt >= filters.from)
        .filter((s) => !filters.to || s.startsAt <= filters.to)
        .filter((s) => !filters.pendingReport || (s.status === 'completed' && !state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted')))
        .filter((s) => filters.mine !== '1' || s.teacherId === actor.teacherId)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map((s) => decorateSession(s, actor));
    },
    getSession(actor, sessionId) {
      const session = must(state.sessions, sessionId);
      if (!sessionVisible(actor, session)) throw E.forbidden();
      return decorateSession(session, actor);
    },
    createSession(actor, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        allow(actor, 'session.create', null);
        const student = must(state.students, input.studentId);
        const sub = assertSchedulable(student.id);
        const enrollment = input.enrollmentId ? must(state.enrollments, input.enrollmentId) : state.enrollments.find((e) => e.studentId === student.id && e.status !== 'ended');
        if (!enrollment) throw E.validation('Enrollment required.', 'التسجيل في كورس مطلوب.');
        if (enrollment.studentId !== student.id || enrollment.status === 'ended') {
          throw E.validation('Enrollment does not belong to this student or is no longer active.', 'التسجيل لا يخص هذا الطالب أو أنه غير نشط.');
        }
        if (enrollment.courseId !== sub.courseId) {
          throw E.validation('Enrollment and subscription courses do not match.', 'الكورس في التسجيل لا يطابق كورس الاشتراك.');
        }
        const teacherId = input.teacherId || currentPrimary(state, student.id, enrollment.id)?.teacherId;
        if (!teacherId || !byId(state.teachers, teacherId)) throw E.validation('Teacher required.', 'المعلم مطلوب.');
        const cycle = input.cycleId ? must(state.cycles, input.cycleId) : activeCycle(student.id);
        if (!cycle) throw E.validation('No cycle to attach this session to.', 'لا توجد فترة اشتراك لربط الحصة بها.');
        if (cycle.subscriptionId !== sub.id || cycle.planId !== sub.planId) {
          throw E.validation('Billing cycle does not belong to this subscription.', 'فترة الفوترة لا تخص هذا الاشتراك.');
        }
        const startsAt = new Date(input.startsAt);
        if (Number.isNaN(startsAt.getTime())) throw E.validation('Invalid start time.', 'موعد البداية غير صالح.');
        const durationMin = Number(input.durationMin ?? planBrief(sub.planId)?.minutes ?? 30);
        if (!Number.isInteger(durationMin) || durationMin < 1) {
          throw E.validation('Duration must be a positive whole number of minutes.', 'مدة الحصة يجب أن تكون عددًا صحيحًا موجبًا بالدقائق.');
        }
        const session = {
          id: id('ses'),
          studentId: student.id,
          familyId: student.familyId,
          enrollmentId: enrollment.id,
          subscriptionId: sub.id,
          cycleId: cycle.id,
          courseId: enrollment.courseId,
          teacherId,
          startsAt: startsAt.toISOString(),
          endsAt: new Date(startsAt.getTime() + durationMin * 60000).toISOString(),
          durationMin,
          status: 'scheduled',
          countsTowardBalance: null,
          lateCancel: false,
          noShowParty: null,
          cancelReason: null,
          cancelledByRole: null,
          rescheduleReason: null,
          rescheduledFromId: null,
          rescheduledToId: null,
          substituteFor: null,
          originalStartsAt: null,
          createdBy: actor.id,
          createdAt: clock().toISOString(),
        };
        assertNoConflict(session);
        state.sessions.push(session);
        audit(actor, 'session.created', 'session', session.id, null, { startsAt: session.startsAt, teacherId, studentId: student.id }, input.reason ?? null, meta.requestId);
        event(actor, 'session.created', { studentId: student.id, familyId: student.familyId, entityType: 'session', entityId: session.id, summary: 'Session scheduled', summaryAr: 'تم جدولة حصة' });
        return decorateSession(session, actor);
      });
    },
    confirmSession(actor, sessionId, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.write', session);
        assertOpen(session);
        const before = session.status;
        session.status = 'confirmed';
        audit(actor, 'session.confirmed', 'session', session.id, { status: before }, { status: session.status }, null, meta.requestId);
        return decorateSession(session, actor);
      });
    },
    markAttendance(actor, sessionId, input, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.write', session);
        if (!ATTENDANCE_STATUSES.has(input?.status)) throw E.validation('Unknown attendance status.', 'حالة الحضور غير معروفة.');
        const existing = state.attendance.find((a) => a.sessionId === session.id && a.studentId === session.studentId);
        const before = existing ? { status: existing.status } : null;
        if (existing) {
          existing.status = input.status;
          existing.markedBy = actor.id;
          existing.markedAt = clock().toISOString();
        } else {
          state.attendance.push({ id: id('att'), sessionId: session.id, studentId: session.studentId, status: input.status, markedBy: actor.id, markedAt: clock().toISOString() });
        }
        audit(actor, 'attendance.marked', 'session', session.id, before, { status: input.status }, input.reason ?? null, meta.requestId);
        return decorateSession(session, actor);
      });
    },
    completeSession(actor, sessionId, input = {}, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.write', session);
        if (session.status === 'completed') throw E.already('completed', 'إكمالها');
        assertOpen(session);
        if (input.attendance !== undefined && input.attendance !== null) {
          if (!ATTENDANCE_STATUSES.has(input.attendance)) throw E.validation('Unknown attendance status.', 'حالة الحضور غير معروفة.');
          const existing = state.attendance.find((a) => a.sessionId === session.id && a.studentId === session.studentId);
          if (existing) {
            existing.status = input.attendance;
            existing.markedBy = actor.id;
            existing.markedAt = clock().toISOString();
          } else {
            state.attendance.push({ id: id('att'), sessionId: session.id, studentId: session.studentId, status: input.attendance, markedBy: actor.id, markedAt: clock().toISOString() });
          }
        }
        const before = session.status;
        session.status = 'completed';
        audit(actor, 'session.completed', 'session', session.id, { status: before }, { status: 'completed', attendance: input.attendance ?? null }, null, meta.requestId);
        event(actor, 'session.completed', { studentId: session.studentId, familyId: session.familyId, entityType: 'session', entityId: session.id, summary: 'Session completed', summaryAr: 'اكتملت الحصة' });
        return decorateSession(session, actor);
      });
    },
    submitReport(actor, sessionId, input, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.report', session);
        if (session.status !== 'completed') throw E.badState('Report comes after the session is completed.', 'التقرير يُرفع بعد اكتمال الحصة.');
        if (!input.summary || String(input.summary).trim().length < 3) throw E.validation('Summary is required.', 'ملخص الحصة مطلوب.');
        const existing = state.reports.find((r) => r.sessionId === session.id);
        const reportAuditFields = (report) => report ? Object.fromEntries([
          'status', 'reviewStatus', 'summary', 'summaryAr', 'homework', 'homeworkAr', 'nextStep',
          'nextStepAr', 'strengths', 'strengthsAr', 'improvements', 'improvementsAr', 'submittedAt',
        ].map((field) => [field, report[field] ?? null])) : null;
        const before = reportAuditFields(existing);
        const row = existing ?? { id: id('rpt'), sessionId: session.id, studentId: session.studentId, teacherId: session.teacherId };
        Object.assign(row, {
          status: 'submitted',
          reviewStatus: existing?.reviewStatus === 'approved' ? 'approved' : 'pending',
          summary: String(input.summary).trim(),
          summaryAr: input.summaryAr ?? input.summary,
          homework: input.homework ?? '',
          homeworkAr: input.homeworkAr ?? input.homework ?? '',
          nextStep: input.nextStep ?? '',
          nextStepAr: input.nextStepAr ?? input.nextStep ?? '',
          strengths: input.strengths ?? '',
          strengthsAr: input.strengthsAr ?? input.strengths ?? '',
          improvements: input.improvements ?? '',
          improvementsAr: input.improvementsAr ?? input.improvements ?? '',
          submittedAt: clock().toISOString(),
        });
        if (!existing) state.reports.push(row);
        audit(actor, existing ? 'report.corrected' : 'report.submitted', 'session', session.id, before, reportAuditFields(row), input.reason ?? null, meta.requestId);
        if (!existing) {
          event(actor, 'report.submitted', { studentId: session.studentId, familyId: session.familyId, entityType: 'session', entityId: session.id, summary: 'Report submitted', summaryAr: 'رُفع تقرير الحصة' });
        }
        const internal = state.followUps.find((f) => f.sessionId === session.id && f.type === 'teacher_ops' && !['resolved', 'closed'].includes(f.status));
        if (internal) {
          internal.status = 'resolved';
          internal.outcome = 'Report submitted.';
          internal.outcomeAr = 'رُفع التقرير.';
          internal.closedAt = clock().toISOString();
        }
        attachHomeworkFromReport(actor, session, row);
        return decorateSession(session, actor);
      });
    },
    approveReport(actor, sessionId, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'report.approve', session);
        const row = state.reports.find((r) => r.sessionId === session.id);
        if (!row || row.status !== 'submitted') {
          throw E.badState('No submitted report to approve.', 'لا تقرير مرفوع للاعتماد.');
        }
        if (row.reviewStatus === 'approved') return decorateSession(session, actor);
        const before = { reviewStatus: row.reviewStatus ?? 'pending' };
        row.reviewStatus = 'approved';
        row.reviewedAt = clock().toISOString();
        row.reviewedBy = actor.id;
        audit(actor, 'report.approved', 'session', session.id, before, { reviewStatus: 'approved' }, meta.reason ?? null, meta.requestId);
        event(actor, 'report.approved', {
          studentId: session.studentId,
          familyId: session.familyId,
          entityType: 'session',
          entityId: session.id,
          summary: 'Report approved',
          summaryAr: 'اعتُمد تقرير الحصة',
        });
        for (const g of state.guardians.filter((g) => g.studentIds.includes(session.studentId))) {
          notify(g.userId, 'A lesson report is ready', 'تقرير الحصة جاهز', row.summary, row.summaryAr, `/app/sessions/${session.id}`);
        }
        return decorateSession(session, actor);
      });
    },
    cancelSession(actor, sessionId, input, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.cancel', session);
        assertOpen(session);
        const reason = requireReason(input.reason);
        const party = input.party || (actor.role === 'teacher' ? 'teacher' : 'academy');
        const before = { status: session.status, startsAt: session.startsAt };
        session.status = 'cancelled';
        session.cancelReason = reason;
        if (party === 'family') {
          session.cancelledByRole = 'guardian';
          session.lateCancel = isLateCancel(clock(), session.startsAt);
        } else if (party === 'teacher') {
          session.cancelledByRole = 'teacher';
          session.lateCancel = false;
        } else {
          session.cancelledByRole = actor.role === 'ops' ? 'ops' : 'admin';
          session.lateCancel = false;
        }
        audit(actor, 'session.cancelled', 'session', session.id, before, { status: session.status, lateCancel: session.lateCancel, cancelledByRole: session.cancelledByRole }, reason, meta.requestId);
        event(actor, 'session.cancelled', { studentId: session.studentId, familyId: session.familyId, entityType: 'session', entityId: session.id, summary: 'Session cancelled', summaryAr: 'أُلغيت الحصة' });
        return decorateSession(session, actor);
      });
    },
    rescheduleSession(actor, sessionId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.create', null);
        assertOpen(session);
        const reason = requireReason(input.reason);
        const startsAt = new Date(input.startsAt);
        if (Number.isNaN(startsAt.getTime())) throw E.validation('Invalid start time.', 'موعد البداية غير صالح.');
        const original = session.originalStartsAt || session.startsAt;
        const next = {
          ...session,
          id: id('ses'),
          startsAt: startsAt.toISOString(),
          endsAt: new Date(startsAt.getTime() + session.durationMin * 60000).toISOString(),
          status: 'scheduled',
          rescheduledFromId: session.id,
          originalStartsAt: original,
          rescheduledToId: null,
          rescheduleReason: null,
          createdBy: actor.id,
          createdAt: clock().toISOString(),
        };
        assertNoConflict(next, [session.id]);
        session.status = 'rescheduled';
        session.rescheduleReason = reason;
        session.rescheduledToId = next.id;
        session.originalStartsAt = original;
        state.sessions.push(next);
        audit(actor, 'session.rescheduled', 'session', session.id, { startsAt: session.startsAt, status: 'scheduled' }, { status: 'rescheduled', movedTo: next.id, startsAt: next.startsAt, originalStartsAt: original }, reason, meta.requestId);
        event(actor, 'session.rescheduled', { studentId: session.studentId, familyId: session.familyId, entityType: 'session', entityId: next.id, summary: 'Session rescheduled', summaryAr: 'أُعيد جدولة الحصة' });
        const teacherUser = state.teachers.find((t) => t.id === session.teacherId);
        notify(teacherUser?.userId, 'A session moved', 'تغيّر موعد حصة', reason, reason, `/app/sessions/${next.id}`);
        return { from: decorateSession(session, actor), to: decorateSession(next, actor) };
      });
    },
    markNoShow(actor, sessionId, input, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'session.write', session);
        assertOpen(session);
        if (!['student', 'teacher'].includes(input.party)) throw E.validation('Say who missed the session.', 'حدّد من الغائب.');
        const reason = requireReason(input.reason);
        const before = session.status;
        session.status = 'no_show';
        session.noShowParty = input.party;
        state.attendance.push({
          id: id('att'),
          sessionId: session.id,
          studentId: session.studentId,
          status: input.party === 'student' ? 'absent' : 'excused',
          markedBy: actor.id,
          markedAt: clock().toISOString(),
        });
        audit(actor, 'session.no_show', 'session', session.id, { status: before }, { status: 'no_show', party: input.party }, reason, meta.requestId);
        return decorateSession(session, actor);
      });
    },
    substituteTeacher(actor, sessionId, input, meta = {}) {
      return command(actor, null, () => {
        const session = must(state.sessions, sessionId);
        allow(actor, 'teacher.assign', null);
        assertOpen(session);
        const reason = requireReason(input.reason);
        const teacher = must(state.teachers, input.teacherId);
        const beforeTeacher = session.teacherId;
        const candidate = { ...session, teacherId: teacher.id };
        assertNoConflict(candidate, [session.id]);
        session.substituteFor = session.substituteFor || beforeTeacher;
        session.teacherId = teacher.id;
        audit(actor, 'session.substitute', 'session', session.id, { teacherId: beforeTeacher }, { teacherId: teacher.id, substituteFor: session.substituteFor }, reason, meta.requestId);
        const primary = currentPrimary(state, session.studentId, session.enrollmentId);
        return { session: decorateSession(session, actor), primaryUnchanged: primary?.teacherId === beforeTeacher || primary?.teacherId !== teacher.id };
      });
    },
    changeTeacher(actor, input, meta = {}) {
      return command(actor, null, () => {
        allow(actor, 'teacher.assign', null);
        const reason = requireReason(input.reason);
        const enrollment = must(state.enrollments, input.enrollmentId);
        const teacher = must(state.teachers, input.teacherId);
        const open = state.assignments.filter((a) => a.enrollmentId === enrollment.id && a.kind === 'primary' && !a.endAt);
        const before = open.map((a) => ({ id: a.id, teacherId: a.teacherId }));
        const endedAt = clock().toISOString();
        for (const a of open) a.endAt = endedAt;
        const assignment = {
          id: id('asg'),
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          teacherId: teacher.id,
          kind: 'primary',
          startAt: endedAt,
          endAt: null,
          reason,
          createdBy: actor.id,
        };
        state.assignments.push(assignment);
        const previousTeacher = enrollment.teacherId;
        enrollment.teacherId = teacher.id;
        let moved = [];
        if (input.moveFuture !== false) {
          moved = state.sessions.filter((s) => s.enrollmentId === enrollment.id && OPEN.has(s.status) && s.teacherId === previousTeacher && !s.substituteFor);
          for (const s of moved) {
            const candidate = { ...s, teacherId: teacher.id };
            assertNoConflict(candidate, [s.id]);
            s.teacherId = teacher.id;
          }
        }
        audit(actor, 'teacher.assignment.changed', 'enrollment', enrollment.id, { teacherId: previousTeacher, open: before }, { teacherId: teacher.id, assignmentId: assignment.id, futureMoved: moved.map((s) => s.id) }, reason, meta.requestId);
        event(actor, 'teacher.changed', { studentId: enrollment.studentId, familyId: byId(state.students, enrollment.studentId)?.familyId, entityType: 'enrollment', entityId: enrollment.id, summary: 'Teacher assignment changed', summaryAr: 'تغيّر إسناد المعلم' });
        return {
          assignment,
          history: state.assignments.filter((a) => a.enrollmentId === enrollment.id),
          futureMoved: moved.map((s) => s.id),
        };
      });
    },
    listSubscriptions(actor, filters = {}) {
      if (!actor) throw E.unauthorized();
      const nowIso = clock().toISOString();
      const horizon = filters.renewing ? new Date(clock().getTime() + Number(filters.renewing) * 86400000).toISOString() : null;
      return state.subscriptions
        .filter((s) => can(actor, 'subscription.read', s, state))
        .filter((s) => !filters.status || s.status === filters.status)
        .filter((s) => !filters.studentId || s.studentId === filters.studentId)
        .filter((s) => {
          if (!horizon) return true;
          return state.cycles.some((c) => c.subscriptionId === s.id && c.status === 'active' && c.end >= nowIso && c.end <= horizon);
        })
        .map((s) => subscriptionDto(actor, s));
    },
    getSubscription(actor, subscriptionId) {
      return subscriptionDto(actor, must(state.subscriptions, subscriptionId));
    },
    renewSubscription(actor, subscriptionId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const sub = must(state.subscriptions, subscriptionId);
        allow(actor, 'subscription.write', sub);
        const reason = requireReason(input.reason);
        const plan = planBrief(input.planId || sub.planId);
        if (!plan) throw E.validation('Unknown plan.', 'الخطة غير معروفة.');
        const cycles = state.cycles.filter((c) => c.subscriptionId === sub.id);
        const current = cycles.find((c) => c.status === 'active' || c.status === 'scheduled') ?? cycles.at(-1);
        const start = input.startAt ? new Date(input.startAt) : current && new Date(current.end) > clock() ? new Date(current.end) : clock();
        if (Number.isNaN(start.getTime())) throw E.validation('Invalid start.', 'تاريخ البداية غير صالح.');
        if (current && current.status === 'active' && new Date(current.end) <= clock()) current.status = 'completed';
        const cycle = {
          id: id('cyc'),
          subscriptionId: sub.id,
          planId: plan.id,
          start: start.toISOString(),
          end: addMs(start.toISOString(), POLICY.cycleDays * 86400000),
          sessionsAllocated: Number(input.sessionsAllocated || plan.sessionsPerMonth),
          status: start > clock() ? 'scheduled' : 'active',
          priceUsd: plan.price,
          adjustments: [],
          frozenAt: null,
          freezeReason: null,
          resumedAt: null,
          cancelledAt: null,
          cancelReason: null,
          createdBy: actor.id,
        };
        state.cycles.push(cycle);
        const before = { status: sub.status, planId: sub.planId, cycles: cycles.map((c) => c.id) };
        sub.status = 'active';
        sub.planId = plan.id;
        audit(actor, 'subscription.renewed', 'subscription', sub.id, before, { status: sub.status, planId: sub.planId, cycleId: cycle.id }, reason, meta.requestId);
        event(actor, 'subscription.renewed', { studentId: sub.studentId, familyId: sub.familyId, entityType: 'subscription', entityId: sub.id, summary: 'Subscription renewed', summaryAr: 'تم تجديد الاشتراك' });
        return subscriptionDto(actor, sub);
      });
    },
    freezeSubscription(actor, subscriptionId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const sub = must(state.subscriptions, subscriptionId);
        allow(actor, 'subscription.write', sub);
        const reason = requireReason(input.reason);
        const cycle = state.cycles.find((c) => c.subscriptionId === sub.id && c.status === 'active');
        if (!cycle) throw E.badState('No active cycle to freeze.', 'لا توجد فترة سارية للتجميد.');
        const beforeRemaining = cycleBalance(cycle, state.sessions).remaining;
        cycle.status = 'frozen';
        cycle.frozenAt = clock().toISOString();
        cycle.freezeReason = reason;
        sub.status = 'paused';
        audit(actor, 'subscription.frozen', 'subscription', sub.id, { status: 'active', remaining: beforeRemaining }, { status: 'paused', remaining: beforeRemaining, frozenAt: cycle.frozenAt }, reason, meta.requestId);
        return { subscription: subscriptionDto(actor, sub), remainingPreserved: beforeRemaining };
      });
    },
    resumeSubscription(actor, subscriptionId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const sub = must(state.subscriptions, subscriptionId);
        allow(actor, 'subscription.write', sub);
        const reason = requireReason(input.reason);
        const cycle = state.cycles.find((c) => c.subscriptionId === sub.id && c.status === 'frozen');
        if (!cycle?.frozenAt) throw E.badState('Subscription is not frozen.', 'الاشتراك غير مجمّد.');
        const beforeRemaining = cycleBalance(cycle, state.sessions).remaining;
        const frozenMs = clock().getTime() - new Date(cycle.frozenAt).getTime();
        cycle.end = addMs(cycle.end, Math.max(frozenMs, 0));
        cycle.status = 'active';
        cycle.resumedAt = clock().toISOString();
        sub.status = 'active';
        const afterRemaining = cycleBalance(cycle, state.sessions).remaining;
        audit(actor, 'subscription.resumed', 'subscription', sub.id, { remaining: beforeRemaining }, { remaining: afterRemaining, end: cycle.end }, reason, meta.requestId);
        return { subscription: subscriptionDto(actor, sub), remainingBefore: beforeRemaining, remainingAfter: afterRemaining };
      });
    },
    cancelSubscription(actor, subscriptionId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const sub = must(state.subscriptions, subscriptionId);
        allow(actor, 'subscription.write', sub);
        const reason = requireReason(input.reason);
        const before = { status: sub.status };
        sub.status = 'cancelled';
        for (const c of state.cycles.filter((c) => c.subscriptionId === sub.id && ['active', 'scheduled', 'frozen'].includes(c.status))) {
          c.status = 'cancelled';
          c.cancelledAt = clock().toISOString();
          c.cancelReason = reason;
        }
        audit(actor, 'subscription.cancelled', 'subscription', sub.id, before, { status: 'cancelled' }, reason, meta.requestId);
        event(actor, 'subscription.cancelled', { studentId: sub.studentId, familyId: sub.familyId, entityType: 'subscription', entityId: sub.id, summary: 'Subscription cancelled — history kept', summaryAr: 'أُلغي الاشتراك مع الإبقاء على التاريخ' });
        return subscriptionDto(actor, sub);
      });
    },
    adjustCycle(actor, cycleId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const cycle = must(state.cycles, cycleId);
        const sub = must(state.subscriptions, cycle.subscriptionId);
        allow(actor, 'subscription.write', sub);
        const reason = requireReason(input.reason);
        const delta = Number(input.delta);
        if (!Number.isInteger(delta) || delta === 0) throw E.validation('Adjustment must be a non-zero integer.', 'التسوية عدد صحيح غير صفري.');
        const before = cycle.sessionsAllocated + cycle.adjustments.reduce((s, a) => s + a.delta, 0);
        cycle.adjustments.push({ id: id('adj'), delta, reason, actorId: actor.id, at: clock().toISOString() });
        const after = before + delta;
        audit(actor, 'cycle.adjusted', 'cycle', cycle.id, { allocated: before }, { allocated: after, delta }, reason, meta.requestId);
        return subscriptionDto(actor, sub);
      });
    },
    recordPayment(actor, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        allow(actor, 'payment.write', null);
        const sub = must(state.subscriptions, input.subscriptionId);
        const cycle = input.cycleId ? must(state.cycles, input.cycleId) : null;
        if (cycle && cycle.subscriptionId !== sub.id) {
          throw E.validation('Billing cycle does not belong to this subscription.', 'فترة الفوترة لا تخص هذا الاشتراك.');
        }
        if (!['pending', 'paid', 'failed', 'refunded'].includes(input.status)) throw E.validation('Unknown payment status.', 'حالة الدفع غير معروفة.');
        const amount = Number(input.amount);
        if (!Number.isFinite(amount) || amount < 0) throw E.validation('Amount is invalid.', 'المبلغ غير صالح.');
        const beforeStatus = sub.status;
        const row = {
          id: id('pay'),
          familyId: sub.familyId,
          subscriptionId: sub.id,
          cycleId: input.cycleId ?? null,
          amount,
          currency: 'USD',
          status: input.status,
          method: input.method || 'manual',
          paidAt: input.status === 'paid' ? clock().toISOString() : null,
          createdAt: clock().toISOString(),
          failureReason: input.failureReason ?? null,
          createdBy: actor.id,
          idempotencyKey: meta.idempotencyKey ?? null,
        };
        state.payments.push(row);
        audit(actor, 'payment.recorded', 'payment', row.id, null, { status: row.status, amount, subscriptionStatusUnchanged: sub.status === beforeStatus }, input.reason ?? null, meta.requestId);
        return { payment: row, subscriptionStatus: sub.status };
      });
    },
    listFollowUps(actor, filters = {}) {
      allow(actor, 'dashboard.read', null);
      const nowIso = clock().toISOString();
      return state.followUps
        .filter((f) => followVisible(actor, f))
        .filter((f) => !filters.status || f.status === filters.status)
        .filter((f) => !filters.type || f.type === filters.type)
        .filter((f) => !filters.assigneeId || f.assigneeId === filters.assigneeId)
        .filter((f) => filters.overdue !== '1' || (['open', 'in_progress', 'waiting'].includes(f.status) && f.dueAt && f.dueAt < nowIso))
        .map(followDto)
        .sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)));
    },
    getFollowUp(actor, followId) {
      const row = must(state.followUps, followId);
      if (!followVisible(actor, row)) throw E.forbidden();
      return followDto(row);
    },
    createFollowUp(actor, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        allow(actor, 'people.admin', null);
        if (!input.title || String(input.title).trim().length < 3) throw E.validation('Title is required.', 'عنوان المتابعة مطلوب.');
        const student = input.studentId ? must(state.students, input.studentId) : null;
        const teacher = input.teacherId ? must(state.teachers, input.teacherId) : null;
        const subscription = input.subscriptionId ? must(state.subscriptions, input.subscriptionId) : null;
        const session = input.sessionId ? must(state.sessions, input.sessionId) : null;
        const familyId = input.familyId || student?.familyId || subscription?.familyId || session?.familyId || null;
        const assigneeId = input.assigneeId || defaultAssignee(actor);
        if (familyId && !byId(state.families, familyId)) throw E.notFound();
        if (student && familyId && student.familyId !== familyId) {
          throw E.validation('Student and family do not match.', 'الطالب لا ينتمي إلى الأسرة المحددة.');
        }
        if (subscription && student && subscription.studentId !== student.id) {
          throw E.validation('Subscription does not belong to this student.', 'الاشتراك لا يخص هذا الطالب.');
        }
        if (subscription && familyId && subscription.familyId !== familyId) {
          throw E.validation('Subscription does not belong to this family.', 'الاشتراك لا يخص هذه الأسرة.');
        }
        if (session && student && session.studentId !== student.id) {
          throw E.validation('Session does not belong to this student.', 'الحصة لا تخص هذا الطالب.');
        }
        if (session && familyId && session.familyId !== familyId) {
          throw E.validation('Session does not belong to this family.', 'الحصة لا تخص هذه الأسرة.');
        }
        if (session && subscription && session.subscriptionId !== subscription.id) {
          throw E.validation('Session and subscription do not match.', 'الحصة لا تتبع الاشتراك المحدد.');
        }
        if (session && subscription && session.familyId !== subscription.familyId) {
          throw E.validation('Session and subscription families do not match.', 'أسرة الحصة لا تطابق أسرة الاشتراك.');
        }
        if (session && teacher && session.teacherId !== teacher.id) {
          throw E.validation('Teacher does not match the session.', 'المعلم المحدد لا يطابق معلم الحصة.');
        }
        if (!byId(state.users, assigneeId)) throw E.notFound();
        const row = {
          id: id('fu'),
          level: input.level || (student ? 'student' : 'family'),
          type: input.type || 'family',
          visibility: input.visibility || (input.type === 'teacher_ops' ? 'internal' : 'family'),
          familyId,
          studentId: student?.id ?? null,
          teacherId: input.teacherId ?? null,
          subscriptionId: input.subscriptionId ?? null,
          sessionId: input.sessionId ?? null,
          title: String(input.title).trim(),
          titleAr: input.titleAr || input.title,
          status: 'open',
          priority: input.priority || 'normal',
          assigneeId,
          dueAt: input.dueAt || addMs(clock().toISOString(), 2 * 86400000),
          outcome: null,
          outcomeAr: null,
          createdBy: actor.id,
          createdAt: clock().toISOString(),
          closedAt: null,
        };
        state.followUps.push(row);
        audit(actor, 'followup.created', 'followup', row.id, null, { title: row.title, assigneeId: row.assigneeId }, null, meta.requestId);
        notify(row.assigneeId, 'Follow-up assigned', 'أُسندت إليك متابعة', row.title, row.titleAr, `/app/follow-ups/${row.id}`);
        return followDto(row);
      });
    },
    addAttempt(actor, followId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const row = must(state.followUps, followId);
        allow(actor, 'people.admin', null);
        if (!input.note || String(input.note).trim().length < 2) throw E.validation('Note is required.', 'ملاحظة المحاولة مطلوبة.');
        const attempt = {
          id: id('attm'),
          followUpId: row.id,
          at: clock().toISOString(),
          channel: input.channel || 'portal',
          note: String(input.note).trim(),
          noteAr: input.noteAr || input.note,
          actorId: actor.id,
          result: input.result || 'logged',
        };
        const beforeCount = state.attempts.filter((a) => a.followUpId === row.id).length;
        state.attempts.push(attempt);
        if (row.status === 'open') row.status = 'in_progress';
        audit(actor, 'followup.attempt', 'followup', row.id, { attempts: beforeCount }, { attempts: beforeCount + 1 }, null, meta.requestId);
        return followDto(row);
      });
    },
    transitionFollowUp(actor, followId, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        const row = must(state.followUps, followId);
        allow(actor, 'people.admin', null);
        const next = input.status;
        if (!['open', 'in_progress', 'waiting', 'resolved', 'closed'].includes(next)) throw E.validation('Unknown status.', 'حالة غير معروفة.');
        if ((next === 'resolved' || next === 'closed') && (!input.outcome || String(input.outcome).trim().length < 3)) throw E.outcome();
        const before = row.status;
        row.status = next;
        if (input.outcome) {
          row.outcome = String(input.outcome).trim();
          row.outcomeAr = input.outcomeAr || row.outcome;
        }
        if (next === 'resolved' || next === 'closed') row.closedAt = clock().toISOString();
        audit(actor, 'followup.transition', 'followup', row.id, { status: before }, { status: next, outcome: row.outcome }, row.outcome, meta.requestId);
        return followDto(row);
      });
    },
    createChangeRequest(actor, input, meta = {}) {
      return command(actor, meta.idempotencyKey, () => {
        allow(actor, 'followup.request', null);
        const g = guardianOf(state, actor);
        if (!g) throw E.forbidden();
        const studentId = input.studentId;
        if (studentId && !g.studentIds.includes(studentId)) throw E.forbidden();
        const reason = requireReason(input.reason);
        const student = studentId ? must(state.students, studentId) : null;
        const row = {
          id: id('fu'),
          level: student ? 'student' : 'family',
          type: input.kind === 'teacher' ? 'academic' : 'family',
          visibility: 'family',
          familyId: g.familyId,
          studentId: student?.id ?? null,
          teacherId: null,
          subscriptionId: null,
          sessionId: input.sessionId ?? null,
          title: input.kind === 'teacher' ? 'Teacher change request' : 'Schedule change request',
          titleAr: input.kind === 'teacher' ? 'طلب تغيير المعلم' : 'طلب تغيير الموعد',
          status: 'open',
          priority: 'normal',
          assigneeId: defaultAssignee(actor),
          dueAt: addMs(clock().toISOString(), 2 * 86400000),
          outcome: null,
          outcomeAr: null,
          createdBy: actor.id,
          createdAt: clock().toISOString(),
          closedAt: null,
        };
        state.followUps.push(row);
        state.attempts.push({ id: id('attm'), followUpId: row.id, at: clock().toISOString(), channel: 'portal', note: reason, noteAr: reason, actorId: actor.id, result: 'requested' });
        state.requests.push({ id: id('req'), followUpId: row.id, by: actor.id, kind: input.kind || 'schedule', reason, createdAt: clock().toISOString() });
        audit(actor, 'request.created', 'followup', row.id, null, { kind: input.kind || 'schedule' }, reason, meta.requestId);
        notify(row.assigneeId, 'Family request', 'طلب من الأسرة', row.title, row.titleAr, `/app/follow-ups/${row.id}`);
        return followDto(row);
      });
    },
    listAudit(actor, filters = {}) {
      allow(actor, 'audit.read', { type: 'audit' });
      return state.audit
        .filter((a) => !filters.entityId || a.entityId === filters.entityId)
        .filter((a) => !filters.entityType || a.entityType === filters.entityType)
        .filter((a) => !filters.actorId || a.actorId === filters.actorId)
        .slice()
        .reverse()
        .slice(0, 200)
        .map((a) => ({ ...a, actor: publicUser(byId(state.users, a.actorId)) }));
    },
    notifications(actor) {
      allow(actor, 'notification.read', null);
      return state.notifications.filter((n) => n.userId === actor.id);
    },
    markNotificationRead(actor, noteId) {
      return command(actor, null, () => {
        const note = state.notifications.find((n) => n.id === noteId && n.userId === actor.id);
        if (!note) throw E.notFound();
        note.read = true;
        return note;
      });
    },
    issueAssetToken(actor, assetId) {
      const asset = must(state.assets, assetId);
      allow(actor, 'asset.read', { type: 'asset', id: asset.id, studentId: asset.studentId });
      if (asset.status !== 'ready' || asset.deletedAt) {
        throw E.badState('This file is not available.', 'هذا الملف غير متاح.');
      }
      const issued = issueAssetToken(actor.id, asset.id, secret, POLICY.assetTokenTtlSec, clock().getTime());
      audit(actor, 'asset.token_issued', 'asset', asset.id, null, { expiresAt: issued.expiresAt }, null);
      commit();
      return { ...issued, url: `/api/assets/${asset.id}/content?token=${issued.token}` };
    },
    readAsset(actor, assetId, token) {
      const asset = must(state.assets, assetId);
      const payload = readAssetToken(token, secret, clock().getTime());
      if (!payload || payload.assetId !== asset.id || payload.sub !== actor?.id) throw E.forbidden();
      allow(actor, 'asset.read', { type: 'asset', id: asset.id, studentId: asset.studentId });
      return {
        demo: true,
        asset: assetMeta(asset),
        noteEn: 'Protected demo note. This is not a recording of a real child, and the link expires.',
        noteAr: 'ملاحظة تجريبية محمية. هذا ليس تسجيلًا لطفل حقيقي، والرابط مؤقت.',
        covered: state.reports.find((r) => r.sessionId === asset.sessionId)?.summary ?? null,
      };
    },
    integrity(actor) {
      allow(actor, 'integrity.read', null);
      const issues = [];
      const push = (level, code, message, messageAr, entityId) => issues.push({ level, code, message, messageAr, entityId });
      for (const s of state.sessions) {
        if (!byId(state.students, s.studentId)) push('error', 'orphan_session', 'Session without a student', 'حصة بلا طالب', s.id);
        if (!byId(state.teachers, s.teacherId)) push('error', 'orphan_teacher', 'Session without a teacher', 'حصة بلا معلم', s.id);
        if (s.cycleId && !byId(state.cycles, s.cycleId)) push('error', 'orphan_cycle', 'Session without a cycle', 'حصة بلا فترة اشتراك', s.id);
      }
      for (const e of state.enrollments) {
        const open = state.assignments.filter((a) => a.enrollmentId === e.id && a.kind === 'primary' && !a.endAt);
        if (open.length > 1) push('error', 'dual_primary', 'Two open primary assignments', 'إسنادان أساسيان مفتوحان', e.id);
      }
      for (const f of state.followUps) {
        if (['resolved', 'closed'].includes(f.status) && (!f.outcome || f.outcome.length < 3)) {
          push('error', 'close_without_outcome', 'Closed follow-up without outcome', 'متابعة مغلقة بلا نتيجة', f.id);
        }
      }
      for (const student of state.students) {
        const bal = balanceView(student.id);
        for (const c of bal.byCycle) {
          if (c.remaining < 0) push('warn', 'negative_balance', 'Negative remaining balance', 'رصيد متبقٍ سالب', c.cycleId);
        }
      }
      for (const a of state.audit) {
        if (!a.actorId || !a.action || !a.occurredAt) push('error', 'thin_audit', 'Audit row missing actor or time', 'صف تدقيق ناقص', a.id);
        const blob = JSON.stringify(a);
        if (/passwordHash|scrypt\$/i.test(blob)) push('error', 'secret_in_audit', 'Secret landed in the audit log', 'سرّ ظهر في سجل التدقيق', a.id);
      }
      const overlaps = findFamilyOverlaps(state.sessions);
      for (const o of overlaps) push('warn', 'family_overlap', 'Two siblings overlap', 'تعارض بين شقيقين', `${o.a}+${o.b}`);
      return { ok: issues.every((i) => i.level !== 'error'), issues };
    },
    acceptance(actor) {
      allow(actor, 'integrity.read', null);
      const yusufAssignments = state.assignments.filter((a) => a.studentId === IDS.yusuf && a.kind === 'primary');
      const aminaCycles = state.cycles.filter((c) => c.subscriptionId === IDS.subAmina);
      const moved = byId(state.sessions, IDS.sesYusufMoved);
      const laylaAttempts = state.attempts.filter((a) => a.followUpId === IDS.fuLayla);
      const fatima = byId(state.guardians, IDS.gFatima);
      const tech = byId(state.followUps, IDS.fuTech);
      const checks = [
        { id: 'family-scope', pass: fatima?.studentIds.includes(IDS.yusuf) && fatima?.studentIds.includes(IDS.layla) && !fatima?.studentIds.includes(IDS.adam), href: `/app/families/${IDS.famRahman}`, en: 'Fatima sees Yusuf and Layla, not Adam.', ar: 'فاطمة ترى يوسف وليلى لا آدم.' },
        { id: 'teacher-history', pass: yusufAssignments.some((a) => a.endAt) && yusufAssignments.some((a) => !a.endAt), href: `/app/students/${IDS.yusuf}?tab=teachers`, en: 'Yusuf keeps Sara and Omneya in assignment history.', ar: 'تاريخ يوسف يحتفظ بسارة وأمنية.' },
        { id: 'renewal-history', pass: aminaCycles.length >= 2 && aminaCycles.some((c) => c.status === 'completed'), href: `/app/students/${IDS.amina}?tab=subscriptions`, en: 'Amina’s previous cycle is still on the record.', ar: 'فترة أمينة السابقة ما زالت في السجل.' },
        { id: 'reschedule', pass: moved?.status === 'rescheduled' && moved?.originalStartsAt && byId(state.sessions, moved.rescheduledToId), href: `/app/sessions/${IDS.sesYusufMoved}`, en: 'The original time is kept on the moved session.', ar: 'الموعد الأصلي محفوظ على الحصة المنقولة.' },
        { id: 'attempts-append', pass: laylaAttempts.length >= 2, href: `/app/follow-ups/${IDS.fuLayla}`, en: 'Layla’s two contact attempts both remain.', ar: 'محاولتا التواصل بشأن ليلى ما زالتا معًا.' },
        { id: 'outcome', pass: Boolean(tech?.outcome && tech.status === 'resolved'), href: `/app/follow-ups/${IDS.fuTech}`, en: 'The resolved technical follow-up has an outcome.', ar: 'المتابعة التقنية المحلولة لها نتيجة.' },
        { id: 'axes', pass: byId(state.students, IDS.yusuf)?.loginEnabled === false && byId(state.students, IDS.yusuf)?.academicStatus === 'active' && subscriptionStatusFor(IDS.yusuf) === 'active', href: `/app/students/${IDS.yusuf}`, en: 'Academic, subscription, and login are three different flags.', ar: 'الحالة الأكاديمية والاشتراك والدخول ثلاثة أعلام مختلفة.' },
        { id: 'payment-split', pass: state.payments.some((p) => p.id === IDS.payAminaFail) && state.payments.some((p) => p.id === IDS.payAminaOk), href: `/app/students/${IDS.amina}?tab=payments`, en: 'A failed payment and its settlement both remain.', ar: 'الدفعة الفاشلة وتسويتها باقيتان معًا.' },
      ];
      return { pass: checks.every((c) => c.pass), checks };
    },
    resetDemo(actor) {
      if (options.production) throw E.forbidden();
      allow(actor, 'demo.reset', null);
      state = buildSeed(clock());
      state.outbox = [];
      for (const g of state.guardians) g.phone ??= null;
      commit();
      return { ok: true, seededAt: state.meta.seededAt };
    },
  };
  attachOps(api, {
    get state() { return state; },
    clock,
    allow,
    command,
    audit,
    event,
    notify,
    must,
    byId,
    requireReason,
    defaultAssignee,
    readToken: (token) => readAssetToken(token, secret, clock().getTime()),
  });
  attachProfiles(api, {
    get state() { return state; },
    clock,
    command,
    audit,
    event,
    must,
    byId,
    production: Boolean(options.production),
    publicUser,
    defaultAssignee,
    isDemoPassword: (value) => DEMO_PASSWORDS.has(String(value || '')),
  });
  attachSignup(api, {
    get state() { return state; },
    clock,
    command,
    audit,
    event,
    notify,
    publicUser,
    defaultAssignee,
  });
  return api;
}
