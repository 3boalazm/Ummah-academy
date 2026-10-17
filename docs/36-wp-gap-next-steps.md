# 36 · خطوات الأوديت الأول والثاني — WordPress pages + plugins

التاريخ: 2026-10-17. المصدر: لوحات وردبريس (Dashboard / Pages / Plugins) مقابل هذا الريبو.
القاعدة: لا ننقل بلجن. ننقل **الوظيفة** إن كانت ما زالت ناقصة، ونؤجّل ما يحتاج قرارًا تجاريًا.

---

## العربية

### ما أُغلق في هذا القطع (كود، بلا قرار تجاري)

| # | من أي أوديت | الخطوة | أين |
|---|---|---|---|
| 1 | صفحات P0 | صفحة بيان إمكانية الوصول `/accessibility/` بخمس لغات + رابط في التذييل | `src/views/Accessibility.astro` |
| 2 | بلجنز · HTTP Headers / Wordfence | `Content-Security-Policy` + `X-Frame-Options: DENY` + `frame-ancestors 'none'` | `vercel.json` |
| 3 | صفحات P1 · Academic Progress / Placement Reviews | معاينة صادقة على `/family-portal/` (عيّنة، ليست سجل طالب حي) + ميزة «مراجعات التحديد» | `src/views/FamilyPortal.astro` |
| 4 | صفحات P1 · Resources | فلتر أوراق العمل: الكل / تجويد / عربي / حفظ / أطفال | `src/views/Resources.astro` |
| 5 | بلجنز · فجوات اللجر | `MSG-004` إيميل معاملات، `AUTH-012` تحقق بخطوتين، `CHAT-001` شات حي مؤجّل، `A11Y-001` البيان العام | `docs/21-requirements-ledger.md` |

### ما يبقى — مرتّب للتنفيذ بعد هذا القطع

**لا يُنفَّذ في الكود حتى يقرر العمل (P0).**

| ID | الخطوة | لماذا واقفة | ماذا يفعل العمل |
|---|---|---|---|
| FIN-001 | إعادة وصل الدفع (Stripe كان مفصولًا في الصورة) | `BLOCKED` | اختيار المزوّد: Stripe أو تحويل يدوي أو الاثنين |
| OPS-001 | ليدز / CRM (HubSpot كان مفصولًا) | الويبهوك فاضي | إنشاء ويب هوك (Sheet / Zapier / HubSpot) ثم `PUBLIC_LEAD_ENDPOINT` |
| MSG-004 | إيميل تأكيد وتذكير وCareer | لا SMTP في النيتيف | اختيار مزوّد (Resend / Postmark / SES) + قوالب |
| GSC / GTM | Site Kit | التوكن فاضي | ملكية Search Console + `PUBLIC_GTM_ID` أو `PUBLIC_PLAUSIBLE_DOMAIN` |
| Impressum | بيانات قانوني | `SITE.legalEntity = null` | اسم الشركة، العنوان، الممثل، السجل، VAT |
| Portal 301 | `/login/` و`/my-account/` | القطع لم يتم؛ الرابط ما زال وردبريس عمدًا | نطاق فرعي للبوابة ثم 301 في `vercel.json` |

**يُنفَّذ بعد القرارات، أو في قطع لاحق (P1).**

| ID | الخطوة | ملاحظة |
|---|---|---|
| AUTH-008 | فحص CSP على النشر الفعلي | الهيدر وُضع؛ يلزم `curl -I` بعد الدومين |
| AUTH-012 | 2FA لأدمن/تشغيل البوابة | تصميم المنتج أولًا |
| AUTH-006 | WAF عند الحافة | Vercel WAF أو Cloudflare، ليس Wordfence داخل التطبيق |
| FILE-003 | فحص الملفات المرفوعة | سياسة مالوير قبل بيانات أطفال |
| DATA-005 | نسخة احتياطية إنتاج للبوابة | التدريب المحلي موجود؛ نظام خارجي لا |
| Pagefind | بحث داخل الموقع التسويقي | البوابة لديها `/api/search`؛ الموقع العام لا |
| صور المعلمين | ثقة | موافقة + صور حقيقية بدل المونوجرام |
| CHAT-001 | شات حي | **مؤجّل.** واتساب هو القناة. لا Intercom/HubSpot Chat |

### ما لن يُنقل أبدًا

Elementor وكل الإضافات، Angie، TranslatePress، LiteSpeed، File Manager، Classic Editor، Starter Templates، Templately، HTML Import 2.

---

## English

This cut ships the code that both audits could close without a business token: a public accessibility statement, CSP/frame headers, resource filters, a labelled Family Portal progress/placement preview, and the ledger rows the plugin screen was missing.

Do not add `/login/` 301s until `PUBLIC_PORTAL_URL` points at the new portal. Do not reconnect Stripe, HubSpot, SMTP or GTM in code — those are env/provider decisions.
