import { chip, esc, fmt, nm, num, state, t, tx } from './util.js';
import { api } from './util.js';
import { ot } from './ops-ui.js';

function L(en, ar) {
  return state.lang === 'ar' ? ar : en;
}

function head(title, lede) {
  return `<header class="page-head"><div><p class="eyebrow">${esc(L('Admin OS', 'نظام التشغيل'))}</p><h1>${esc(title)}</h1>${lede ? `<p class="muted">${esc(lede)}</p>` : ''}</div>
    <div class="row"><button class="btn ghost small" type="button" data-cmd="screen-options">${esc(L('Queues', 'الطوابير'))}</button><button class="btn ghost small" type="button" data-cmd="help-panel">${esc(L('Help', 'مساعدة'))}</button></div></header>`;
}

function metabox(id, title, body) {
  const hidden = (state.hiddenWidgets || []).includes(id);
  if (hidden) return '';
  return `<section class="metabox" data-box="${esc(id)}">
    <h2>${esc(title)}<button class="metabox-toggle" type="button" data-cmd="toggle-box" aria-label="toggle">▾</button></h2>
    <div class="metabox-body">${body}</div>
  </section>`;
}

function notice(row) {
  const cls = row.level === 'danger' ? 'bad' : row.level === 'info' ? 'ok' : '';
  return `<div class="banner ${cls}" data-notice="${esc(row.id)}">${esc(state.lang === 'ar' ? row.ar : row.en)}</div>`;
}

function queueList(rows, empty) {
  if (!rows?.length) return `<p class="empty">${esc(empty || t('none'))}</p>`;
  return `<ul class="plain">${rows.join('')}</ul>`;
}

export async function viewWorkspace() {
  const data = await api('GET', '/api/console?view=workspace');
  const g = data.glance || {};
  const q = data.queues || {};
  const glance = `<ul class="glance">
    <li><a href="/app/admissions"><b>${num(g.trials)}</b> ${esc(L('trials', 'تجارب'))}</a></li>
    <li><a href="/app/today?queue=reports"><b>${num(g.pendingReports)}</b> ${esc(L('reports due', 'تقارير مطلوبة'))}</a></li>
    <li><a href="/app?queue=review"><b>${num(g.pendingReview)}</b> ${esc(L('awaiting approval', 'بانتظار الاعتماد'))}</a></li>
    <li><a href="/app/follow-ups?overdue=1"><b>${num(g.overdueFollowUps)}</b> ${esc(L('overdue follow-ups', 'متابعات متأخرة'))}</a></li>
    <li><a href="/app/subscriptions?renewing=14"><b>${num(g.renewals)}</b> ${esc(L('renewals 14d', 'تجديدات ١٤ يوم'))}</a></li>
    <li><a href="/app/schedule"><b>${num(g.sessionsOpen)}</b> ${esc(L('open sessions', 'حصص مفتوحة'))}</a></li>
  </ul>`;
  const reports = (q.pendingReports || []).map((s) => `<li><a href="/app/sessions/${esc(s.id)}">${esc(nm(s.student))}</a> <span class="small">${esc(fmt(s.startsAt, s.student?.timezone))}</span></li>`);
  const review = (q.pendingReview || []).map((s) => `<li><a href="/app/sessions/${esc(s.id)}">${esc(nm(s.student))}</a> ${s.actions?.approveReport ? `<form class="row" data-action="approve-report"><input type="hidden" name="id" value="${esc(s.id)}"><button class="btn small primary" type="submit">${esc(t('approveReport'))}</button></form>` : ''}</li>`);
  const follow = (q.overdueFollowUps || []).map((f) => `<li><a href="/app/follow-ups/${esc(f.id)}">${esc(nm(f))}</a> <span class="small">${esc(fmt(f.dueAt))}</span></li>`);
  const admissions = `<p><a href="/app/admissions">${esc(L('Open the admissions board', 'افتح لوحة القبول'))}</a> · ${num(g.trials)} ${esc(L('trial students', 'طلاب تجربة'))}</p>`;
  const activity = (data.activity || []).map((e) => `<li><b>${esc(state.lang === 'ar' ? e.summaryAr : e.summary)}</b><div class="small">${esc(fmt(e.occurredAt))} · <a href="${esc(e.href)}">${esc(e.type)}</a></div></li>`).join('') || `<li>${esc(t('none'))}</li>`;
  const mem = data.memberships || {};
  const membership = `<p>${esc(state.lang === 'ar' ? mem.noteAr : mem.noteEn)}</p>
    <p>${esc(L('Active', 'نشط'))} <b>${num(mem.active)}</b> · ${esc(L('Trial', 'تجريبي'))} <b>${num(mem.trial)}</b> · ${esc(L('Paused', 'متوقف'))} <b>${num(mem.paused)}</b></p>
    <p><a href="/app/subscriptions?payment=failed">${esc(L('Failed ledger payments', 'دفعات دفترية فاشلة'))}: ${num(mem.failedPayments)}</a></p>`;
  const health = `<p>${data.health?.ok ? esc(t('pass')) : esc(t('fail'))} · ${num(data.health?.issues)} ${esc(L('issues', 'ملاحظات'))}</p><p><a href="/app/health">${esc(t('health'))}</a></p>`;
  return `${head(L('Overview', 'نظرة عامة'), L('Action queues for today. Website edits are not here — open Website Manager. This is not WordPress.', 'طوابير عمل اليوم. تعديل الموقع ليس هنا — افتح مدير الموقع. هذه ليست ووردبريس.'))}
    ${(data.notices || []).map(notice).join('')}
    <div class="metabox-grid">
      ${metabox('queues', L('At a glance', 'نظرة سريعة'), glance)}
      ${metabox('admissions', L('Admissions', 'القبول'), admissions)}
      ${metabox('reports', L('Reports due from teachers', 'تقارير مطلوبة من المعلمين'), queueList(reports))}
      ${metabox('review', L('Reports awaiting approval', 'تقارير بانتظار الاعتماد'), queueList(review))}
      ${metabox('health', L('Integrity', 'السلامة'), health)}
      ${metabox('memberships', L('Agreements (ledger, not Stripe)', 'الاتفاقات (دفتر، ليست Stripe)'), membership)}
      ${metabox('activity', L('Recent activity', 'آخر النشاط'), `<ol class="timeline">${activity}</ol>`)}
      ${metabox('followups', L('Overdue follow-ups', 'متابعات متأخرة'), queueList(follow))}
    </div>`;
}

