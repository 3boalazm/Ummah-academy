import { api, errText, esc, localToIso, state, t, toast } from './util.js';
import { downloadExport, handleOps, viewInvoices, viewNotes, viewOnboard, viewOutbox } from './ops-ui.js';
import {
  markSvg,
  viewAudit,
  viewDashboard,
  viewFamilies,
  viewFamily,
  viewFollowUp,
  viewFollowUps,
  viewHealth,
  viewLogin,
  viewMissing,
  viewSchedule,
  viewSearch,
  viewSession,
  viewStudent,
  viewStudents,
  viewSubscriptions,
  viewTeacher,
  viewTeachers,
} from './views.js';

const VIEWS = {
  login: viewLogin,
  dashboard: viewDashboard,
  students: viewStudents,
  student: viewStudent,
  families: viewFamilies,
  family: viewFamily,
  teachers: viewTeachers,
  teacher: viewTeacher,
  schedule: viewSchedule,
  session: viewSession,
  subscriptions: viewSubscriptions,
  followups: viewFollowUps,
  followup: viewFollowUp,
  audit: viewAudit,
  health: viewHealth,
  search: viewSearch,
  onboard: viewOnboard,
  outbox: viewOutbox,
  invoices: viewInvoices,
  notes: viewNotes,
  missing: viewMissing,
};

const ROUTES = [
  { re: /^\/login\/?$/, id: 'login', auth: false },
  { re: /^\/$/, id: 'root', auth: false },
  { re: /^\/app\/?$/, id: 'dashboard' },
  { re: /^\/app\/students\/?$/, id: 'students' },
  { re: /^\/app\/students\/([^/]+)\/?$/, id: 'student' },
  { re: /^\/app\/families\/?$/, id: 'families' },
  { re: /^\/app\/families\/([^/]+)\/?$/, id: 'family' },
  { re: /^\/app\/teachers\/?$/, id: 'teachers' },
  { re: /^\/app\/teachers\/([^/]+)\/?$/, id: 'teacher' },
  { re: /^\/app\/schedule\/?$/, id: 'schedule' },
  { re: /^\/app\/sessions\/([^/]+)\/?$/, id: 'session' },
  { re: /^\/app\/subscriptions\/?$/, id: 'subscriptions' },
  { re: /^\/app\/follow-ups\/?$/, id: 'followups' },
  { re: /^\/app\/follow-ups\/([^/]+)\/?$/, id: 'followup' },
  { re: /^\/app\/audit\/?$/, id: 'audit' },
  { re: /^\/app\/health\/?$/, id: 'health' },
  { re: /^\/app\/search\/?$/, id: 'search' },
  { re: /^\/app\/onboard\/?$/, id: 'onboard' },
  { re: /^\/app\/outbox\/?$/, id: 'outbox' },
  { re: /^\/app\/invoices\/?$/, id: 'invoices' },
  { re: /^\/app\/notifications\/?$/, id: 'notes' },
];

function go(href) {
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin) return;
  history.pushState({}, '', url.pathname + url.search);
  render();
}

function navItems() {
  const role = state.me.role;
  const items = [['/app', t('overview')]];
  if (role === 'student') items.push([`/app/students/${state.me.studentId}`, t('myFile')]);
  if (role === 'guardian') items.push([`/app/families/${state.me.familyId}`, t('myFamily')]);
  if (role === 'admin' || role === 'ops' || role === 'teacher') items.push(['/app/students', t('students')]);
  if (role === 'admin' || role === 'ops') {
    items.push(['/app/families', t('families')]);
    items.push(['/app/teachers', t('teachers')]);
  }
  items.push(['/app/schedule', t('schedule')]);
  if (role !== 'student') items.push(['/app/subscriptions', t('subscriptions')]);
  if (role !== 'student') items.push(['/app/follow-ups', t('followups')]);
  if (role === 'admin' || role === 'ops') {
    items.push(['/app/onboard', state.lang === 'ar' ? 'تسجيل' : 'Enrol']);
    items.push(['/app/outbox', state.lang === 'ar' ? 'واتساب' : 'WhatsApp']);
    items.push(['/app/invoices', state.lang === 'ar' ? 'فواتير' : 'Invoices']);
    items.push(['/app/audit', t('audit')]);
    items.push(['/app/health', t('health')]);
  }
  items.push(['/app/notifications', state.lang === 'ar' ? 'تنبيهات' : 'Alerts']);
  return items;
}

