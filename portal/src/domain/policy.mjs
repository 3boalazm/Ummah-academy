/**
 * Session ledger policy — published promise, encoded once.
 *
 * Free reschedule with 24 hours' notice does not consume a credit.
 * A freeze keeps paid sessions; it does not zero the balance.
 * A scheduled session is not a delivered session.
 * Counting is always derived from records, never from a stored counter.
 */
export const POLICY = {
  rescheduleNoticeHours: 24,
  bufferMinutes: 5,
  cycleDays: 28,
  assetTokenTtlSec: 15 * 60,
  sessionTtlHours: 12,
};

const OPEN = new Set(['scheduled', 'confirmed']);

export function consumptionOf(session) {
  if (!session) return 0;
  if (session.status === 'completed') return session.countsTowardBalance === false ? 0 : 1;
  if (session.status === 'no_show') return session.noShowParty === 'student' ? 1 : 0;
  if (session.status === 'cancelled') {
    if (session.cancelledByRole === 'teacher' || session.cancelledByRole === 'admin' || session.cancelledByRole === 'ops') {
      return 0;
    }
    return session.lateCancel ? 1 : 0;
  }
  return 0;
}

export function consumptionReason(session) {
  const n = consumptionOf(session);
  if (session.status === 'completed' && n === 1) return { en: 'Delivered session', ar: 'حصة منعقدة' };
  if (session.status === 'completed') return { en: 'Completed but excluded by adjustment', ar: 'مكتملة ومستثناة بتسوية' };
  if (session.status === 'no_show' && n === 1) return { en: 'Student no-show consumes a credit', ar: 'غياب الطالب يُحتسب من الرصيد' };
  if (session.status === 'no_show') return { en: 'Teacher no-show does not consume', ar: 'غياب المعلم لا يُحتسب على الأسرة' };
  if (session.status === 'cancelled' && n === 1) return { en: 'Late family cancellation', ar: 'إلغاء متأخر من الأسرة' };
  if (session.status === 'cancelled') return { en: 'Cancellation within policy — not consumed', ar: 'إلغاء ضمن السياسة — غير محتسب' };
  if (session.status === 'rescheduled') return { en: 'Moved — the new session carries the credit', ar: 'أُعيد جدولتها — الرصيد على الموعد الجديد' };
  if (OPEN.has(session.status)) return { en: 'Not held yet — not consumed', ar: 'لم تُعقد بعد — لا تُخصم' };
  return { en: session.status, ar: session.status };
}

export function cycleBalance(cycle, sessions) {
  const adjustments = (cycle.adjustments ?? []).reduce((sum, a) => sum + a.delta, 0);
  const allocated = cycle.sessionsAllocated + adjustments;
  const mine = sessions.filter((s) => s.cycleId === cycle.id);
  const lines = mine.map((s) => ({
    sessionId: s.id,
    status: s.status,
    consumed: consumptionOf(s),
    ...consumptionReason(s),
  }));
  const delivered = lines.filter((l) => l.status === 'completed').reduce((s, l) => s + l.consumed, 0);
  const noShowConsumed = lines.filter((l) => l.status === 'no_show').reduce((s, l) => s + l.consumed, 0);
  const lateCancelConsumed = lines.filter((l) => l.status === 'cancelled').reduce((s, l) => s + l.consumed, 0);
  const consumed = delivered + noShowConsumed + lateCancelConsumed;
  const scheduledNotHeld = mine.filter((s) => OPEN.has(s.status)).length;
  return {
    cycleId: cycle.id,
    allocated,
    adjustments,
    delivered,
    noShowConsumed,
    lateCancelConsumed,
    consumed,
    remaining: allocated - consumed,
    scheduledNotHeld,
    notConsumed: mine.length - lines.filter((l) => l.consumed).length - scheduledNotHeld,
    lines,
    formulaEn:
      'remaining = allocated + adjustments − delivered − student no-shows − late family cancellations. Scheduled sessions are not subtracted.',
    formulaAr:
      'المتبقي = المخصص + التسويات − الحصص المنعقدة − غياب الطالب − الإلغاء المتأخر. الحصص المجدولة لا تُخصم.',
  };
}

export function sumBalances(balances) {
  return balances.reduce(
    (acc, b) => {
      for (const k of ['allocated', 'delivered', 'noShowConsumed', 'lateCancelConsumed', 'consumed', 'remaining', 'scheduledNotHeld']) {
        acc[k] += b[k];
      }
      return acc;
    },
    { allocated: 0, delivered: 0, noShowConsumed: 0, lateCancelConsumed: 0, consumed: 0, remaining: 0, scheduledNotHeld: 0 },
  );
}

export function isLateCancel(now, startsAt, noticeHours = POLICY.rescheduleNoticeHours) {
  return new Date(startsAt).getTime() - now.getTime() < noticeHours * 60 * 60 * 1000;
}

export function findHardConflicts(sessions, candidate, bufferMin = POLICY.bufferMinutes) {
  const start = new Date(candidate.startsAt);
  const end = new Date(candidate.endsAt);
  const hits = [];
  for (const other of sessions) {
    if (other.id === candidate.id) continue;
    if (other.status !== 'scheduled' && other.status !== 'confirmed') continue;
    if (!rangesOverlapSafe(start, end, new Date(other.startsAt), new Date(other.endsAt), bufferMin)) continue;
    if (other.teacherId === candidate.teacherId) hits.push({ sessionId: other.id, kind: 'teacher', studentId: other.studentId });
    else if (other.studentId === candidate.studentId) hits.push({ sessionId: other.id, kind: 'student', teacherId: other.teacherId });
  }
  return hits;
}

function rangesOverlapSafe(aStart, aEnd, bStart, bEnd, bufferMin) {
  const buf = bufferMin * 60 * 1000;
  return aStart.getTime() < bEnd.getTime() + buf && bStart.getTime() < aEnd.getTime() + buf;
}

/** Sibling overlap is a warning, not a block — two children may be taught at once. */
export function findFamilyOverlaps(sessions, bufferMin = POLICY.bufferMinutes) {
  const open = sessions.filter((s) => s.status === 'scheduled' || s.status === 'confirmed');
  const out = [];
  for (let i = 0; i < open.length; i++) {
    for (let j = i + 1; j < open.length; j++) {
      const a = open[i];
      const b = open[j];
      if (a.studentId === b.studentId) continue;
      if (!rangesOverlapSafe(new Date(a.startsAt), new Date(a.endsAt), new Date(b.startsAt), new Date(b.endsAt), bufferMin)) continue;
      out.push({ a: a.id, b: b.id, studentA: a.studentId, studentB: b.studentId });
    }
  }
  return out;
}
