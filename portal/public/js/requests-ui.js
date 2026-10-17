/**
 * طلبات الموقع — Website Requests board.
 * Everything the marketing site sends (trial bookings, training applications,
 * level tests, contact) lands here and is worked by staff: contact the person,
 * leave a note, then convert the request into the regular follow-up flow.
 */
import { api, esc, fmt, num, state, t, chip } from './util.js';

const L = {
  title: ['طلبات الموقع', 'Website requests'],
  lede: ['كل ما يرسله الموقع يصل هنا: طلبات حصة التجربة وطلبات التدريب واختبارات المستوى. ابدأ بالتواصل معنا.', 'Everything the website sends arrives here: trial lessons, training requests and level tests. Start by contacting them.'],
  open: ['ما زالت مفتوحة', 'Still open'],
  fresh: ['جديد', 'New'],
  contacted: ['تم التواصل', 'Contacted'],
  trials: ['طلبات تجربة', 'Trial requests'],
  training: ['طلبات تدريب', 'Training requests'],
  levels: ['اختبارات المستوى', 'Level tests'],
  all: ['كل الطلبات', 'All requests'],
  kindTrial: ['طلب حصة تجربة', 'Trial lesson request'],
  kindTraining: ['طلب تدريب', 'Training request'],
  kindLevel: ['اختبار مستوى', 'Level test'],
  kindContact: ['رسالة عامة', 'General message'],
  kinds: ['الأنواع', 'Kinds'],
  empty: ['لا توجد طلبات بهذا الفلتر', 'No requests match this filter'],
  emptyAll: ['لا توجد طلبات بعد — اربط نموذجات الموقع وسيصل أول طلب هنا.', 'No requests yet — connect the site forms and the first one will arrive here.'],
  wa: ['واتساب', 'WhatsApp'],
  email: ['بريد', 'Email'],
  markContacted: ['سجّلت أنني تواصلت', 'I made contact'],
  close: ['إغلاق', 'Close'],
  won: ['تحول لطالب', 'Won'],
  lost: ['خسارة', 'Lost'],
  duplicate: ['مكرر', 'Duplicate'],
  spam: ['مزعزع', 'Spam'],
  note: ['ملاحظة داخلية', 'Internal note'],
  addNote: ['إضافة الملاحظة', 'Add note'],
  toFollow: ['تحويل إلى متابعة', 'Turn into a follow-up'],
  followLink: ['افتح المتابعة', 'Open the follow-up'],
  received: ['وصل في', 'Received'],
  course: ['الكورس', 'Course'],
  level: ['المستوى', 'Level'],
  learner: ['الدارس', 'Learner'],
  from: ['من صفحة', 'From page'],
  result: ['النتيجة', 'Result'],
  closeForm: ['الإغلاق يحتاج نتيجة', 'Closing needs an outcome'],
};

const lt = (key) => (state.lang === 'ar' ? L[key][0] : L[key][1]);

const KIND_LABEL = {
  trial: 'kindTrial',
  training: 'kindTraining',
  'level-test': 'kindLevel',
  contact: 'kindContact',
};

