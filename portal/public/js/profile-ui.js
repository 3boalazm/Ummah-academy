/**
 * Profiles and site performance. Three screens:
 *   /app/profile                 who I am, my role profile, my preferences, my password
 *   /app/students/:id/learning   the learning profile of a student (what they are learning, how it is going)
 *   /app/performance             staff only: real-user Core Web Vitals of the marketing site
 */
import { api, chip, errText, esc, fmt, initials, nm, num, state, toast, tx } from './util.js';

const L = {
  profile: ['ملفي الشخصي', 'My profile'],
  profileLede: ['من أنت داخل الأكاديمية، وما الذي يمكنك تعديله بنفسك.', 'Who you are in the academy, and what you can change yourself.'],
  account: ['الحساب', 'Account'],
  email: ['البريد', 'Email'],
  role: ['الدور', 'Role'],
  name: ['الاسم', 'Name'],
  nameAr: ['الاسم بالعربية', 'Arabic name'],
  language: ['اللغة', 'Language'],
  timezone: ['المنطقة الزمنية', 'Time zone'],
  save: ['حفظ', 'Save'],
  saved: ['تم الحفظ', 'Saved'],
  prefs: ['التفضيلات', 'Preferences'],
  security: ['الأمان', 'Security'],
  lastLogin: ['آخر دخول سابق', 'Previous sign-in'],
  pwChanged: ['آخر تغيير لكلمة المرور', 'Password last changed'],
  never: ['لم يحدث', 'Never'],
  current: ['كلمة المرور الحالية', 'Current password'],
  next: ['كلمة المرور الجديدة', 'New password'],
  pwHint: ['10 أحرف على الأقل، ولا تتضمن اسم بريدك. تغييرها يُخرجك من الأجهزة الأخرى.', 'At least 10 characters, without your email name. Changing it signs you out of other devices.'],
  changePw: ['تغيير كلمة المرور', 'Change password'],
  pwDone: ['تم تغيير كلمة المرور', 'Password changed'],
  family: ['الأسرة', 'Family'],
  children: ['الأبناء', 'Children'],
  noChildren: ['لا أبناء مرتبطون بهذا الحساب.', 'No children are linked to this account.'],
  teacherLabel: ['المعلم', 'Teacher'],
  nextLesson: ['الحصة القادمة', 'Next lesson'],
  noNext: ['لا حصة قادمة', 'No upcoming lesson'],
  learningProfile: ['الملف التعليمي', 'Learning profile'],
  studentFile: ['ملف الطالب', 'Student file'],
  contact: ['التواصل', 'Contact'],
  phone: ['الهاتف (دولي)', 'Phone (international)'],
  whatsapp: ['واتساب', 'WhatsApp'],
  consent: { opted_in: ['موافق', 'Opted in'], opted_out: ['غير موافق', 'Opted out'], unknown: ['لم يُحدَّد', 'Not set'] },
  access: ['صلاحياتك', 'Your access'],
  billing: ['الفواتير', 'Billing'],
  recordings: ['التسجيلات', 'Recordings'],
  yes: ['مسموح', 'Allowed'],
  no: ['غير مسموح', 'Not allowed'],
  specialty: ['التخصص', 'Specialty'],
  ijazah: ['إجازة', 'Ijazah'],
  bio: ['نبذة (تظهر للأسر)', 'Bio (families see this)'],
  bioAr: ['النبذة بالعربية', 'Arabic bio'],
  myStudents: ['طلابي', 'My students'],
  weekLessons: ['حصص الأسبوع', 'Lessons this week'],
  reportsDue: ['تقارير مطلوبة', 'Reports due'],
  staffScope: ['نطاق العمل', 'Scope'],
  staffNote: ['كل تغيير حساس يُسجَّل في سجل التدقيق مع السبب.', 'Every sensitive change is written to the audit log with its reason.'],
  readOnlyNote: ['الاسم والمستوى والحالة الأكاديمية يغيّرها فريق الأكاديمية فقط. اطلب التعديل من الأسرة أو التشغيل.', 'Name, level and academic status are changed by the academy team only. Ask your family contact or operations.'],
  // learning profile
  learning: ['الملف التعليمي', 'Learning profile'],
  learningLede: ['أين وصل الطالب، وكيف يسير: من سجلات الحصص والحضور والواجب، لا من أرقام مكتوبة يدويًا.', 'Where the student is and how it is going — derived from lessons, attendance and homework, not typed-in numbers.'],
  level: ['المستوى', 'Level'],
  course: ['المسار', 'Course'],
  goal: ['الهدف الحالي', 'Current goal'],
  strengths: ['نقاط القوة', 'Strengths'],
  improve: ['للتحسين', 'To improve'],
  attendance90: ['الحضور · آخر 90 يومًا', 'Attendance · last 90 days'],
  lessonsDone: ['حصص مكتملة', 'Lessons completed'],
  last30: ['آخر 30 يومًا', 'Last 30 days'],
  openHw: ['واجب مفتوح', 'Open homework'],
  placement: ['نتيجة تحديد المستوى', 'Placement result'],
  noPlacement: ['لا توجد مراجعة تحديد مسجّلة بعد.', 'No placement review is recorded yet.'],
  outcome: ['النتيجة', 'Outcome'],
  recommended: ['المستوى الموصى به', 'Recommended level'],
  rubric: ['درجات المعيار', 'Rubric scores'],
  staffNotes: ['ملاحظات المقيِّم (للفريق فقط)', 'Assessor notes (staff only)'],
  goals: ['أهداف التعلّم', 'Learning goals'],
  noGoals: ['لا أهداف مفصّلة بعد. الهدف العام أعلاه.', 'No detailed goals yet. The general goal is above.'],
  lastReport: ['آخر تقرير حصة', 'Latest lesson report'],
  noReport: ['لا تقرير منشور بعد.', 'No published report yet.'],
  nextHw: ['أقرب واجب', 'Next homework'],
  noHw: ['لا واجب مفتوح', 'No open homework'],
  timeline: ['آخر الأحداث', 'Recent events'],
  noEvents: ['لا أحداث تقدّم بعد.', 'No progress events yet.'],
  noMarks: ['لا حضور مسجّل في هذه الفترة', 'No attendance recorded in this period'],
  present: ['حاضر', 'Present'],
  late: ['متأخر', 'Late'],
  absent: ['غائب', 'Absent'],
  excused: ['بعذر', 'Excused'],
  withTeacher: ['مع', 'with'],
  // performance
  performance: ['أداء الموقع', 'Site performance'],
  perfLede: ['قياسات حقيقية من متصفحات الزوار (Core Web Vitals). بلا كوكيز وبلا هوية: أرقام مجمّعة فقط.', 'Real measurements from visitors’ browsers (Core Web Vitals). No cookies, no identity — aggregates only.'],
  range: ['الفترة', 'Range'],
  days: ['أيام', 'days'],
  views: ['مشاهدات مقيسة', 'Measured views'],
  p75: ['الشريحة 75', '75th percentile'],
  good: ['جيد', 'Good'],
  needs: ['يحتاج تحسينًا', 'Needs work'],
  poor: ['ضعيف', 'Poor'],
  byDevice: ['حسب الجهاز', 'By device'],
  byLang: ['حسب اللغة', 'By language'],
  byConn: ['حسب الاتصال', 'By connection'],
  slowest: ['أبطأ الصفحات (LCP)', 'Slowest pages (LCP)'],
  pages: ['الصفحات الأكثر مشاهدة', 'Most viewed pages'],
  daily: ['LCP اليومي (الشريحة 75)', 'Daily LCP (75th percentile)'],
  page: ['الصفحة', 'Page'],
  noData: ['لا قياسات بعد. فعّل الإرسال بإضافة PUBLIC_RUM_ENDPOINT عند بناء الموقع، وسيظهر أول رقم بعد أول زيارة.', 'No measurements yet. Turn collection on by setting PUBLIC_RUM_ENDPOINT when building the site; the first numbers appear after the first visit.'],
  mobile: ['جوال', 'Mobile'],
  tablet: ['لوحي', 'Tablet'],
  desktop: ['حاسوب', 'Desktop'],
  slow: ['بطيء / توفير بيانات', 'Slow / data saver'],
  fast: ['سريع', 'Fast'],
  unknown: ['غير معروف', 'Unknown'],
  roleName: { admin: ['مدير', 'Admin'], ops: ['تشغيل', 'Operations'], teacher: ['معلم', 'Teacher'], guardian: ['ولي أمر', 'Guardian'], student: ['طالب', 'Student'] },
  langName: { en: 'English', ar: 'العربية', de: 'Deutsch', fr: 'Français', it: 'Italiano' },
};