function shell(body) {
  const path = location.pathname.replace(/\/$/, '') || '/';
  const links = navItems()
    .map(([href, label]) => {
      const current = path === href.replace(/\/$/, '') || (href !== '/app' && path.startsWith(href));
      return `<a href="${esc(href)}" ${current ? 'aria-current="page"' : ''}>${esc(label)}</a>`;
    })
    .join('');
  const name = state.lang === 'ar' ? state.me.nameAr || state.me.name : state.me.name;
  return `<div class="shell">
    <aside class="side">
      <a class="brand" href="/app">${markSvg()}<span>${esc(t('brand'))}</span></a>
      <nav class="nav" aria-label="Main">${links}</nav>
      <div class="who">
        <strong>${esc(name)}</strong>
        <span class="small">${esc(state.me.role)} · ${esc(state.tz)}</span>
        <button class="btn ghost small" type="button" data-cmd="logout">${esc(t('signOut'))}</button>
      </div>
    </aside>
    <div class="main">
      <header class="top">
        <button class="btn ghost small menu-btn" type="button" data-cmd="menu">${esc(t('menu'))}</button>
        <form class="search" data-action="search"><label class="sr">${esc(t('search'))}</label><input name="q" placeholder="${esc(t('search'))}" value="${esc(new URLSearchParams(location.search).get('q') || '')}"><button class="btn small" type="submit">${esc(t('search'))}</button></form>
        <button class="btn ghost small" type="button" data-cmd="lang">${esc(t('lang'))}</button>
        <button class="btn ghost small" type="button" data-cmd="theme">${esc(t('theme'))}</button>
      </header>
      <div class="content"><p class="banner">${esc(t('demoNote'))}</p>${body}</div>
    </div>
  </div>`;
}

