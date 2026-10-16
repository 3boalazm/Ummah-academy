import { api, errText, esc, localToIso, money, nm, state, toast } from './util.js';

const L = {
  onboard: ['تسجيل أسرة', 'Enrol a family'],
  onboardLede: ['تجربتان، من دون تفعيل دخول الطالب، ومن دون خصم بطاقة.', 'Two trial lessons, no student login, no card charge.'],
  outbox: ['مسودات واتساب', 'WhatsApp drafts'],
  outboxLede: ['المسودات لا تُرسل وحدها. الرابط يفتح واتساب على جهاز الموظف، وتسجيل الإرسال لا يؤكد الوصول.', 'Drafts are not sent by themselves. The link opens WhatsApp on the staff device, and marking sent does not confirm delivery.'],
  invoices: ['فواتير دفترية', 'Ledger invoices'],
  invoicesLede: ['مشتقة من سجل الدفع. ليست مستندًا ضريبيًا ولا عملية خصم.', 'Derived from the payment record. Not a tax document and not a card charge.'],
  notes: ['التنبيهات', 'Notifications'],
  prepare: ['تجهيز مسودات ٢٤ ساعة', 'Prepare 24-hour drafts'],
  markSent: ['سجّلت أنني أرسلتها', 'I sent this myself'],
  openWa: ['فتح واتساب', 'Open WhatsApp'],
  needsPhone: ['لا يوجد هاتف — لن يُنشأ رابط', 'No phone — no link is created'],
  phone: ['هاتف ولي الأمر', 'Guardian phone'],
  savePhone: ['حفظ الهاتف', 'Save phone'],
  exportStudents: ['تصدير الطلاب', 'Export students'],
  exportSessions: ['تصدير الحصص', 'Export sessions'],
  exportFollow: ['تصدير المتابعات', 'Export follow-ups'],
  exportInvoices: ['تصدير الفواتير', 'Export invoices'],
  familyName: ['اسم الأسرة', 'Family name'],
  guardian: ['ولي الأمر', 'Guardian'],
  child: ['الطفل', 'Child'],
  year: ['سنة الميلاد', 'Birth year'],
  city: ['المدينة', 'City'],
  email: ['البريد', 'Email'],
  password: ['كلمة مرور ولي الأمر', 'Guardian password'],
  course: ['الكورس', 'Course'],
  teacher: ['المعلم', 'Teacher'],
  reason: ['السبب', 'Reason'],
  save: ['حفظ', 'Save'],
  repeat: ['عدد الأسابيع', 'Weeks'],
  upload: ['رفع واجب أو ورقة', 'Upload a worksheet'],
  uploadHint: ['PDF أو صورة أو نص، حتى ١ ميغابايت. ليس تسجيلًا لطفل.', 'PDF, image or text, up to 1 MB. Not a recording of a child.'],
  unread: ['غير مقروء', 'Unread'],
  read: ['مقروء', 'Read'],
};

export function ot(key) {
  const row = L[key];
  return state.lang === 'ar' ? row[0] : row[1];
}

function head(title, lede) {
  return `<header class="page-head"><div><p class="eyebrow">Ummah Academy</p><h1>${esc(title)}</h1><p class="muted">${esc(lede)}</p></div></header>`;
}

