/** Public sign-up page (/register): a parent for a child, or an adult for themselves. */
import { api, esc, state } from './util.js';

const SITE = 'https://ummahacademy.net';

const L = {
  title: ['إنشاء حساب الأسرة', 'Create your family account'],
  lede: ['حساب مجاني. بعد التسجيل يتواصل معك فريق الأكاديمية لتحديد معلم وموعد حصتيك التجريبيتين. لا بطاقة ولا دفع.', 'Free account. After you register, the academy team contacts you to pick a teacher and book the two free trial lessons. No card, no payment.'],
  who: ['من سيتعلّم؟', 'Who will be learning?'],
  child: ['طفلي (أنا ولي الأمر)', 'My child (I am the parent or guardian)'],
  self: ['نفسي (16 سنة فأكثر)', 'Myself (16 or older)'],
  yourName: ['اسمك الكامل', 'Your full name'],
  relation: ['صلتك بالطفل', 'Your relation to the child'],
  mother: ['أم', 'Mother'],
  father: ['أب', 'Father'],
  guardian: ['ولي أمر', 'Guardian'],
  childName: ['اسم الطفل', "Child's name"],
  birthYear: ['سنة الميلاد', 'Birth year'],
  track: ['المسار المهتم به', 'Course of interest'],
  notSure: ['لست متأكدًا بعد', 'Not sure yet'],
  email: ['البريد الإلكتروني', 'Email'],
  password: ['كلمة المرور', 'Password'],
  pwHint: ['10 أحرف على الأقل، ولا تتضمن اسم بريدك.', 'At least 10 characters, without your email name.'],
  phone: ['واتساب (اختياري، بصيغة دولية)', 'WhatsApp (optional, international format)'],
  accept1: ['أوافق على', 'I agree to the'],
  terms: ['الشروط', 'Terms'],
  and: ['و', 'and'],
  privacy: ['سياسة الخصوصية', 'Privacy Policy'],
  submit: ['إنشاء الحساب', 'Create account'],
  haveAccount: ['لدي حساب بالفعل', 'I already have an account'],
  backSite: ['الموقع التعريفي', 'Back to the website'],
  childNote: ['لا نُنشئ دخولًا للطفل. حساب الأسرة هو الذي يدخل ويتابع.', 'We do not create a login for the child. The family account signs in and follows progress.'],
};
const l = (k) => L[k][state.lang === 'ar' ? 0 : 1];

export async function viewRegister() {
  let options = { courses: [] };
  try { options = await api('GET', '/api/signup/options'); } catch { /* the form still works without the list */ }
  const courses = options.courses
    .map((c) => `<option value="${esc(c.id)}">${esc(state.lang === 'ar' ? c.nameAr || c.name : c.name)}</option>`)
    .join('');
  const year = new Date().getFullYear();
  return `<main class="login"><section class="login-card register-card">
    <div>
      <a class="brand" href="/login"><svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true"><rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="#6b3fa0"/><rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="#1d5fa8" transform="rotate(45 20 20)"/><path d="M15.6 27.2v-6.1a4.4 4.4 0 0 1 8.8 0v6.1z" fill="#fff"/></svg><span>${state.lang === 'ar' ? 'أكاديمية الأمة' : 'Ummah Academy'}</span></a>
      <h1 class="display">${esc(l('title'))}</h1>
      <p class="muted">${esc(l('lede'))}</p>
      <p class="small">${esc(l('childNote'))}</p>
      <p class="small"><a href="/login">${esc(l('haveAccount'))}</a> · <a data-native href="${SITE}">${esc(l('backSite'))}</a></p>
    </div>
    <form class="form reg-form" data-action="register" autocomplete="on">
      <div class="seg-choice" role="radiogroup" aria-labelledby="reg-who"><b id="reg-who">${esc(l('who'))}</b>
        <label><input type="radio" name="for" value="child" checked> ${esc(l('child'))}</label>
        <label><input type="radio" name="for" value="self"> ${esc(l('self'))}</label>
      </div>
      <label>${esc(l('yourName'))}<input name="guardianName" required minlength="2" maxlength="80" autocomplete="name"></label>
      <label data-child-only>${esc(l('relation'))}<select name="relation"><option value="mother">${esc(l('mother'))}</option><option value="father">${esc(l('father'))}</option><option value="guardian">${esc(l('guardian'))}</option></select></label>
      <label data-child-only>${esc(l('childName'))}<input name="studentName" required minlength="2" maxlength="80"></label>
      <label>${esc(l('birthYear'))}<input name="birthYear" type="number" inputmode="numeric" min="1930" max="${year - 3}" required placeholder="${year - 9}"></label>
      <label>${esc(l('track'))}<select name="courseId"><option value="">${esc(l('notSure'))}</option>${courses}</select></label>
      <label>${esc(l('email'))}<input name="email" type="email" required autocomplete="email" dir="ltr"></label>
      <label>${esc(l('password'))}<input name="password" type="password" required minlength="10" autocomplete="new-password"></label>
      <p class="small muted">${esc(l('pwHint'))}</p>
      <label>${esc(l('phone'))}<input name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="+971500000000"></label>
      <div class="hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <label class="check"><input type="checkbox" name="accept" required> <span>${esc(l('accept1'))} <a data-native target="_blank" rel="noopener" href="${SITE}/terms-of-service/">${esc(l('terms'))}</a> ${esc(l('and'))} <a data-native target="_blank" rel="noopener" href="${SITE}/privacy-policy/">${esc(l('privacy'))}</a></span></label>
      <button class="btn primary" type="submit">${esc(l('submit'))}</button>
    </form>
  </section></main>`;
}

/** Self sign-up hides the child-only fields (and stops them blocking the submit). */
document.addEventListener('change', (event) => {
  const radio = event.target;
  if (!(radio instanceof HTMLInputElement) || radio.name !== 'for') return;
  const form = radio.closest('form');
  const self = radio.value === 'self';
  for (const row of form.querySelectorAll('[data-child-only]')) {
    row.hidden = self;
    for (const field of row.querySelectorAll('input,select')) field.disabled = self;
  }
});

/** Returns { go } when handled, null when the action is not ours. */
export async function handleSignup(action, data) {
  if (action !== 'register') return null;
  const body = {
    ...data,
    guardianNameAr: data.guardianName,
    studentNameAr: data.studentName,
    accept: data.accept === 'on',
    birthYear: Number(data.birthYear),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: state.lang,
  };
  const res = await api('POST', '/api/auth/register', body);
  state.me = { ...res.user, demo: res.demo };
  state.tz = res.user.timezone || state.tz;
  return { go: '/app' };
}