export async function viewPeople() {
  const data = await api('GET', '/api/console?view=people');
  const rows = (data.users || []).map((u) => `<tr><td>${esc(state.lang === 'ar' ? u.nameAr || u.name : u.name)}</td><td>${chip(u.role)}</td><td>${chip(u.status)}</td><td class="small">${esc(u.email)}</td><td class="small">${esc(u.timezone || '')}</td></tr>`).join('');
  return `${head(L('Users', 'المستخدمون'), L('Portal accounts. A WordPress user is not a student.', 'حسابات البوابة. مستخدم ووردبريس ليس طالبًا.'))}
    <section class="panel"><table><thead><tr><th>${esc(L('Name', 'الاسم'))}</th><th>${esc(L('Role', 'الدور'))}</th><th>${esc(t('status'))}</th><th>${esc(t('email'))}</th><th>${esc(t('zone'))}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

export async function viewAcademic() {
  const data = await api('GET', '/api/console?view=academic');
  const rows = (data.students || []).map((s) => `<tr>
    <td><a href="/app/students/${esc(s.id)}">${esc(nm(s))}</a></td>
    <td>${chip(s.axes.academicStatus)}${chip(s.axes.subscriptionStatus)}</td>
    <td>${esc(nm(s.teacher))}</td>
    <td class="small">${s.nextSession ? esc(fmt(s.nextSession.startsAt)) : esc(t('none'))}</td>
    <td>${s.lastReport ? esc(tx(s.lastReport, 'summary')) : esc(t('none'))}</td>
    <td>${num(s.openHomework)}</td>
  </tr>`).join('');
  return `${head(L('Academic Progress', 'التقدّم الدراسي'), L('Last report, open homework and next lesson. Not a gradebook plugin.', 'آخر تقرير والواجب المفتوح والحصة الجاية. ليس بلجن درجات.'))}
    <section class="panel"><table><thead><tr><th>${esc(t('student'))}</th><th>${esc(t('status'))}</th><th>${esc(t('teacher'))}</th><th>${esc(t('next'))}</th><th>${esc(t('report'))}</th><th>${esc(t('homework'))}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

export async function viewPlacements() {
  const data = await api('GET', '/api/console?view=placements');
  const rows = (data.placements || []).map((p) => `<tr><td>${esc(p.id)}</td><td>${esc(p.studentId)}</td><td>${esc(p.outcome || '')}</td><td>${esc(fmt(p.occurredAt))}</td></tr>`).join('');
  return `${head(L('Placement Reviews', 'مراجعات التحديد'), state.lang === 'ar' ? data.noteAr : data.noteEn)}
    <section class="panel">${rows ? `<table><thead><tr><th>ID</th><th>${esc(t('student'))}</th><th>${esc(L('Outcome', 'النتيجة'))}</th><th>${esc(t('when'))}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="empty">${esc(t('empty'))}</p>`}</section>`;
}

export async function viewFiles() {
  const data = await api('GET', '/api/console?view=assets');
  const rows = (data.assets || []).map((a) => `<article class="panel row" style="justify-content:space-between"><div><b>${esc(nm(a))}</b><div class="small">${chip(a.status)} · ${esc(nm(a.student))} · ${esc(a.type)}</div></div>${a.status === 'ready' ? `<button class="btn small" type="button" data-cmd="asset" data-id="${esc(a.id)}">${esc(t('openFile'))}</button>` : ''}</article>`).join('');
  return `${head(L('Media', 'الملفات'), L('Protected files with a short-lived token. Not a WordPress file manager.', 'ملفات محمية برمز قصير العمر. ليست مدير ملفات ووردبريس.'))}<div class="stack">${rows || `<p class="empty">${esc(t('empty'))}</p>`}</div>`;
}

export async function viewSettings() {
  const data = await api('GET', '/api/console?view=settings');
  const groups = (data.groups || []).map((g) => {
    const rows = g.rows.map((r) => `<div class="kv"><span>${esc(r.key)}</span><b>${esc(r.value)}</b>${r.reasonEn || r.reasonAr ? `<span class="small">${esc(state.lang === 'ar' ? r.reasonAr : r.reasonEn)}</span>` : ''}</div>`).join('');
    return `<section class="panel"><h2>${esc(state.lang === 'ar' ? g.ar : g.en)} ${g.status ? chip(g.status) : ''}</h2>${rows}</section>`;
  }).join('');
  return `${head(L('Settings', 'الإعدادات'), L('Comparable option groups. Disconnected services stay disconnected until the academy answers the questionnaire.', 'مجموعات مقابلة. الخدمة المفصولة تبقى مفصولة حتى يجيب العمل الاستبيان.'))}
    <p class="banner">${esc(L('Nothing on this screen invents Stripe, SMTP, HubSpot or GTM credentials.', 'لا شيء هنا يخترع مفاتيح Stripe أو SMTP أو HubSpot أو GTM.'))}</p>
    <div class="stack">${groups}</div>`;
}

export async function viewStack() {
  const data = await api('GET', '/api/console?view=stack');
  const rows = (data.items || []).map((i) => `<tr><td>${chip(i.status)}</td><td>${esc(i.wp)}</td><td>${esc(state.lang === 'ar' ? i.ar : i.en)}</td></tr>`).join('');
  return `${head(L('Capabilities', 'القدرات'), L('This replaces the Plugins screen. Native, blocked, or never ported — not a plugin installer.', 'هذا بدل شاشة الإضافات. أصلي أو موقوف أو لن يُنقل — ليس مثبّت بلجنز.'))}
    <section class="panel"><table><thead><tr><th>${esc(t('status'))}</th><th>WordPress</th><th>${esc(L('Here', 'هنا'))}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

export async function viewTools() {
  return `${head(L('Tools', 'أدوات'), L('Export and rehearsal backup. Not UpdraftPlus on this host.', 'تصدير ونسخ تدريبي. ليس UpdraftPlus على هذا الاستضافة.'))}
    <section class="panel stack">
      <button class="btn" type="button" data-cmd="export" data-kind="students">${esc(ot('exportStudents'))}</button>
      <button class="btn" type="button" data-cmd="export" data-kind="sessions">${esc(ot('exportSessions'))}</button>
      <button class="btn" type="button" data-cmd="export" data-kind="follow-ups">${esc(ot('exportFollow'))}</button>
      <button class="btn" type="button" data-cmd="export" data-kind="invoices">${esc(ot('exportInvoices'))}</button>
    </section>`;
}

export async function viewWebsite() {
  const data = await api('GET', '/api/console?view=website');
  const steps = (data.workflow || []).map((step, i) => `<li><b>${esc(step)}</b>${i < data.workflow.length - 1 ? ' →' : ''}</li>`).join('');
  const rows = (data.collections || []).map((c) => `<tr><td>${esc(c.id)}</td><td>${esc(state.lang === 'ar' ? c.ar : c.en)}</td><td class="small">${esc(c.folder)}</td></tr>`).join('');
  return `${head(L('Website Manager', 'مدير الموقع'), state.lang === 'ar' ? data.noteAr : data.noteEn)}
    <p class="banner">${esc(L('The portal does not write the public site. Page builders are never installed.', 'البوابة لا تكتب الموقع العام. منشئات الصفحات لن تُثبَّت.'))}</p>
    <section class="panel">
      <h2>${esc(L('Publish path', 'مسار النشر'))}</h2>
      <ol class="workflow">${steps}</ol>
      <p><a data-native target="_blank" rel="noopener" href="${esc(data.cmsLive)}">${esc(L('Open Sveltia CMS', 'افتح سفيلتيا'))}</a>
        <span class="small"> · ${esc(data.guide)}</span></p>
    </section>
    <section class="panel">
      <h2>${esc(L('Collections', 'المجموعات'))}</h2>
      <table><thead><tr><th>id</th><th>${esc(L('Collection', 'المجموعة'))}</th><th>${esc(L('Folder', 'المجلد'))}</th></tr></thead><tbody>${rows}</tbody></table>
    </section>`;
}

export async function viewAdmissions() {
  const data = await api('GET', '/api/console?view=admissions');
  const labels = {
    lead: L('Lead', 'ليد'),
    trial_booked: L('Trial booked', 'تجربة محجوزة'),
    trial_completed: L('Trial completed', 'تجربة مكتملة'),
    paid: L('Paid', 'مدفوع'),
  };
  const cols = Object.entries(data.columns || {}).map(([stage, cards]) => {
    const items = (cards || []).map((c) => {
      const follows = (c.followUps || []).map((f) => `<a class="small" href="${esc(f.href)}">${esc(state.lang === 'ar' ? f.titleAr : f.title)}</a>`).join(' · ');
      return `<article class="admit-card">
        <a href="${esc(c.href)}"><b>${esc(nm(c))}</b></a>
        <div class="small">${chip(c.academicStatus)}${c.subscriptionStatus ? chip(c.subscriptionStatus) : ''}</div>
        <div class="small">${esc(nm(c.teacher) || '—')}</div>
        ${follows ? `<div>${follows}</div>` : ''}
      </article>`;
    }).join('') || `<p class="empty">${esc(t('none'))}</p>`;
    return `<section class="panel admit-col"><h2>${esc(labels[stage] || stage)} <span class="small">${num((data.counts || {})[stage])}</span></h2>${items}</section>`;
  }).join('');
  return `${head(L('Admissions', 'القبول'), state.lang === 'ar' ? data.noteAr : data.noteEn)}
    <p class="banner">${esc(L('CRM disconnected. Columns are portal records, not a HubSpot import.', 'الـ CRM مفصول. الأعمدة من سجلات البوابة، ليست استيراد HubSpot.'))}</p>
    <div class="admit-board">${cols}</div>`;
}

export async function viewGovernance() {
  const data = await api('GET', '/api/console?view=governance');
  const roles = (data.roles || []).map((r) => `<tr><td><code>${esc(r.login)}</code></td><td>${esc(state.lang === 'ar' ? r.osAr : r.os)}</td><td>${chip(r.portal ? 'portal' : 'cms')}</td></tr>`).join('');
  const matrix = (data.matrix || []).map((m) => `<tr><td><code>${esc(m.action)}</code></td><td>${esc((m.roles || []).join(', ') || '—')}</td><td>${chip(m.portal ? 'portal' : 'sveltia')}</td><td class="small">${esc(state.lang === 'ar' ? m.ar : m.en)}</td></tr>`).join('');
  return `${head(L('Governance', 'الحوكمة'), state.lang === 'ar' ? data.noteAr : data.noteEn)}
    <section class="panel">
      <h2>${esc(L('Login roles', 'أدوار الدخول'))}</h2>
      <table><thead><tr><th>${esc(L('Login', 'الدخول'))}</th><th>${esc(L('In this OS', 'في هذا النظام'))}</th><th>${esc(t('status'))}</th></tr></thead><tbody>${roles}</tbody></table>
    </section>
    <section class="panel">
      <h2>${esc(L('Permission matrix', 'مصفوفة الصلاحيات'))}</h2>
      <table><thead><tr><th>${esc(L('Action', 'الإجراء'))}</th><th>${esc(L('Roles', 'الأدوار'))}</th><th>${esc(L('Where', 'أين'))}</th><th></th></tr></thead><tbody>${matrix}</tbody></table>
    </section>`;
}