export function pt(key) {
  const row = L[key];
  return Array.isArray(row) ? row[state.lang === 'ar' ? 0 : 1] : key;
}
const sub = (group, key) => (L[group]?.[key] ? L[group][key][state.lang === 'ar' ? 0 : 1] : key);

function head(title, lede, extra = '') {
  return `<header class="page-head"><div><p class="eyebrow">Ummah Academy</p><h1>${esc(title)}</h1>${lede ? `<p class="muted">${esc(lede)}</p>` : ''}</div>${extra}</header>`;
}

const metric = (label, value, note = '') => `<div class="metric"><span class="small">${esc(label)}</span><span class="n">${value}</span>${note ? `<span class="small muted">${esc(note)}</span>` : ''}</div>`;

function zones(current) {
  let list = [];
  try { list = Intl.supportedValuesOf('timeZone'); } catch { list = ['Africa/Cairo', 'Asia/Dubai', 'Europe/London', 'Europe/Paris', 'America/New_York', 'America/Chicago', 'America/Toronto', 'Australia/Sydney']; }
  if (current && !list.includes(current)) list = [current, ...list];
  return list.map((z) => `<option value="${esc(z)}" ${z === current ? 'selected' : ''}>${esc(z.replace(/_/g, ' '))}</option>`).join('');
}

