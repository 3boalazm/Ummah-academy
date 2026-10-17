# 16 · دليل المحرّر — Sveltia CMS · Editor guide

> **العربية تحت، English below.** The two halves say the same thing: how to edit the site
> without touching code, what happens when you press **Save**, and what to do when the
> build complains.

---

## العربية

### 1. أين أحرّر؟

1. افتح `https://ummahacademy.net/admin/`.
2. اختر **Sign In with Token** (لا يوجد حساب ولا كلمة مرور خاصة بالموقع).
3. أول مرة فقط: أنشئ **رمز GitHub دقيق الصلاحيات** (fine-grained token):
   - GitHub → *Settings* → *Developer settings* → *Personal access tokens* → *Fine-grained tokens* → **Generate new token**;
   - *Repository access*: **Only select repositories** → `3boalazm/Ummah-academy`;
   - *Permissions* → *Repository permissions*:
     **Contents: Read and write** و **Pull requests: Read and write**;
   - *Expiration*: 90 يومًا (وسجّل التاريخ في تقويمك — الرمز المنتهي يوقف النشر فقط، لا الموقع).
   - انسخ الرمز والصقه في صفحة الدخول. يبقى في متصفحك.
4. لا تشارك الرمز مع أحد. لتغييره أو إلغائه: GitHub → نفس الصفحة → *Revoke*.

### 2. ماذا يمكن تعديله؟

| القسم | ما يحتويه | الملاحظة المهمة |
|---|---|---|
| **Articles · English** | مقالات المدونة بالإنجليزية | العنوان والرابط هما ما يظهر في جوجل |
| **مقالات · العربية** | المقالات العربية | اكتب الرابط بحروف لاتينية، مثال `quran-for-kids-abroad` |
| **Artikel · Deutsch / Articles · Français / Articoli · Italiano** | نفس المقالات بالألمانية والفرنسية والإيطالية | الأدلة والاصطلاحات في `docs/11-i18n-glossary.md` |
| **FAQ page** | أسئلة `/faq/` بالخمس لغات | **كل لغة يجب أن تحتوي نفس المواضيع وبنفس عدد الأسئلة** — البناء يتحقق من ذلك ويفشل إن اختلفت |
| **Prices** | أسعار الخطط الستة بالدولار | رقم واحد يكفي: تتغير كل الصفحات والبطاقات والأسئلة المكرّرة ونموذج الحجز تلقائيًا |
| **Family stories** | الشهادات على `/reviews/` والرئيسية | نفس العدد ونفس `id` في كل لغة. موافقة الأسرة شرط قبل اسم جديد |

**صلاحيات لا يقبلها البناء:** لا تعدّل `id` في أسئلة FAQ (هو المُعرّف المستخدم في روابط
`/faq/#pricing`)، ولا المسافات في الرابط (slug)، ولا تلصق صورًا أكبر من 400 KB.

### 3. الرحلة من التعديل إلى النشر

1. **Save** → يُنشأ مسوّدة (**draft**) على فرع خاص + **Pull Request**.
2. Vercel يبني **معاينة** بك عنوانها في الـ PR، وخطوط CI تشغّل فحوصات الموقع (روابط، ترجمة، بيانات منظّمة، أسعار، بطاقات المشاركة).
3. راجع المعاينة على هاتفك ثم اضغط **Publish**.
4. الدمج في `main` ينشر الموقع الحقيقي خلال دقيقة أو دقيقتين.

> لا شيء يظهر للزوّار قبل **Publish**. وهذا مقصود: نصف تعديل غير منشور أجمل من نصف تعديل منشور.

### 4. الأسعار والرموز

- في أي نص يمكنك كتابة `{{from}}` (أرخص خطة) و`{{to}}` (أغلى خطة) و`{{from60}}` (أرخص خطة 60 دقيقة) و`{{launch}}` … `{{diamond}}` (خطة بالاسم). أضف `:number` للرقم وحده بلا كلمة «من»: `{{from:number}}`.
- الأرقام تُقرأ من **Prices** دائمًا. لا تكتب رقمًا مكتوبًا بيدك في أي مكان.
- الروابط الداخلية تُكتب بالعنوان الإنجليزي: `[الأسعار](/pricing/)`، والموقع يحوّلها إلى `/ar/pricing/` في النسخة العربية تلقائيًا.

### 5. الصور

- مسار الرفع: `public/images/blog/`، والاستخدام `/images/blog/<file>`.
- المقاس المثالي: عرض 1200 بكسل، JPEG أو WebP، أقل من 300 KB (واتساب يُسقط الصورة الأثقل).
- اكتب **وصفًا** للصورة (alt) بالعربية أو الإنجليزية: يُقرأ لقارئ الشاشة ويظهر إن تعذّر تحميل الصورة.

### 6. عندما يرفض البناء التعديل

