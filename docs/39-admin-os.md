# 39 · Ummah Admin OS

التاريخ: 2026-10-17.

واجهة تشغيل واحدة للموقع + الأكاديمية. ليست ووردبريس، وليست أربعة أنظمة منفصلة.

**شُحن في الكود:** `/app` أدمن/تشغيل = نظام التشغيل. الشريط: مساحة العمل، مدير الموقع، تشغيل الأكاديمية، القبول، الفريق والحوكمة. `GET /api/console?view=website|admissions|governance`. اعتماد التقرير: `POST /api/sessions/:id/report/approve`. الأسرة لا ترى التقرير قبل الاعتماد.

---

## العربية

### ماذا تغيّر

| الشاشة | الوظيفة | ما لن تفعله |
|---|---|---|
| نظرة عامة | طوابير: تجارب، تقارير ناقصة، تقارير بانتظار الاعتماد، متابعات متأخرة، تجديدات | ليست لوحة ووردبريس |
| مدير الموقع | مجموعات سفيلتيا ومسار Draft→Preview→Approval→Publish | لا تكتب ملفات Astro من البوابة، لا Elementor |
| تشغيل الأكاديمية | الطلاب، الحصص، الاشتراكات، التقدّم — نفس `portal/` | لا سجلات موازية |
| القبول | Lead → تجربة محجوزة → مكتملة → مدفوع من الاشتراك/الحصص | لا HubSpot، لا ليدز مخترعة |
| الحوكمة | أدوار الدخول الخمس ومصفوفة الصلاحيات | لا حساب «مدير أكاديمي» حتى يفصل المالك التشغيل |

الموقع العام يبقى Astro ثابتًا. النشر عبر طلب GitHub + معاينة Vercel (`docs/16-cms-guide.md`).

يوم المعلم ومتابعة الأسرة كما شُحنا: `/app/today` و`/app/home`.

المخزن JSON تجريبي. **ليس إنتاج أطفال.** Stripe/SMTP/الدردشة الحية غير موصولة.

### قرارات المالك ما زالت في `docs/37`

لا تخمين: بوابة الدفع، SMTP، طرف الليدز، GTM، الإمبريسوم، نطاق البوابة.

---

## English

One admin workspace for the marketing site and the academy. Not WordPress. Not four products.

Overview is action queues. Website edits stay Astro + Sveltia (GitHub PR). Operations reuse `portal/`. Admissions columns are derived from students, subscriptions and sessions. Family Hub sees a lesson report only after admin/ops approval. Login roles remain admin / ops / teacher / guardian / student.