function when(iso) {
  return iso ? fmt(iso, state.tz) : pt('never');
}

function identity(data) {
  const a = data.account;
  const display = state.lang === 'ar' ? a.nameAr || a.name : a.name;
  return `<section class="panel profile-id">
    <span class="avatar big" aria-hidden="true">${esc(initials({ name: a.name, nameAr: a.nameAr }))}</span>
    <div><h2>${esc(display)}</h2>
      <p class="small muted" dir="ltr">${esc(a.email)}</p>
      <p class="chips"><span class="chip internal">${esc(sub('roleName', a.role))}</span>${chip(a.status)}</p></div>
  </section>`;
}

function preferences(data) {
  const a = data.account;
  const can = new Set(data.editable);
  const names = ['name', 'nameAr'].filter((k) => can.has(k))
    .map((k) => `<label>${esc(pt(k))}<input name="${k}" value="${esc(a[k] || '')}" required minlength="2" maxlength="80"></label>`).join('');
  return `<form class="form panel" data-action="profile-save">
    <h2>${esc(pt('prefs'))}</h2>
    ${names}
    <label>${esc(pt('language'))}<select name="locale"><option value="ar" ${a.locale === 'ar' ? 'selected' : ''}>العربية</option><option value="en" ${a.locale === 'en' ? 'selected' : ''}>English</option></select></label>
    <label>${esc(pt('timezone'))}<select name="timezone">${zones(a.timezone)}</select></label>
    <button class="btn primary" type="submit">${esc(pt('save'))}</button>
    ${data.account.role === 'student' ? `<p class="small muted">${esc(pt('readOnlyNote'))}</p>` : ''}
  </form>`;
}

