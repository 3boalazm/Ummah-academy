/**
 * Synthetic operations dataset. Names echo public testimonials on the marketing
 * site so the demo is recognisable; none of these are live student records.
 * Do not put real children into this store.
 */
import { hashPassword } from './auth.mjs';
import { localOn } from './time.mjs';
import { POLICY } from './policy.mjs';

export const DEMO_PASSWORD = {
  admin: 'Sakinah-Admin-2026',
  ops: 'Sakinah-Ops-2026',
  teacher: 'Sakinah-Teach-2026',
  family: 'Sakinah-Family-2026',
  student: 'Sakinah-Student-2026',
};

export const IDS = {
  admin: 'usr_admin',
  ops: 'usr_ops',
  omneyaUser: 'usr_omneya',
  saraUser: 'usr_sara',
  nourUser: 'usr_nour',
  khalid: 'usr_khalid',
  fatima: 'usr_fatima',
  sarah: 'usr_sarah',
  aminaUser: 'usr_amina',
  alfarsiUser: 'usr_alfarsi',
  yasminUser: 'usr_yasmin',
  omarStudentUser: 'usr_omar_m',
  famRahman: 'fam_rahman',
  famMansouri: 'fam_mansouri',
  famBergstrom: 'fam_bergstrom',
  famAlfarsi: 'fam_alfarsi',
  famDubois: 'fam_dubois',
  gKhalid: 'grd_khalid',
  gFatima: 'grd_fatima',
  gSarah: 'grd_sarah',
  gAmina: 'grd_amina',
  gAlfarsi: 'grd_alfarsi',
  gYasmin: 'grd_yasmin',
  yusuf: 'stu_yusuf',
  layla: 'stu_layla',
  adam: 'stu_adam',
  omarM: 'stu_omar_m',
  amina: 'stu_amina',
  alfarsi: 'stu_alfarsi',
  yasmin: 'stu_yasmin',
  tOmneya: 'omneya-ali',
  tSara: 'sara-ahmed',
  tNour: 'nour-hassan',
  cTajweed: 'crs_tajweed',
  cNoor: 'crs_noor',
  cCubs: 'crs_cubs',
  cHifz: 'crs_hifz',
  cArabic: 'crs_arabic',
  enrYusuf: 'enr_yusuf',
  enrLayla: 'enr_layla',
  enrAdam: 'enr_adam',
  enrOmar: 'enr_omar_m',
  enrAmina: 'enr_amina',
  enrAlfarsi: 'enr_alfarsi',
  enrYasmin: 'enr_yasmin',
  subYusuf: 'sub_yusuf',
  subLayla: 'sub_layla',
  subAdam: 'sub_adam',
  subOmar: 'sub_omar_m',
  subAmina: 'sub_amina',
  subAlfarsi: 'sub_alfarsi',
  subYasmin: 'sub_yasmin',
  cycYusuf: 'cyc_yusuf',
  cycLayla: 'cyc_layla',
  cycAdam: 'cyc_adam',
  cycOmar: 'cyc_omar_m',
  cycAminaPrev: 'cyc_amina_prev',
  cycAmina: 'cyc_amina',
  cycAlfarsi: 'cyc_alfarsi',
  cycYasmin: 'cyc_yasmin',
  asgYusufSara: 'asg_yusuf_sara',
  asgYusufOmneya: 'asg_yusuf_omneya',
  sesYusufSara: 'ses_yusuf_sara',
  sesYusufDone: 'ses_yusuf_done',
  sesYusufPending: 'ses_yusuf_pending',
  sesYusufCancel: 'ses_yusuf_cancel',
  sesYusufMoved: 'ses_yusuf_moved',
  sesYusufMovedTo: 'ses_yusuf_moved_to',
  sesYusufNext: 'ses_yusuf_next',
  sesLaylaDone: 'ses_layla_done',
  sesLaylaNext: 'ses_layla_next',
  sesAdamReport: 'ses_adam_report',
  sesAdamNext: 'ses_adam_next',
  sesAdamCover: 'ses_adam_cover',
  sesOmarNext: 'ses_omar_next',
  sesAminaNoShow: 'ses_amina_noshow',
  sesAminaDone: 'ses_amina_done',
  sesAlfarsiNext: 'ses_alfarsi_next',
  astYusuf: 'ast_yusuf_rec',
  astAdam: 'ast_adam_rec',
  astLaylaFailed: 'ast_layla_failed',
  fuRenew: 'fu_yusuf_renew',
  fuLayla: 'fu_layla_convert',
  fuYasmin: 'fu_yasmin_resume',
  fuTech: 'fu_alfarsi_tech',
  fuReport: 'fu_yusuf_report',
  fuFamily: 'fu_rahman_schedule',
  payYusuf: 'pay_yusuf',
  payAdam: 'pay_adam',
  payAminaFail: 'pay_amina_fail',
  payAminaOk: 'pay_amina_ok',
  payAminaPending: 'pay_amina_pending',
  payYasmin: 'pay_yasmin',
  payAlfarsi: 'pay_alfarsi',
};

const PLANS = [
  { id: 'launch', minutes: 30, perWeek: 2, sessionsPerMonth: 8, price: 40, name: 'Launch', nameAr: 'الانطلاقة' },
  { id: 'consistent', minutes: 30, perWeek: 4, sessionsPerMonth: 16, price: 59, name: 'Consistent', nameAr: 'المواظبة' },
  { id: 'elite', minutes: 30, perWeek: 5, sessionsPerMonth: 20, price: 74, name: 'Elite', nameAr: 'النخبة' },
  { id: 'starter', minutes: 60, perWeek: 1, sessionsPerMonth: 4, price: 64, name: 'Starter', nameAr: 'البداية' },
  { id: 'gold', minutes: 60, perWeek: 2, sessionsPerMonth: 8, price: 96, name: 'Gold', nameAr: 'الذهبية' },
  { id: 'diamond', minutes: 60, perWeek: 3, sessionsPerMonth: 12, price: 128, name: 'Diamond', nameAr: 'الماسية' },
];

let hashes;
function pw(kind) {
  hashes ??= {
    admin: hashPassword(DEMO_PASSWORD.admin),
    ops: hashPassword(DEMO_PASSWORD.ops),
    teacher: hashPassword(DEMO_PASSWORD.teacher),
    family: hashPassword(DEMO_PASSWORD.family),
    student: hashPassword(DEMO_PASSWORD.student),
  };
  return hashes[kind];
}

