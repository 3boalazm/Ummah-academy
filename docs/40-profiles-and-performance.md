# 40 · Profiles and site performance

Date: 2026-10-17. Scope: the first core of the profiling system, built on the existing `portal/` (not a rewrite).

## العربية

### ما الذي أُضيف

| الشاشة | المسار | من يراها |
|---|---|---|
| **ملفي الشخصي** | `/app/profile` | كل الأدوار. الحساب + ملف الدور + التفضيلات + كلمة المرور |
| **الملف التعليمي** | `/app/students/:id/learning` | الطالب نفسه، أسرته المصرَّح لها، معلمه، الإدارة |
| **أداء الموقع** | `/app/performance` | الأدمن والتشغيل فقط |

**ملف الدور**

- ولي الأمر: الأسرة، الأبناء المصرَّح لهم فقط، حصة كل ابن القادمة، الهاتف (يمرّ على موافقة واتساب القائمة).
- المعلم: الحمل (طلاب، حصص الأسبوع، تقارير مطلوبة) ونبذة تظهر للأسر.
- الإدارة/التشغيل: النطاق والصلاحيات.
- الطالب: يرى نفسه فقط.

**الملف التعليمي** مشتق كله من سجلات موجودة، لا أرقام تُكتب يدويًا: المستوى والهدف ونقاط القوة والتحسين، الحضور آخر 90 يومًا، الحصص المكتملة، الواجب، نتيجة تحديد المستوى، الأهداف، آخر تقرير منشور، أحداث التقدّم.

### قواعد لا تتغير

- **التعديل الذاتي ضيّق.** الكل: اللغة والمنطقة الزمنية. ولي الأمر والإدارة: الاسم. المعلم: النبذة فقط. الطالب لا يغيّر اسمه ولا مستواه. المستوى والحالة الأكاديمية يغيّرهما فريق الأكاديمية بسبب مكتوب.
- **درجات المعيار وملاحظات المقيِّم للفريق فقط** إلى أن يقرر المالك ما تراه الأسرة (قرار مفتوح في `38-academy-operating-system.md` §8).
- **تغيير كلمة المرور** يطلب الحالية، ويرفض الضعيفة وتكرار اسم البريد وكلمات المرور التجريبية في الإنتاج، ويُخرج كل الجلسات الأخرى (رقم نسخة الجلسة `pv`). لا تُكتب كلمة مرور في سجل التدقيق.

### قياس الأداء (RUM)

متصفح الزائر يرسل رقمًا واحدًا لكل مقياس عند مغادرة الصفحة: LCP · INP · CLS · FCP · TTFB، مع المسار واللغة وفئة الجهاز وفئة الاتصال. **لا كوكيز، لا IP، لا user agent، لا query string، لا معرّف.** يُخزَّن تجميع (هيستوجرام) لكل يوم لمدة 30 يومًا.

- يعمل **فقط** إذا وُضع `PUBLIC_RUM_ENDPOINT` عند بناء الموقع، مثل `https://portal.ummahacademy.net/api/rum`. بدونه لا يصل للموقع أي كود إضافي.
- يحترم Global Privacy Control وDo Not Track.
- المسار `/api/rum` يقبل أصل الموقع فقط (`PORTAL_RUM_ORIGINS`)، وحدّ الجسم 2 KB، وحدّ المعدل، و600 مفتاح مسار يوميًا كحد أقصى.
- العتبات هي عتبات web.dev: LCP ≤ 2.5s · INP ≤ 200ms · CLS ≤ 0.1.

**قبل التفعيل:** أضف سطرًا لسياسة الخصوصية يذكر القياس المجهول. صياغة قانونية = قرار المراجعة القانونية في `06-launch-checklist.md`.

## English

The first core of the profiling system lives inside the existing portal. Three screens: **My profile** (`/app/profile`, all roles), **Learning profile** (`/app/students/:id/learning`, same access rules as the student record) and **Site performance** (`/app/performance`, admin and ops).

- Self-service stays narrow: everyone sets language and time zone; guardians and staff set their name; teachers set a bio. A student cannot rename themselves or change their level.
- The learning profile is a read model over sessions, attendance, homework, reports and placements. Rubric scores and assessor notes are staff-only until the owner decides what families see.
- Changing a password needs the current one, enforces strength, bumps the user's session version (`pv`) so older cookies stop working, and never writes the password to the audit log.
- Real-user Core Web Vitals are collected by `src/scripts/vitals.ts` only when `PUBLIC_RUM_ENDPOINT` is set at build time. One `sendBeacon` per page view, text/plain so there is no CORS preflight. Stored data is per-day histograms; nothing identifies a person. Aggregation lives in `portal/src/domain/rum.mjs` and is flushed to `rum.json` next to the store (debounced 5 s, and on shutdown).

### Turning it on

1. Deploy the portal on its own host (Hostinger Web App, Node ≥ 20) with `PORTAL_ENV=production`, `PORTAL_SECRET`, `PORTAL_RUM_ORIGINS=https://ummahacademy.net,https://www.ummahacademy.net`.
2. Build the site with `PUBLIC_RUM_ENDPOINT=https://<portal-host>/api/rum`.
3. Add the anonymous-measurement sentence to the privacy policy after legal review.

### Not in this core

Persistent database (the store is still the JSON rehearsal file — not for real children, see `19-operations-audit.md`), email for password reset, 2FA, avatars/uploads for profiles, and the admin-side editing of a student's learning goals. Each is a separate decision or a later phase.

## Sign-up (added later the same day)

`/register` on the portal: public sign-up for families and adult learners. See `docs/41-hostinger-deploy.md` § Sign-up for the limits. Domain code: `portal/src/domain/signup.mjs`; the site’s "Create Family Account" buttons point to it.