function securityPanel(data) {
  const s = data.security;
  return `<form class="form panel" data-action="password-change" autocomplete="off">
    <h2>${esc(pt('security'))}</h2>
    <p class="small muted">${esc(pt('lastLogin'))}: ${esc(when(s.lastLoginAt))} · ${esc(pt('pwChanged'))}: ${esc(when(s.passwordChangedAt))}</p>
    <label>${esc(pt('current'))}<input type="password" name="current" required autocomplete="current-password"></label>
    <label>${esc(pt('next'))}<input type="password" name="next" required minlength="${s.passwordMin}" autocomplete="new-password"></label>
    <p class="small muted">${esc(pt('pwHint'))}</p>
    <button class="btn" type="submit">${esc(pt('changePw'))}</button>
  </form>`;
}

function guardianSection(data) {
  const g = data.guardian;
  if (!g) return '';
  const children = (data.children || []).map((c) => `<article class="card child-card">
      <div class="row-between"><strong>${esc(nm(c))}</strong>${chip(c.academicStatus)}</div>
      <p class="small muted">${esc(c.level || '')}${c.teacher ? ` · ${esc(pt('withTeacher'))} ${esc(nm(c.teacher))}` : ''}</p>
      <p class="small">${esc(pt('nextLesson'))}: ${c.nextSessionAt ? esc(fmt(c.nextSessionAt, state.tz)) : esc(pt('noNext'))}</p>
      <p class="chips"><a class="btn small primary" href="/app/students/${esc(c.id)}/learning">${esc(pt('learningProfile'))}</a><a class="btn small ghost" href="${esc(c.href)}">${esc(pt('studentFile'))}</a></p>
    </article>`).join('') || `<p class="empty">${esc(pt('noChildren'))}</p>`;
  const consent = sub('consent', g.whatsappConsent);
  return `<section class="panel stack"><h2>${esc(pt('family'))}${data.family ? ` · <a href="${esc(data.family.href)}">${esc(nm(data.family))}</a>` : ''}</h2>
      <p class="small muted">${esc(pt('access'))}: ${esc(pt('billing'))} — ${esc(g.canViewBilling ? pt('yes') : pt('no'))} · ${esc(pt('recordings'))} — ${esc(g.canViewRecordings ? pt('yes') : pt('no'))}</p>
    </section>
    <section class="stack"><h2>${esc(pt('children'))}</h2><div class="grid-cards">${children}</div></section>
    <form class="form panel" data-action="guardian-phone">
      <h2>${esc(pt('contact'))}</h2>
      <input type="hidden" name="guardianId" value="${esc(g.id)}">
      <label>${esc(pt('phone'))}<input name="phone" dir="ltr" value="${esc(g.phone || '')}" placeholder="+971500000000" inputmode="tel"></label>
      <p class="small muted">${esc(pt('whatsapp'))}: ${esc(consent)}</p>
      <button class="btn" type="submit">${esc(pt('save'))}</button>
    </form>`;
}

function teacherSection(data) {
  const t = data.teacher;
  if (!t) return '';
  return `<div class="metrics three">${metric(pt('myStudents'), num(data.load.students))}${metric(pt('weekLessons'), num(data.load.upcomingWeek))}${metric(pt('reportsDue'), num(data.load.reportsDue))}</div>
    <section class="panel stack"><h2>${esc(tx(t, 'role'))}</h2>
      <p class="small muted">${esc(pt('specialty'))}: ${esc(tx(t, 'specialty'))}${t.ijazah ? ` · ${esc(pt('ijazah'))} ✓` : ''}</p>
    </section>
    <form class="form panel" data-action="profile-save">
      <h2>${esc(pt('bio'))}</h2>
      <label>${esc(pt('bio'))}<textarea name="bio" maxlength="600">${esc(t.bio)}</textarea></label>
      <label>${esc(pt('bioAr'))}<textarea name="bioAr" maxlength="600" dir="rtl">${esc(t.bioAr)}</textarea></label>
      <button class="btn primary" type="submit">${esc(pt('save'))}</button>
    </form>`;
}

