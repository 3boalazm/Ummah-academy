import { chip, dayKey, esc, fmt, initials, money, nm, num, state, t, tx } from './util.js';
import { api } from './util.js';
import { phoneForms, uploadForm } from './ops-ui.js';
import { viewWorkspace } from './console-ui.js';

const staff = () => state.me?.role === 'admin' || state.me?.role === 'ops';

function head(title, lede, extra = '') {
  return `<header class="page-head"><div><p class="eyebrow">${esc(t('portal'))}</p><h1>${esc(title)}</h1>${lede ? `<p class="muted">${lede}</p>` : ''}</div>${extra}</header>`;
}

function tabs(current, items) {
  const u = new URL(location.href);
  return `<div class="tabs" role="tablist">${items
    .map(([id, label]) => {
      u.searchParams.set('tab', id);
      return `<a href="${esc(u.pathname + u.search)}" ${current === id ? 'aria-current="page"' : ''}>${esc(label)}</a>`;
    })
    .join('')}</div>`;
}

function person(href, row, sub) {
  return `<a class="person" href="${esc(href)}"><span class="avatar">${esc(initials(row))}</span><span><b>${esc(nm(row))}</b><small class="small">${esc(sub)}</small></span></a>`;
}

function progressCardHtml(card) {
  if (!card) return `<p class="empty">${esc(t('empty'))}</p>`;
  const tz = card.student.timezone || state.tz;
  const next = card.nextSession;
  const last = card.lastHeld;
  const homework = (card.homework || [])
    .map((h) => `<li><b>${esc(tx(h, 'title'))}</b><div class="small">${esc(tx(h, 'instructions'))}${h.dueAt ? ` · ${esc(t('hwDue'))} ${esc(fmt(h.dueAt, tz))}` : ''}</div></li>`)
    .join('') || `<li class="small">${esc(t('none'))}</li>`;
  let lastBody = `<p class="muted">${esc(t('none'))}</p>`;
  if (last) {
    lastBody = `<p><b>${esc(fmt(last.startsAt, tz))}</b> ${chip(last.status)}${last.attendance ? chip(last.attendance) : ''}${last.pendingReport ? chip('pending') : ''}</p>`;
    if (last.report) {
      lastBody += `<p>${esc(tx(last.report, 'summary'))}</p><p class="small"><b>${esc(t('homework'))}.</b> ${esc(tx(last.report, 'homework'))}</p><p class="small"><b>${esc(t('nextStep'))}.</b> ${esc(tx(last.report, 'nextStep'))}</p>`;
    } else {
      lastBody += `<p class="small">${esc(t('noReportYet'))}</p>`;
      if (card.lastReport) lastBody += `<p class="small"><b>${esc(t('m_recent_reports'))}.</b> ${esc(tx(card.lastReport, 'summary'))}</p>`;
    }
  }
  return `<article class="panel progress-card">
    <div class="row" style="justify-content:space-between">
      <div>
        <h2 style="margin:0"><a href="/app/students/${esc(card.student.id)}">${esc(nm(card.student))}</a></h2>
        <p class="small">${esc(card.student.level || '')} · ${esc(t('teacher'))} ${esc(nm(card.teacher))}</p>
      </div>
      <div class="chips">${chip(card.axes.academicStatus)}${chip(card.axes.subscriptionStatus)}</div>
    </div>
    ${card.student.goals ? `<p class="muted">${esc(card.student.goals)}</p>` : ''}
    <div class="metrics" style="margin-top:10px">
      <div class="metric"><span class="small">${esc(t('remaining'))}</span><span class="n">${num(card.credits.remaining)}</span></div>
      <div class="metric"><span class="small">${esc(t('delivered'))}</span><span class="n">${num(card.credits.delivered)}</span></div>
      <div class="metric"><span class="small">${esc(t('scheduled'))}</span><span class="n">${num(card.credits.scheduledNotHeld)}</span></div>
    </div>
    <div class="grid-2" style="margin-top:12px">
      <section>
        <h3>${esc(t('next'))}</h3>
        ${next
          ? `<p class="lesson-time">${esc(fmt(next.startsAt, tz))}</p><p class="small">${esc(tz)} · ${esc(nm(next.teacher))} · ${esc(next.course ? nm(next.course) : '')}</p><p><a class="btn ghost small" href="/app/sessions/${esc(next.id)}">${esc(t('open'))}</a></p>`
          : `<p class="muted">${esc(t('none'))}</p>`}
      </section>
      <section>
        <h3>${esc(t('lastLesson'))}</h3>
        ${lastBody}
        ${last ? `<p><a class="btn ghost small" href="/app/sessions/${esc(last.id)}">${esc(t('open'))}</a></p>` : ''}
      </section>
    </div>
    <section style="margin-top:12px">
      <h3>${esc(t('homework'))}</h3>
      <ul class="plain">${homework}</ul>
    </section>
  </article>`;
}

export async function viewLogin() {
  let demo = true;
  try { demo = (await api('GET', '/api/health')).demo !== false; } catch { demo = true; }
  const accounts = [
    ['admin@ummahacademy.net', 'Sakinah-Admin-2026', 'هدى السيد', 'Huda El-Sayed', 'إدارة كاملة'],
    ['ops@ummahacademy.net', 'Sakinah-Ops-2026', 'كريم نبيل', 'Karim Nabil', 'متابعة وتشغيل'],
    ['omneya@ummahacademy.net', 'Sakinah-Teach-2026', 'أمنية علي', 'Omneya Ali', 'معلمة تجويد'],
    ['sara@ummahacademy.net', 'Sakinah-Teach-2026', 'سارة أحمد', 'Sara Ahmed', 'معلمة عربية'],
    ['nour@ummahacademy.net', 'Sakinah-Teach-2026', 'نور حسن', 'Nour Hassan', 'أشبال الأمة'],
    ['khalid.rahman@example.com', 'Sakinah-Family-2026', 'خالد رحمن', 'Khalid Rahman', 'أب · ثلاثة أبناء وفواتير'],
    ['fatima.rahman@example.com', 'Sakinah-Family-2026', 'فاطمة رحمن', 'Fatima Rahman', 'أم · يوسف وليلى فقط، بلا فواتير'],
    ['omar.mansouri@example.com', 'Sakinah-Student-2026', 'عمر المنصوري', 'Omar', 'طالب · بياناته فقط'],
  ];
  const more = [
    ['sarah.mansouri@example.com', 'Sakinah-Family-2026', 'سارة المنصوري', 'London'],
    ['amina.bergstrom@example.com', 'Sakinah-Family-2026', 'أمينة بيرغستروم', 'Toronto · تجديد'],
    ['omar.alfarsi@example.com', 'Sakinah-Family-2026', 'عمر الفارسي', 'Sydney · ٧ صباحًا'],
    ['yasmin.dubois@example.com', 'Sakinah-Family-2026', 'ياسمين دوبوا', 'Paris · تجميد'],
  ];
  const btn = ([email, password, ar, en, hint]) =>
    `<button type="button" class="account" data-cmd="fill" data-email="${esc(email)}" data-password="${esc(password)}"><span><b>${esc(state.lang === 'ar' ? ar : en)}</b><small class="small">${esc(hint)} · ${esc(email)}</small></span><span class="chip">${esc(t('signIn'))}</span></button>`;
  return `<main class="login"><section class="login-card">
    <div>
      <a class="brand" href="/login">${mark()}<span>${esc(t('brand'))}</span></a>
      <p class="eyebrow">${esc(t('portal'))}</p>
      <h1 class="display">${esc(t('loginTitle'))}</h1>
      <p class="muted">${esc(t('loginLede'))}</p>
      ${demo ? `<p class="demo-note">${esc(t('demoNote'))}</p>` : `<p class="demo-note">${esc(state.lang === 'ar' ? 'بيئة إنتاج. كلمات المرور التجريبية مرفوضة.' : 'Production mode. Published demo passwords are refused.')}</p>`}
      <p class="small"><a data-native href="https://ummahacademy.net">${esc(t('site'))}</a></p>
    </div>
    <div>
      <form class="form" data-action="login">
        <label>${esc(t('email'))}<input name="email" type="email" autocomplete="username" required ${demo ? 'value="admin@ummahacademy.net"' : ''}></label>
        <label>${esc(t('password'))}<input name="password" type="password" autocomplete="current-password" required ${demo ? 'value="Sakinah-Admin-2026"' : ''}></label>
        <button class="btn primary" type="submit">${esc(t('signIn'))}</button>
      </form>
      ${demo ? `<p class="small">${esc(t('pick'))}</p><div class="accounts">${accounts.map(btn).join('')}</div><details><summary class="small">${esc(t('moreAccounts'))}</summary><div class="accounts">${more.map(btn).join('')}</div></details>` : ''}
    </div>
  </section></main>`;
}