| الرسالة | المعنى | الحل |
|---|---|---|
| `check-i18n` · English leak | جملة إنجليزية بقيت في صفحة ألمانية/فرنسية/إيطالية | ترجمها أو أبلغ المطوّر |
| `check-cards` · og:image too large | صورة المشاركة أكبر من 250 KB | استبدل الصورة بأخف منها |
| FAQ parity | عدد الأسئلة مختلف بين اللغات | أضف السؤال الناقص في اللغة الأخرى |
| duplicate slug | الرابط مستخدم من قبل | غيّر الرابط في المسوّدة |
| build failed | حقل ناقص أو تاريخ غير صالح | افتح تفاصيل الـ PR واقرأ أول سطر أحمر |

الموقع **لا يتأثّر**: آخر نسخة جيدة تبقى على الهواء حتى يُشفى الخطأ.

### 7. ما لا يفعله هذا النظام

- لا يعدّل التصميم ولا الأكواد ولا القوائم — تلك تحتاج مطوّرًا.
- لا يدير أسعارًا بعملات أخرى: الأسعار بالدولار، وتبديل العملة قرار تجاري (ABO-43).
- لا يرسل رسائل ولا يدير الحجوزات — الحجوزات تصل واتساب (أو الويبهوك إن فُعِّل `PUBLIC_LEAD_ENDPOINT`).

---

## English

### 1. Where do I edit?

1. Open `https://ummahacademy.net/admin/`.
2. Choose **Sign In with Token** — there is no site account or password.
3. First time only, create a **fine-grained GitHub token**:
   - GitHub → *Settings* → *Developer settings* → *Personal access tokens* → *Fine-grained tokens* → **Generate new token**;
   - *Repository access*: **Only select repositories** → `3boalazm/Ummah-academy`;
   - *Permissions* → *Repository permissions*: **Contents: Read and write** and **Pull requests: Read and write**;
   - *Expiration*: 90 days (put the date in your calendar — an expired token stops publishing, never the live site).
   - Copy the token into the sign-in screen. It stays in your browser.
4. Never share the token. To rotate it: GitHub → the same page → *Revoke*.

### 2. What can I edit?

| Collection | Contains | The important note |
|---|---|---|
| **Articles · English** | Blog posts in English | Title + slug are what Google and WhatsApp show |
| **مقالات · العربية** | Arabic articles | Type the slug in Latin letters, e.g. `quran-for-kids-abroad` |
| **Artikel · Deutsch / Articles · Français / Articoli · Italiano** | The same articles in DE/FR/IT | Voice and terminology: `docs/11-i18n-glossary.md` |
| **FAQ page** | The questions on `/faq/`, all five languages side by side | **Every language keeps the same topics and the same number of questions** — the build fails otherwise |
| **Prices** | The six monthly prices in US dollars | One number changes the pricing page, course cards, menus, page titles, FAQ answers and the booking form |
| **Family stories** | Quotes on `/reviews/` and Home | Same count and `id` in every language. Written consent before a new name |

The build rejects: a changed FAQ `id` (it is the anchor in `/faq/#pricing`), a changed slug,
or an image over ~400 KB.

### 3. From edit to live

1. **Save** → a **draft** on its own branch + a **pull request**.
2. Vercel builds a **preview** (the link is on the PR) and CI runs the site checks: links, translations, structured data, prices, social cards.
3. Look at the preview on your phone, then press **Publish**.
4. The merge into `main` deploys the real site in a minute or two.

Nothing is visible to visitors before **Publish** — deliberately.

### 4. Prices and tokens

- Any text can use `{{from}}` (cheapest plan), `{{to}}` (dearest), `{{from60}}` (cheapest 60-minute plan) and `{{launch}}` … `{{diamond}}` for one plan by name. Add `:number` for the figure alone: `{{from:number}}`.
- Numbers always come from **Prices**. Never type a price by hand.
- Internal links are written with the English path — `[Pricing](/pricing/)` — and are localised automatically on the Arabic, German, French and Italian pages.

### 5. Images

- Uploads land in `public/images/blog/` and are used as `/images/blog/<file>`.
- 1200 px wide, JPEG or WebP, **under 300 KB** (WhatsApp silently drops heavier previews).
- Always fill in the alt text: screen readers read it, and it is what shows if the image fails.

### 6. When the build complains

| Message | Meaning | Fix |
|---|---|---|
| `check-i18n` · English leak | An English sentence left in a DE/FR/IT page | Translate it or tell the developer |
| `check-cards` · og:image too large | The social card is over 250 KB | Replace the image with a lighter one |
| FAQ parity | Different number of questions between languages | Add the missing question |
| duplicate slug | The URL is already used | Change the slug in the draft |
| build failed | A missing field or an invalid date | Open the PR details, read the first red line |

The live site is never at risk: the last good version stays online.

### 7. What this system does not do

- It does not touch design, code or navigation — that needs a developer.
- It does not do multi-currency: prices are USD, and switching currency is a business decision (ABO-43).
- It does not send messages or manage bookings — bookings arrive on WhatsApp (or as JSON if `PUBLIC_LEAD_ENDPOINT` is set).

---

**Technical reference:** `public/admin/config.yml` (the schema), `src/content.config.ts`
(field validation), `npm run check:cms` (config + articles checked on every build),
`/admin/` is `noindex` and excluded from `robots.txt` and the sitemap.