function staffSection(data) {
  if (!data.staff) return '';
  return `<section class="panel stack"><h2>${esc(pt('staffScope'))}</h2>
    <p class="chips">${data.staff.can.map((c) => `<span class="chip internal" dir="ltr">${esc(c)}</span>`).join('')}</p>
    <p class="small muted">${esc(pt('staffNote'))}</p></section>`;
}

export async function viewProfile() {
  const data = await api('GET', '/api/profile');
  const learn = data.learningHref
    ? `<a class="btn primary" href="${esc(data.learningHref)}">${esc(pt('learningProfile'))}</a>`
    : '';
  return `${head(pt('profile'), pt('profileLede'), learn)}
    <div class="grid-2 profile-grid">
      <div class="stack">${identity(data)}${guardianSection(data)}${teacherSection(data)}${staffSection(data)}</div>
      <div class="stack">${preferences(data)}${securityPanel(data)}</div>
    </div>`;
}

function attendanceBar(a) {
  if (!a.marked) return `<p class="empty">${esc(pt('noMarks'))}</p>`;
  const part = (n, cls, label) => (n ? `<span class="seg ${cls}" style="flex:${n}" title="${esc(label)}: ${n}"></span>` : '');
  return `<div class="segbar" role="img" aria-label="${esc(pt('attendance90'))}">${part(a.present, 'ok', pt('present'))}${part(a.late, 'warn', pt('late'))}${part(a.excused, 'info', pt('excused'))}${part(a.absent, 'bad', pt('absent'))}</div>
    <p class="small muted">${esc(pt('present'))} ${a.present} · ${esc(pt('late'))} ${a.late} · ${esc(pt('excused'))} ${a.excused} · ${esc(pt('absent'))} ${a.absent}</p>`;
}