function mark() {
  return `<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="#6b3fa0"/><rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="#1d5fa8" transform="rotate(45 20 20)"/><path d="M15.6 27.2v-6.1a4.4 4.4 0 0 1 8.8 0v6.1z" fill="#fff"/></svg>`;
}

export async function viewDashboard() {
  if (state.me.role === 'guardian' || state.me.role === 'student') return viewHome({});
  if (state.me.role === 'admin' || state.me.role === 'ops') return viewWorkspace();
  const data = await api('GET', '/api/dashboard');
  const metrics = (data.metrics || [])
    .map((m) => `<a class="metric" href="${esc(m.href || '/app')}"><span class="small">${esc(t('m_' + m.id) === 'm_' + m.id ? m.id : t('m_' + m.id))}</span><span class="n">${num(m.value)}</span></a>`)
    .join('');
  const notes = (data.notifications || [])
    .map((n) => `<a class="person" href="${esc(n.href || '/app')}"><span class="avatar">!</span><span><b>${esc(state.lang === 'ar' ? n.titleAr : n.title)}</b><small class="small">${esc(state.lang === 'ar' ? n.bodyAr : n.body)}</small></span></a>`)
    .join('') || `<p class="empty">${esc(t('none'))}</p>`;
  let extra = '';
  if (data.role === 'teacher') {
    extra = `<section class="panel"><h2>${esc(t('teachingNote'))}</h2><p>${esc(state.lang === 'ar' ? data.teaching.noteAr : data.teaching.noteEn)}</p><div class="row">${chip('scheduled')}<b>${num(data.teaching.scheduled)}</b> ${chip('completed')}<b>${num(data.teaching.completedThisWeek)}</b> <span class="small">${num(data.teaching.hoursThisWeek)} h</span></div><p><a class="btn primary small" href="/app/today">${esc(t('today'))}</a></p></section>`;
  }
  if (data.role === 'guardian') {
    extra = `<section class="stack">${(data.children || []).map((c) => person(`/app/students/${c.id}`, c, `${c.level || ''} · ${fmt(c.nextSession?.startsAt, c.timezone)}`)).join('')}${(data.overlaps || []).length ? `<div class="banner">${esc(t('overlap'))}</div>` : ''}</section>`;
  }
  if (data.role === 'student') {
    extra = `<section class="panel"><h2>${esc(t('homework'))}</h2>${(data.homework || []).map((r) => `<p>${esc(tx(r, 'homework'))}</p>`).join('') || `<p class="muted">${esc(t('none'))}</p>`}</section>`;
  }
  const queue = (data.queues?.pendingReports || data.queues?.today || [])
    .slice(0, 6)
    .map((s) => person(`/app/sessions/${s.id}`, s.student || { name: s.id }, `${fmt(s.startsAt, s.student?.timezone)} · ${nm(s.teacher)}`))
    .join('');
  return `${head(t('overview'), state.me.nameAr && state.lang === 'ar' ? state.me.nameAr : state.me.name)}
    <div class="metrics">${metrics}</div>
    <div class="grid-2" style="margin-top:14px">
      <section class="stack">${extra}${queue ? `<section class="panel"><h2>${esc(t('sessions'))}</h2>${queue}</section>` : ''}</section>
      <section class="panel"><h2>${esc(t('notifications'))}</h2>${notes}</section>
    </div>`;
}

function attendanceSelect(name, selected = 'present') {
  return `<select name="${esc(name)}">${['present', 'late', 'absent', 'excused'].map((status) => `<option value="${status}" ${selected === status ? 'selected' : ''}>${esc(t('st_' + status) === 'st_' + status ? status : t('st_' + status))}</option>`).join('')}</select>`;
}

function todayLesson(s) {
  const tz = s.student?.timezone || state.tz;
  const latest = s.attendance?.at(-1);
  const forms = [];
  if (s.actions?.attend && (s.status === 'scheduled' || s.status === 'confirmed')) {
    forms.push(`<form class="row" data-action="attendance"><input type="hidden" name="id" value="${esc(s.id)}">${attendanceSelect('status', latest?.status || 'present')}<button class="btn small" type="submit">${esc(t('attendance'))}</button></form>`);
  }
  if (s.actions?.complete) {
    forms.push(`<form class="row" data-action="complete"><input type="hidden" name="id" value="${esc(s.id)}">${attendanceSelect('attendance', latest?.status || 'present')}<button class="btn small primary" type="submit">${esc(t('complete'))}</button></form>`);
  }
  if (s.actions?.report && s.pendingReport) {
    forms.push(`<form class="form" data-action="report"><input type="hidden" name="id" value="${esc(s.id)}"><p class="small">${esc(t('reportDue'))}</p><label>${esc(t('summary'))}<textarea name="summary" required minlength="3"></textarea></label><label>${esc(t('homework'))}<input name="homework" required minlength="3"></label><label>${esc(t('nextStep'))}<input name="nextStep"></label><button class="btn primary" type="submit">${esc(t('report'))}</button></form>`);
  }
  return `<article class="panel stack">
    <div class="row" style="justify-content:space-between">
      <div>
        <p class="lesson-time">${esc(fmt(s.startsAt, tz))}</p>
        <p class="small">${esc(tz)} · ${esc(s.course ? nm(s.course) : '')}${s.substituteForTeacher ? ` · ${esc(t('substituteOf'))} ${esc(nm(s.substituteForTeacher))}` : ''}</p>
      </div>
      <div class="chips">${chip(s.status)}${s.pendingReport ? chip('pending') : ''}${latest ? chip(latest.status) : ''}</div>
    </div>
    ${person(`/app/students/${esc(s.studentId)}`, s.student || { name: s.studentId }, t('myFile'))}
    <div class="row"><a class="btn ghost small" href="/app/sessions/${esc(s.id)}">${esc(t('open'))}</a>${s.actions?.room ? `<a class="btn ghost small" data-native target="_blank" href="/api/sessions/${esc(s.id)}/room">${esc(t('join'))}</a>` : ''}</div>
    ${forms.join('')}
  </article>`;
}

