/**
 * Self-service sign-up for families and adult learners.
 *
 * It creates an account and the records a person is entitled to see (their family, and the child or
 * themselves as a trial student) and then hands the lead to staff as an internal follow-up. It does
 * NOT create an enrolment, a subscription, a lesson or a login for a child: staff assign the teacher
 * and book the two trial lessons. Nothing here can touch an existing family.
 *
 * Abuse limits live in two places: the HTTP layer rate-limits per address, and this module caps new
 * sign-ups per rolling 24 hours so a flood cannot fill the store.
 */
import { hashPassword } from './auth.mjs';
import { DomainError, E } from './errors.mjs';
import { id } from './ids.mjs';
import { isAcademySender, normalizePhone } from './ops.mjs';
import { NAME_RE, passwordProblem, validTimezone } from './profiles.mjs';

export const SIGNUP_DAILY_CAP = 60;
export const ADULT_MIN_AGE = 16;
const RELATIONS = new Set(['mother', 'father', 'guardian']);
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,}$/;

const truthy = (v) => v === true || v === 'true' || v === 'on' || v === '1' || v === 1;

export function attachSignup(api, bag) {
  const { clock, command, audit, event, notify, publicUser, defaultAssignee } = bag;
  const stateOf = () => bag.state;

  api.signupOptions = () => ({
    open: true,
    adultMinAge: ADULT_MIN_AGE,
    courses: stateOf().courses.map((c) => ({ id: c.id, name: c.name, nameAr: c.nameAr, track: c.track })),
  });

  api.register = (input = {}, meta = {}) =>
    command({ id: 'anonymous' }, null, () => {
      const state = stateOf();
      const now = clock();
      const nowIso = now.toISOString();

      // Bots fill every field, including the one humans cannot see.
      if (String(input.website ?? '').trim()) throw E.validation('Could not create the account.', 'تعذّر إنشاء الحساب.');

      const dayAgo = new Date(now.getTime() - 86400000).toISOString();
      if (state.users.filter((u) => u.signup?.at >= dayAgo).length >= SIGNUP_DAILY_CAP) {
        throw new DomainError('signups_paused', 429, 'Sign-ups are paused for today. Please message us on WhatsApp.', 'التسجيل متوقف مؤقتًا اليوم. راسلنا على واتساب.');
      }

      if (!truthy(input.accept)) {
        throw E.validation('Please accept the Terms and Privacy Policy.', 'يرجى الموافقة على الشروط وسياسة الخصوصية.');
      }
      const email = String(input.email ?? '').trim().toLowerCase();
      if (!EMAIL_RE.test(email) || email.length > 120) throw E.validation('Enter a valid email.', 'أدخل بريدًا صحيحًا.');
      if (state.users.some((u) => u.email.toLowerCase() === email)) {
        throw E.validation('That email already has an account. Sign in instead.', 'هذا البريد لديه حساب بالفعل. سجّل الدخول.');
      }
      const problem = passwordProblem(input.password, { email });
      if (problem) throw E.validation(problem.message, problem.messageAr);

      const guardianName = String(input.guardianName ?? '').trim();
      const guardianNameAr = String(input.guardianNameAr ?? '').trim() || guardianName;
      if (!NAME_RE.test(guardianName) || !NAME_RE.test(guardianNameAr)) {
        throw E.validation('Enter your name (2–80 characters, no symbols).', 'أدخل اسمك (من 2 إلى 80 حرفًا بلا رموز).');
      }

      const forSelf = String(input.for ?? 'child') === 'self';
      const studentName = forSelf ? guardianName : String(input.studentName ?? '').trim();
      const studentNameAr = forSelf ? guardianNameAr : String(input.studentNameAr ?? '').trim() || studentName;
      if (!NAME_RE.test(studentName) || !NAME_RE.test(studentNameAr)) {
        throw E.validation("Enter the child's name (2–80 characters, no symbols).", 'أدخل اسم الطفل (من 2 إلى 80 حرفًا بلا رموز).');
      }
      const birthYear = Number(input.birthYear);
      const thisYear = now.getUTCFullYear();
      if (!Number.isInteger(birthYear) || birthYear < 1930 || birthYear > thisYear - 3) {
        throw E.validation('Birth year is not usable.', 'سنة الميلاد غير صالحة.');
      }
      if (forSelf && thisYear - birthYear < ADULT_MIN_AGE) {
        throw E.validation(`Self sign-up is for ages ${ADULT_MIN_AGE}+. A parent or guardian should register the child.`, `التسجيل بنفسك لمن عمره ${ADULT_MIN_AGE} سنة فأكثر. على ولي الأمر تسجيل الطفل.`);
      }

      const phone = input.phone ? normalizePhone(input.phone) : null;
      if (input.phone && !phone) throw E.validation('Phone must be international, like +201000000000.', 'الهاتف يجب أن يكون دوليًا، مثل +201000000000.');
      if (isAcademySender(phone)) throw E.validation('That number is the academy WhatsApp sender, not a family phone.', 'هذا رقم واتساب الأكاديمية المُرسِل، وليس هاتف أسرة.');
      const timezone = validTimezone(input.timezone) ? input.timezone : 'Africa/Cairo';
      const course = input.courseId ? state.courses.find((c) => c.id === input.courseId) : null;
      if (input.courseId && !course) throw E.validation('Unknown course.', 'المسار غير معروف.');
      const relation = forSelf ? 'self' : RELATIONS.has(input.relation) ? input.relation : 'guardian';
      const locale = input.locale === 'en' ? 'en' : 'ar';

      const familyId = id('fam');
      const studentId = id('stu');
      const userId = id('usr');
      const guardianId = id('grd');

      state.families.push({
        id: familyId,
        name: String(input.familyName ?? '').trim() || guardianName,
        nameAr: String(input.familyNameAr ?? '').trim() || guardianNameAr,
        timezone,
        country: '',
        city: '',
        status: 'new',
        joinedAt: nowIso,
        phone,
      });
      const user = {
        id: userId,
        role: 'guardian',
        email,
        passwordHash: hashPassword(String(input.password)),
        name: guardianName,
        nameAr: guardianNameAr,
        timezone,
        locale,
        status: 'active',
        teacherId: null,
        studentId: forSelf ? studentId : null,
        guardianId,
        familyId,
        pwv: 0,
        signup: { at: nowIso, source: 'self', consentAt: nowIso, consent: 'terms+privacy' },
      };
      state.users.push(user);
      state.guardians.push({
        id: guardianId,
        familyId,
        userId,
        name: guardianName,
        nameAr: guardianNameAr,
        relation,
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
        userId: forSelf ? userId : null,
        name: studentName,
        nameAr: studentNameAr,
        birthYear,
        timezone,
        country: '',
        language: locale,
        academicStatus: 'trial',
        portalVisible: true,
        loginEnabled: forSelf,
        level: 'Trial',
        goals: course ? `Trial interest: ${course.name}` : 'Complete the two free trial sessions.',
        strengths: '',
        improvements: '',
      });

      const actor = publicUser(user);
      audit(actor, 'auth.registered', 'user', userId, null, { email, relation, forSelf, courseId: course?.id ?? null }, null, meta.requestId);
      event(actor, 'family.signup', {
        studentId,
        familyId,
        entityType: 'family',
        entityId: familyId,
        summary: 'Family signed up on the portal',
        summaryAr: 'سجّلت أسرة من البوابة',
      });

      const assigneeId = defaultAssignee();
      if (assigneeId) {
        const title = `New sign-up: ${studentName}${course ? ` · ${course.name}` : ''}`;
        const titleAr = `تسجيل جديد: ${studentNameAr}${course ? ` · ${course.nameAr}` : ''}`;
        state.followUps.push({
          id: id('fu'),
          level: 'student',
          type: 'sales',
          visibility: 'internal',
          familyId,
          studentId,
          teacherId: null,
          subscriptionId: null,
          sessionId: null,
          title,
          titleAr,
          status: 'open',
          priority: 'normal',
          assigneeId,
          dueAt: new Date(now.getTime() + 86400000).toISOString(),
          outcome: null,
          outcomeAr: null,
          createdBy: userId,
          createdAt: nowIso,
          closedAt: null,
        });
        for (const staff of state.users.filter((u) => (u.role === 'admin' || u.role === 'ops') && u.status === 'active')) {
          notify(staff.id, 'New sign-up', 'تسجيل جديد', title, titleAr, `/app/families/${familyId}`);
        }
      }
      return { user: actor, familyId, studentId };
    });
}
