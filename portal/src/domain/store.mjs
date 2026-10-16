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
import { addMs } from './time.mjs';

const DEMO_PASSWORDS = new Set(Object.values(DEMO_PASSWORD));

const SECRET_KEY = /password|secret|token|cvv|card|pan/i;
const OPEN = new Set(['scheduled', 'confirmed']);

export function createStore(options = {}) {
  const clock = options.now ?? (() => new Date());
  const secret = options.secret ?? 'dev-portal-secret-change-me';
  const onCommit = options.onCommit ?? (() => {});
  let state = structuredClone(options.state ?? buildSeed(clock()));
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

  function replay(actor, key) {
    if (!key) return null;
    const hit = state.idempotency.find((i) => i.key === key && i.actorId === actor.id);
    return hit ? structuredClone(hit.result) : null;
  }

  function command(actor, key, fn) {
    const hit = replay(actor, key);
    if (hit) return { ...hit, replayed: true };
    const snapshot = structuredClone(state);
    try {
      const result = fn();
      if (key) {
        state.idempotency.push({
          key,
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
      report: report ? { ...report } : null,
      assets,
      pendingReport: session.status === 'completed' && (!report || report.status !== 'submitted'),
      actions: {
        confirm: OPEN.has(session.status) && can(actor, 'session.write', session, state),
        attend: can(actor, 'session.write', session, state) && session.status !== 'cancelled' && session.status !== 'rescheduled',
        complete: OPEN.has(session.status) && can(actor, 'session.write', session, state),
        report: session.status === 'completed' && can(actor, 'session.report', session, state),
        cancel: OPEN.has(session.status) && can(actor, 'session.cancel', session, state),
        reschedule: OPEN.has(session.status) && can(actor, 'session.create', null, state),
        substitute: OPEN.has(session.status) && can(actor, 'teacher.assign', null, state),
        room: OPEN.has(session.status),
      },
      revealsMoney: money,
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
    const upcoming = sessions.filter((s) => OPEN.has(s.status) && s.startsAt >= nowIso && s.startsAt <= in24);
    const overdue = state.followUps.filter((f) => ['open', 'in_progress', 'waiting'].includes(f.status) && f.dueAt && f.dueAt < nowIso);
    const renewals = state.cycles.filter((c) => c.status === 'active' && c.end >= nowIso && c.end <= in14);
    const trials = students.filter((s) => s.academicStatus === 'trial');
    const active = students.filter((s) => s.academicStatus === 'active');
    const failedPays = state.payments.filter((p) => p.status === 'failed');
    const metric = (id, value, href, rows) => ({ id, value, href, ids: rows.map((r) => r.id) });
    return {
      role: actor.role,
      metrics: [
        metric('active_students', active.length, '/app/students?status=active', active),
        metric('trials', trials.length, '/app/students?status=trial', trials),
        metric('upcoming_sessions', upcoming.length, '/app/schedule?window=24h', upcoming),
        metric('pending_reports', pending.length, '/app/schedule?pendingReport=1', pending),
        metric('overdue_followups', overdue.length, '/app/follow-ups?overdue=1', overdue),
        metric('renewals_14d', renewals.length, '/app/subscriptions?renewing=14', renewals),
        metric('failed_payments', failedPays.length, '/app/subscriptions?payment=failed', failedPays),
      ],
      queues: {
        pendingReports: pending.slice(0, 8).map((s) => decorateSession(s, actor)),
        overdueFollowUps: overdue.slice(0, 8).map(followDto),
        upcoming: upcoming.slice(0, 8).map((s) => decorateSession(s, actor)),
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
        { id: 'today', value: today.length, href: '/app/schedule?mine=1', ids: today.map((s) => s.id) },
        { id: 'students', value: students.length, href: '/app/students', ids: students.map((s) => s.id) },
        { id: 'pending_reports', value: pending.length, href: '/app/schedule?pendingReport=1', ids: pending.map((s) => s.id) },
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
        { id: 'children', value: hub.children.length, href: `/app/families/${family.id}`, ids: hub.children.map((c) => c.id) },
        { id: 'upcoming', value: hub.sessions.filter((s) => OPEN.has(s.status) && s.startsAt >= clock().toISOString()).length, href: '/app/schedule', ids: [] },
        { id: 'recent_reports', value: unreadReports.length, href: `/app/families/${family.id}?tab=progress`, ids: unreadReports.map((s) => s.id) },
        { id: 'open_followups', value: hub.followUps.filter((f) => !['resolved', 'closed'].includes(f.status)).length, href: `/app/families/${family.id}?tab=followups`, ids: [] },
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
      homework: dto.progress.reports.filter((r) => r.homework).slice(0, 3),
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
        const durationMin = Number(input.durationMin || planBrief(sub.planId)?.minutes || 30);
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
        if (!['present', 'late', 'absent', 'excused'].includes(input.status)) throw E.validation('Unknown attendance status.', 'حالة الحضور غير معروفة.');
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
        if (input.attendance) {
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
        const before = existing ? { summary: existing.summary, status: existing.status } : null;
        const row = existing ?? { id: id('rpt'), sessionId: session.id, studentId: session.studentId, teacherId: session.teacherId };
        Object.assign(row, {
          status: 'submitted',
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
        audit(actor, 'report.submitted', 'session', session.id, before, { summary: row.summary }, null, meta.requestId);
        event(actor, 'report.submitted', { studentId: session.studentId, familyId: session.familyId, entityType: 'session', entityId: session.id, summary: 'Report submitted', summaryAr: 'رُفع تقرير الحصة' });
        for (const g of state.guardians.filter((g) => g.studentIds.includes(session.studentId))) {
          notify(g.userId, 'A lesson report is ready', 'تقرير الحصة جاهز', row.summary, row.summaryAr, `/app/sessions/${session.id}`);
        }
        const internal = state.followUps.find((f) => f.sessionId === session.id && f.type === 'teacher_ops' && !['resolved', 'closed'].includes(f.status));
        if (internal) {
          internal.status = 'resolved';
          internal.outcome = 'Report submitted.';
          internal.outcomeAr = 'رُفع التقرير.';
          internal.closedAt = clock().toISOString();
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
        const assigneeId = input.assigneeId || IDS.ops;
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
          assigneeId: IDS.ops,
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
        notify(IDS.ops, 'Family request', 'طلب من الأسرة', row.title, row.titleAr, `/app/follow-ups/${row.id}`);
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
    readToken: (token) => readAssetToken(token, secret, clock().getTime()),
  });
  return api;
}