export async function viewToday({ query }) {
  const qs = query.teacherId ? `?teacherId=${encodeURIComponent(query.teacherId)}` : '';
  const data = await api('GET', `/api/teacher/day${qs}`);
  if (data.picker) {
    const rows = (data.teachers || [])
      .map((tc) => person(`/app/today?teacherId=${encodeURIComponent(tc.id)}`, tc, `${num(tc.today)} · ${t('m_pending_reports')} ${num(tc.pendingReports)} · ${t('m_students')} ${num(tc.students)}`))
      .join('');
    return `${head(t('today'), t('pickTeacher'))}<div class="panel stack">${rows || `<p class="empty">${esc(t('empty'))}</p>`}</div>`;
  }
  const teacherTz = data.timezone || state.tz;
  const queue = query.queue === 'reports' ? 'reports' : 'today';
  const lessons = (data.today || []).map(todayLesson).join('') || `<p class="empty">${esc(t('noLessonToday'))}</p>`;
  const reports = (data.pendingReports || []).map(todayLesson).join('') || `<p class="empty">${esc(t('none'))}</p>`;
  const roster = (data.roster || [])
    .map((row) => {
      const sub = [
        row.isPrimary ? t('primaryNow') : t('coverNow'),
        `${t('assignedSince')} ${fmt(row.assignment.startAt, teacherTz)}`,
        row.nextSession ? `${t('next')} ${fmt(row.nextSession.startsAt, row.student.timezone || teacherTz)}` : t('none'),
        row.openHomework ? `${t('openHomework')} ${num(row.openHomework)}` : '',
      ].filter(Boolean).join(' · ');
      return person(`/app/students/${esc(row.student.id)}`, row.student, sub);
    })
    .join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  const metrics = [
    { id: 'today', value: data.counts?.today, href: '/app/today' },
    { id: 'pending_reports', value: data.counts?.pendingReports, href: '/app/today?queue=reports' },
    { id: 'students', value: data.counts?.students, href: '/app/today' },
  ].map((m) => `<a class="metric" href="${esc(m.href)}"><span class="small">${esc(t('m_' + m.id))}</span><span class="n">${num(m.value)}</span></a>`).join('');
  return `${head(t('today'), `${nm(data.teacher)} · ${esc(data.date)} · ${esc(teacherTz)}`)}
    <p class="muted">${esc(state.lang === 'ar' ? data.noteAr : data.noteEn)}</p>
    <div class="metrics">${metrics}</div>
    <div class="row" style="margin-top:12px">
      <a class="btn ghost small" href="/app/today">${esc(t('m_today'))}</a>
      <a class="btn ghost small" href="/app/today?queue=reports">${esc(t('filterPending'))}</a>
    </div>
    <div class="grid-2" style="margin-top:12px">
      <div class="stack">
        <section class="panel"><h2>${esc(queue === 'reports' ? t('m_pending_reports') : t('m_today'))}</h2></section>
        ${queue === 'reports' ? reports : lessons}
        ${queue === 'reports' ? '' : `<section class="panel"><h2>${esc(t('m_pending_reports'))}</h2></section>${reports}`}
      </div>
      <section class="panel stack"><h2>${esc(t('roster'))}</h2>${roster}</section>
    </div>`;
}

export async function viewHome({ query }) {
  const qs = new URLSearchParams();
  if (query.studentId) qs.set('studentId', query.studentId);
  if (query.familyId) qs.set('familyId', query.familyId);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const data = await api('GET', `/api/progress${suffix}`);
  const metrics = [
    { id: 'children', value: data.counts?.children },
    { id: 'upcoming', value: data.counts?.upcoming },
    { id: 'open_homework', value: data.counts?.openHomework },
    { id: 'remaining', value: data.counts?.remaining },
  ].map((m) => `<div class="metric"><span class="small">${esc(t('m_' + m.id))}</span><span class="n">${num(m.value)}</span></div>`).join('');
  const upcoming = (data.upcoming || [])
    .map((s) => person(`/app/sessions/${s.id}`, s.student, `${fmt(s.startsAt, s.timezone || state.tz)} · ${nm(s.teacher)}`))
    .join('') || `<p class="empty">${esc(t('none'))}</p>`;
  const cards = (data.children || []).map(progressCardHtml).join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  const request = state.me.role === 'guardian' && data.children?.length
    ? `<form class="form panel" data-action="request"><h2>${esc(t('request'))}</h2><label>${esc(t('student'))}<select name="studentId">${data.children.map((c) => `<option value="${esc(c.student.id)}">${esc(nm(c.student))}</option>`).join('')}</select></label><label>${esc(t('kind'))}<select name="kind"><option value="schedule">${esc(t('reschedule'))}</option><option value="teacher">${esc(t('changeTeacher'))}</option></select></label><label>${esc(t('reason'))}<textarea name="reason" required minlength="3"></textarea></label><button class="btn primary" type="submit">${esc(t('save'))}</button></form>`
    : '';
  return `${head(t('home'), data.family ? nm(data.family) : '')}
    <p class="muted">${esc(state.lang === 'ar' ? data.noteAr : data.noteEn)}</p>
    ${data.overlaps?.length ? `<div class="banner">${esc(t('overlap'))}</div>` : ''}
    <div class="metrics">${metrics}</div>
    <div class="grid-2" style="margin-top:14px">
      <div class="stack">${cards}${request}</div>
      <section class="panel stack"><h2>${esc(t('next'))}</h2>${upcoming}</section>
    </div>`;
}

export async function viewStudents({ query }) {
  const rows = await api('GET', `/api/students${query.status ? `?status=${encodeURIComponent(query.status)}` : ''}`);
  const body = rows.length
    ? rows.map((s) => person(`/app/students/${s.id}`, s, `${t('st_' + s.axes.academicStatus)} · ${t('st_' + s.axes.subscriptionStatus)} · ${s.loginEnabled ? t('loginOn') : t('loginOff')} · ${nm(s.primaryTeacher)}`)).join('')
    : `<p class="empty">${esc(t('empty'))}</p>`;
  return `${head(t('students'), '')}<div class="row"><a class="btn ghost small" href="/app/students">${esc(t('all'))}</a><a class="btn ghost small" href="/app/students?status=active">${esc(t('st_active'))}</a><a class="btn ghost small" href="/app/students?status=trial">${esc(t('st_trial'))}</a><a class="btn ghost small" href="/app/students?status=paused">${esc(t('st_paused'))}</a></div><div class="panel stack" style="margin-top:12px">${body}</div>`;
}