export async function viewLearning({ params }) {
  const p = await api('GET', `/api/students/${params[0]}/learning`);
  const s = p.student;
  const e = p.enrollment;
  const staff = state.me.role === 'admin' || state.me.role === 'ops' || state.me.role === 'teacher';
  const back = state.me.role === 'student' && state.me.studentId === s.id ? '/app/profile' : `/app/students/${s.id}`;
  const rate = p.attendance.rate === null ? '—' : `${num(p.attendance.rate)}${state.lang === 'ar' ? '٪' : '%'}`;

  const placement = p.placement
    ? `<div class="stack"><p><b>${esc(pt('outcome'))}:</b> ${esc(p.placement.outcome)} · <span class="small muted">${esc(fmt(p.placement.occurredAt, state.tz))}</span></p>
        ${p.placement.recommendedLevel ? `<p><b>${esc(pt('recommended'))}:</b> ${esc(nm(p.placement.recommendedLevel))}</p>` : ''}
        ${p.placement.scores?.length ? `<p class="small"><b>${esc(pt('rubric'))}:</b></p><ul class="plain">${p.placement.scores.map((x) => `<li>${esc(x.criterion ?? x.name ?? '')}: <b>${esc(x.score)}</b></li>`).join('')}</ul>` : ''}
        ${staff && p.placement.notes ? `<p class="small"><b>${esc(pt('staffNotes'))}:</b> ${esc(p.placement.notes)}</p>` : ''}</div>`
    : `<p class="empty">${esc(pt('noPlacement'))}</p>`;

  const goals = p.goals.length
    ? `<ul class="plain">${p.goals.map((g) => `<li>${esc(state.lang === 'ar' ? g.titleAr || g.title || g.id : g.title || g.titleAr || g.id)} ${chip(g.status)}</li>`).join('')}</ul>`
    : `<p class="empty">${esc(pt('noGoals'))}</p>`;

  const report = p.lastReport
    ? `<p class="small muted">${esc(fmt(p.lastReport.startsAt, state.tz))}</p><p>${esc(state.lang === 'ar' ? p.lastReport.summaryAr || p.lastReport.summary || '' : p.lastReport.summary || p.lastReport.summaryAr || '')}</p>`
    : `<p class="empty">${esc(pt('noReport'))}</p>`;

  const hw = p.homework.next
    ? `<p><b>${esc(state.lang === 'ar' ? p.homework.next.titleAr || p.homework.next.title : p.homework.next.title)}</b></p><p class="small muted">${esc(fmt(p.homework.next.dueAt, state.tz))}</p>`
    : `<p class="empty">${esc(pt('noHw'))}</p>`;

  const events = p.events.length
    ? `<ol class="timeline">${p.events.map((x) => `<li><span class="small muted">${esc(fmt(x.occurredAt, state.tz))}</span> ${esc(x.summary || x.kind || '')}</li>`).join('')}</ol>`
    : `<p class="empty">${esc(pt('noEvents'))}</p>`;

  const course = e ? `${nm(e.course)}${e.level ? ` · ${e.level}` : ''}${e.teacher ? ` · ${pt('withTeacher')} ${nm(e.teacher)}` : ''}` : '';
  return `${head(nm(s), s.level || '', `<a class="btn ghost" href="${esc(back)}">${esc(pt('studentFile'))}</a>`)}
    <p class="muted">${esc(pt('learningLede'))}</p>
    <div class="metrics">${metric(pt('attendance90'), rate)}${metric(pt('lessonsDone'), num(p.lessons.completed), `${pt('last30')}: ${num(p.lessons.completedLast30)}`)}${metric(pt('openHw'), num(p.homework.open), `${num(p.homework.submitted)} / ${num(p.homework.total)}`)}${metric(pt('level'), esc(s.level || '—'), course)}</div>
    <div class="grid-2" style="margin-top:14px">
      <div class="stack">
        <section class="panel stack"><h2>${esc(pt('goal'))}</h2><p>${esc(s.goals || '—')}</p><div class="two"><div><h3>${esc(pt('strengths'))}</h3><p>${esc(s.strengths || '—')}</p></div><div><h3>${esc(pt('improve'))}</h3><p>${esc(s.improvements || '—')}</p></div></div></section>
        <section class="panel stack"><h2>${esc(pt('attendance90'))}</h2>${attendanceBar(p.attendance)}</section>
        <section class="panel stack"><h2>${esc(pt('lastReport'))}</h2>${report}</section>
        <section class="panel stack"><h2>${esc(pt('timeline'))}</h2>${events}</section>
      </div>
      <div class="stack">
        <section class="panel stack"><h2>${esc(pt('placement'))}</h2>${placement}</section>
        <section class="panel stack"><h2>${esc(pt('goals'))}</h2>${goals}</section>
        <section class="panel stack"><h2>${esc(pt('nextHw'))}</h2>${hw}</section>
      </div>
    </div>`;
}

const GRADE = { good: 'ok', ni: 'warn', poor: 'bad' };
const METRIC_INFO = {
  lcp: { name: 'LCP', unit: 'ms', fmt: (v) => `${(v / 1000).toFixed(2)} s` },
  inp: { name: 'INP', unit: 'ms', fmt: (v) => `${Math.round(v)} ms` },
  cls: { name: 'CLS', unit: '', fmt: (v) => v.toFixed(3) },
  fcp: { name: 'FCP', unit: 'ms', fmt: (v) => `${(v / 1000).toFixed(2)} s` },
  ttfb: { name: 'TTFB', unit: 'ms', fmt: (v) => `${Math.round(v)} ms` },
};