function waLink(phone, text) {
  const digits = String(phone || '').replace(/[^\d]/g, '');
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

function head() {
  return `<header class="page-head">
    <div>
      <p class="eyebrow">Ummah Academy</p>
      <h1>${esc(lt('title'))}</h1>
      <p class="muted">${esc(lt('lede'))}</p>
    </div>
  </header>`;
}

function metric(href, label, n, active) {
  return `<a class="metric" href="${esc(href)}" ${active ? 'aria-current="page"' : ''}>
    <span class="small">${esc(label)}</span>
    <span class="n">${num(n)}</span>
  </a>`;
}

function kindChip(kind) {
  return `<span class="chip internal">${esc(lt(KIND_LABEL[kind] || 'kindContact'))}</span>`;
}

function requestCard(row, openId) {
  const wa = waLink(row.phone, state.lang === 'ar'
    ? `السلام عليكم ${row.name || ''}، نتواصل من أكاديمية الأمة بشأن ${row.course || lt(KIND_LABEL[row.kind] || 'kindContact')}`
    : `Hello ${row.name || ''}, this is Ummah Academy about ${row.course || lt(KIND_LABEL[row.kind] || 'kindContact')}`);
  const contact = [
    wa ? `<a class="btn ghost small" data-native href="${esc(wa)}" target="_blank" rel="noopener">${esc(lt('wa'))}</a>` : '',
    row.email ? `<a class="btn ghost small" href="mailto:${esc(row.email)}">${esc(lt('email'))}</a>` : '',
    row.phone && !wa ? `<span class="small">${esc(row.phone)}</span>` : '',
  ].join('');
  const notes = (row.notes || []).map((n) => `<li class="small">${esc(fmt(n.at))} — ${esc(n.text)}</li>`).join('');
  const result = row.payload && (row.payload.percent !== undefined || row.payload.level)
    ? `<p class="small">${esc(lt('result'))}: ${esc([row.payload.level, row.payload.percent != null ? `${row.payload.percent}%` : null, row.payload.recommended].filter(Boolean).join(' · '))}</p>`
    : '';
  const actions = row.followUpId
    ? `<a class="btn ghost small" href="/app/follow-ups/${esc(row.followUpId)}">${esc(lt('followLink'))}</a>`
    : `<form data-action="site-request-follow" class="row"><input type="hidden" name="id" value="${esc(row.id)}"><button class="btn small primary" type="submit">${esc(lt('toFollow'))}</button></form>`;
  const statusForm = row.status === 'closed'
    ? `<form data-action="site-request-status" class="row"><input type="hidden" name="id" value="${esc(row.id)}"><input type="hidden" name="status" value="contacted"><button class="btn ghost small" type="submit">${esc(lt('contacted'))}</button></form>`
    : row.status === 'new'
      ? `<form data-action="site-request-status" class="row"><input type="hidden" name="id" value="${esc(row.id)}"><input type="hidden" name="status" value="contacted"><button class="btn small" type="submit">${esc(lt('markContacted'))}</button></form>`
      : '';
  const closeForm = row.status !== 'closed'
    ? `<form data-action="site-request-status" class="row">
        <input type="hidden" name="id" value="${esc(row.id)}">
        <input type="hidden" name="status" value="closed">
        <label class="sr">${esc(lt('closeForm'))}</label>
        <select name="outcome" aria-label="${esc(lt('result'))}">
          <option value="won">${esc(lt('won'))}</option>
          <option value="lost">${esc(lt('lost'))}</option>
          <option value="duplicate">${esc(lt('duplicate'))}</option>
          <option value="spam">${esc(lt('spam'))}</option>
        </select>
        <button class="btn ghost small" type="submit">${esc(lt('close'))}</button>
      </form>`
    : '';
  const noteForm = `<form data-action="site-request-note" class="row">
      <input type="hidden" name="id" value="${esc(row.id)}">
      <input name="note" maxlength="2000" placeholder="${esc(lt('note'))}" aria-label="${esc(lt('note'))}">
      <button class="btn ghost small" type="submit">${esc(lt('addNote'))}</button>
    </form>`;
  return `<article class="panel stack" id="req-${esc(row.id)}" ${openId === row.id ? 'style="outline:2px solid var(--accent)"' : ''}>
    <div class="row" style="justify-content:space-between">
      <div>
        <h2 style="margin:0;font-size:1.05rem">${esc(row.name || row.nameAr || row.email || row.phone || row.id)}</h2>
        <div class="small">${esc(fmt(row.receivedAt))} · ${esc(row.source || '')}</div>
      </div>
      <div class="chips">${kindChip(row.kind)}${chip(row.status)}${row.outcome ? chip(row.outcome) : ''}</div>
    </div>
    <div class="small">${[row.course && `${lt('course')}: ${row.course}`, row.level && `${lt('level')}: ${row.level}`, row.learner && `${lt('learner')}: ${row.learner}`].filter(Boolean).map(esc).join(' · ')}</div>
    ${row.message ? `<p class="muted" style="margin:0">${esc(row.message)}</p>` : ''}
    ${result}
    <div class="row">${contact}${statusForm}${closeForm}${actions}</div>
    ${noteForm}
    ${notes ? `<ul class="plain">${notes}</ul>` : ''}
  </article>`;
}

export async function viewSiteRequests({ query = {} } = {}) {
  const kind = query.kind || 'all';
  const status = query.status || 'all';
  const data = await api('GET', `/api/site-requests?kind=${encodeURIComponent(kind)}&status=${encodeURIComponent(status)}`);
  const c = data.counts || {};
  const kindTab = (id, label, n) =>
    `<a href="/app/site-requests?kind=${id}${status !== 'all' ? `&status=${status}` : ''}" ${kind === id ? 'aria-current="page"' : ''}>${esc(label)} <span class="small">(${num(n)})</span></a>`;
  const qs = (patch) => {
    const p = new URLSearchParams({ kind, status });
    for (const [k, v] of Object.entries(patch)) p.set(k, v);
    return `/app/site-requests?${p}`;
  };
  const rows = data.rows || [];
  return `${head()}
    <div class="metrics">
      ${metric(qs({ status: 'open', kind: 'all' }), lt('open'), c.open ?? 0, status === 'open')}
      ${metric(qs({ status: 'new', kind: 'all' }), lt('fresh'), c.new ?? 0, status === 'new')}
      ${metric(qs({ status: 'contacted', kind: 'all' }), lt('contacted'), c.contacted ?? 0, status === 'contacted')}
      ${metric(qs({ kind: 'trial', status: 'all' }), lt('trials'), c.trial ?? 0, kind === 'trial')}
      ${metric(qs({ kind: 'training', status: 'all' }), lt('training'), c.training ?? 0, kind === 'training')}
      ${metric(qs({ kind: 'level-test', status: 'all' }), lt('levels'), c.levelTest ?? 0, kind === 'level-test')}
    </div>
    <div class="tabs" role="navigation" aria-label="${esc(lt('kinds'))}">
      <a href="/app/site-requests" ${kind === 'all' && status === 'all' ? 'aria-current="page"' : ''}>${esc(lt('all'))} <span class="small">(${num(c.total ?? 0)})</span></a>
      ${kindTab('trial', lt('kindTrial'), c.trial ?? 0)}
      ${kindTab('training', lt('kindTraining'), c.training ?? 0)}
      ${kindTab('level-test', lt('kindLevel'), c.levelTest ?? 0)}
    </div>
    <div class="stack" style="margin-top:12px">
      ${rows.length ? rows.map((r) => requestCard(r, query.open)).join('') : `<p class="empty">${esc(kind === 'all' && status === 'all' ? lt('emptyAll') : lt('empty'))}</p>`}
    </div>`;
}
