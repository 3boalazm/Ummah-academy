/**
 * Profiles: who this person is (account + role profile) and what a student is
 * learning (the learning profile). Both are read models over the existing
 * records; nothing here stores a second copy of a name, level or balance.
 *
 * Self-service is deliberately narrow. A family member cannot rename a child, a
 * student cannot change their own level, and a teacher cannot change the name
 * families see. Those are staff decisions and keep their audit trail.
 */
import { hashPassword, verifyPassword } from './auth.mjs';
import { E } from './errors.mjs';
import { currentPrimary, grantedStudentIds, guardianOf } from './permissions.mjs';

export const PASSWORD_MIN = 10;
const LOCALES = new Set(['ar', 'en']);
const NAME_RE = /^[^\p{C}<>]{2,80}$/u;
const BASE_FIELDS = ['locale', 'timezone'];

function validTimezone(tz) {
  if (typeof tz !== 'string' || tz.length > 64) return false;
  if (tz !== 'UTC' && !tz.includes('/')) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Fields this actor may change about their own account. */
export function editableFields(actor) {
  const fields = [...BASE_FIELDS];
  if (actor.role === 'admin' || actor.role === 'ops' || actor.role === 'guardian') fields.push('name', 'nameAr');
  if (actor.role === 'teacher') fields.push('bio', 'bioAr');
  return fields;
}

export function passwordProblem(next, { email = '', current = '' } = {}) {
  const value = String(next ?? '');
  if (value.length < PASSWORD_MIN) {
    return { message: `Use at least ${PASSWORD_MIN} characters.`, messageAr: `استخدم ${PASSWORD_MIN} أحرف على الأقل.` };
  }
  if (value === current) {
    return { message: 'The new password must differ from the current one.', messageAr: 'كلمة المرور الجديدة يجب أن تختلف عن الحالية.' };
  }
  const local = String(email).split('@')[0].toLowerCase();
  if (local.length >= 4 && value.toLowerCase().includes(local)) {
    return { message: 'Do not put your email name inside the password.', messageAr: 'لا تضع اسم بريدك داخل كلمة المرور.' };
  }
  if (/^(.)\1+$/.test(value) || /^(0123456789|1234567890|password|qwertyuiop)/i.test(value)) {
    return { message: 'That password is too easy to guess.', messageAr: 'كلمة المرور هذه سهلة التخمين.' };
  }
  return null;
}

export function attachProfiles(api, bag) {
  const { clock, command, audit, event, must, byId } = bag;
  const stateOf = () => bag.state;

  const brief = (row) => (row ? { id: row.id, name: row.name, nameAr: row.nameAr } : null);
  const pct = (n, d) => (d ? Math.round((n / d) * 100) : null);

  function previousLogin(state, userId) {
    const rows = state.audit.filter((a) => a.action === 'auth.login' && a.entityId === userId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    return rows[1]?.occurredAt ?? rows[0]?.occurredAt ?? null;
  }

  function guardianProfile(state, actor) {
    const guardian = guardianOf(state, actor);
    if (!guardian) return null;
    const family = byId(state.families, guardian.familyId);
    const now = clock().toISOString();
    const children = state.students
      .filter((s) => grantedStudentIds(state, actor).has(s.id))
      .map((s) => {
        const next = state.sessions
          .filter((x) => x.studentId === s.id && ['scheduled', 'confirmed'].includes(x.status) && x.startsAt >= now)
          .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
        return {
          id: s.id,
          name: s.name,
          nameAr: s.nameAr,
          level: s.level,
          academicStatus: s.academicStatus,
          loginEnabled: s.loginEnabled,
          nextSessionAt: next?.startsAt ?? null,
          teacher: brief(byId(state.teachers, currentPrimary(state, s.id)?.teacherId)),
          href: `/app/students/${s.id}`,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    return {
      guardian: {
        id: guardian.id,
        name: guardian.name,
        nameAr: guardian.nameAr,
        relation: guardian.relation,
        phone: guardian.phone ?? null,
        whatsappConsent: guardian.whatsappConsent ?? 'unknown',
        verified: Boolean(guardian.verified),
        canViewBilling: Boolean(guardian.canViewBilling),
        canViewRecordings: Boolean(guardian.canViewRecordings),
      },
      family: family
        ? { id: family.id, name: family.name, nameAr: family.nameAr, city: family.city ?? null, country: family.country ?? null, timezone: family.timezone, href: `/app/families/${family.id}` }
        : null,
      children,
    };
  }

  function teacherProfile(state, actor) {
    const teacher = byId(state.teachers, actor.teacherId);
    if (!teacher) return null;
    const now = clock().toISOString();
    const weekAhead = new Date(clock().getTime() + 7 * 86400000).toISOString();
    const mine = state.sessions.filter((s) => s.teacherId === teacher.id);
    return {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        nameAr: teacher.nameAr,
        role: teacher.role,
        roleAr: teacher.roleAr,
        specialty: teacher.specialty,
        specialtyAr: teacher.specialtyAr,
        ijazah: Boolean(teacher.ijazah),
        timezone: teacher.timezone,
        bio: teacher.bio ?? '',
        bioAr: teacher.bioAr ?? '',
      },
      load: {
        students: state.assignments.filter((a) => a.teacherId === teacher.id && a.kind === 'primary' && !a.endAt).length,
        upcomingWeek: mine.filter((s) => ['scheduled', 'confirmed'].includes(s.status) && s.startsAt >= now && s.startsAt <= weekAhead).length,
        reportsDue: mine.filter((s) => s.status === 'completed' && !state.reports.some((r) => r.sessionId === s.id && r.status === 'submitted')).length,
      },
    };
  }

  function staffProfile(actor) {
    return {
      staff: {
        scope: actor.role,
        can: actor.role === 'admin' && !bag.production
          ? ['people.admin', 'payment.write', 'subscription.write', 'student.write', 'audit.read', 'demo.reset', 'performance.read']
          : ['people.admin', 'payment.write', 'subscription.write', 'student.write', 'audit.read', 'performance.read'],
      },
    };
  }

  api.getProfile = (actor) => {
    const state = stateOf();
    const user = must(state.users, actor.id);
    const base = {
      account: {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        nameAr: user.nameAr,
        locale: user.locale ?? 'ar',
        timezone: user.timezone,
        status: user.status,
      },
      editable: editableFields(actor),
      security: {
        lastLoginAt: previousLogin(state, user.id),
        passwordChangedAt: user.passwordChangedAt ?? null,
        passwordMin: PASSWORD_MIN,
      },
    };
    if (actor.role === 'guardian') Object.assign(base, guardianProfile(state, actor));
    if (actor.role === 'teacher') Object.assign(base, teacherProfile(state, actor));
    if (actor.role === 'admin' || actor.role === 'ops') Object.assign(base, staffProfile(actor));
    if (actor.studentId) base.learningHref = `/app/students/${actor.studentId}/learning`;
    return base;
  };

  api.updateProfile = (actor, patch, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      const user = must(state.users, actor.id);
      const allowed = new Set(editableFields(actor));
      const input = patch && typeof patch === 'object' ? patch : {};
      const unknown = Object.keys(input).filter((k) => !allowed.has(k));
      if (unknown.length) {
        throw E.validation(`You cannot change: ${unknown.join(', ')}.`, `لا يمكنك تغيير: ${unknown.join('، ')}.`);
      }
      const before = {};
      const after = {};
      const set = (record, key, value) => {
        before[key] = record[key] ?? null;
        record[key] = value;
        after[key] = value;
      };
      if (input.locale !== undefined) {
        if (!LOCALES.has(input.locale)) throw E.validation('Language must be ar or en.', 'اللغة يجب أن تكون ar أو en.');
        set(user, 'locale', input.locale);
      }
      if (input.timezone !== undefined) {
        if (!validTimezone(input.timezone)) throw E.validation('Unknown time zone.', 'المنطقة الزمنية غير معروفة.');
        set(user, 'timezone', input.timezone);
      }
      for (const key of ['name', 'nameAr']) {
        if (input[key] === undefined) continue;
        const value = String(input[key]).trim();
        if (!NAME_RE.test(value)) throw E.validation('Names must be 2–80 characters without symbols.', 'الاسم من 2 إلى 80 حرفًا بلا رموز.');
        set(user, key, value);
        const guardian = actor.role === 'guardian' ? byId(state.guardians, actor.guardianId) : null;
        if (guardian && !actor.studentId) guardian[key] = value;
      }
      for (const key of ['bio', 'bioAr']) {
        if (input[key] === undefined) continue;
        const value = String(input[key]).trim();
        if (value.length > 600 || /[<>]/.test(value)) throw E.validation('Bio is limited to 600 characters, no markup.', 'النبذة حتى 600 حرف بلا وسوم.');
        const teacher = must(state.teachers, actor.teacherId);
        set(teacher, key, value);
      }
      if (!Object.keys(after).length) throw E.validation('Nothing to update.', 'لا يوجد ما يُحدَّث.');
      audit(actor, 'profile.updated', 'user', user.id, before, after, null, meta.requestId);
      event(actor, 'profile.updated', { entityType: 'user', entityId: user.id, summary: 'Profile updated', summaryAr: 'تم تحديث الملف الشخصي' });
      return { ok: true, changed: Object.keys(after) };
    });

  api.sessionVersion = (userId) => byId(stateOf().users, userId)?.pwv ?? 0;

  api.changePassword = (actor, input, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      const user = must(state.users, actor.id);
      const current = String(input?.current ?? '');
      const next = String(input?.next ?? '');
      if (!verifyPassword(current, user.passwordHash)) {
        audit(actor, 'auth.password_change_failed', 'user', user.id, null, { ok: false }, null, meta.requestId);
        throw E.validation('Current password is incorrect.', 'كلمة المرور الحالية غير صحيحة.');
      }
      const problem = passwordProblem(next, { email: user.email, current });
      if (problem) throw E.validation(problem.message, problem.messageAr);
      if (bag.production && bag.isDemoPassword(next)) {
        throw E.validation('That is a published demo password.', 'هذه كلمة مرور تجريبية منشورة.');
      }
      user.passwordHash = hashPassword(next);
      user.pwv = (user.pwv ?? 0) + 1;
      user.passwordChangedAt = clock().toISOString();
      audit(actor, 'auth.password_changed', 'user', user.id, null, { ok: true }, null, meta.requestId);
      return { ok: true, sessionVersion: user.pwv };
    });

  api.learningProfile = (actor, studentId) => {
    const state = stateOf();
    const student = must(state.students, studentId);
    const dto = api.getStudent(actor, student.id); // authorises, filters sessions and reports for this actor
    const staffView = actor.role === 'admin' || actor.role === 'ops' || actor.role === 'teacher';
    const now = clock().toISOString();
    const since = new Date(clock().getTime() - 90 * 86400000).toISOString();

    const recent = dto.sessions.filter((s) => s.startsAt >= since && s.startsAt <= now);
    const marks = recent.flatMap((s) => s.attendance ?? []).filter((a) => a.studentId === student.id);
    const count = (status) => marks.filter((a) => a.status === status).length;
    const attended = count('present') + count('late');
    const attendance = {
      windowDays: 90,
      marked: marks.length,
      present: count('present'),
      late: count('late'),
      absent: count('absent'),
      excused: count('excused'),
      rate: pct(attended, marks.length),
    };

    const homeworkRows = api.listHomework(actor, { studentId: student.id });
    const homework = {
      total: homeworkRows.length,
      open: homeworkRows.filter((h) => h.open).length,
      submitted: homeworkRows.filter((h) => !h.open).length,
      next: homeworkRows.filter((h) => h.open).sort((a, b) => String(a.dueAt).localeCompare(String(b.dueAt)))[0] ?? null,
    };

    const objectives = new Map((state.objectives ?? []).map((o) => [o.id, o]));
    const goals = (state.learningGoals ?? [])
      .filter((g) => g.studentId === student.id)
      .map((g) => ({ id: g.id, status: g.status, createdAt: g.createdAt, title: objectives.get(g.objectiveId)?.title ?? null, titleAr: objectives.get(g.objectiveId)?.titleAr ?? null }));

    const levelName = (levelId) => (state.curriculumLevels ?? []).find((l) => l.id === levelId);
    const placementRows = (state.placements ?? [])
      .filter((p) => p.studentId === student.id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const placement = placementRows[0]
      ? {
          occurredAt: placementRows[0].occurredAt,
          outcome: placementRows[0].outcome,
          recommendedLevel: levelName(placementRows[0].recommendedLevelId)
            ? { name: levelName(placementRows[0].recommendedLevelId).name, nameAr: levelName(placementRows[0].recommendedLevelId).nameAr }
            : null,
          // Rubric detail and assessor notes stay with staff until the owner decides what families see.
          scores: staffView ? placementRows[0].scores : undefined,
          notes: staffView ? placementRows[0].notes ?? null : undefined,
        }
      : null;

    const completed = dto.sessions.filter((s) => s.status === 'completed');
    const lastReport = dto.sessions.map((s) => s.report && { sessionId: s.id, startsAt: s.startsAt, ...s.report }).find(Boolean) ?? null;
    const enrollment = (dto.enrollments ?? []).filter((e) => !e.endAt).at(-1) ?? (dto.enrollments ?? []).at(-1) ?? null;

    const events = (state.progressEvents ?? [])
      .filter((e) => e.studentId === student.id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, 10)
      .map((e) => ({ id: e.id, kind: e.kind ?? e.sourceType, occurredAt: e.occurredAt, summary: e.summary ?? null }));

    return {
      student: {
        id: student.id,
        name: student.name,
        nameAr: student.nameAr,
        level: student.level,
        goals: student.goals,
        strengths: student.strengths,
        improvements: student.improvements,
        academicStatus: student.academicStatus,
        timezone: student.timezone,
      },
      enrollment: enrollment ? { course: enrollment.course, level: enrollment.level, teacher: enrollment.teacher, startAt: enrollment.startAt ?? null, status: enrollment.status } : null,
      placement,
      goals,
      attendance,
      lessons: {
        completed: completed.length,
        lastCompletedAt: completed.map((s) => s.startsAt).sort().at(-1) ?? null,
        completedLast30: completed.filter((s) => s.startsAt >= new Date(clock().getTime() - 30 * 86400000).toISOString()).length,
      },
      homework,
      lastReport,
      events,
      hasLogin: Boolean(student.loginEnabled),
    };
  };
}