function iso(now, offset, hour, minute, tz) {
  return localOn(now, offset, hour, minute, tz).toISOString();
}

function endFrom(startIso, minutes) {
  return new Date(new Date(startIso).getTime() + minutes * 60000).toISOString();
}

export function buildSeed(now = new Date()) {
  const I = IDS;
  const cairo = 'Africa/Cairo';
  const houston = 'America/Chicago';
  const london = 'Europe/London';
  const toronto = 'America/Toronto';
  const sydney = 'Australia/Sydney';
  const paris = 'Europe/Paris';

  const at = (offset, hour, minute, tz) => iso(now, offset, hour, minute, tz);
  const cycleEnd = (startIso) => new Date(new Date(startIso).getTime() + POLICY.cycleDays * 86400000).toISOString();

  const yusufStart = at(-14, 0, 0, houston);
  const adamStart = at(-14, 0, 0, houston);
  const laylaStart = at(-7, 0, 0, houston);
  const omarStart = at(-21, 0, 0, london);
  const aminaPrevStart = at(-56, 0, 0, toronto);
  const aminaStart = at(-20, 0, 0, toronto);
  const alfarsiStart = at(-10, 0, 0, sydney);
  const yasminStart = at(-40, 0, 0, paris);
  const yasminFrozenAt = at(-30, 9, 0, paris);

  const ses = (row) => {
    const durationMin = row.durationMin ?? 30;
    const startsAt = row.startsAt;
    return {
      durationMin,
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
      createdBy: I.admin,
      createdAt: at(-21, 9, 0, cairo),
      ...row,
      startsAt,
      endsAt: endFrom(startsAt, durationMin),
    };
  };

  const yusufNext = at(0, 10, 0, houston);
  const laylaNext = at(0, 10, 15, houston);
  const adamNext = at(0, 11, 0, houston);

  const sessions = [
    ses({
      id: I.sesYusufSara,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tSara,
      familyId: I.famRahman,
      startsAt: at(-12, 10, 0, houston),
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesYusufDone,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tOmneya,
      familyId: I.famRahman,
      startsAt: at(-3, 10, 0, houston),
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesYusufPending,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tOmneya,
      familyId: I.famRahman,
      startsAt: at(-1, 10, 0, houston),
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesYusufCancel,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tOmneya,
      familyId: I.famRahman,
      startsAt: at(-5, 10, 0, houston),
      status: 'cancelled',
      lateCancel: false,
      cancelledByRole: 'guardian',
      cancelReason: 'Travel — notice given 48 hours ahead',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesYusufMoved,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tOmneya,
      familyId: I.famRahman,
      startsAt: at(2, 10, 0, houston),
      originalStartsAt: at(2, 10, 0, houston),
      status: 'rescheduled',
      rescheduledToId: I.sesYusufMovedTo,
      rescheduleReason: 'School event',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesYusufMovedTo,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tOmneya,
      familyId: I.famRahman,
      startsAt: at(3, 10, 30, houston),
      status: 'scheduled',
      rescheduledFromId: I.sesYusufMoved,
      originalStartsAt: at(2, 10, 0, houston),
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesYusufNext,
      studentId: I.yusuf,
      enrollmentId: I.enrYusuf,
      subscriptionId: I.subYusuf,
      cycleId: I.cycYusuf,
      teacherId: I.tOmneya,
      familyId: I.famRahman,
      startsAt: yusufNext,
      status: 'confirmed',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesLaylaDone,
      studentId: I.layla,
      enrollmentId: I.enrLayla,
      subscriptionId: I.subLayla,
      cycleId: I.cycLayla,
      teacherId: I.tSara,
      familyId: I.famRahman,
      startsAt: at(-2, 16, 0, houston),
      status: 'completed',
      courseId: I.cNoor,
    }),
    ses({
      id: I.sesLaylaNext,
      studentId: I.layla,
      enrollmentId: I.enrLayla,
      subscriptionId: I.subLayla,
      cycleId: I.cycLayla,
      teacherId: I.tSara,
      familyId: I.famRahman,
      startsAt: laylaNext,
      status: 'scheduled',
      courseId: I.cNoor,
    }),
    ses({
      id: I.sesAdamReport,
      studentId: I.adam,
      enrollmentId: I.enrAdam,
      subscriptionId: I.subAdam,
      cycleId: I.cycAdam,
      teacherId: I.tNour,
      familyId: I.famRahman,
      startsAt: at(-1, 11, 0, houston),
      status: 'completed',
      courseId: I.cCubs,
    }),
    ses({
      id: I.sesAdamCover,
      studentId: I.adam,
      enrollmentId: I.enrAdam,
      subscriptionId: I.subAdam,
      cycleId: I.cycAdam,
      teacherId: I.tSara,
      familyId: I.famRahman,
      startsAt: at(-8, 11, 0, houston),
      status: 'completed',
      substituteFor: I.tNour,
      courseId: I.cCubs,
    }),
    ses({
      id: I.sesAdamNext,
      studentId: I.adam,
      enrollmentId: I.enrAdam,
      subscriptionId: I.subAdam,
      cycleId: I.cycAdam,
      teacherId: I.tNour,
      familyId: I.famRahman,
      startsAt: adamNext,
      status: 'scheduled',
      courseId: I.cCubs,
    }),
    ses({
      id: I.sesOmarNext,
      studentId: I.omarM,
      enrollmentId: I.enrOmar,
      subscriptionId: I.subOmar,
      cycleId: I.cycOmar,
      teacherId: I.tNour,
      familyId: I.famMansouri,
      startsAt: at(1, 10, 0, london),
      status: 'confirmed',
      courseId: I.cCubs,
    }),
    ses({
      id: 'ses_omar_done_1',
      studentId: I.omarM,
      enrollmentId: I.enrOmar,
      subscriptionId: I.subOmar,
      cycleId: I.cycOmar,
      teacherId: I.tNour,
      familyId: I.famMansouri,
      startsAt: at(-6, 10, 0, london),
      status: 'completed',
      courseId: I.cCubs,
    }),
    ses({
      id: 'ses_omar_done_2',
      studentId: I.omarM,
      enrollmentId: I.enrOmar,
      subscriptionId: I.subOmar,
      cycleId: I.cycOmar,
      teacherId: I.tNour,
      familyId: I.famMansouri,
      startsAt: at(-3, 10, 0, london),
      status: 'completed',
      courseId: I.cCubs,
    }),
    ses({
      id: I.sesAminaNoShow,
      studentId: I.amina,
      enrollmentId: I.enrAmina,
      subscriptionId: I.subAmina,
      cycleId: I.cycAminaPrev,
      teacherId: I.tOmneya,
      familyId: I.famBergstrom,
      startsAt: at(-40, 10, 0, toronto),
      durationMin: 60,
      status: 'no_show',
      noShowParty: 'student',
      courseId: I.cTajweed,
    }),
    ses({
      id: 'ses_amina_prev_1',
      studentId: I.amina,
      enrollmentId: I.enrAmina,
      subscriptionId: I.subAmina,
      cycleId: I.cycAminaPrev,
      teacherId: I.tOmneya,
      familyId: I.famBergstrom,
      startsAt: at(-50, 10, 0, toronto),
      durationMin: 60,
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: 'ses_amina_prev_2',
      studentId: I.amina,
      enrollmentId: I.enrAmina,
      subscriptionId: I.subAmina,
      cycleId: I.cycAminaPrev,
      teacherId: I.tOmneya,
      familyId: I.famBergstrom,
      startsAt: at(-46, 10, 0, toronto),
      durationMin: 60,
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: 'ses_amina_prev_3',
      studentId: I.amina,
      enrollmentId: I.enrAmina,
      subscriptionId: I.subAmina,
      cycleId: I.cycAminaPrev,
      teacherId: I.tOmneya,
      familyId: I.famBergstrom,
      startsAt: at(-43, 10, 0, toronto),
      durationMin: 60,
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesAminaDone,
      studentId: I.amina,
      enrollmentId: I.enrAmina,
      subscriptionId: I.subAmina,
      cycleId: I.cycAmina,
      teacherId: I.tOmneya,
      familyId: I.famBergstrom,
      startsAt: at(-2, 10, 0, toronto),
      durationMin: 60,
      status: 'completed',
      courseId: I.cTajweed,
    }),
    ses({
      id: 'ses_amina_next',
      studentId: I.amina,
      enrollmentId: I.enrAmina,
      subscriptionId: I.subAmina,
      cycleId: I.cycAmina,
      teacherId: I.tOmneya,
      familyId: I.famBergstrom,
      startsAt: at(1, 10, 0, toronto),
      durationMin: 60,
      status: 'scheduled',
      courseId: I.cTajweed,
    }),
    ses({
      id: I.sesAlfarsiNext,
      studentId: I.alfarsi,
      enrollmentId: I.enrAlfarsi,
      subscriptionId: I.subAlfarsi,
      cycleId: I.cycAlfarsi,
      teacherId: I.tOmneya,
      familyId: I.famAlfarsi,
      startsAt: at(1, 7, 0, sydney),
      durationMin: 60,
      status: 'confirmed',
      courseId: I.cHifz,
    }),
    ses({
      id: 'ses_yasmin_1',
      studentId: I.yasmin,
      enrollmentId: I.enrYasmin,
      subscriptionId: I.subYasmin,
      cycleId: I.cycYasmin,
      teacherId: I.tSara,
      familyId: I.famDubois,
      startsAt: at(-38, 18, 0, paris),
      status: 'completed',
      courseId: I.cArabic,
    }),
    ses({
      id: 'ses_yasmin_2',
      studentId: I.yasmin,
      enrollmentId: I.enrYasmin,
      subscriptionId: I.subYasmin,
      cycleId: I.cycYasmin,
      teacherId: I.tSara,
      familyId: I.famDubois,
      startsAt: at(-35, 18, 0, paris),
      status: 'completed',
      courseId: I.cArabic,
    }),
    ses({
      id: 'ses_yasmin_3',
      studentId: I.yasmin,
      enrollmentId: I.enrYasmin,
      subscriptionId: I.subYasmin,
      cycleId: I.cycYasmin,
      teacherId: I.tSara,
      familyId: I.famDubois,
      startsAt: at(-32, 18, 0, paris),
      status: 'completed',
      courseId: I.cArabic,
    }),
  ];

  const reports = [
    {
      id: 'rpt_yusuf_sara',
      sessionId: I.sesYusufSara,
      studentId: I.yusuf,
      teacherId: I.tSara,
      status: 'submitted',
      summary: 'Letters and short vowels reviewed. Ready to move to a Tajweed specialist.',
      summaryAr: 'مراجعة الحروف والحركات. جاهز للانتقال إلى معلمة تجويد متخصصة.',
      homework: 'Read the first page of Al-Fatiha slowly.',
      homeworkAr: 'اقرأ الصفحة الأولى من الفاتحة بتمهّل.',
      nextStep: 'Hand over to Teacher Omneya.',
      nextStepAr: 'التسليم للمعلمة أمنية.',
      strengths: 'Willing and accurate on short vowels.',
      strengthsAr: 'منضبط ودقيق في الحركات القصيرة.',
      improvements: 'Madd still rushed.',
      improvementsAr: 'المد ما زال مستعجلًا.',
      submittedAt: at(-12, 11, 0, houston),
    },
    {
      id: 'rpt_yusuf_done',
      sessionId: I.sesYusufDone,
      studentId: I.yusuf,
      teacherId: I.tOmneya,
      status: 'submitted',
      summary: 'Noon sakinah: idgham introduced. Recitation of Al-Fatiha is stable.',
      summaryAr: 'النون الساكنة: تعرّف على الإدغام. قراءة الفاتحة مستقرة.',
      homework: 'Mark five examples of idgham in the mushaf.',
      homeworkAr: 'حدّد خمسة أمثلة للإدغام في المصحف.',
      nextStep: 'Ikhfa next lesson.',
      nextStepAr: 'الدرس القادم: الإخفاء.',
      strengths: 'Listens and repeats accurately.',
      strengthsAr: 'يستمع ويكرّر بدقة.',
      improvements: 'Needs a slower pace on ghunnah.',
      improvementsAr: 'يحتاج إلى تمهّل في الغنة.',
      submittedAt: at(-3, 11, 0, houston),
    },
    {
      id: 'rpt_layla',
      sessionId: I.sesLaylaDone,
      studentId: I.layla,
      teacherId: I.tSara,
      status: 'submitted',
      summary: 'Trial: connected three letters and enjoyed the story break.',
      summaryAr: 'الحصة التجريبية: وصلت ثلاثة حروف واستمتعت بفاصل القصة.',
      homework: 'Trace the three letters in the worksheet.',
      homeworkAr: 'انسخ الحروف الثلاثة في ورقة التتبع.',
      nextStep: 'Second trial, then a placement decision.',
      nextStepAr: 'الحصة التجريبية الثانية ثم قرار المستوى.',
      strengths: 'Curious and not afraid of mistakes.',
      strengthsAr: 'فضولية ولا تخاف من الخطأ.',
      improvements: 'Short attention after 20 minutes.',
      improvementsAr: 'التركيز يضعف بعد ٢٠ دقيقة.',
      submittedAt: at(-2, 16, 40, houston),
    },
    {
      id: 'rpt_adam',
      sessionId: I.sesAdamReport,
      studentId: I.adam,
      teacherId: I.tNour,
      status: 'submitted',
      summary: 'Reviewed the opening dua and played the letter-matching game.',
      summaryAr: 'مراجعة دعاء البدء ولعبة مطابقة الحروف.',
      homework: 'Repeat the dua once with a parent.',
      homeworkAr: 'كرّر الدعاء مرة مع أحد الوالدين.',
      nextStep: 'Add one new letter.',
      nextStepAr: 'إضافة حرف جديد.',
      strengths: 'Joins the room smiling.',
      strengthsAr: 'يدخل الغرفة مبتسمًا.',
      improvements: 'Still confuses ba and ta.',
      improvementsAr: 'ما زال يخلط بين الباء والتاء.',
      submittedAt: at(-1, 11, 40, houston),
    },
    {
      id: 'rpt_amina',
      sessionId: I.sesAminaDone,
      studentId: I.amina,
      teacherId: I.tOmneya,
      status: 'submitted',
      summary: 'Al-Fatiha recited correctly, including madd.',
      summaryAr: 'قراءة الفاتحة صحيحة بما فيها المد.',
      homework: 'Record one slow recitation and listen back.',
      homeworkAr: 'سجّل تلاوة بطيئة واستمع إليها.',
      nextStep: 'Begin Surah Al-Ikhlas.',
      nextStepAr: 'البدء بسورة الإخلاص.',
      strengths: 'Patience with repetition.',
      strengthsAr: 'صبر على التكرار.',
      improvements: 'Qalqalah is still light.',
      improvementsAr: 'القلقلة ما زالت خفيفة.',
      submittedAt: at(-2, 11, 10, toronto),
    },
    ...['ses_omar_done_1', 'ses_omar_done_2', 'ses_amina_prev_1', 'ses_amina_prev_2', 'ses_amina_prev_3', 'ses_yasmin_1', 'ses_yasmin_2', 'ses_yasmin_3', I.sesAdamCover].map((sessionId, i) => ({
      id: `rpt_hist_${i}`,
      sessionId,
      studentId: sessionId.includes('omar') ? I.omarM : sessionId.includes('amina') ? I.amina : sessionId.includes('yasmin') ? I.yasmin : I.adam,
      teacherId: sessionId.includes('yasmin') || sessionId === I.sesAdamCover ? I.tSara : sessionId.includes('omar') ? I.tNour : I.tOmneya,
      status: 'submitted',
      summary: 'Historical lesson recorded so the pending queue only shows work that is actually open.',
      summaryAr: 'حصة سابقة موثّقة، حتى لا تظهر في قائمة التقارير الناقصة.',
      homework: '',
      homeworkAr: '',
      nextStep: '',
      nextStepAr: '',
      strengths: '',
      strengthsAr: '',
      improvements: '',
      improvementsAr: '',
      submittedAt: at(-4, 12, 0, cairo),
    })),
  ];
  for (const report of reports) {
    report.reviewStatus = 'approved';
    report.reviewedAt = report.submittedAt;
    report.reviewedBy = I.ops;
  }

  const users = [
    user(I.admin, 'admin', 'admin@ummahacademy.net', pw('admin'), 'Huda El-Sayed', 'هدى السيد', cairo, {}),
    user(I.ops, 'ops', 'ops@ummahacademy.net', pw('ops'), 'Karim Nabil', 'كريم نبيل', cairo, {}),
    user(I.omneyaUser, 'teacher', 'omneya@ummahacademy.net', pw('teacher'), 'Omneya Ali', 'أمنية علي', cairo, { teacherId: I.tOmneya }),
    user(I.saraUser, 'teacher', 'sara@ummahacademy.net', pw('teacher'), 'Sara Ahmed', 'سارة أحمد', cairo, { teacherId: I.tSara }),
    user(I.nourUser, 'teacher', 'nour@ummahacademy.net', pw('teacher'), 'Nour Hassan', 'نور حسن', cairo, { teacherId: I.tNour }),
    user(I.khalid, 'guardian', 'khalid.rahman@example.com', pw('family'), 'Khalid Rahman', 'خالد رحمن', houston, { guardianId: I.gKhalid, familyId: I.famRahman }),
    user(I.fatima, 'guardian', 'fatima.rahman@example.com', pw('family'), 'Fatima Rahman', 'فاطمة رحمن', houston, { guardianId: I.gFatima, familyId: I.famRahman }),
    user(I.sarah, 'guardian', 'sarah.mansouri@example.com', pw('family'), 'Sarah Al-Mansouri', 'سارة المنصوري', london, { guardianId: I.gSarah, familyId: I.famMansouri }),
    user(I.aminaUser, 'guardian', 'amina.bergstrom@example.com', pw('family'), 'Amina Bergström', 'أمينة بيرغستروم', toronto, { guardianId: I.gAmina, familyId: I.famBergstrom, studentId: I.amina }),
    user(I.alfarsiUser, 'guardian', 'omar.alfarsi@example.com', pw('family'), 'Omar Al-Farsi', 'عمر الفارسي', sydney, { guardianId: I.gAlfarsi, familyId: I.famAlfarsi, studentId: I.alfarsi }),
    user(I.yasminUser, 'guardian', 'yasmin.dubois@example.com', pw('family'), 'Yasmin Dubois', 'ياسمين دوبوا', paris, { guardianId: I.gYasmin, familyId: I.famDubois, studentId: I.yasmin }),
    user(I.omarStudentUser, 'student', 'omar.mansouri@example.com', pw('student'), 'Omar Al-Mansouri', 'عمر المنصوري', london, { studentId: I.omarM, familyId: I.famMansouri }),
  ];

  return {
    meta: {
      version: 1,
      demo: true,
      seededAt: now.toISOString(),
      disclaimer:
        'Synthetic demo. Not a record of a real child. Do not enter real student data until a production host, secret, and retention policy are in place.',
    },
    users,
    teachers: [
      { id: I.tOmneya, userId: I.omneyaUser, name: 'Omneya Ali', nameAr: 'أمنية علي', role: 'Head of Tajweed', roleAr: 'رئيسة قسم التجويد', specialty: 'Tajweed & Qira’at', specialtyAr: 'التجويد والقراءات', timezone: cairo, track: 'quran', ijazah: true, status: 'active' },
      { id: I.tSara, userId: I.saraUser, name: 'Sara Ahmed', nameAr: 'سارة أحمد', role: 'Lead, Arabic Foundations', roleAr: 'مسؤولة تأسيس العربية', specialty: 'Arabic & Noor Al-Bayan', specialtyAr: 'العربية ونور البيان', timezone: cairo, track: 'arabic', ijazah: false, status: 'active' },
      { id: I.tNour, userId: I.nourUser, name: 'Nour Hassan', nameAr: 'نور حسن', role: 'Lead, Ummah Cubs', roleAr: 'مسؤولة أشبال الأمة', specialty: 'Kids & Islamic studies', specialtyAr: 'الأطفال والدراسات الإسلامية', timezone: cairo, track: 'kids', ijazah: false, status: 'active' },
    ],
    families: [
      fam(I.famRahman, 'Rahman', 'رحمن', houston, 'US', 'active', at(-60, 12, 0, houston), 'Houston'),
      fam(I.famMansouri, 'Al-Mansouri', 'المنصوري', london, 'GB', 'active', at(-40, 12, 0, london), 'London'),
      fam(I.famBergstrom, 'Bergström', 'بيرغستروم', toronto, 'CA', 'active', at(-70, 12, 0, toronto), 'Toronto'),
      fam(I.famAlfarsi, 'Al-Farsi', 'الفارسي', sydney, 'AU', 'active', at(-20, 12, 0, sydney), 'Sydney'),
      fam(I.famDubois, 'Dubois', 'دوبوا', paris, 'FR', 'needs_follow_up', at(-50, 12, 0, paris), 'Paris'),
    ],
    guardians: [
      grd(I.gKhalid, I.famRahman, I.khalid, 'Khalid Rahman', 'خالد رحمن', 'father', [I.yusuf, I.layla, I.adam], true, true, true),
      grd(I.gFatima, I.famRahman, I.fatima, 'Fatima Rahman', 'فاطمة رحمن', 'mother', [I.yusuf, I.layla], true, false, true),
      grd(I.gSarah, I.famMansouri, I.sarah, 'Sarah Al-Mansouri', 'سارة المنصوري', 'mother', [I.omarM], true, true, true),
      grd(I.gAmina, I.famBergstrom, I.aminaUser, 'Amina Bergström', 'أمينة بيرغستروم', 'self', [I.amina], true, true, true),
      grd(I.gAlfarsi, I.famAlfarsi, I.alfarsiUser, 'Omar Al-Farsi', 'عمر الفارسي', 'self', [I.alfarsi], true, true, true),
      grd(I.gYasmin, I.famDubois, I.yasminUser, 'Yasmin Dubois', 'ياسمين دوبوا', 'self', [I.yasmin], true, true, true),
    ],
    students: [
      stu(I.yusuf, I.famRahman, null, 'Yusuf Rahman', 'يوسف رحمن', 2014, houston, 'US', 'active', true, false, 'Tajweed L2', 'Hold noon sakinah rules without prompting.', 'Accurate short vowels', 'Ghunnah length'),
      stu(I.layla, I.famRahman, null, 'Layla Rahman', 'ليلى رحمن', 2018, houston, 'US', 'trial', true, false, 'Noor Al-Bayan start', 'Finish the two trial lessons and decide on Launch.', 'Curious', 'Attention after 20 minutes'),
      stu(I.adam, I.famRahman, null, 'Adam Rahman', 'آدم رحمن', 2020, houston, 'US', 'active', true, false, 'Cubs 1', 'Know the opening dua and five letters.', 'Eager', 'Ba / ta'),
      stu(I.omarM, I.famMansouri, I.omarStudentUser, 'Omar Al-Mansouri', 'عمر المنصوري', 2019, london, 'GB', 'active', true, true, 'Cubs 1', 'Stay excited for the session.', 'Shows up ready', 'Still new to letters'),
      stu(I.amina, I.famBergstrom, I.aminaUser, 'Amina Bergström', 'أمينة بيرغستروم', 1994, toronto, 'CA', 'active', true, true, 'Tajweed L1 complete', 'Recite Al-Ikhlas with tajweed.', 'Patient', 'Qalqalah'),
      stu(I.alfarsi, I.famAlfarsi, I.alfarsiUser, 'Omar Al-Farsi', 'عمر الفارسي', 1988, sydney, 'AU', 'active', true, true, 'Hifz Juz 30', 'Keep a 7am Sydney slot without missing Fajr routine.', 'Consistent', 'New to the portal'),
      stu(I.yasmin, I.famDubois, I.yasminUser, 'Yasmin Dubois', 'ياسمين دوبوا', 1998, paris, 'FR', 'paused', true, true, 'Noor Al-Bayan mid', 'Resume after travel without losing paid credits.', 'Fast reader', 'Paused by request'),
    ],
    courses: [
      { id: I.cTajweed, track: 'quran', name: 'Tajweed Rules', nameAr: 'أحكام التجويد' },
      { id: I.cNoor, track: 'arabic', name: 'Noor Al-Bayan', nameAr: 'نور البيان' },
      { id: I.cCubs, track: 'kids', name: 'Ummah Cubs', nameAr: 'أشبال الأمة' },
      { id: I.cHifz, track: 'quran', name: 'Hifz & Ijazah', nameAr: 'الحفظ والإجازة' },
      { id: I.cArabic, track: 'arabic', name: 'Arabic Foundations', nameAr: 'تأسيس العربية' },
    ],
    plans: PLANS,
    enrollments: [
      enr(I.enrYusuf, I.yusuf, I.cTajweed, 'L2', yusufStart, null, 'active', I.tOmneya),
      enr(I.enrLayla, I.layla, I.cNoor, 'Start', laylaStart, null, 'trial', I.tSara),
      enr(I.enrAdam, I.adam, I.cCubs, 'Cubs 1', adamStart, null, 'active', I.tNour),
      enr(I.enrOmar, I.omarM, I.cCubs, 'Cubs 1', omarStart, null, 'active', I.tNour),
      enr(I.enrAmina, I.amina, I.cTajweed, 'L1', aminaPrevStart, null, 'active', I.tOmneya),
      enr(I.enrAlfarsi, I.alfarsi, I.cHifz, 'Juz 30', alfarsiStart, null, 'active', I.tOmneya),
      enr(I.enrYasmin, I.yasmin, I.cArabic, 'Mid', yasminStart, null, 'paused', I.tSara),
    ],
    subscriptions: [
      sub(I.subYusuf, I.yusuf, I.famRahman, 'gold', I.cTajweed, 'active', I.admin, yusufStart),
      sub(I.subLayla, I.layla, I.famRahman, 'launch', I.cNoor, 'trial', I.ops, laylaStart),
      sub(I.subAdam, I.adam, I.famRahman, 'consistent', I.cCubs, 'active', I.admin, adamStart),
      sub(I.subOmar, I.omarM, I.famMansouri, 'launch', I.cCubs, 'active', I.admin, omarStart),
      sub(I.subAmina, I.amina, I.famBergstrom, 'gold', I.cTajweed, 'active', I.admin, aminaPrevStart),
      sub(I.subAlfarsi, I.alfarsi, I.famAlfarsi, 'diamond', I.cHifz, 'active', I.admin, alfarsiStart),
      sub(I.subYasmin, I.yasmin, I.famDubois, 'gold', I.cArabic, 'paused', I.admin, yasminStart),
    ],
    cycles: [
      cyc(I.cycYusuf, I.subYusuf, 'gold', yusufStart, cycleEnd(yusufStart), 8, 'active', 96),
      cyc(I.cycLayla, I.subLayla, 'launch', laylaStart, cycleEnd(laylaStart), 2, 'active', 0),
      cyc(I.cycAdam, I.subAdam, 'consistent', adamStart, cycleEnd(adamStart), 16, 'active', 59),
      cyc(I.cycOmar, I.subOmar, 'launch', omarStart, cycleEnd(omarStart), 8, 'active', 40),
      cyc(I.cycAminaPrev, I.subAmina, 'starter', aminaPrevStart, cycleEnd(aminaPrevStart), 4, 'completed', 64),
      cyc(I.cycAmina, I.subAmina, 'gold', aminaStart, cycleEnd(aminaStart), 8, 'active', 96),
      cyc(I.cycAlfarsi, I.subAlfarsi, 'diamond', alfarsiStart, cycleEnd(alfarsiStart), 12, 'active', 128),
      {
        ...cyc(I.cycYasmin, I.subYasmin, 'gold', yasminStart, cycleEnd(yasminStart), 8, 'frozen', 96),
        frozenAt: yasminFrozenAt,
        freezeReason: 'Travel — keep the five remaining credits',
        resumedAt: null,
      },
    ],
    payments: [
      pay(I.payYusuf, I.famRahman, I.subYusuf, I.cycYusuf, 96, 'paid', 'card', yusufStart, null),
      pay(I.payAdam, I.famRahman, I.subAdam, I.cycAdam, 59, 'paid', 'paypal', adamStart, null),
      pay(I.payAminaFail, I.famBergstrom, I.subAmina, I.cycAminaPrev, 64, 'failed', 'card', aminaPrevStart, 'Issuer declined'),
      pay(I.payAminaOk, I.famBergstrom, I.subAmina, I.cycAminaPrev, 64, 'paid', 'bank', at(-54, 12, 0, toronto), null),
      pay(I.payAminaPending, I.famBergstrom, I.subAmina, I.cycAmina, 96, 'pending', 'card', aminaStart, null),
      pay(I.payYasmin, I.famDubois, I.subYasmin, I.cycYasmin, 96, 'paid', 'bank', yasminStart, null),
      pay(I.payAlfarsi, I.famAlfarsi, I.subAlfarsi, I.cycAlfarsi, 128, 'paid', 'bank', alfarsiStart, null),
    ],
    assignments: [
      { id: I.asgYusufSara, studentId: I.yusuf, enrollmentId: I.enrYusuf, teacherId: I.tSara, kind: 'primary', startAt: at(-18, 9, 0, houston), endAt: at(-11, 9, 0, houston), reason: 'Trial placement before Tajweed specialist', createdBy: I.ops },
      { id: I.asgYusufOmneya, studentId: I.yusuf, enrollmentId: I.enrYusuf, teacherId: I.tOmneya, kind: 'primary', startAt: at(-11, 9, 0, houston), endAt: null, reason: 'Moved to Head of Tajweed after trial', createdBy: I.ops },
      { id: 'asg_layla', studentId: I.layla, enrollmentId: I.enrLayla, teacherId: I.tSara, kind: 'primary', startAt: laylaStart, endAt: null, reason: 'Trial match', createdBy: I.ops },
      { id: 'asg_adam', studentId: I.adam, enrollmentId: I.enrAdam, teacherId: I.tNour, kind: 'primary', startAt: adamStart, endAt: null, reason: 'Cubs placement', createdBy: I.admin },
      { id: 'asg_omar', studentId: I.omarM, enrollmentId: I.enrOmar, teacherId: I.tNour, kind: 'primary', startAt: omarStart, endAt: null, reason: 'Cubs placement', createdBy: I.admin },
      { id: 'asg_amina', studentId: I.amina, enrollmentId: I.enrAmina, teacherId: I.tOmneya, kind: 'primary', startAt: aminaPrevStart, endAt: null, reason: 'Adult tajweed', createdBy: I.admin },
      { id: 'asg_alfarsi', studentId: I.alfarsi, enrollmentId: I.enrAlfarsi, teacherId: I.tOmneya, kind: 'primary', startAt: alfarsiStart, endAt: null, reason: 'Hifz, 7am Sydney', createdBy: I.admin },
      { id: 'asg_yasmin', studentId: I.yasmin, enrollmentId: I.enrYasmin, teacherId: I.tSara, kind: 'primary', startAt: yasminStart, endAt: null, reason: 'Arabic foundations', createdBy: I.admin },
    ],
    sessions,
    attendance: [
      att('att_yusuf_sara', I.sesYusufSara, I.yusuf, 'present', I.saraUser, at(-12, 10, 5, houston)),
      att('att_yusuf_done', I.sesYusufDone, I.yusuf, 'present', I.omneyaUser, at(-3, 10, 5, houston)),
      att('att_yusuf_pending', I.sesYusufPending, I.yusuf, 'present', I.omneyaUser, at(-1, 10, 5, houston)),
      att('att_layla', I.sesLaylaDone, I.layla, 'present', I.saraUser, at(-2, 16, 5, houston)),
      att('att_adam', I.sesAdamReport, I.adam, 'present', I.nourUser, at(-1, 11, 5, houston)),
      att('att_adam_cover', I.sesAdamCover, I.adam, 'present', I.saraUser, at(-8, 11, 5, houston)),
      att('att_omar_1', 'ses_omar_done_1', I.omarM, 'present', I.nourUser, at(-6, 10, 5, london)),
      att('att_omar_2', 'ses_omar_done_2', I.omarM, 'late', I.nourUser, at(-3, 10, 8, london)),
      att('att_amina_ns', I.sesAminaNoShow, I.amina, 'absent', I.omneyaUser, at(-40, 10, 15, toronto)),
      att('att_amina', I.sesAminaDone, I.amina, 'present', I.omneyaUser, at(-2, 10, 5, toronto)),
    ],
    reports,
    assets: [
      asset(I.astYusuf, 'recording', I.yusuf, I.sesYusufDone, I.cTajweed, I.omneyaUser, 'ready', 'Yusuf · idgham lesson', 'يوسف · درس الإدغام', at(-3, 11, 5, houston)),
      asset(I.astAdam, 'recording', I.adam, I.sesAdamReport, I.cCubs, I.nourUser, 'ready', 'Adam · opening dua', 'آدم · دعاء البدء', at(-1, 11, 45, houston)),
      asset(I.astLaylaFailed, 'recording', I.layla, I.sesLaylaDone, I.cNoor, I.saraUser, 'failed', 'Layla · trial upload failed', 'ليلى · فشل رفع التسجيل', at(-2, 17, 0, houston)),
    ],
    followUps: [
      fu(I.fuRenew, 'student', 'subscription', 'family', I.famRahman, I.yusuf, null, I.subYusuf, null, 'Renew Yusuf before the cycle ends', 'تجديد اشتراك يوسف قبل نهاية الفترة', 'open', 'high', I.ops, at(-1, 9, 0, cairo), null),
      fu(I.fuLayla, 'student', 'sales', 'family', I.famRahman, I.layla, null, I.subLayla, I.sesLaylaDone, 'Convert Layla’s trial', 'تحويل تجربة ليلى إلى اشتراك', 'in_progress', 'normal', I.ops, at(1, 12, 0, houston), null),
      fu(I.fuYasmin, 'student', 'subscription', 'family', I.famDubois, I.yasmin, null, I.subYasmin, null, 'Resume Yasmin after travel', 'استئناف ياسمين بعد السفر', 'waiting', 'normal', I.ops, at(3, 10, 0, paris), null),
      fu(I.fuTech, 'session', 'technical', 'family', I.famAlfarsi, I.alfarsi, null, null, I.sesAlfarsiNext, 'Sydney join link opened the wrong room', 'رابط سيدني فتح غرفة خاطئة', 'resolved', 'urgent', I.ops, at(-2, 8, 0, sydney), 'Room link regenerated and confirmed by the student the same day.'),
      fu(I.fuReport, 'session', 'teacher_ops', 'internal', I.famRahman, I.yusuf, I.tOmneya, null, I.sesYusufPending, 'Report missing after Yusuf’s last lesson', 'تقرير يوسف بعد آخر حصة لم يُرفع', 'open', 'high', I.omneyaUser, at(0, 9, 0, cairo), null),
      fu(I.fuFamily, 'family', 'family', 'family', I.famRahman, null, null, null, null, 'Rahman siblings overlap at 10:00 Houston', 'تعارض حصص أبناء رحمن في العاشرة بتوقيت هيوستن', 'open', 'normal', I.ops, at(0, 18, 0, houston), null),
    ],
    attempts: [
      { id: 'attm_renew_1', followUpId: I.fuRenew, at: at(-1, 15, 0, cairo), channel: 'whatsapp', note: 'Asked Khalid which card to use. He will confirm tonight.', noteAr: 'سُئل خالد عن البطاقة. سيؤكّد الليلة.', actorId: I.ops, result: 'waiting_on_family' },
      { id: 'attm_layla_1', followUpId: I.fuLayla, at: at(-1, 18, 0, houston), channel: 'whatsapp', note: 'Fatima liked the trial report.', noteAr: 'أعجب فاطمة تقرير التجربة.', actorId: I.ops, result: 'positive' },
      { id: 'attm_layla_2', followUpId: I.fuLayla, at: at(0, 8, 0, houston), channel: 'call', note: 'Second call: she wants Launch, not Consistent. Note kept; the first note was not overwritten.', noteAr: 'اتصال ثانٍ: تريد الانطلاقة لا المواظبة. الملاحظة الأولى ما زالت محفوظة.', actorId: I.ops, result: 'positive' },
      { id: 'attm_tech', followUpId: I.fuTech, at: at(-2, 9, 0, sydney), channel: 'portal', note: 'Regenerated the room link.', noteAr: 'أُعيد إنشاء رابط الغرفة.', actorId: I.ops, result: 'fixed' },
    ],
    audit: [
      audit('aud_seed_teacher', I.ops, 'teacher.assignment.changed', 'enrollment', I.enrYusuf, at(-11, 9, 0, houston), { teacherId: I.tSara }, { teacherId: I.tOmneya }, 'Moved to Head of Tajweed after trial'),
      audit('aud_seed_renew', I.admin, 'subscription.renewed', 'subscription', I.subAmina, aminaStart, { cycleId: I.cycAminaPrev, planId: 'starter' }, { cycleId: I.cycAmina, planId: 'gold' }, 'Renewed after the starter cycle ended'),
      audit('aud_seed_pay', I.admin, 'payment.recorded', 'payment', I.payAminaOk, at(-54, 12, 0, toronto), { status: 'failed', id: I.payAminaFail }, { status: 'paid', id: I.payAminaOk }, 'Settled the declined starter invoice without deleting the failure'),
      audit('aud_seed_move', I.ops, 'session.rescheduled', 'session', I.sesYusufMoved, at(-1, 12, 0, houston), { startsAt: at(2, 10, 0, houston) }, { status: 'rescheduled', movedTo: I.sesYusufMovedTo }, 'School event'),
    ],
    events: [
      evt('evt_join_rahman', 'family.joined', I.famRahman, null, 'Rahman family joined', 'انضمّت أسرة رحمن', at(-60, 12, 0, houston)),
      evt('evt_teacher', 'teacher.changed', I.famRahman, I.yusuf, 'Yusuf moved from Sara to Omneya', 'انتقل يوسف من سارة إلى أمنية', at(-11, 9, 0, houston)),
      evt('evt_renew', 'subscription.renewed', I.famBergstrom, I.amina, 'Amina renewed from Starter to Gold', 'جدّدت أمينة من البداية إلى الذهبية', aminaStart),
      evt('evt_freeze', 'subscription.frozen', I.famDubois, I.yasmin, 'Yasmin froze her plan and kept remaining credits', 'جمّدت ياسمين خطتها مع بقاء الرصيد', yasminFrozenAt),
      evt('evt_report', 'report.submitted', I.famRahman, I.adam, 'Adam’s report is ready', 'تقرير آدم جاهز', at(-1, 11, 45, houston)),
    ],
    notifications: [
      note('ntf_khalid_report', I.khalid, 'Adam’s report is ready', 'تقرير آدم جاهز', 'Teacher Nour submitted yesterday’s lesson.', 'رفعت المعلمة نور تقرير حصة الأمس.', `/app/students/${I.adam}?tab=progress`, false),
      note('ntf_khalid_overlap', I.khalid, 'Two children at the same time', 'حصتان في الوقت نفسه', 'Yusuf and Layla both start around 10:00 Houston.', 'يوسف وليلى يبدآن قرب العاشرة بتوقيت هيوستن.', `/app/families/${I.famRahman}?tab=schedule`, false),
      note('ntf_omneya', I.omneyaUser, 'Report still open', 'تقرير معلّق', 'Yusuf’s last lesson has attendance but no report.', 'حصة يوسف الأخيرة لها حضور بلا تقرير.', `/app/sessions/${I.sesYusufPending}`, false),
      note('ntf_ops', I.ops, 'Overdue renewal follow-up', 'متابعة تجديد متأخرة', 'Yusuf’s renewal follow-up is past due.', 'متابعة تجديد يوسف تجاوزت موعدها.', `/app/follow-ups/${I.fuRenew}`, false),
      note('ntf_fatima', I.fatima, 'Layla’s trial report', 'تقرير تجربة ليلى', 'The second trial is still on the calendar.', 'الحصة التجريبية الثانية ما زالت في الجدول.', `/app/students/${I.layla}`, false),
    ],
    idempotency: [],
    requests: [],
  };
}

