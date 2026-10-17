/**
 * Website → portal intake ("طلبات الموقع").
 *
 * This is the real link between the static marketing site and operations:
 * the booking wizard (trial lessons), the career form (teacher training),
 * the placement test (level tests) and general contact all land here as
 * site requests. Staff work the board, then convert a request into the
 * existing follow-up/enrolment flow. Public intake is write-only and
 * rate-limited at the server; everything else is staff-only.
 */
import { E } from './errors.mjs';
import { id } from './ids.mjs';
import { IDS } from './seed.mjs';

export const INTAKE_KINDS = ['trial', 'training', 'level-test', 'contact'];
export const INTAKE_STATUSES = ['new', 'contacted', 'closed'];
export const INTAKE_OUTCOMES = ['won', 'lost', 'duplicate', 'spam'];

const LIMITS = {
  name: 120, email: 190, phone: 40, course: 160, level: 80, learner: 80,
  city: 80, country: 80, message: 2000, lang: 12, source: 300,
};

function text(value, max) {
  if (value == null) return null;
  const s = String(value).trim().replace(/\s+/g, ' ');
  if (!s) return null;
  return s.slice(0, max);
}

function looseEmail(value) {
  const s = text(value, LIMITS.email);
  if (!s) return null;
  return /.+@.+\..+/.test(s) ? s : null;
}

function loosePhone(value) {
  const s = text(value, LIMITS.phone);
  if (!s) return null;
  return /[0-9]{6,}/.test(s.replace(/[^0-9]/g, '')) ? s : null;
}

/** Shallow-clean an arbitrary payload blob from the site (size-capped). */
function payloadBlob(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  let n = 0;
  for (const [k, v] of Object.entries(input)) {
    if (n >= 24) break;
    const key = text(k, 40);
    if (!key || /password|secret|token|hash/i.test(key)) continue;
    if (v == null || ['string', 'number', 'boolean'].includes(typeof v)) {
      out[key] = typeof v === 'string' ? text(v, 400) : v;
      n += 1;
    } else if (Array.isArray(v)) {
      out[key] = v.slice(0, 12).map((x) => (typeof x === 'string' ? text(x, 120) : typeof x === 'number' ? x : null)).filter((x) => x != null);
      n += 1;
    }
  }
  return out;
}

export function requestDto(row) {
  return { ...row };
}

/**
 * Public write path. `meta` carries requestId plus optional remote info.
 * Honeypot (`input.website`) is silently accepted and dropped.
 */
export function createSiteRequest(state, input, meta = {}, notifyOps) {
  const kind = text(input?.kind, 20);
  if (!INTAKE_KINDS.includes(kind)) {
    throw E.validation('Unknown request kind.', 'نوع الطلب غير معروف.');
  }
  const submissionId = text(input?.submissionId, 80);
  if (submissionId) {
    const existing = state.siteRequests.find((r) => r.submissionId === submissionId);
    if (existing) return { ...requestDto(existing), replayed: true };
  }
  // Bot trap: real people never fill the hidden "website" field.
  if (text(input?.website, 80)) {
    return { ok: true, dropped: true };
  }
  const name = text(input?.name, LIMITS.name) || text(input?.firstName, LIMITS.name);
  const email = looseEmail(input?.email);
  const phone = loosePhone(input?.phone) || loosePhone(input?.whatsapp);
  // The placement test is anonymous by design — level tests arrive without contact
  // details and are still worth counting. Every other kind needs a way to reply.
  if (kind !== 'level-test' && !name && !email && !phone) {
    throw E.validation('A name or a way to reach you is required.', 'الاسم أو وسيلة التواصل مطلوبة.');
  }
  const now = clockIso(meta);
  const row = {
    id: id('sreq'),
    submissionId: submissionId || null,
    kind,
    status: 'new',
    outcome: null,
    name: name || null,
    nameAr: text(input?.nameAr, LIMITS.name),
    email,
    phone,
    country: text(input?.country, LIMITS.country),
    city: text(input?.city, LIMITS.city),
    course: text(input?.course, LIMITS.course),
    level: text(input?.level, LIMITS.level),
    learner: text(input?.learner, LIMITS.learner) || text(input?.learnerLabel, LIMITS.learner),
    message: text(input?.message, LIMITS.message),
    lang: text(input?.lang, LIMITS.lang),
    source: text(input?.source, LIMITS.source),
    payload: payloadBlob(input?.payload ?? input?.fields ?? {}),
    attribution: payloadBlob(input?.attribution),
    receivedAt: text(input?.submitted_at, 40) || now,
    updatedAt: now,
    notes: [],
    followUpId: null,
    closedAt: null,
  };
  state.siteRequests.push(row);
  if (notifyOps) notifyOps(row);
  return requestDto(row);
}