function grade(key, value, thresholds) {
  if (value === null || value === undefined) return null;
  const th = thresholds[key];
  return value <= th.good ? 'good' : value > th.poor ? 'poor' : 'ni';
}

function vitalCard(key, row, thresholds) {
  const info = METRIC_INFO[key];
  if (!row) return `<div class="metric"><span class="small">${info.name}</span><span class="n">—</span></div>`;
  const g = grade(key, row.p75, thresholds);
  const label = g === 'good' ? pt('good') : g === 'poor' ? pt('poor') : pt('needs');
  const goodPct = Math.round((row.good ?? 0) * 100);
  return `<div class="metric vital ${GRADE[g]}"><span class="small">${info.name} · ${esc(pt('p75'))}</span><span class="n" dir="ltr">${esc(info.fmt(row.p75))}</span>
    <span class="chip ${GRADE[g] === 'ok' ? 'active' : GRADE[g] === 'warn' ? 'trial' : 'failed'}">${esc(label)}</span>
    <span class="small muted"><bdi>${goodPct}%</bdi> ${esc(pt('good'))} · <bdi dir="ltr">n=${num(row.samples)}</bdi></span></div>`;
}

function sliceTable(title, rows, labeler, th) {
  const entries = Object.entries(rows || {});
  if (!entries.length) return '';
  return `<section class="panel stack"><h2>${esc(title)}</h2><div class="tablewrap"><table class="table"><thead><tr><th></th><th>${esc(pt('views'))}</th><th>LCP</th><th>INP</th><th>CLS</th></tr></thead><tbody>${entries
    .sort((a, b) => b[1].views - a[1].views)
    .map(([k, r]) => `<tr><td>${esc(labeler(k))}</td><td>${num(r.views)}</td>${['lcp', 'inp', 'cls'].map((m) => {
      const g = grade(m, r[m]?.p75, th);
      return `<td dir="ltr" class="${g ? GRADE[g] : ''}">${r[m] ? esc(METRIC_INFO[m].fmt(r[m].p75)) : '—'}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}

function dailyChart(daily, th) {
  const pts = daily.filter((d) => d.lcp !== null);
  if (pts.length < 2) return '';
  const W = 640;
  const H = 150;
  const pad = { l: 44, r: 10, t: 12, b: 24 };
  const max = Math.max(th.lcp.poor * 1.2, ...pts.map((d) => d.lcp));
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / (daily.length - 1);
  const y = (v) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = daily.map((d, i) => (d.lcp === null ? null : `${x(i).toFixed(1)},${y(d.lcp).toFixed(1)}`)).filter(Boolean).join(' ');
  const mark = (v, cls, label) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" class="thr ${cls}"/><text x="${pad.l - 6}" y="${y(v) + 4}" text-anchor="end" class="axis">${label}</text>`;
  return `<section class="panel stack"><h2>${esc(pt('daily'))}</h2>
    <svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="${esc(pt('daily'))}">
      ${mark(th.lcp.good, 'ok', `${th.lcp.good / 1000}s`)}${mark(th.lcp.poor, 'bad', `${th.lcp.poor / 1000}s`)}
      <polyline points="${line}" class="series"/>
      ${daily.map((d, i) => (d.lcp === null ? '' : `<circle cx="${x(i).toFixed(1)}" cy="${y(d.lcp).toFixed(1)}" r="3.2" class="dot"><title>${esc(d.day)} · ${esc(METRIC_INFO.lcp.fmt(d.lcp))} · ${d.views}</title></circle>`)).join('')}
      <text x="${pad.l}" y="${H - 6}" class="axis">${esc(daily[0].day.slice(5))}</text><text x="${W - pad.r}" y="${H - 6}" text-anchor="end" class="axis">${esc(daily.at(-1).day.slice(5))}</text>
    </svg></section>`;
}

export async function viewPerformance({ query }) {
  const range = [7, 14, 30].includes(Number(query.range)) ? Number(query.range) : 7;
  const r = await api('GET', `/api/performance?range=${range}`);
  const th = r.thresholds;
  const picker = `<nav class="tabs" aria-label="${esc(pt('range'))}">${[7, 14, 30].map((d) => `<a href="/app/performance?range=${d}" ${d === range ? 'aria-current="page"' : ''}>${d} ${esc(pt('days'))}</a>`).join('')}</nav>`;
  if (!r.views) return `${head(pt('performance'), pt('perfLede'))}${picker}<div class="banner">${esc(pt('noData'))}</div>`;
  const devLabel = (k) => pt(k);
  const langLabel = (k) => L.langName[k] || k;
  const slow = r.worst.length
    ? `<section class="panel stack"><h2>${esc(pt('slowest'))}</h2><ol class="plain">${r.worst.map((w) => `<li><span dir="ltr">${esc(w.path)}</span> — <b dir="ltr">${esc(METRIC_INFO.lcp.fmt(w.lcpP75))}</b> <span class="small muted"><bdi dir="ltr">n=${num(w.views)}</bdi></span></li>`).join('')}</ol></section>`
    : '';
  const pages = `<section class="panel stack"><h2>${esc(pt('pages'))}</h2><div class="tablewrap"><table class="table"><thead><tr><th>${esc(pt('page'))}</th><th>${esc(pt('views'))}</th><th>LCP</th><th>INP</th><th>CLS</th></tr></thead><tbody>${r.pages.map((p) => `<tr><td dir="ltr">${esc(p.path)}</td><td>${num(p.views)}</td>${['lcp', 'inp', 'cls'].map((m) => {
    const g = grade(m, p[m]?.p75, th);
    return `<td dir="ltr" class="${g ? GRADE[g] : ''}">${p[m] ? esc(METRIC_INFO[m].fmt(p[m].p75)) : '—'}</td>`;
  }).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  return `${head(pt('performance'), pt('perfLede'))}${picker}
    <p class="small muted">${esc(r.from)} → ${esc(r.to)} · ${esc(pt('views'))}: ${num(r.views)}</p>
    <div class="metrics five">${['lcp', 'inp', 'cls', 'fcp', 'ttfb'].map((k) => vitalCard(k, r.overall[k], th)).join('')}</div>
    <div class="stack" style="margin-top:14px">${dailyChart(r.daily, th)}
      <div class="grid-3">${sliceTable(pt('byDevice'), r.byDevice, devLabel, th)}${sliceTable(pt('byLang'), r.byLang, langLabel, th)}${sliceTable(pt('byConn'), r.byConnection, devLabel, th)}</div>
      ${slow}${pages}</div>`;
}

/** Form actions for this module. Returns { go } | { stay } | null (not handled). */
export async function handleProfile(action, data, opt) {
  if (action === 'profile-save') {
    const body = {};
    for (const k of ['name', 'nameAr', 'locale', 'timezone', 'bio', 'bioAr']) if (data[k] !== undefined) body[k] = data[k];
    await api('PATCH', '/api/profile', body, opt);
    if (body.locale && body.locale !== state.lang) {
      state.lang = body.locale;
      localStorage.setItem('ua:lang', state.lang);
    }
    state.me = await api('GET', '/api/me');
    if (body.timezone) state.tz = body.timezone;
    toast(pt('saved'));
    return { stay: true };
  }
  if (action === 'password-change') {
    try {
      await api('POST', '/api/profile/password', { current: data.current, next: data.next }, opt);
    } catch (error) {
      toast(errText(error));
      return { stay: true, keepForm: true };
    }
    toast(pt('pwDone'));
    return { stay: true };
  }
  if (action === 'guardian-phone') {
    await api('POST', `/api/guardians/${data.guardianId}/phone`, { phone: data.phone || null, reason: 'Guardian updated own phone' }, opt);
    toast(pt('saved'));
    return { stay: true };
  }
  return null;
}
