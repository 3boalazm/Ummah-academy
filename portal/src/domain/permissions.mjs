/**
 * Access is decided here, then enforced again on every query and command.
 * Membership in a family is not a grant to every child, recording, or invoice.
 */

export function assignedStudentIds(state, teacherId) {
  const ids = new Set();
  for (const a of state.assignments) if (a.teacherId === teacherId) ids.add(a.studentId);
  return ids;
}

export function currentPrimary(state, studentId, enrollmentId = null) {
  const open = state.assignments.filter(
    (a) => a.studentId === studentId && a.kind === 'primary' && !a.endAt && (!enrollmentId || a.enrollmentId === enrollmentId),
  );
  return open.at(-1) ?? null;
}

export function guardianOf(state, actor) {
  if (!actor?.guardianId) return null;
  return state.guardians.find((g) => g.id === actor.guardianId) ?? null;
}

export function grantedStudentIds(state, actor) {
  const g = guardianOf(state, actor);
  if (!g) return new Set();
  return new Set(g.studentIds);
}

function studentResourceId(resource) {
  if (!resource) return null;
  if (resource.type === 'student') return resource.id;
  return resource.studentId ?? null;
}

export function can(actor, action, resource, state) {
  if (!actor || actor.status === 'disabled') return false;
  if (actor.role === 'admin') return true;
  if (actor.role === 'ops') return action !== 'demo.reset';

  if (
    action === 'audit.read' ||
    action === 'demo.reset' ||
    action === 'payment.write' ||
    action === 'subscription.write' ||
    action === 'student.write' ||
    action === 'session.create' ||
    action === 'teacher.assign' ||
    action === 'integrity.read' ||
    action === 'people.admin'
  ) {
    return false;
  }

  if (actor.role === 'teacher') return teacherCan(actor, action, resource, state);
  if (actor.role === 'guardian') return guardianCan(actor, action, resource, state);
  if (actor.role === 'student') return studentCan(actor, action, resource, state);
  return false;
}

function teacherCan(actor, action, resource, state) {
  const mine = assignedStudentIds(state, actor.teacherId);
  const sid = studentResourceId(resource);
  const teachesSession = resource?.teacherId && resource.teacherId === actor.teacherId;
  const current = sid ? currentPrimary(state, sid)?.teacherId === actor.teacherId : false;

  if (action === 'dashboard.read' || action === 'catalog.read' || action === 'notification.read' || action === 'session.list' || action === 'student.list') {
    return true;
  }
  if (action === 'teacher.read') return !resource?.id || resource.id === actor.teacherId;
  if (action === 'student.read') return Boolean(sid && mine.has(sid));
  if (action === 'session.read') return Boolean(teachesSession || (sid && current && mine.has(sid)));
  if (action === 'session.write' || action === 'session.report' || action === 'session.cancel') {
    return Boolean(teachesSession);
  }
  if (action === 'asset.read') return Boolean(sid && mine.has(sid));
  if (action === 'asset.write') {
    if (!sid || !mine.has(sid)) return false;
    if (!resource?.sessionId) return Boolean(current);
    const session = state.sessions.find((s) => s.id === resource.sessionId);
    return Boolean(session && session.teacherId === actor.teacherId && session.studentId === sid);
  }
  if (action === 'followup.read') {
    if (!resource) return false;
    if (resource.type === 'sales' || resource.type === 'subscription') return false;
    const isCurrent = Boolean(sid && currentPrimary(state, sid)?.teacherId === actor.teacherId);
    if (isCurrent) return true;
    return resource.teacherId === actor.teacherId;
  }
  if (action === 'subscription.read') return Boolean(sid && mine.has(sid));
  if (action === 'payment.read' || action === 'family.read' || action === 'audit.read') return false;
  return false;
}

function guardianCan(actor, action, resource, state) {
  const g = guardianOf(state, actor);
  if (!g) return false;
  const granted = grantedStudentIds(state, actor);
  const sid = studentResourceId(resource);
  const ownFamily = resource?.familyId ? resource.familyId === g.familyId : resource?.type === 'family' && resource.id === g.familyId;

  if (action === 'dashboard.read' || action === 'catalog.read' || action === 'notification.read' || action === 'session.list' || action === 'student.list' || action === 'followup.list') {
    return true;
  }
  if (action === 'family.read') return resource?.id === g.familyId || resource?.familyId === g.familyId;
  if (action === 'student.read') return Boolean(sid && granted.has(sid));
  if (action === 'session.read') return Boolean(sid && granted.has(sid));
  if (action === 'asset.read') return Boolean(g.canViewRecordings && sid && granted.has(sid));
  if (action === 'payment.read') return Boolean(g.canViewBilling && (ownFamily || (sid && granted.has(sid))));
  if (action === 'subscription.read') return Boolean(sid && granted.has(sid));
  if (action === 'followup.read') {
    if (resource?.visibility !== 'family') return false;
    if (resource.familyId && resource.familyId !== g.familyId) return false;
    if (resource.studentId && !granted.has(resource.studentId)) return false;
    return true;
  }
  if (action === 'followup.request') return true;
  if (action === 'teacher.read') return true;
  return false;
}

function studentCan(actor, action, resource) {
  const sid = actor.studentId;
  if (!sid) return false;
  if (action === 'dashboard.read' || action === 'catalog.read' || action === 'notification.read' || action === 'session.list' || action === 'student.list') return true;
  if (action === 'student.read') return resource?.id === sid || resource?.studentId === sid;
  if (action === 'session.read' || action === 'asset.read' || action === 'subscription.read') {
    return studentResourceId(resource) === sid;
  }
  if (action === 'teacher.read') return true;
  if (action === 'payment.read' || action === 'family.read' || action === 'followup.read' || action === 'audit.read') return false;
  return false;
}

export function assertCan(actor, action, resource, state, E) {
  if (!can(actor, action, resource, state)) throw E.forbidden();
}