export async function viewStudent({ params, query }) {
  const dto = await api('GET', `/api/students/${params[0]}`);
  const tab = query.tab || 'overview';
  const s = dto.student;
  const familyViewer = state.me.role === 'guardian' || state.me.role === 'student';
  const items = familyViewer
    ? [
      ['overview', t('overview')],
      ['sessions', t('sessions')],
      ['homework', t('homework')],
      ['progress', t('progress')],
    ]
    : [
      ['overview', t('overview')],
      ['sessions', t('sessions')],
      ['teachers', t('teachersTab')],
      ['subscriptions', t('subscriptions')],
      ['progress', t('progress')],
      ['homework', t('homework')],
      ['followups', t('followups')],
      ['assets', t('assets')],
      ['activity', t('activity')],
    ];
  if (dto.payments) items.splice(familyViewer ? 3 : 4, 0, ['payments', t('payments')]);
  if (dto.audit) items.push(['audit', t('audit')]);
  if (familyViewer && dto.assets?.length) items.push(['assets', t('assets')]);
  if (familyViewer && state.me.role === 'guardian') items.push(['subscriptions', t('subscriptions')]);
  if (familyViewer) {
    const progress = tab === 'overview' ? await api('GET', `/api/progress/${s.id}`) : null;
    const body = tab === 'overview' ? progressCardHtml(progress.child) : await panel(tab, dto);
    return `${head(nm(s), s.level || '')}${tabs(tab, items)}<div class="stack">${body}</div>`;
  }
  const header = `<section class="panel">
    <div class="row" style="justify-content:space-between">
      <div class="row">${person(`/app/students/${s.id}`, s, s.id)}<div class="chips">${chip(dto.axes.academicStatus)}${chip(dto.axes.subscriptionStatus)}${chip(dto.axes.loginEnabled ? 'active' : 'paused')}<span class="small">${dto.axes.loginEnabled ? esc(t('loginOn')) : esc(t('loginOff'))}</span></div></div>
      <a class="btn ghost small" href="/app/families/${esc(s.familyId)}">${esc(nm(dto.family))}</a>
    </div>
    <p class="small">${esc(t('threeAxes'))}</p>
    <div class="metrics" style="margin-top:10px">
      <div class="metric"><span class="small">${esc(t('remaining'))}</span><span class="n">${num(dto.balance.total.remaining)}</span></div>
      <div class="metric"><span class="small">${esc(t('delivered'))}</span><span class="n">${num(dto.balance.total.delivered)}</span></div>
      <div class="metric"><span class="small">${esc(t('scheduled'))}</span><span class="n">${num(dto.balance.total.scheduledNotHeld)}</span></div>
      <div class="metric"><span class="small">${esc(t('allocated'))}</span><span class="n">${num(dto.balance.total.allocated)}</span></div>
    </div>
    <p class="formula">${esc(state.lang === 'ar' ? dto.balance.formulaAr : dto.balance.formulaEn)}</p>
    <p class="small">${esc(t('teacher'))}: ${esc(nm(dto.primaryTeacher))} · ${esc(t('next'))}: ${dto.nextSession ? esc(fmt(dto.nextSession.startsAt, s.timezone)) : esc(t('none'))}</p>
  </section>`;
  return `${head(nm(s), s.level || '')}${header}${tabs(tab, items)}<div class="stack">${await panel(tab, dto)}</div>`;
}