function user(id, role, email, passwordHash, name, nameAr, timezone, extra) {
  return {
    id,
    role,
    email,
    passwordHash,
    name,
    nameAr,
    timezone,
    locale: 'ar',
    status: 'active',
    teacherId: null,
    studentId: null,
    guardianId: null,
    familyId: null,
    ...extra,
  };
}
function fam(id, name, nameAr, timezone, country, status, joinedAt, city) {
  return { id, name, nameAr, timezone, country, city, status, joinedAt, phone: null };
}
function grd(id, familyId, userId, name, nameAr, relation, studentIds, verified, canViewBilling, canViewRecordings) {
  return { id, familyId, userId, name, nameAr, relation, studentIds, verified, canViewBilling, canViewRecordings, email: null };
}
function stu(id, familyId, userId, name, nameAr, birthYear, timezone, country, academicStatus, portalVisible, loginEnabled, level, goals, strengths, improvements) {
  return {
    id,
    familyId,
    userId,
    name,
    nameAr,
    birthYear,
    timezone,
    country,
    language: 'ar',
    academicStatus,
    portalVisible,
    loginEnabled,
    level,
    goals,
    strengths,
    improvements,
  };
}
function enr(id, studentId, courseId, level, startAt, endAt, status, teacherId) {
  return { id, studentId, courseId, level, startAt, endAt, status, teacherId };
}
function sub(id, studentId, familyId, planId, courseId, status, createdBy, createdAt) {
  return { id, studentId, familyId, planId, courseId, status, createdBy, createdAt };
}
function cyc(id, subscriptionId, planId, start, end, sessionsAllocated, status, priceUsd) {
  return { id, subscriptionId, planId, start, end, sessionsAllocated, status, priceUsd, adjustments: [], frozenAt: null, freezeReason: null, resumedAt: null, cancelledAt: null, cancelReason: null, createdBy: IDS.admin };
}
function pay(id, familyId, subscriptionId, cycleId, amount, status, method, at, failureReason) {
  return { id, familyId, subscriptionId, cycleId, amount, currency: 'USD', status, method, paidAt: status === 'paid' ? at : null, createdAt: at, failureReason, createdBy: IDS.admin, idempotencyKey: null };
}
function fu(id, level, type, visibility, familyId, studentId, teacherId, subscriptionId, sessionId, title, titleAr, status, priority, assigneeId, dueAt, outcome) {
  return {
    id,
    level,
    type,
    visibility,
    familyId,
    studentId,
    teacherId,
    subscriptionId,
    sessionId,
    title,
    titleAr,
    status,
    priority,
    assigneeId,
    dueAt,
    outcome,
    outcomeAr: outcome,
    createdBy: IDS.ops,
    createdAt: dueAt,
    closedAt: status === 'resolved' || status === 'closed' ? dueAt : null,
  };
}
function att(id, sessionId, studentId, status, markedBy, markedAt) {
  return { id, sessionId, studentId, status, markedBy, markedAt };
}
function asset(id, type, studentId, sessionId, courseId, ownerId, status, title, titleAr, createdAt) {
  const retention = new Date(new Date(createdAt).getTime() + 365 * 86400000).toISOString();
  return {
    id,
    type,
    studentId,
    sessionId,
    courseId,
    ownerId,
    status,
    title,
    titleAr,
    storageKey: `demo://protected/${id}`,
    createdAt,
    retentionUntil: retention,
    deletedAt: null,
  };
}
function audit(id, actorId, action, entityType, entityId, occurredAt, before, after, reason) {
  return { id, actorId, action, entityType, entityId, occurredAt, before, after, reason, requestId: 'seed' };
}
function evt(id, type, familyId, studentId, summary, summaryAr, occurredAt) {
  return { id, type, familyId, studentId, entityType: 'student', entityId: studentId, summary, summaryAr, occurredAt, actorId: IDS.ops };
}
function note(id, userId, title, titleAr, body, bodyAr, href, read) {
  return { id, userId, title, titleAr, body, bodyAr, href, read, createdAt: new Date().toISOString() };
}