function clockIso(meta) {
  return (meta.now && typeof meta.now === 'function' ? meta.now() : new Date()).toISOString();
}

export function siteRequestCounts(rows) {
  const counts = {
    total: rows.length,
    open: 0,
    new: 0,
    contacted: 0,
    closed: 0,
    trial: 0,
    training: 0,
    levelTest: 0,
    contact: 0,
  };
  for (const r of rows) {
    if (r.status !== 'closed') counts.open += 1;
    if (r.status === 'new') counts.new += 1;
    if (r.status === 'contacted') counts.contacted += 1;
    if (r.status === 'closed') counts.closed += 1;
    if (r.kind === 'trial') counts.trial += 1;
    if (r.kind === 'training') counts.training += 1;
    if (r.kind === 'level-test') counts.levelTest += 1;
    if (r.kind === 'contact') counts.contact += 1;
  }
  return counts;
}

export function filterSiteRequests(rows, filters = {}) {
  let out = rows.slice();
  if (filters.kind && filters.kind !== 'all') out = out.filter((r) => r.kind === filters.kind);
  if (filters.status === 'open') out = out.filter((r) => r.status !== 'closed');
  else if (filters.status && filters.status !== 'all') out = out.filter((r) => r.status === filters.status);
  if (filters.q) {
    const q = String(filters.q).toLowerCase();
    out = out.filter((r) =>
      [r.name, r.nameAr, r.email, r.phone, r.course, r.message].some((v) => v && String(v).toLowerCase().includes(q)));
  }
  out.sort((a, b) => String(b.receivedAt).localeCompare(String(a.receivedAt)));
  return out;
}

