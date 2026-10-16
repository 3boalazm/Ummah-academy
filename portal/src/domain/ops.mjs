/**
 * Operations that sit on the ledger: enrolment, local-time series,
 * a WhatsApp draft queue (never an automatic send), invoices and CSV.
 * Delivery by a provider is not claimed.
 */
import { hashPassword } from './auth.mjs';
import { E } from './errors.mjs';
import { id } from './ids.mjs';
import { IDS } from './seed.mjs';
import { findHardConflicts, POLICY } from './policy.mjs';
import { localParts, zonedLocalToUtc } from './time.mjs';

export const ACADEMY_WA_DISPLAY = '+971 50 276 0242';

export function normalizePhone(raw) {
  if (raw == null || String(raw).trim() === '') return null;
  let digits = String(raw).trim().replace(/[\s()-]/g, '');
  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  if (!digits.startsWith('+')) digits = `+${digits.replace(/\D/g, '')}`;
  else digits = `+${digits.slice(1).replace(/\D/g, '')}`;
  if (!/^\+[1-9]\d{7,14}$/.test(digits)) return null;
  return digits;
}

const ACADEMY_SENDER = '+971502760242';

export function isAcademySender(phone) {
  return normalizePhone(phone) === ACADEMY_SENDER;
}

export function waDraftLink(phone, text) {
  const normalized = normalizePhone(phone);
  if (!normalized || normalized === ACADEMY_SENDER) return null;
  return `https://wa.me/${normalized.slice(1)}?text=${encodeURIComponent(text)}`;
}

/** Bytes decide the type. A video labeled as text is still rejected. */
export function sniffUpload(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 4 || buf.length > 1_000_000) return null;
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  const head = buf.subarray(0, Math.min(buf.length, 32)).toString('latin1');
  if (head.includes('ftyp') || buf[0] === 0x1a) return null;
  if (buf.includes(0)) return null;
  return 'text/plain';
}

export function addLocalWeeks(iso, weeks, timeZone) {
  const parts = localParts(new Date(iso), timeZone);
  const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + weeks * 7));
  return zonedLocalToUtc(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth() + 1,
    shifted.getUTCDate(),
    parts.hour,
    parts.minute,
    timeZone,
  );
}

function csvCell(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(','), ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(','))];
  return `\uFEFF${lines.join('\n')}\n`;
}

function invoiceFrom(payment) {
  return {
    id: `inv_${payment.id}`,
    paymentId: payment.id,
    number: `UA-${String(payment.id).replace(/[^a-z0-9]/gi, '').slice(-8).toUpperCase()}`,
    familyId: payment.familyId,
    subscriptionId: payment.subscriptionId,
    studentId: payment.studentId ?? null,
    amount: payment.amount,
    currency: payment.currency || 'USD',
    status: payment.status === 'paid' ? 'issued' : payment.status,
    issuedAt: payment.paidAt || payment.createdAt,
    noteEn: 'Ledger invoice derived from the payment record. Not a tax document and not a card charge.',
    noteAr: 'فاتورة دفترية مأخوذة من سجل الدفع. ليست مستندًا ضريبيًا ولا عملية خصم بطاقة.',
  };
}