async function render() {
  document.body.classList.remove('nav-open');
  const path = location.pathname;
  const route = ROUTES.find((r) => r.re.test(path)) || { id: 'missing', re: /$/ };
  const params = path.match(route.re)?.slice(1) || [];
  const query = Object.fromEntries(new URLSearchParams(location.search));
  if (route.id === 'root') {
    if (!state.me) {
      try { state.me = await api('GET', '/api/me'); } catch { /* signed out */ }
    }
    history.replaceState({}, '', state.me ? '/app' : '/login');
    return render();
  }
  if (route.auth !== false && !state.me) {
    try {
      state.me = await api('GET', '/api/me');
      state.tz = state.me.timezone || state.tz;
    } catch {
      location.replace('/login');
      return;
    }
  }
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  const app = document.getElementById('app');
  app.innerHTML = `<p class="muted" style="padding:24px">${esc(t('loading'))}</p>`;
  let html = '';
  try {
    const view = VIEWS[route.id] || viewMissing;
    html = await view({ params, query });
  } catch (error) {
    if (error.status === 401) {
      state.me = null;
      location.replace('/login');
      return;
    }
    html = `<div class="banner bad">${esc(errText(error))}</div><p><a href="/app">${esc(t('back'))}</a></p>`;
  }
  app.innerHTML = route.id === 'login' ? html : shell(html);
  document.title = state.lang === 'ar' ? 'بوابة أكاديمية الأمة' : 'Ummah Academy portal';
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function onForm(form) {
  let action = form.dataset.action;
  const data = formData(form);
  form.dataset.key ||= crypto.randomUUID();
  const key = form.dataset.key;
  const opt = { idempotencyKey: key };
  try {
    if (action === 'login') {
      const res = await api('POST', '/api/auth/login', { email: data.email, password: data.password });
      state.me = res.user;
      state.tz = res.user.timezone || state.tz;
      history.pushState({}, '', '/app');
      await render();
      return;
    }
    if (action === 'search') {
      go(`/app/search?q=${encodeURIComponent(data.q || '')}`);
      return;
    }
    if (action === 'upload') data.file = form.querySelector('input[type="file"]')?.files?.[0];
    if (action === 'create-session' && Number(data.count) > 1) action = 'series';
    const opsResult = await handleOps(action, data, opt);
    if (opsResult) {
      delete form.dataset.key;
      if (opsResult.go) {
        go(opsResult.go);
        return;
      }
      await render();
      return;
    }
    if (action === 'complete') {
      const body = await api('POST', `/api/sessions/${data.id}/complete`, { attendance: data.attendance }, opt);
      toast(body.replayed ? t('replayed') : t('saved'));
    } else if (action === 'attendance') {
      await api('POST', `/api/sessions/${data.id}/attendance`, { status: data.status }, opt);
      toast(t('saved'));
    } else if (action === 'confirm-session') {
      await api('POST', `/api/sessions/${data.id}/confirm`, {}, opt);
      toast(t('saved'));
    } else if (action === 'report') {
      await api('POST', `/api/sessions/${data.id}/report`, data, opt);
      toast(t('saved'));
    } else if (action === 'cancel-session') {
      await api('POST', `/api/sessions/${data.id}/cancel`, { reason: data.reason, party: data.party }, opt);
      toast(t('saved'));
    } else if (action === 'reschedule') {
      const startsAt = localToIso(data.local, data.timeZone || state.tz);
      const body = await api('POST', `/api/sessions/${data.id}/reschedule`, { startsAt, reason: data.reason }, opt);
      toast(body.replayed ? t('replayed') : t('saved'));
      if (body.to?.id) {
        go(`/app/sessions/${body.to.id}`);
        return;
      }
    } else if (action === 'no-show') {
      await api('POST', `/api/sessions/${data.id}/no-show`, { party: data.party, reason: data.reason }, opt);
      toast(t('saved'));
    } else if (action === 'substitute') {
      await api('POST', `/api/sessions/${data.id}/substitute`, { teacherId: data.teacherId, reason: data.reason }, opt);
      toast(t('saved'));
    } else if (action === 'create-session') {
      const startsAt = localToIso(data.local, data.timeZone || state.tz);
      const body = await api('POST', '/api/sessions', { studentId: data.studentId, teacherId: data.teacherId, startsAt, durationMin: Number(data.durationMin || 30) }, opt);
      toast(body.replayed ? t('replayed') : t('saved'));
      go(`/app/sessions/${body.id}`);
      return;
    } else if (action === 'assign') {
      await api('POST', '/api/assignments', { enrollmentId: data.enrollmentId, teacherId: data.teacherId, reason: data.reason, moveFuture: data.moveFuture === '1' }, opt);
      toast(t('saved'));
    } else if (action === 'renew') {
      await api('POST', `/api/subscriptions/${data.id}/renew`, { planId: data.planId, reason: data.reason }, opt);
      toast(t('saved'));
    } else if (action === 'freeze' || action === 'resume' || action === 'cancel-sub') {
      const path = action === 'cancel-sub' ? 'cancel' : action;
      await api('POST', `/api/subscriptions/${data.id}/${path}`, { reason: data.reason }, opt);
      toast(t('saved'));
    } else if (action === 'adjust') {
      await api('POST', `/api/cycles/${data.cycleId}/adjust`, { delta: Number(data.delta), reason: data.reason }, opt);
      toast(t('saved'));
    } else if (action === 'pay') {
      const body = await api('POST', '/api/payments', { subscriptionId: data.subscriptionId, amount: Number(data.amount), status: data.status, reason: data.reason, method: 'manual' }, opt);
      toast(body.replayed ? t('replayed') : t('saved'));
    } else if (action === 'student-patch') {
      await api('PATCH', `/api/students/${data.id}`, {
        academicStatus: data.academicStatus,
        loginEnabled: data.loginEnabled === 'true',
        level: data.level,
        reason: data.reason,
      });
      toast(t('saved'));
    } else if (action === 'create-follow') {
      const body = await api('POST', '/api/follow-ups', data, opt);
      toast(t('saved'));
      go(`/app/follow-ups/${body.id}`);
      return;
    } else if (action === 'attempt') {
      await api('POST', `/api/follow-ups/${data.id}/attempts`, { note: data.note, channel: data.channel }, opt);
      toast(t('saved'));
    } else if (action === 'transition') {
      await api('POST', `/api/follow-ups/${data.id}/transition`, { status: data.status, outcome: data.outcome }, opt);
      toast(t('saved'));
    } else if (action === 'request') {
      const body = await api('POST', '/api/requests', data, opt);
      toast(t('saved'));
      go(`/app/follow-ups/${body.id}`);
      return;
    } else if (action === 'whatsapp-consent') {
      await api('POST', `/api/guardians/${data.guardianId}/whatsapp-consent`, {
        status: data.status,
        reason: 'Guardian updated WhatsApp preference',
      }, opt);
      toast(t('saved'));
    } else if (action === 'reset') {
      if (!confirm(t('resetWarn'))) return;
      await api('POST', '/api/admin/reset-demo', {}, opt);
      toast(t('saved'));
      go('/app');
      return;
    }
    delete form.dataset.key;
    await render();
  } catch (error) {
    toast(errText(error));
  }
}

document.addEventListener('click', async (event) => {
  const link = event.target.closest('a[href]');
  if (link && link.origin === location.origin && !link.hasAttribute('data-native') && !link.getAttribute('href').startsWith('#')) {
    event.preventDefault();
    go(link.href);
    return;
  }
  const cmd = event.target.closest('[data-cmd]');
  if (!cmd) return;
  const name = cmd.dataset.cmd;
  if (name === 'menu') document.body.classList.toggle('nav-open');
  if (name === 'lang') {
    state.lang = state.lang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('ua:lang', state.lang);
    render();
  }
  if (name === 'theme') {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ua:theme', state.theme);
    document.documentElement.dataset.theme = state.theme;
  }
  if (name === 'logout') {
    await api('POST', '/api/auth/logout', {});
    state.me = null;
    location.replace('/login');
  }
  if (name === 'fill') {
    const form = document.querySelector('form[data-action="login"]');
    if (!form) return;
    form.email.value = cmd.dataset.email;
    form.password.value = cmd.dataset.password;
    form.requestSubmit();
  }
  if (name === 'export') {
    try { await downloadExport(cmd.dataset.kind); } catch (error) { toast(errText(error)); }
    return;
  }
  if (name === 'asset') {
    try {
      const token = await api('POST', `/api/assets/${cmd.dataset.id}/token`, {});
      window.open(token.url, '_blank', 'noopener');
    } catch (error) {
      toast(errText(error));
    }
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-action]');
  if (!form) return;
  event.preventDefault();
  onForm(form);
});

window.addEventListener('popstate', () => render());
render();