export function attachIntake(api, bag) {
  const { clock, allow, audit, notify, must, byId } = bag;
  const stateOf = () => bag.state;

  function ensure(state) {
    state.siteRequests ??= [];
    for (const r of state.siteRequests) {
      r.notes ??= [];
      r.payload ??= {};
      r.attribution ??= {};
      r.followUpId ??= null;
      r.outcome ??= null;
      r.closedAt ??= null;
    }
  }

  ensure(stateOf());

  Object.assign(api, {
    /** Public: called by the marketing site. No actor. */
    createSiteRequest(input, meta = {}) {
      const state = stateOf();
      ensure(state);
      const row = createSiteRequest(state, input, { ...meta, now: clock }, (created) => {
        audit(null, 'site_request.received', 'site_request', created.id, null, {
          kind: created.kind, source: created.source, lang: created.lang,
        }, created.course || null, meta.requestId);
        notify(IDS.ops, 'New website request', 'طلب جديد من الموقع',
          `${created.name || created.email || created.phone || ''} · ${created.course || created.kind}`,
          `${created.course || created.kind}`, `/app/site-requests?open=${created.id}`);
      });
      return row;
    },

    /** Staff-only board data. */
    listSiteRequests(actor, filters = {}) {
      allow(actor, 'people.admin', null);
      const state = stateOf();
      ensure(state);
      const rows = filterSiteRequests(state.siteRequests, filters);
      return {
        rows: rows.map(requestDto),
        counts: siteRequestCounts(state.siteRequests),
        noteAr: 'كل ما يرسله الموقع يصل هنا: طلبات حصة التجربة وطلبات التدريب واختبارات المستوى. ابدأ بالتواصل ثم حوّل الطلب إلى متابعة.',
        noteEn: 'Everything the website sends arrives here: trial lesson requests, training requests and level tests. Make contact, then turn the request into a follow-up.',
      };
    },

    updateSiteRequest(actor, requestId, input, meta = {}) {
      const state = stateOf();
      ensure(state);
      allow(actor, 'people.admin', null);
      const row = must(state.siteRequests, requestId);
      const before = { status: row.status, outcome: row.outcome };
      const now = clock().toISOString();
      if (input.status) {
        if (!INTAKE_STATUSES.includes(input.status)) throw E.validation('Unknown status.', 'حالة غير معروفة.');
        if (input.status === 'closed') {
          const outcome = input.outcome ? String(input.outcome).trim() : row.outcome;
          if (!INTAKE_OUTCOMES.includes(outcome)) {
            throw E.validation('Closing needs an outcome: won, lost, duplicate or spam.', 'الإغلاق يحتاج نتيجة: مكسب أو خسارة أو تكرار أو مزعزع.');
          }
          row.outcome = outcome;
          row.closedAt = now;
        } else {
          row.outcome = null;
          row.closedAt = null;
        }
        row.status = input.status;
      }
      const note = input.note ? String(input.note).trim().slice(0, 2000) : '';
      if (note) {
        row.notes.push({ id: id('snote'), at: now, by: actor.id, text: note });
      }
      row.updatedAt = now;
      audit(actor, 'site_request.updated', 'site_request', row.id, before,
        { status: row.status, outcome: row.outcome, note: note || null }, input.reason ?? null, meta.requestId);
      return requestDto(row);
    },

    /** Convert a website request into the existing follow-up workflow. */
    siteRequestToFollowUp(actor, requestId, input = {}, meta = {}) {
      const state = stateOf();
      ensure(state);
      allow(actor, 'people.admin', null);
      const row = must(state.siteRequests, requestId);
      if (row.followUpId && byId(state.followUps, row.followUpId)) {
        throw E.already('converted into a follow-up', 'تم تحويلها إلى متابعة');
      }
      const now = clock().toISOString();
      const assigneeId = input.assigneeId || IDS.ops;
      if (!byId(state.users, assigneeId)) throw E.notFound();
      const kindLabel = { trial: 'Trial request', training: 'Training request', 'level-test': 'Level test', contact: 'Website contact' }[row.kind];
      const kindLabelAr = { trial: 'طلب حصة تجربة', training: 'طلب تدريب', 'level-test': 'اختبار مستوى', contact: 'رسالة من الموقع' }[row.kind];
      const follow = {
        id: id('fu'),
        level: 'family',
        type: input.type || 'admissions',
        visibility: 'internal',
        familyId: null,
        studentId: null,
        teacherId: null,
        subscriptionId: null,
        sessionId: null,
        title: `${kindLabel}: ${row.name || row.email || row.phone || row.id}`,
        titleAr: `${kindLabelAr}: ${row.nameAr || row.name || row.email || row.phone || row.id}`,
        status: 'open',
        priority: input.priority || 'normal',
        assigneeId,
        dueAt: new Date(clock().getTime() + 2 * 86400000).toISOString(),
        outcome: null,
        outcomeAr: null,
        createdBy: actor.id,
        createdAt: now,
        closedAt: null,
      };
      state.followUps.push(follow);
      const summary = [row.course, row.level, row.learner, row.message].filter(Boolean).join(' · ') || kindLabel;
      state.attempts.push({
        id: id('attm'), followUpId: follow.id, at: now, channel: 'portal',
        note: `Website request ${row.id}: ${summary}`,
        noteAr: `طلب موقع ${row.id}: ${summary}`,
        actorId: actor.id, result: 'requested',
      });
      row.followUpId = follow.id;
      if (row.status === 'new') row.status = 'contacted';
      row.updatedAt = now;
      audit(actor, 'site_request.converted', 'site_request', row.id,
        { followUpId: null }, { followUpId: follow.id }, null, meta.requestId);
      notify(assigneeId, 'Website request follow-up', 'متابعة طلب موقع', follow.title, follow.titleAr, `/app/follow-ups/${follow.id}`);
      return { request: requestDto(row), followUp: follow };
    },
  });
}