export function attachOps(api, bag) {
  const { clock, allow, command, audit, event, notify, must, byId, requireReason } = bag;
  const stateOf = () => bag.state;

  function ensure(state) {
    state.outbox ??= [];
    for (const g of state.guardians) g.phone ??= null;
    for (const row of state.outbox) {
      row.attempts ??= [];
      const guardian = state.guardians.find((g) => g.userId === row.toUserId);
      const consent = guardian?.whatsappConsent || 'unknown';
      // Old queued records are not evidence of consent. Fail closed on upgrade.
      if (consent !== 'opted_in' && ['queued', 'opened', 'attempted'].includes(row.status)) {
        row.status = consent === 'opted_out' ? 'cancelled' : 'needs_consent';
        row.waUrl = null;
        row.deliveryConfirmed = false;
      }
      if (consent === 'opted_in' && row.status === 'needs_consent') {
        row.status = row.phone ? 'queued' : 'needs_phone';
        row.waUrl = row.phone ? waDraftLink(row.phone, row.bodyAr || row.body) : null;
      }
    }
  }

  function blankSession(partial) {
    return {
      durationMin: 30,
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
      createdAt: clock().toISOString(),
      ...partial,
    };
  }

  api.enrollFamily = (actor, input, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      ensure(state);
      allow(actor, 'people.admin', null);
      const reason = requireReason(input.reason || 'New family enrolment');
      const email = String(input.email || '').trim().toLowerCase();
      if (!email.includes('@')) throw E.validation('A guardian email is required.', 'بريد ولي الأمر مطلوب.');
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        throw E.validation('That email is already a user.', 'هذا البريد مستخدم بالفعل.');
      }
      if (!input.password || String(input.password).length < 8) {
        throw E.validation('Password must be at least 8 characters.', 'كلمة المرور ٨ أحرف على الأقل.');
      }
      const course = must(state.courses, input.courseId);
      const teacher = must(state.teachers, input.teacherId);
      const timezone = input.timezone || 'Africa/Cairo';
      const phone = input.phone ? normalizePhone(input.phone) : null;
      if (input.phone && !phone) throw E.validation('Phone must be international, like +201000000000.', 'الهاتف يجب أن يكون دوليًا، مثل +201000000000.');
      if (isAcademySender(phone)) throw E.validation('That number is the academy WhatsApp sender, not a family phone.', 'هذا رقم واتساب الأكاديمية المُرسِل، وليس هاتف أسرة.');
      const birthYear = Number(input.birthYear);
      if (!Number.isInteger(birthYear) || birthYear < 1980 || birthYear > clock().getUTCFullYear()) {
        throw E.validation('Birth year is not usable.', 'سنة الميلاد غير صالحة.');
      }
      const nowIso = clock().toISOString();
      const familyId = id('fam');
      const studentId = id('stu');
      const userId = id('usr');
      const guardianId = id('grd');
      const enrollmentId = id('enr');
      const subId = id('sub');
      const cycleId = id('cyc');
      state.families.push({
        id: familyId,
        name: String(input.familyName || input.guardianName).trim(),
        nameAr: String(input.familyNameAr || input.guardianNameAr || input.familyName || '').trim(),
        timezone,
        country: input.country || '',
        city: input.city || '',
        status: 'new',
        joinedAt: nowIso,
        phone,
      });
      state.users.push({
        id: userId,
        role: 'guardian',
        email,
        passwordHash: hashPassword(String(input.password)),
        name: String(input.guardianName).trim(),
        nameAr: String(input.guardianNameAr || input.guardianName).trim(),
        timezone,
        locale: 'ar',
        status: 'active',
        teacherId: null,
        studentId: null,
        guardianId,
        familyId,
      });
      state.guardians.push({
        id: guardianId,
        familyId,
        userId,
        name: String(input.guardianName).trim(),
        nameAr: String(input.guardianNameAr || input.guardianName).trim(),
        relation: input.relation || 'guardian',
        studentIds: [studentId],
        verified: false,
        canViewBilling: true,
        canViewRecordings: true,
        email,
        phone,
      });
      state.students.push({
        id: studentId,
        familyId,
        userId: null,
        name: String(input.studentName).trim(),
        nameAr: String(input.studentNameAr || input.studentName).trim(),
        birthYear,
        timezone,
        country: input.country || '',
        language: 'ar',
        academicStatus: 'trial',
        portalVisible: true,
        loginEnabled: false,
        level: input.level || 'Trial',
        goals: input.goals || 'Complete the two trial lessons.',
        strengths: '',
        improvements: '',
      });
      state.enrollments.push({
        id: enrollmentId,
        studentId,
        courseId: course.id,
        level: input.level || 'Trial',
        startAt: nowIso,
        endAt: null,
        status: 'trial',
        teacherId: teacher.id,
      });
      state.assignments.push({
        id: id('asg'),
        studentId,
        enrollmentId,
        teacherId: teacher.id,
        kind: 'primary',
        startAt: nowIso,
        endAt: null,
        reason,
        createdBy: actor.id,
      });
      state.subscriptions.push({
        id: subId,
        studentId,
        familyId,
        planId: 'launch',
        courseId: course.id,
        status: 'trial',
        createdBy: actor.id,
        createdAt: nowIso,
      });
      const end = new Date(clock().getTime() + POLICY.cycleDays * 86400000).toISOString();
      state.cycles.push({
        id: cycleId,
        subscriptionId: subId,
        planId: 'launch',
        start: nowIso,
        end,
        sessionsAllocated: 2,
        status: 'active',
        priceUsd: 0,
        adjustments: [],
        frozenAt: null,
        freezeReason: null,
        resumedAt: null,
        cancelledAt: null,
        cancelReason: null,
        createdBy: actor.id,
      });
      const follow = {
        id: id('fu'),
        level: 'student',
        type: 'sales',
        visibility: 'family',
        familyId,
        studentId,
        teacherId: teacher.id,
        subscriptionId: subId,
        sessionId: null,
        title: `Convert ${input.studentName}'s trial`,
        titleAr: `تحويل تجربة ${input.studentNameAr || input.studentName}`,
        status: 'open',
        priority: 'normal',
        assigneeId: IDS.ops,
        dueAt: new Date(clock().getTime() + 3 * 86400000).toISOString(),
        outcome: null,
        outcomeAr: null,
        createdBy: actor.id,
        createdAt: nowIso,
        closedAt: null,
      };
      state.followUps.push(follow);
      audit(actor, 'family.enrolled', 'family', familyId, null, { studentId, email, phone, sessionsAllocated: 2 }, reason, meta.requestId);
      event(actor, 'family.joined', {
        studentId,
        familyId,
        entityType: 'family',
        entityId: familyId,
        summary: 'Family enrolled on a two-lesson trial',
        summaryAr: 'سُجّلت الأسرة على تجربتين',
      });
      notify(IDS.ops, 'New trial family', 'أسرة تجريبية جديدة', follow.title, follow.titleAr, `/app/families/${familyId}`);
      return { familyId, studentId, guardianId, userId, subscriptionId: subId, cycleId, followUpId: follow.id, loginEnabled: false, sessionsAllocated: 2 };
    });

  api.createSeries = (actor, input, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      ensure(state);
      allow(actor, 'session.create', null);
      const count = Number(input.count || 1);
      if (!Number.isInteger(count) || count < 1 || count > 12) {
        throw E.validation('A series is 1 to 12 lessons.', 'السلسلة من حصة إلى ١٢.');
      }
      const student = must(state.students, input.studentId);
      const sub = state.subscriptions.find((s) => s.studentId === student.id && (s.status === 'active' || s.status === 'trial'));
      if (!sub) throw E.frozen();
      if (state.cycles.some((c) => c.subscriptionId === sub.id && c.status === 'frozen')) throw E.frozen();
      const enrollment = state.enrollments.find((e) => e.studentId === student.id && e.status !== 'ended');
      if (!enrollment) throw E.validation('Enrollment required.', 'التسجيل في كورس مطلوب.');
      const teacherId = input.teacherId || enrollment.teacherId;
      if (!byId(state.teachers, teacherId)) throw E.validation('Teacher required.', 'المعلم مطلوب.');
      const cycle = state.cycles.find((c) => c.subscriptionId === sub.id && c.status === 'active');
      if (!cycle) throw E.validation('No active cycle.', 'لا توجد فترة سارية.');
      const timeZone = input.timeZone || student.timezone;
      const first = new Date(input.startsAt);
      if (Number.isNaN(first.getTime())) throw E.validation('Invalid start time.', 'موعد البداية غير صالح.');
      const durationMin = Number(input.durationMin || 30);
      const created = [];
      for (let i = 0; i < count; i++) {
        const starts = i === 0 ? first : addLocalWeeks(first.toISOString(), i, timeZone);
        const session = blankSession({
          id: id('ses'),
          studentId: student.id,
          familyId: student.familyId,
          enrollmentId: enrollment.id,
          subscriptionId: sub.id,
          cycleId: cycle.id,
          courseId: enrollment.courseId,
          teacherId,
          startsAt: starts.toISOString(),
          endsAt: new Date(starts.getTime() + durationMin * 60000).toISOString(),
          durationMin,
          createdBy: actor.id,
        });
        const hits = findHardConflicts(state.sessions, session);
        if (hits.length) throw E.conflict({ conflicts: hits, index: i });
        state.sessions.push(session);
        created.push({ id: session.id, startsAt: session.startsAt });
      }
      audit(actor, 'session.series_created', 'student', student.id, null, { count, ids: created.map((s) => s.id) }, input.reason || null, meta.requestId);
      return { sessions: created, timeZone };
    });

  api.setGuardianPhone = (actor, guardianId, input, meta = {}) =>
    command(actor, null, () => {
      const state = stateOf();
      ensure(state);
      const guardian = must(state.guardians, guardianId);
      const self = actor.guardianId === guardian.id;
      if (!self) allow(actor, 'people.admin', null);
      const reason = requireReason(input.reason || 'Update contact phone');
      const phone = input.phone ? normalizePhone(input.phone) : null;
      if (input.phone && !phone) throw E.validation('Phone must be international, like +201000000000.', 'الهاتف يجب أن يكون دوليًا.');
      if (isAcademySender(phone)) throw E.validation('That number is the academy WhatsApp sender, not a family phone.', 'هذا رقم واتساب الأكاديمية المُرسِل، وليس هاتف أسرة.');
      const before = guardian.phone;
      guardian.phone = phone;
      const family = byId(state.families, guardian.familyId);
      if (family && (actor.role === 'admin' || actor.role === 'ops')) family.phone = phone;
      for (const row of state.outbox.filter((item) => item.toUserId === guardian.userId && ['needs_phone', 'queued'].includes(item.status))) {
        row.phone = phone;
        row.waUrl = guardian.whatsappConsent === 'opted_in' && phone ? waDraftLink(phone, row.bodyAr || row.body) : null;
        if (guardian.whatsappConsent !== 'opted_in') row.status = 'needs_consent';
        else row.status = phone ? 'queued' : 'needs_phone';
      }
      audit(actor, 'guardian.phone_changed', 'guardian', guardian.id, { phone: before }, { phone }, reason, meta.requestId);
      return { id: guardian.id, phone };
    });

  api.setGuardianMessagingConsent = (actor, guardianId, input, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      ensure(state);
      const guardian = must(state.guardians, guardianId);
      const self = actor.guardianId === guardian.id;
      if (!self) allow(actor, 'people.admin', null);
      const status = input.status;
      if (!['opted_in', 'opted_out', 'unknown'].includes(status)) {
        throw E.validation('Unknown WhatsApp consent status.', 'حالة موافقة واتساب غير معروفة.');
      }
      const source = self ? 'guardian_portal' : input.source;
      if (!['guardian_portal', 'signed_form', 'recorded_verbal', 'support_request'].includes(source)) {
        throw E.validation('A valid consent source is required.', 'مصدر الموافقة مطلوب.');
      }
      if (status === 'opted_in' && source === 'support_request') {
        throw E.validation('A support request cannot establish opt-in consent.', 'طلب الدعم لا يثبت الموافقة على الاشتراك.');
      }
      const reason = requireReason(input.reason || (self ? 'Guardian updated WhatsApp preference' : ''));
      if (status === 'opted_in' && !self && !['signed_form', 'recorded_verbal'].includes(source)) {
        throw E.validation('Opt-in must be backed by a signed form or recorded verbal consent.', 'يجب توثيق الموافقة بنموذج موقّع أو موافقة شفهية مسجلة.');
      }
      const before = {
        whatsappConsent: guardian.whatsappConsent || 'unknown',
        consentSource: guardian.consentSource || null,
        consentAt: guardian.consentAt || null,
      };
      guardian.whatsappConsent = status;
      guardian.consentSource = source;
      guardian.consentAt = status === 'unknown' ? null : clock().toISOString();
      guardian.consentRecordedBy = actor.id;
      guardian.consentReason = reason;
      for (const row of state.outbox.filter((item) => item.toUserId === guardian.userId)) {
        row.attempts ??= [];
        if (status === 'opted_out') {
          if (!['sent', 'delivered', 'cancelled'].includes(row.status)) {
            row.status = 'cancelled';
            row.waUrl = null;
            row.cancelledAt = clock().toISOString();
            row.cancelReason = 'Recipient opted out';
            row.attempts.push({ at: clock().toISOString(), actorId: actor.id, from: 'consent-change', to: 'cancelled', reason: 'Recipient opted out' });
          }
        } else if (status === 'unknown') {
          if (['queued', 'opened', 'attempted'].includes(row.status)) {
            row.status = 'needs_consent';
            row.waUrl = null;
          }
        } else if (status === 'opted_in' && row.status === 'needs_consent') {
          row.status = row.phone ? 'queued' : 'needs_phone';
          row.waUrl = row.phone ? waDraftLink(row.phone, row.bodyAr || row.body) : null;
        }
      }
      audit(actor, 'guardian.whatsapp_consent_changed', 'guardian', guardian.id, before, {
        whatsappConsent: status, consentSource: source, consentAt: guardian.consentAt,
      }, reason, meta.requestId);
      return {
        id: guardian.id,
        whatsappConsent: guardian.whatsappConsent,
        consentSource: guardian.consentSource,
        consentAt: guardian.consentAt,
      };
    });

  api.listOutbox = (actor) => {
    const state = stateOf();
    ensure(state);
    allow(actor, 'people.admin', null);
    return state.outbox
      .slice()
      .reverse()
      .map((row) => ({
        ...row,
        attempts: (row.attempts || []).map((attempt) => ({ ...attempt })),
        deliveryConfirmed: row.status === 'delivered' && Boolean(row.deliveryEvidence),
        noteAr: 'مسودة يدوية. لا يتم الإرسال آليًا؛ الوصول لا يُؤكَّد إلا بدليل موثّق.',
        noteEn: 'Manual draft only. Nothing is sent automatically; delivery is confirmed only with recorded evidence.',
      }));
  };

  api.generateDrafts = (actor, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      ensure(state);
      allow(actor, 'people.admin', null);
      const now = clock();
      const until = new Date(now.getTime() + 24 * 3600 * 1000);
      const renewUntil = new Date(now.getTime() + 14 * 86400000);
      let created = 0;
      const push = (row) => {
        const key = `${row.kind}:${row.relatedId}:${row.toUserId || 'none'}`;
        if (state.outbox.some((o) => o.dedupeKey === key && o.status !== 'cancelled')) return;
        const recipient = state.guardians.find((g) => g.userId === row.toUserId);
        if (!recipient || recipient.whatsappConsent === 'opted_out') return;
        const consent = recipient.whatsappConsent || 'unknown';
        const status = consent !== 'opted_in' ? 'needs_consent' : row.phone ? 'queued' : 'needs_phone';
        state.outbox.push({
          ...row,
          id: id('out'),
          dedupeKey: key,
          status,
          waUrl: status === 'queued' ? waDraftLink(row.phone, row.bodyAr || row.body) : null,
          attempts: [],
          createdAt: now.toISOString(),
          sentAt: null,
          deliveryConfirmed: false,
        });
        created += 1;
      };
      for (const session of state.sessions) {
        if (session.status !== 'scheduled' && session.status !== 'confirmed') continue;
        const start = new Date(session.startsAt);
        if (start < now || start > until) continue;
        const student = byId(state.students, session.studentId);
        if (!student) continue;
        const guardians = state.guardians.filter((g) => g.studentIds.includes(student.id));
        for (const g of guardians) {
          const when = new Intl.DateTimeFormat('ar-EG', { timeZone: student.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit' }).format(start);
          const text = `تذكير من أكاديمية الأمة: حصة ${student.nameAr || student.name} ${when}. هذه مسودة ولم تُرسل تلقائيًا.`;
          push({
            kind: 'reminder',
            relatedId: session.id,
            studentId: student.id,
            familyId: student.familyId,
            toUserId: g.userId,
            phone: g.phone,
            body: text,
            bodyAr: text,
            waUrl: waDraftLink(g.phone, text),
            senderDisplay: ACADEMY_WA_DISPLAY,
          });
        }
      }
      for (const cycle of state.cycles) {
        if (cycle.status !== 'active') continue;
        const end = new Date(cycle.end);
        if (end < now || end > renewUntil) continue;
        const sub = byId(state.subscriptions, cycle.subscriptionId);
        if (!sub || sub.status === 'cancelled') continue;
        const student = byId(state.students, sub.studentId);
        const guardians = state.guardians.filter((g) => g.canViewBilling && g.studentIds.includes(sub.studentId));
        for (const g of guardians) {
          const text = `تذكير من أكاديمية الأمة: اشتراك ${student?.nameAr || student?.name || ''} يقترب من نهايته. هذه مسودة ولم تُرسل تلقائيًا.`;
          push({
            kind: 'renewal',
            relatedId: sub.id,
            studentId: sub.studentId,
            familyId: sub.familyId,
            toUserId: g.userId,
            phone: g.phone,
            body: text,
            bodyAr: text,
            waUrl: waDraftLink(g.phone, text),
            senderDisplay: ACADEMY_WA_DISPLAY,
          });
        }
      }
      audit(actor, 'outbox.drafts_generated', 'outbox', 'batch', null, { created }, null, meta.requestId);
      return { created };
    });

  api.markOutbox = (actor, outboxId, input, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      ensure(state);
      allow(actor, 'people.admin', null);
      const row = must(state.outbox, outboxId);
      const next = input.status;
      if (!['opened', 'attempted', 'sent', 'failed', 'delivered', 'cancelled'].includes(next)) {
        throw E.validation('Unknown outbox status.', 'حالة غير معروفة.');
      }
      const recipient = state.guardians.find((g) => g.userId === row.toUserId);
      const consent = recipient?.whatsappConsent || 'unknown';
      if (['opened', 'attempted', 'sent', 'delivered'].includes(next) && consent !== 'opted_in') {
        throw E.badState('Recipient has not opted in to WhatsApp messages.', 'المستلم لم يوافق على رسائل واتساب.');
      }
      if (['opened', 'attempted', 'sent', 'delivered'].includes(next) && (!row.phone || !waDraftLink(row.phone, row.bodyAr || row.body))) {
        throw E.badState('A valid recipient phone is required.', 'رقم هاتف صالح للمستلم مطلوب.');
      }
      const transitions = {
        needs_consent: ['cancelled'],
        needs_phone: ['cancelled'],
        queued: ['opened', 'attempted', 'cancelled'],
        opened: ['attempted', 'sent', 'failed', 'cancelled'],
        attempted: ['sent', 'failed', 'cancelled'],
        failed: ['attempted', 'cancelled'],
        sent: ['delivered'],
        delivered: [],
        cancelled: [],
      };
      if (!(transitions[row.status] || []).includes(next)) {
        throw E.badState(`Cannot move a message from ${row.status} to ${next}.`, 'انتقال حالة الرسالة غير مسموح.');
      }
      const reason = ['attempted', 'sent', 'failed', 'delivered', 'cancelled'].includes(next)
        ? requireReason(input.reason || '')
        : (input.reason || null);
      if (next === 'delivered' && (!input.deliveryEvidence || String(input.deliveryEvidence).trim().length < 4)) {
        throw E.validation('Delivery evidence is required to confirm delivery.', 'دليل الوصول مطلوب لتأكيد التسليم.');
      }
      const before = row.status;
      const at = clock().toISOString();
      row.attempts ??= [];
      row.attempts.push({
        at,
        actorId: actor.id,
        from: before,
        to: next,
        reason,
        deliveryEvidence: next === 'delivered' ? String(input.deliveryEvidence).trim() : null,
      });
      row.status = next;
      row.lastAttemptAt = ['attempted', 'failed'].includes(next) ? at : row.lastAttemptAt || null;
      if (next === 'sent') {
        row.sentAt = at;
        row.sentBy = actor.id;
        row.deliveryConfirmed = false;
      }
      if (next === 'failed') {
        row.failureReason = reason;
        row.failedAt = at;
      }
      if (next === 'delivered') {
        row.deliveredAt = at;
        row.deliveryEvidence = String(input.deliveryEvidence).trim();
        row.deliveryConfirmed = true;
      }
      if (next === 'cancelled') {
        row.cancelledAt = at;
        row.cancelReason = reason;
        row.waUrl = null;
      }
      audit(actor, 'outbox.transitioned', 'outbox', row.id, { status: before }, {
        status: next, deliveryConfirmed: row.status === 'delivered' && Boolean(row.deliveryEvidence),
      }, reason, meta.requestId);
      return row;
    });

  api.listInvoices = (actor) => {
    const state = stateOf();
    allow(actor, 'payment.read', { type: 'payment', familyId: actor.familyId, studentId: actor.studentId });
    return state.payments
      .filter((p) => actor.role === 'admin' || actor.role === 'ops' || p.familyId === actor.familyId)
      .map((p) => ({ ...invoiceFrom(p), studentId: state.subscriptions.find((s) => s.id === p.subscriptionId)?.studentId ?? null }));
  };

  api.exportCsv = (actor, kind) => {
    const state = stateOf();
    ensure(state);
    allow(actor, 'people.admin', null);
    if (kind === 'students') {
      const headers = ['id', 'name', 'nameAr', 'academicStatus', 'loginEnabled', 'timezone', 'familyId'];
      const rows = state.students.map((s) => ({ ...s, loginEnabled: s.loginEnabled ? 'yes' : 'no' }));
      return { filename: 'students.csv', csv: toCsv(headers, rows) };
    }
    if (kind === 'sessions') {
      const headers = ['id', 'studentId', 'teacherId', 'startsAt', 'status', 'cycleId'];
      return { filename: 'sessions.csv', csv: toCsv(headers, state.sessions) };
    }
    if (kind === 'followups') {
      const headers = ['id', 'title', 'status', 'assigneeId', 'dueAt', 'studentId', 'outcome'];
      return { filename: 'followups.csv', csv: toCsv(headers, state.followUps) };
    }
    if (kind === 'invoices') {
      const headers = ['number', 'paymentId', 'familyId', 'amount', 'currency', 'status', 'issuedAt'];
      const rows = state.payments.map(invoiceFrom);
      return { filename: 'invoices.csv', csv: toCsv(headers, rows) };
    }
    throw E.validation('Unknown export.', 'تصدير غير معروف.');
  };

  api.registerUpload = (actor, input, meta = {}) =>
    command(actor, meta.idempotencyKey, () => {
      const state = stateOf();
      const student = must(state.students, input.studentId);
      allow(actor, 'asset.write', { type: 'asset', id: 'new', studentId: student.id, sessionId: input.sessionId || null });
      const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
      if (!allowed.includes(input.mime)) throw E.validation('Only PDF, PNG, JPEG or plain text.', 'المسموح: PDF أو PNG أو JPEG أو نص.');
      const assetId = id('ast');
      const asset = {
        id: assetId,
        type: 'homework',
        studentId: student.id,
        sessionId: input.sessionId || null,
        courseId: input.courseId || null,
        ownerId: actor.id,
        status: 'ready',
        title: String(input.filename || 'file').slice(0, 120),
        titleAr: String(input.filename || 'ملف').slice(0, 120),
        mime: input.mime,
        storageKey: `file:${assetId}`,
        createdAt: clock().toISOString(),
        retentionUntil: new Date(clock().getTime() + 365 * 86400000).toISOString(),
        deletedAt: null,
      };
      state.assets.push(asset);
      audit(actor, 'asset.uploaded', 'asset', assetId, null, { studentId: student.id, mime: input.mime }, null, meta.requestId);
      return { id: assetId, storageKey: asset.storageKey };
    });

  api.assetDownload = (actor, assetId, token) => {
    const state = stateOf();
    const asset = must(state.assets, assetId);
    const payload = bag.readToken(token);
    if (!payload || payload.assetId !== asset.id || payload.sub !== actor?.id) throw E.forbidden();
    allow(actor, 'asset.read', { type: 'asset', id: asset.id, studentId: asset.studentId });
    if (!String(asset.storageKey || '').startsWith('file:')) return null;
    return { id: asset.id, mime: asset.mime || 'application/octet-stream', filename: asset.title || asset.id };
  };
}