async function panel(tab, dto) {
  const s = dto.student;
  if (tab === 'overview') {
    const lines = dto.balance.byCycle
      .map((c) => `<section class="panel"><h3>${esc(c.planId)} · ${chip(c.status)} · ${esc(fmt(c.start, s.timezone))} → ${esc(fmt(c.end, s.timezone))}</h3><p class="small">${esc(t('remaining'))} ${num(c.remaining)} · ${esc(t('delivered'))} ${num(c.delivered)} · ${esc(t('scheduled'))} ${num(c.scheduledNotHeld)}</p>${lineTable(c.lines, s.timezone)}</section>`)
      .join('');
    return `<section class="panel"><div class="kv"><span>${esc(t('birth'))}</span><b>${num(s.birthYear)}</b><span>${esc(t('zone'))}</span><b>${esc(s.timezone)}</b><span>${esc(t('goals'))}</span><b>${esc(s.goals)}</b><span>${esc(t('level'))}</span><b>${esc(s.level)}</b></div>${staff() ? patchForm(s) : ''}</section>${lines}`;
  }
  if (tab === 'sessions') {
    return sessionTable(dto.sessions, s.timezone);
  }
  if (tab === 'teachers') {
    const rows = dto.assignments
      .map((a) => `<tr><td>${esc(nm(a.teacher))}</td><td>${esc(a.kind)}</td><td>${esc(fmt(a.startAt, s.timezone))}</td><td>${a.endAt ? esc(fmt(a.endAt, s.timezone)) : '—'}</td><td>${esc(a.reason || '')}</td></tr>`)
      .join('');
    const catalog = staff() ? await api('GET', '/api/catalog') : null;
    const form = catalog
      ? `<form class="form" data-action="assign"><input type="hidden" name="enrollmentId" value="${esc(dto.enrollments[0]?.id || '')}"><label>${esc(t('teacher'))}<select name="teacherId">${catalog.teachers.map((tc) => `<option value="${esc(tc.id)}">${esc(nm(tc))}</option>`).join('')}</select></label><label>${esc(t('reason'))}<input name="reason" required minlength="3"></label><label class="row"><input type="checkbox" name="moveFuture" value="1" checked> ${esc(t('moveFuture'))}</label><button class="btn primary" type="submit">${esc(t('changeTeacher'))}</button></form>`
      : '';
    return `<section class="panel"><table><thead><tr><th>${esc(t('teacher'))}</th><th>${esc(t('kind'))}</th><th>${esc(t('from'))}</th><th>${esc(t('to'))}</th><th>${esc(t('reason'))}</th></tr></thead><tbody>${rows}</tbody></table></section><section class="panel">${form}</section>`;
  }
  if (tab === 'subscriptions') {
    return dto.subscriptions.map((sub) => subCard(sub, s)).join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  }
  if (tab === 'payments') {
    if (!dto.payments) return `<p class="banner">${esc(t('hiddenMoney'))}</p>`;
    const rows = dto.payments
      .map((p) => `<tr><td>${esc(p.id)}</td><td>${chip(p.status)}</td><td>${esc(money(p.amount))}</td><td>${esc(p.method)}</td><td>${esc(p.failureReason || '')}</td><td>${esc(fmt(p.createdAt))}</td></tr>`)
      .join('');
    return `<section class="panel"><table><thead><tr><th>ID</th><th>${esc(t('status'))}</th><th>${esc(t('amount'))}</th><th>${esc(t('method'))}</th><th>${esc(t('reason'))}</th><th>${esc(t('when'))}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
  }
  if (tab === 'progress') {
    const reports = dto.progress.reports
      .map((r) => `<article class="panel"><h3>${esc(tx(r, 'summary'))}</h3><p><b>${esc(t('homework'))}.</b> ${esc(tx(r, 'homework'))}</p><p><b>${esc(t('nextStep'))}.</b> ${esc(tx(r, 'nextStep'))}</p></article>`)
      .join('');
    return `<section class="panel"><p><b>${esc(t('goals'))}.</b> ${esc(s.goals)}</p><p>${esc(s.strengths)} · ${esc(s.improvements)}</p></section>${reports || `<p class="empty">${esc(t('empty'))}</p>`}`;
  }
  if (tab === 'homework') {
    const rows = (dto.homework || [])
      .map((h) => `<article class="panel"><div class="row">${chip(h.open ? 'pending' : 'completed')}<b>${esc(tx(h, 'title'))}</b></div><p>${esc(tx(h, 'instructions'))}</p><p class="small">${esc(t('hwDue'))}: ${esc(fmt(h.dueAt, s.timezone))}${h.sessionId ? ` · <a href="/app/sessions/${esc(h.sessionId)}">${esc(t('sessions'))}</a>` : ''}</p></article>`)
      .join('');
    return rows || `<p class="empty">${esc(t('empty'))}</p>`;
  }
  if (tab === 'followups') {
    return dto.followUps.map(followCard).join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  }
  if (tab === 'assets') {
    if (!dto.assets.length) return `<p class="empty">${esc(t('empty'))}</p>`;
    return dto.assets
      .map((a) => `<article class="panel row" style="justify-content:space-between"><div><b>${esc(nm(a))}</b><div class="small">${chip(a.status)} · ${esc(a.type)} · ${esc(fmt(a.createdAt, s.timezone))}</div></div>${a.status === 'ready' ? `<button class="btn small primary" type="button" data-cmd="asset" data-id="${esc(a.id)}">${esc(t('openFile'))}</button>` : `<span class="small">${esc(t('failedFile'))}</span>`}</article>`)
      .join('');
  }
  if (tab === 'activity') {
    const items = dto.timeline.map((e) => `<li><b>${esc(state.lang === 'ar' ? e.summaryAr : e.summary)}</b><div class="small">${esc(fmt(e.occurredAt, s.timezone))}</div></li>`).join('');
    return `<ol class="timeline">${items || `<li>${esc(t('none'))}</li>`}</ol>`;
  }
  if (tab === 'audit') {
    return auditTable(dto.audit || []);
  }
  return '';
}

function lineTable(lines, tz) {
  if (!lines?.length) return `<p class="small">${esc(t('none'))}</p>`;
  return `<table><thead><tr><th>${esc(t('sessions'))}</th><th>${esc(t('status'))}</th><th>${esc(t('consumed'))}</th><th>${esc(t('reason'))}</th></tr></thead><tbody>${lines
    .map((l) => `<tr><td><a href="/app/sessions/${esc(l.sessionId)}">${esc(l.sessionId)}</a></td><td>${chip(l.status)}</td><td>${num(l.consumed)}</td><td>${esc(state.lang === 'ar' ? l.ar : l.en)}</td></tr>`)
    .join('')}</tbody></table>`;
}

function sessionTable(sessions, tz) {
  if (!sessions?.length) return `<p class="empty">${esc(t('empty'))}</p>`;
  const rows = sessions
    .map((s) => `<tr><td><a href="/app/sessions/${esc(s.id)}">${esc(fmt(s.startsAt, tz))}</a>${s.pendingReport ? `<div>${chip('pending')}</div>` : ''}</td><td>${esc(nm(s.teacher))}${s.substituteFor ? `<div class="small">${esc(t('substituteOf'))} ${esc(nm(s.substituteForTeacher))}</div>` : ''}</td><td>${chip(s.status)}</td><td>${esc(s.course ? nm(s.course) : '')}</td></tr>`)
    .join('');
  return `<section class="panel"><table><thead><tr><th>${esc(t('when'))}</th><th>${esc(t('teacher'))}</th><th>${esc(t('status'))}</th><th>${esc(t('course'))}</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

function patchForm(s) {
  return `<form class="form" data-action="student-patch" style="margin-top:12px"><input type="hidden" name="id" value="${esc(s.id)}"><div class="grid-3"><label>${esc(t('academic'))}<select name="academicStatus">${['trial', 'active', 'paused', 'graduated', 'withdrawn'].map((x) => `<option ${s.academicStatus === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label><label>${esc(t('loginAxis'))}<select name="loginEnabled"><option value="true" ${s.loginEnabled ? 'selected' : ''}>${esc(t('enabled'))}</option><option value="false" ${!s.loginEnabled ? 'selected' : ''}>${esc(t('disabled'))}</option></select></label><label>${esc(t('level'))}<input name="level" value="${esc(s.level || '')}"></label></div><label>${esc(t('reason'))}<input name="reason" required minlength="3" placeholder="${esc(t('reason'))}"></label><button class="btn small" type="submit">${esc(t('save'))}</button></form>`;
}

function subCard(sub, student) {
  const cycles = (sub.cycles || [])
    .map((c) => `<div class="panel"><div class="row">${chip(c.status)}<b>${esc(c.planId)}</b><span class="small">${esc(fmt(c.start, student.timezone))} → ${esc(fmt(c.end, student.timezone))}</span></div><p>${esc(t('allocated'))} ${num(c.balance.allocated)} · ${esc(t('remaining'))} ${num(c.balance.remaining)} · ${esc(t('delivered'))} ${num(c.balance.delivered)}</p>${c.priceUsd != null ? `<p class="small">${esc(money(c.priceUsd))}</p>` : ''}${lineTable(c.balance.lines, student.timezone)}${staff() ? `<form class="form" data-action="adjust"><input type="hidden" name="cycleId" value="${esc(c.id)}"><div class="row"><label>${esc(t('delta'))}<input name="delta" type="number" required value="1"></label><label>${esc(t('reason'))}<input name="reason" required minlength="3"></label><button class="btn small" type="submit">${esc(t('adjust'))}</button></div></form>` : ''}</div>`)
    .join('');
  const actions = staff()
    ? `<div class="stack">
      <form class="form" data-action="renew"><input type="hidden" name="id" value="${esc(sub.id)}"><div class="row"><label>${esc(t('plan'))}<select name="planId">${['launch', 'consistent', 'elite', 'starter', 'gold', 'diamond'].map((p) => `<option ${sub.planId === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label><label>${esc(t('reason'))}<input name="reason" required minlength="3"></label><button class="btn small primary" type="submit">${esc(t('renew'))}</button></div></form>
      <form class="row" data-action="freeze"><input type="hidden" name="id" value="${esc(sub.id)}"><input name="reason" required minlength="3" placeholder="${esc(t('reason'))}"><button class="btn small" type="submit">${esc(t('freeze'))}</button></form>
      <form class="row" data-action="resume"><input type="hidden" name="id" value="${esc(sub.id)}"><input name="reason" required minlength="3" placeholder="${esc(t('reason'))}"><button class="btn small" type="submit">${esc(t('resume'))}</button></form>
      <form class="row" data-action="cancel-sub"><input type="hidden" name="id" value="${esc(sub.id)}"><input name="reason" required minlength="3" placeholder="${esc(t('reason'))}"><button class="btn small danger" type="submit">${esc(t('cancelSub'))}</button></form>
      <form class="row" data-action="pay"><input type="hidden" name="subscriptionId" value="${esc(sub.id)}"><input name="amount" type="number" min="0" required placeholder="${esc(t('amount'))}"><select name="status"><option>paid</option><option>failed</option><option>pending</option><option>refunded</option></select><input name="reason" placeholder="${esc(t('reason'))}"><button class="btn small" type="submit">${esc(t('pay'))}</button></form>
    </div>`
    : dtoMoneyNote(sub);
  return `<section class="panel"><div class="row">${chip(sub.status)}<h2>${esc(sub.plan?.nameAr && state.lang === 'ar' ? sub.plan.nameAr : sub.plan?.name || sub.planId)}</h2>${sub.hasFailedPayment ? chip('failed') : ''}${sub.paymentStatus ? chip(sub.paymentStatus) : ''}</div>${cycles}${actions}</section>`;
}

function dtoMoneyNote(sub) {
  return sub.plan?.price == null ? `<p class="small">${esc(t('hiddenMoney'))}</p>` : '';
}

function followCard(f) {
  return `<article class="panel"><div class="row">${chip(f.status)}${chip(f.priority)}${chip(f.type)}${f.overdue ? chip('urgent') : ''}</div><h3><a href="/app/follow-ups/${esc(f.id)}">${esc(nm(f))}</a></h3><p class="small">${esc(t('due'))}: ${esc(fmt(f.dueAt))} · ${esc(t('assignee'))}: ${esc(nm(f.assignee))}</p>${f.outcome ? `<p>${esc(f.outcome)}</p>` : ''}<p class="small">${num(f.attempts?.length || 0)} ${esc(t('attempts'))}</p></article>`;
}

function auditTable(rows) {
  if (!rows?.length) return `<p class="empty">${esc(t('empty'))}</p>`;
  return `<section class="panel"><table><thead><tr><th>${esc(t('when'))}</th><th>${esc(t('who'))}</th><th>${esc(t('action'))}</th><th>${esc(t('reason'))}</th><th>${esc(t('before'))}</th><th>${esc(t('after'))}</th></tr></thead><tbody>${rows
    .map((a) => `<tr><td>${esc(fmt(a.occurredAt))}</td><td>${esc(nm(a.actor) || a.actorId)}</td><td><code>${esc(a.action)}</code><div class="small">${esc(a.entityType)} ${esc(a.entityId)}</div></td><td>${esc(a.reason || '')}</td><td><code>${esc(JSON.stringify(a.before))}</code></td><td><code>${esc(JSON.stringify(a.after))}</code></td></tr>`)
    .join('')}</tbody></table></section>`;
}

export async function viewFamilies() {
  const rows = await api('GET', '/api/families');
  return `${head(t('families'))}<div class="panel stack">${rows.map((f) => person(`/app/families/${f.id}`, f, `${f.city} · ${f.children}`)).join('')}</div>`;
}

export async function viewFamily({ params, query }) {
  const dto = await api('GET', `/api/families/${params[0]}`);
  const tab = query.tab || 'overview';
  const items = [['overview', t('overview')], ['schedule', t('schedule')], ['followups', t('followups')], ['activity', t('activity')]];
  if (dto.moneyVisible) items.splice(2, 0, ['billing', t('payments')]);
  const kids = dto.children.map((c) => person(`/app/students/${c.id}`, c, `${c.level || ''} · ${nm(c.primaryTeacher)} · ${fmt(c.nextSession?.startsAt, c.timezone)}`)).join('');
  let body = kids;
  if (tab === 'overview') {
    try {
      const hub = await api('GET', `/api/progress?familyId=${encodeURIComponent(dto.family.id)}`);
      body = (hub.children || []).map(progressCardHtml).join('') || kids;
    } catch {
      body = kids;
    }
  }
  if (tab === 'schedule') body = `${dto.overlaps?.length ? `<div class="banner">${esc(t('overlap'))}</div>` : ''}${sessionTable(dto.sessions, dto.family.timezone)}`;
  if (tab === 'billing') {
    body = dto.payments
      ? `<section class="panel"><table><tbody>${dto.payments.map((p) => `<tr><td>${esc(nm(dto.children.find((c) => c.id === dto.subscriptions.find((s) => s.id === p.subscriptionId)?.studentId) || {}))}</td><td>${chip(p.status)}</td><td>${esc(money(p.amount))}</td><td>${esc(p.failureReason || '')}</td></tr>`).join('')}</tbody></table></section>`
      : `<p class="banner">${esc(t('hiddenMoney'))}</p>`;
  }
  if (tab === 'followups') body = dto.followUps.map(followCard).join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  if (tab === 'activity') body = `<ol class="timeline">${dto.timeline.map((e) => `<li><b>${esc(state.lang === 'ar' ? e.summaryAr : e.summary)}</b><div class="small">${esc(fmt(e.occurredAt))}</div></li>`).join('')}</ol>`;
  const request = state.me.role === 'guardian'
    ? `<form class="form panel" data-action="request"><label>${esc(t('student'))}<select name="studentId">${dto.children.map((c) => `<option value="${esc(c.id)}">${esc(nm(c))}</option>`).join('')}</select></label><label>${esc(t('kind'))}<select name="kind"><option value="schedule">${esc(t('reschedule'))}</option><option value="teacher">${esc(t('changeTeacher'))}</option></select></label><label>${esc(t('reason'))}<textarea name="reason" required minlength="3"></textarea></label><button class="btn primary" type="submit">${esc(t('request'))}</button></form>`
    : '';
  const messagingConsent = state.me.role === 'guardian' && dto.myGuardian
    ? `<section class="panel stack"><h2>${state.lang === 'ar' ? 'تفضيلات رسائل واتساب' : 'WhatsApp message preferences'}</h2><p>${state.lang === 'ar' ? 'الحالة الحالية' : 'Current status'}: ${chip(dto.myGuardian.whatsappConsent)}</p><p class="muted">${state.lang === 'ar' ? 'لا تُرسل الرسائل تلقائيًا. يمكنك تغيير تفضيلك في أي وقت.' : 'Messages are not sent automatically. You can change this preference at any time.'}</p><div class="cluster"><form data-action="whatsapp-consent"><input type="hidden" name="guardianId" value="${esc(dto.myGuardian.id)}"><input type="hidden" name="status" value="opted_in"><button class="btn primary" type="submit">${state.lang === 'ar' ? 'أوافق على رسائل واتساب' : 'Opt in to WhatsApp messages'}</button></form><form data-action="whatsapp-consent"><input type="hidden" name="guardianId" value="${esc(dto.myGuardian.id)}"><input type="hidden" name="status" value="opted_out"><button class="btn" type="submit">${state.lang === 'ar' ? 'إيقاف رسائل واتساب' : 'Stop WhatsApp messages'}</button></form></div></section>`
    : '';
  return `${head(nm(dto.family), `${dto.family.city} · ${dto.family.timezone}`)}${dto.overlaps?.length && tab === 'overview' ? `<div class="banner">${esc(t('overlap'))}</div>` : ''}${tabs(tab, items)}<div class="stack">${body}${messagingConsent}${request}${phoneForms(dto)}</div>`;
}

export async function viewTeachers() {
  const rows = await api('GET', '/api/teachers');
  return `${head(t('teachers'))}<div class="panel stack">${rows.map((tc) => person(`/app/teachers/${tc.id}`, tc, `${state.lang === 'ar' ? tc.specialtyAr : tc.specialty} · ${num(tc.activeStudents)}`)).join('')}</div>`;
}

export async function viewTeacher({ params }) {
  const dto = await api('GET', `/api/teachers/${params[0]}`);
  if (dto.public) return `${head(nm(dto.teacher), state.lang === 'ar' ? dto.teacher.specialtyAr : dto.teacher.specialty)}<p class="muted">${esc(state.lang === 'ar' ? dto.teacher.roleAr : dto.teacher.role)}</p>`;
  const students = (dto.students || []).map((s) => person(`/app/students/${s.id}`, s, '')).join('');
  const pending = (dto.pendingReports || []).map((s) => person(`/app/sessions/${s.id}`, s.student, fmt(s.startsAt, s.student?.timezone))).join('');
  return `${head(nm(dto.teacher), state.lang === 'ar' ? dto.teacher.specialtyAr : dto.teacher.specialty)}<div class="grid-2"><section class="panel"><h2>${esc(t('students'))}</h2>${students || `<p class="empty">${esc(t('empty'))}</p>`}</section><section class="panel"><h2>${esc(t('m_pending_reports'))}</h2>${pending || `<p class="empty">${esc(t('none'))}</p>`}</section></div>`;
}

export async function viewSchedule({ query }) {
  const qs = new URLSearchParams();
  if (query.pendingReport) qs.set('pendingReport', '1');
  if (query.status) qs.set('status', query.status);
  if (query.mine || state.me.role === 'teacher') qs.set('teacherId', query.teacherId || state.me.teacherId || '');
  if (query.window === '24h') {
    qs.set('from', new Date().toISOString());
    qs.set('to', new Date(Date.now() + 24 * 3600 * 1000).toISOString());
  }
  if (state.me.role === 'teacher' && !query.teacherId) qs.set('mine', '1');
  const sessions = await api('GET', `/api/sessions?${qs.toString()}`);
  const groups = new Map();
  for (const s of sessions) {
    const key = dayKey(s.startsAt, state.tz);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  const list = [...groups.entries()]
    .map(([day, rows]) => `<section><h2>${esc(day)}</h2>${rows.map((s) => `<a class="person" href="/app/sessions/${esc(s.id)}"><span class="avatar">${esc(initials(s.student))}</span><span><b>${esc(nm(s.student))}</b><small class="small">${esc(fmt(s.startsAt, s.student?.timezone || state.tz))} · ${esc(nm(s.teacher))} · ${esc(s.student?.timezone || '')}</small></span>${chip(s.status)}${s.pendingReport ? chip('pending') : ''}</a>`).join('')}</section>`)
    .join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  const catalog = staff() ? await api('GET', '/api/catalog') : null;
  const form = catalog
    ? `<form class="form panel" data-action="create-session"><h2>${esc(t('createSession'))}</h2><label>${esc(t('student'))}<select name="studentId">${catalog.students.map((s) => `<option value="${esc(s.id)}">${esc(nm(s))}</option>`).join('')}</select></label><label>${esc(t('teacher'))}<select name="teacherId">${catalog.teachers.map((tc) => `<option value="${esc(tc.id)}">${esc(nm(tc))}</option>`).join('')}</select></label><label>${esc(t('when'))}<input type="datetime-local" name="local" required></label><label>${esc(t('zone'))}<input name="timeZone" value="${esc(state.tz)}"></label><label>${esc(t('duration'))}<input name="durationMin" type="number" value="30"></label><label>${esc(state.lang === 'ar' ? 'أسابيع' : 'Weeks')}<input name="count" type="number" min="1" max="12" value="1"></label><button class="btn primary" type="submit">${esc(t('save'))}</button></form>`
    : '';
  return `${head(t('schedule'), state.tz)}<div class="row"><a class="btn ghost small" href="/app/schedule">${esc(t('all'))}</a><a class="btn ghost small" href="/app/schedule?pendingReport=1">${esc(t('filterPending'))}</a><a class="btn ghost small" href="/app/schedule?window=24h">${esc(t('filter24'))}</a></div><div class="grid-2" style="margin-top:12px"><div class="panel stack">${list}</div>${form}</div>`;
}

export async function viewSession({ params }) {
  const s = await api('GET', `/api/sessions/${params[0]}`);
  const tz = s.student?.timezone || state.tz;
  const report = s.report
    ? `<section class="panel"><h2>${esc(t('report'))}</h2><p>${esc(tx(s.report, 'summary'))}</p><p><b>${esc(t('homework'))}.</b> ${esc(tx(s.report, 'homework'))}</p><p><b>${esc(t('nextStep'))}.</b> ${esc(tx(s.report, 'nextStep'))}</p></section>`
    : '';
  const forms = [];
  if (s.actions?.attend) {
    forms.push(`<form class="row" data-action="attendance"><input type="hidden" name="id" value="${esc(s.id)}"><select name="status"><option>present</option><option>late</option><option>absent</option><option>excused</option></select><button class="btn small" type="submit">${esc(t('attendance'))}</button></form>`);
  }
  if (s.actions?.complete) {
    forms.push(`<form class="row" data-action="complete"><input type="hidden" name="id" value="${esc(s.id)}"><select name="attendance"><option>present</option><option>late</option><option>absent</option></select><button class="btn small primary" type="submit">${esc(t('complete'))}</button></form>`);
  }
  if (s.actions?.confirm) forms.push(`<form data-action="confirm-session"><input type="hidden" name="id" value="${esc(s.id)}"><button class="btn small" type="submit">${esc(t('confirm'))}</button></form>`);
  if (s.actions?.report) {
    forms.push(`<form class="form" data-action="report"><input type="hidden" name="id" value="${esc(s.id)}"><label>${esc(t('summary'))}<textarea name="summary" required minlength="3"></textarea></label><label>${esc(t('homework'))}<input name="homework"></label><label>${esc(t('nextStep'))}<input name="nextStep"></label><button class="btn primary" type="submit">${esc(t('report'))}</button></form>`);
  }
  if (s.actions?.approveReport) {
    forms.push(`<form data-action="approve-report"><input type="hidden" name="id" value="${esc(s.id)}"><p class="small">${esc(t('pendingReview'))}</p><button class="btn primary" type="submit">${esc(t('approveReport'))}</button></form>`);
  }
  if (s.actions?.cancel) {
    forms.push(`<form class="form" data-action="cancel-session"><input type="hidden" name="id" value="${esc(s.id)}"><label>${esc(t('party'))}<select name="party"><option value="family">family</option><option value="teacher">teacher</option><option value="academy">academy</option></select></label><label>${esc(t('reason'))}<input name="reason" required minlength="3"></label><button class="btn danger small" type="submit">${esc(t('cancel'))}</button></form>`);
  }
  if (s.actions?.reschedule) {
    forms.push(`<form class="form" data-action="reschedule"><input type="hidden" name="id" value="${esc(s.id)}"><label>${esc(t('when'))}<input type="datetime-local" name="local" required></label><input type="hidden" name="timeZone" value="${esc(tz)}"><label>${esc(t('reason'))}<input name="reason" required minlength="3"></label><button class="btn small" type="submit">${esc(t('reschedule'))}</button></form>`);
  }
  if (s.actions?.attend) {
    forms.push(`<form class="row" data-action="no-show"><input type="hidden" name="id" value="${esc(s.id)}"><select name="party"><option value="student">student</option><option value="teacher">teacher</option></select><input name="reason" required minlength="3" placeholder="${esc(t('reason'))}"><button class="btn small" type="submit">${esc(t('noShow'))}</button></form>`);
  }
  if (s.actions?.substitute) {
    const catalog = await api('GET', '/api/catalog');
    forms.push(`<form class="form" data-action="substitute"><input type="hidden" name="id" value="${esc(s.id)}"><label>${esc(t('teacher'))}<select name="teacherId">${catalog.teachers.map((tc) => `<option value="${esc(tc.id)}">${esc(nm(tc))}</option>`).join('')}</select></label><label>${esc(t('reason'))}<input name="reason" required minlength="3"></label><button class="btn small" type="submit">${esc(t('substitute'))}</button></form>`);
  }
  const assets = (s.assets || [])
    .map((a) => a.status === 'ready' ? `<button class="btn small" type="button" data-cmd="asset" data-id="${esc(a.id)}">${esc(nm(a))}</button>` : `<span class="small">${esc(t('failedFile'))}</span>`)
    .join('');
  return `${head(nm(s.student), s.course ? nm(s.course) : '')}
    <section class="panel">
      <div class="chips">${chip(s.status)}${s.pendingReport ? chip('pending') : ''}${s.pendingReview ? chip('review') : ''}</div>
      <p><b>${esc(fmt(s.startsAt, tz))}</b> <span class="small">${esc(tz)}</span></p>
      <p class="small">${esc(t('zone'))} ${esc(state.tz)}: ${esc(fmt(s.startsAt, state.tz))}</p>
      ${s.originalStartsAt ? `<p class="small">${esc(t('original'))}: ${esc(fmt(s.originalStartsAt, tz))}</p>` : ''}
      <p>${esc(t('teacher'))}: ${esc(nm(s.teacher))}${s.substituteForTeacher ? ` · ${esc(t('substituteOf'))} ${esc(nm(s.substituteForTeacher))}` : ''}</p>
      <p><a href="/app/students/${esc(s.studentId)}">${esc(t('myFile'))}</a> ${s.actions?.room ? `· <a data-native target="_blank" href="/api/sessions/${esc(s.id)}/room">${esc(t('join'))}</a>` : ''}</p>
      <div class="row">${assets}</div>
    </section>
    ${report}
    <section class="stack">${forms.map((f) => `<div class="panel">${f}</div>`).join('')}</section>
    ${uploadForm(s)}`;
}

export async function viewSubscriptions({ query }) {
  const rows = await api('GET', `/api/subscriptions${query.renewing ? `?renewing=${encodeURIComponent(query.renewing)}` : ''}`);
  const filtered = query.payment === 'failed' ? rows.filter((s) => s.hasFailedPayment) : rows;
  const body = filtered
    .map((s) => `<a class="person" href="/app/students/${esc(s.studentId)}?tab=subscriptions"><span class="avatar">${esc(initials(s.student))}</span><span><b>${esc(nm(s.student))}</b><small class="small">${esc(s.plan?.name || s.planId)} · ${esc(s.status)}</small></span>${chip(s.status)}${s.hasFailedPayment ? chip('failed') : ''}</a>`)
    .join('') || `<p class="empty">${esc(t('empty'))}</p>`;
  return `${head(t('subscriptions'), query.payment === 'failed' ? t('failedOnly') : '')}<div class="panel stack">${body}</div>`;
}

export async function viewFollowUps({ query }) {
  const qs = new URLSearchParams();
  if (query.overdue) qs.set('overdue', '1');
  if (query.status) qs.set('status', query.status);
  const rows = await api('GET', `/api/follow-ups?${qs.toString()}`);
  const form = staff()
    ? `<form class="form panel" data-action="create-follow"><h2>${esc(t('createFollow'))}</h2><label>${esc(t('title'))}<input name="title" required minlength="3"></label><label>${esc(t('kind'))}<select name="type"><option>family</option><option>sales</option><option>academic</option><option>subscription</option><option>teacher_ops</option><option>technical</option></select></label><label>${esc(t('student'))}<input name="studentId" placeholder="stu_yusuf"></label><label>${esc(t('priority'))}<select name="priority"><option>normal</option><option>high</option><option>urgent</option></select></label><button class="btn primary" type="submit">${esc(t('save'))}</button></form>`
    : '';
  return `${head(t('followups'))}<div class="row"><a class="btn ghost small" href="/app/follow-ups">${esc(t('all'))}</a><a class="btn ghost small" href="/app/follow-ups?overdue=1">${esc(t('m_overdue_followups'))}</a></div><div class="grid-2" style="margin-top:12px"><div class="stack">${rows.map(followCard).join('') || `<p class="empty">${esc(t('empty'))}</p>`}</div>${form}</div>`;
}

export async function viewFollowUp({ params }) {
  const f = await api('GET', `/api/follow-ups/${params[0]}`);
  const attempts = (f.attempts || []).map((a) => `<li><b>${esc(fmt(a.at))}</b> · ${esc(a.channel)}<div>${esc(state.lang === 'ar' ? a.noteAr || a.note : a.note)}</div></li>`).join('');
  const forms = staff()
    ? `<form class="form" data-action="attempt"><input type="hidden" name="id" value="${esc(f.id)}"><label>${esc(t('channel'))}<select name="channel"><option>whatsapp</option><option>call</option><option>portal</option></select></label><label>${esc(t('note'))}<textarea name="note" required minlength="2"></textarea></label><button class="btn small" type="submit">${esc(t('attempt'))}</button></form>
      <form class="form" data-action="transition"><input type="hidden" name="id" value="${esc(f.id)}"><label>${esc(t('status'))}<select name="status"><option>in_progress</option><option>waiting</option><option>resolved</option><option>closed</option></select></label><label>${esc(t('outcome'))}<textarea name="outcome" minlength="3"></textarea></label><button class="btn primary" type="submit">${esc(t('close'))}</button></form>`
    : '';
  return `${head(nm(f), f.id)}<section class="panel"><div class="chips">${chip(f.status)}${chip(f.priority)}${chip(f.visibility)}</div><p>${esc(t('due'))}: ${esc(fmt(f.dueAt))} · ${esc(t('assignee'))}: ${esc(nm(f.assignee))}</p>${f.student ? person(`/app/students/${f.studentId}`, f.student, '') : ''}${f.outcome ? `<p class="formula">${esc(f.outcome)}</p>` : ''}</section><section class="panel"><h2>${esc(t('attempts'))}</h2><ol class="timeline">${attempts || `<li>${esc(t('none'))}</li>`}</ol></section><section class="panel stack">${forms}</section>`;
}

export async function viewAudit() {
  const rows = await api('GET', '/api/audit');
  return `${head(t('audit'), t('history'))}${auditTable(rows)}`;
}

export async function viewHealth() {
  const [health, acceptance] = await Promise.all([api('GET', '/api/integrity'), api('GET', '/api/acceptance')]);
  const issues = health.issues.map((i) => `<li>${chip(i.level === 'error' ? 'failed' : 'waiting')} ${esc(state.lang === 'ar' ? i.messageAr : i.message)} <code>${esc(i.entityId || '')}</code></li>`).join('');
  const checks = acceptance.checks
    .map((c) => `<a class="person" href="${esc(c.href)}"><span class="avatar">${c.pass ? '✓' : '!'}</span><span><b>${esc(state.lang === 'ar' ? c.ar : c.en)}</b><small class="small">${c.pass ? esc(t('pass')) : esc(t('fail'))}</small></span></a>`)
    .join('');
  const reset = state.me.role === 'admin' ? `<form class="panel" data-action="reset"><p>${esc(t('resetWarn'))}</p><button class="btn danger" type="submit">${esc(t('reset'))}</button></form>` : '';
  return `${head(t('health'))}<div class="banner ${health.ok && acceptance.pass ? 'ok' : 'bad'}">${health.ok && acceptance.pass ? esc(t('pass')) : esc(t('fail'))}</div><div class="grid-2" style="margin-top:12px"><section class="panel"><h2>${esc(t('integrity'))}</h2><ul>${issues || `<li>${esc(t('none'))}</li>`}</ul></section><section class="panel"><h2>${esc(t('acceptance'))}</h2><div class="stack">${checks}</div></section></div>${reset}`;
}

export async function viewSearch({ query }) {
  const data = await api('GET', `/api/search?q=${encodeURIComponent(query.q || '')}`);
  const block = (title, rows, href, label) => `<section class="panel"><h2>${esc(title)}</h2>${rows.map((r) => person(href(r), r, label(r))).join('') || `<p class="empty">${esc(t('none'))}</p>`}</section>`;
  return `${head(t('search'), query.q || '')}<div class="stack">
    ${block(t('students'), data.students, (r) => `/app/students/${r.id}`, (r) => r.academicStatus || '')}
    ${block(t('families'), data.families, (r) => `/app/families/${r.id}`, (r) => r.city || '')}
    ${block(t('sessions'), data.sessions.map((r) => ({ ...r, name: r.student?.name, nameAr: r.student?.nameAr })), (r) => `/app/sessions/${r.id}`, (r) => fmt(r.startsAt))}
    ${block(t('followups'), data.followUps, (r) => `/app/follow-ups/${r.id}`, (r) => r.status || '')}
  </div>`;
}

export function viewMissing() {
  return `${head(t('notFound'))}<p><a href="/app">${esc(t('back'))}</a></p>`;
}

export function markSvg() {
  return mark();
}