export async function viewOnboard() {
  const catalog = await api('GET', '/api/catalog');
  return `${head(ot('onboard'), ot('onboardLede'))}
    <form class="form panel" data-action="enroll">
      <div class="grid-2">
        <label>${esc(ot('familyName'))}<input name="familyName" required></label>
        <label>${esc(ot('familyName'))} AR<input name="familyNameAr"></label>
        <label>${esc(ot('guardian'))}<input name="guardianName" required></label>
        <label>${esc(ot('guardian'))} AR<input name="guardianNameAr"></label>
        <label>${esc(ot('email'))}<input name="email" type="email" required></label>
        <label>${esc(ot('password'))}<input name="password" type="text" minlength="8" required autocomplete="new-password"></label>
        <label>${esc(ot('phone'))}<input name="phone" placeholder="+201000000000"></label>
        <label>${esc(ot('city'))}<input name="city" value="Mansoura"></label>
        <label>${esc(ot('child'))}<input name="studentName" required></label>
        <label>${esc(ot('child'))} AR<input name="studentNameAr"></label>
        <label>${esc(ot('year'))}<input name="birthYear" type="number" min="1980" max="2024" required value="2016"></label>
        <label>${esc(ot('course'))}<select name="courseId">${catalog.courses.map((c) => `<option value="${esc(c.id)}">${esc(nm(c))}</option>`).join('')}</select></label>
        <label>${esc(ot('teacher'))}<select name="teacherId">${catalog.teachers.map((c) => `<option value="${esc(c.id)}">${esc(nm(c))}</option>`).join('')}</select></label>
        <label>Timezone<input name="timezone" value="Africa/Cairo"></label>
      </div>
      <label>${esc(ot('reason'))}<input name="reason" required minlength="3" value="Trial enrolment"></label>
      <button class="btn primary" type="submit">${esc(ot('save'))}</button>
    </form>`;
}

export async function viewOutbox() {
  const rows = await api('GET', '/api/outbox');
  const body = rows.length
    ? rows
        .map(
          (r) => `<article class="panel">
            <div class="row"><span class="chip ${esc(r.status)}">${esc(r.status)}</span><b>${esc(r.kind)}</b><span class="small">${esc(r.phone || ot('needsPhone'))}</span></div>
            <p>${esc(r.bodyAr || r.body)}</p>
            <p class="small">${esc(state.lang === 'ar' ? r.noteAr : r.noteEn)}</p>
            <div class="row">
              ${r.waUrl ? `<a class="btn small primary" data-native target="_blank" rel="noopener" href="${esc(r.waUrl)}">${esc(ot('openWa'))}</a>` : `<span class="small">${esc(ot('needsPhone'))}</span>`}
              ${r.status !== 'sent' ? `<form data-action="outbox-sent"><input type="hidden" name="id" value="${esc(r.id)}"><input name="reason" required minlength="3" placeholder="${esc(ot('reason'))}"><button class="btn small" type="submit">${esc(ot('markSent'))}</button></form>` : ''}
            </div>
          </article>`,
        )
        .join('')
    : `<p class="empty">—</p>`;
  return `${head(ot('outbox'), ot('outboxLede'))}
    <form data-action="drafts"><button class="btn primary" type="submit">${esc(ot('prepare'))}</button></form>
    <div class="stack" style="margin-top:12px">${body}</div>`;
}

export async function viewInvoices() {
  const rows = await api('GET', '/api/invoices');
  const table = `<section class="panel"><table><thead><tr><th>#</th><th></th><th></th><th></th></tr></thead><tbody>${rows
    .map((i) => `<tr><td>${esc(i.number)}</td><td>${esc(i.status)}</td><td>${esc(money(i.amount))}</td><td class="small">${esc(state.lang === 'ar' ? i.noteAr : i.noteEn)}</td></tr>`)
    .join('')}</tbody></table></section>`;
  const buttons = state.me.role === 'admin' || state.me.role === 'ops'
    ? `<div class="row"><button class="btn small" type="button" data-cmd="export" data-kind="invoices">${esc(ot('exportInvoices'))}</button><button class="btn small" type="button" data-cmd="export" data-kind="students">${esc(ot('exportStudents'))}</button><button class="btn small" type="button" data-cmd="export" data-kind="sessions">${esc(ot('exportSessions'))}</button><button class="btn small" type="button" data-cmd="export" data-kind="followups">${esc(ot('exportFollow'))}</button></div>`
    : '';
  return `${head(ot('invoices'), ot('invoicesLede'))}${buttons}<div style="margin-top:12px">${table}</div>`;
}

export async function viewNotes() {
  const rows = await api('GET', '/api/notifications');
  const body = rows
    .map(
      (n) => `<a class="person" href="${esc(n.href || '/app')}"><span class="avatar">${n.read ? '·' : '!'}</span><span><b>${esc(state.lang === 'ar' ? n.titleAr : n.title)}</b><small class="small">${esc(state.lang === 'ar' ? n.bodyAr : n.body)} · ${n.read ? esc(ot('read')) : esc(ot('unread'))}</small></span></a>`,
    )
    .join('');
  return `${head(ot('notes'), '')}<div class="panel stack">${body || '<p class="empty">—</p>'}</div>`;
}

export async function handleOps(action, data, opt) {
  if (action === 'enroll') {
    const body = await api('POST', '/api/families', {
      ...data,
      birthYear: Number(data.birthYear),
    }, opt);
    toast(state.lang === 'ar' ? 'سُجّلت الأسرة' : 'Family enrolled');
    return { go: `/app/families/${body.familyId}` };
  }
  if (action === 'series') {
    const startsAt = localToIso(data.local, data.timeZone || state.tz);
    const body = await api('POST', '/api/sessions/series', {
      studentId: data.studentId,
      teacherId: data.teacherId,
      startsAt,
      count: Number(data.count || 1),
      durationMin: Number(data.durationMin || 30),
      timeZone: data.timeZone || state.tz,
    }, opt);
    toast(body.replayed ? (state.lang === 'ar' ? 'تكررت السلسلة ولم تُنشأ مرتين' : 'Series replayed') : (state.lang === 'ar' ? 'تم إنشاء السلسلة' : 'Series created'));
    return { go: '/app/schedule' };
  }
  if (action === 'drafts') {
    const body = await api('POST', '/api/outbox/drafts', {}, opt);
    toast(`${body.created}`);
    return { stay: true };
  }
  if (action === 'outbox-sent') {
    await api('POST', `/api/outbox/${data.id}`, { status: 'sent', reason: data.reason }, opt);
    toast(state.lang === 'ar' ? 'سُجّل الإرسال دون تأكيد وصول' : 'Marked sent, delivery not confirmed');
    return { stay: true };
  }
  if (action === 'phone') {
    await api('POST', `/api/guardians/${data.id}/phone`, { phone: data.phone, reason: data.reason }, opt);
    toast(state.lang === 'ar' ? 'حُفظ الهاتف' : 'Phone saved');
    return { stay: true };
  }
  if (action === 'upload') {
    const file = data.file;
    if (!file) throw new Error('file');
    if (file.size > 1_000_000) throw new Error(state.lang === 'ar' ? 'الملف أكبر من ١ ميغابايت' : 'File is over 1 MB');
    const buf = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < buf.length; i += chunk) binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    const body = await api('POST', '/api/assets', {
      studentId: data.studentId,
      sessionId: data.sessionId || null,
      filename: file.name,
      mime: file.type || 'application/octet-stream',
      dataBase64: btoa(binary),
    }, opt);
    toast(body.id);
    return { stay: true };
  }
  return null;
}

export async function downloadExport(kind) {
  const res = await fetch(`/api/export/${encodeURIComponent(kind)}`, { headers: { 'x-ua-request': '1' } });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    toast(errText({ data, message: res.statusText }));
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${kind}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function uploadForm(session) {
  if (state.me.role === 'guardian' || state.me.role === 'student') return '';
  if (state.me.role !== 'admin' && state.me.role !== 'ops' && !session?.actions?.attend && !session?.actions?.report) return '';
  return `<form class="form panel" data-action="upload"><h2>${esc(ot('upload'))}</h2><p class="small">${esc(ot('uploadHint'))}</p><input type="hidden" name="studentId" value="${esc(session.studentId)}"><input type="hidden" name="sessionId" value="${esc(session.id)}"><input name="file" type="file" accept="application/pdf,image/png,image/jpeg,text/plain" required><button class="btn small" type="submit">${esc(ot('save'))}</button></form>`;
}

export function phoneForms(family) {
  if (state.me.role !== 'admin' && state.me.role !== 'ops') return '';
  return (family.guardians || [])
    .map(
      (g) => `<form class="row panel" data-action="phone"><input type="hidden" name="id" value="${esc(g.id)}"><strong>${esc(nm(g))}</strong><input name="phone" value="${esc(g.phone || '')}" placeholder="+201000000000"><input name="reason" required minlength="3" placeholder="${esc(ot('reason'))}"><button class="btn small" type="submit">${esc(ot('savePhone'))}</button></form>`,
    )
    .join('');
}
