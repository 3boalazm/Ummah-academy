# 01 · Live-site inventory — ummahacademy.net (crawled 14 Oct 2026)

**Method:** every public page was fetched. Page and post lists came from the WordPress REST API (`/wp-json/wp/v2/pages`, `/wp-json/wp/v2/posts`), and section order and copy were captured verbatim. This document is the source of truth for the Phase 1 port.

## 1. URL map (old → new)

Every public URL is preserved byte-for-byte, so no redirects are needed for live pages.

| Live URL | Purpose | New implementation |
|---|---|---|
| `/` | Home (15 sections) | `src/pages/index.astro` |
| `/courses/` | All tracks, 13 course cards, chooser table | `src/pages/courses.astro` |
| `/quran-recitation-course/` | Recitation & Tajweed landing (older layout) | `src/pages/quran-recitation-course.astro` |
| `/quran-memorization-hifz/` | Hifz & Ijazah landing | `src/pages/quran-memorization-hifz.astro` |
| `/online-arabic-classes/` | Arabic track landing | `src/pages/online-arabic-classes.astro` |
| `/ummah-cubs-kids-islamic-studies/` | Kids track landing | `src/pages/ummah-cubs-kids-islamic-studies.astro` |
| `/online-islamic-studies-classes/` | Islamic Studies landing | `src/pages/online-islamic-studies-classes.astro` |
| `/teachers/` | Faculty, vetting process | `src/pages/teachers.astro` |
| `/pricing/` | 7 plans, inclusions, payments | `src/pages/pricing.astro` |
| `/about/` | Story, vision, timeline, scholars | `src/pages/about.astro` |
| `/contact/` | Free-trial booking form + FAQ | `src/pages/contact.astro` + `TrialForm.astro` |
| `/placement-test/` | Interactive level test (JS-rendered) | `src/pages/placement-test.astro` + `scripts/placement.ts` |
| `/faq/` | 15 Q&As in 6 groups | `src/pages/faq.astro` |
| `/family-portal/` | Portal marketing page | `src/pages/family-portal.astro` |
| `/career/` | Teacher recruitment + application | `src/pages/career.astro` |
| `/resources/` | Free library (PDFs) | `src/pages/resources.astro` |
| `/blog/` | Blog index | `src/pages/blog.astro` |
| `/<post-slug>/` × 19 | Articles (Aug 2026) | `src/content/blog/*.md` → `src/pages/[slug].astro` |
| `/privacy-policy/`, `/terms-of-service/` | Legal | `src/pages/privacy-policy.astro`, `terms-of-service.astro` |
| `/thank-you/` | Post-form page | `src/pages/thank-you.astro` (noindex) |
| `/login/`, `/my-account/`, `/account/`, `/dashboard/`, `/register/student-access/` | WordPress/LMS app pages | **Not ported** (application, not marketing). Linked via `PUBLIC_PORTAL_URL`; see launch checklist. |

### Pruned (301-redirected in `vercel.json`)

These are thin 2025 Elementor stubs: one sentence or a single image each. Migrating them would add thin-content pages.

| Old URL | → Redirect |
|---|---|
| `/fiqh-the-knowledge-of-deep-understanding-in-islam/` | `/online-islamic-studies-classes/` |
| `/allah-swt-forgives-his-servants-on-this-night/` | `/blog/` |
| `/first-ayah-revealed-in-the-quran/` | `/tajweed-rules-for-beginners-…/` |
| `/learn-quran-and-islamic-studies-from-anywhere-in-the-world/` | `/how-to-learn-quran-online-a-complete-beginners-guide-2026/` |
| `/category/*`, `/2024–2026/*` (date archives), `/feed/` | `/blog/` (and `/rss.xml` for the feed) |
| `/online-quran-memorization-hifz/` (broken link inside a live post) | `/quran-memorization-hifz/` |

## 2. Business facts as published (client claims — verify before launch)

| Fact | Value on live site |
|---|---|
| Offer | 2 free live 1-on-1 trial sessions, no card |
| Tracks | Quran & Tajweed · Arabic · Ummah Cubs (kids 5–14) · Islamic Studies (adults) |
| Pricing — Track A, 60 min | Diamond $128 (12/mo, 3×/wk) · Gold $96 (8/mo, 2×/wk, "Most Popular") · Starter $64 (4–5/mo, 1×/wk) |
| Pricing — Track B, 30 min | Elite $74 (20, 5×/wk) · Consistent $59 (16, 4×/wk, "Kids Fav") · Deen $59 (16, 4×/wk) · Launch $40 (8, 2×/wk) |
| Course "from" prices | Recitation $64 · Tajweed $64 · Hifz $96 · Noor Al-Bayan $40 · Grammar $64 · Conversation $64 · Cubs $40 · Islamic Studies subjects $64 |
| Payments | Visa, Mastercard, PayPal, bank transfer, Western Union, MoneyGram |
| Platform | Zoom or Google Meet, with whiteboard |
| Teachers profiled | Omneya Ali (Head of Tajweed), Sara Ahmed (Arabic foundation), Nour Hassan (Cubs lead) |
| Contact | WhatsApp **+971 50 276 0242**, **info@ummahacademy.net** |

## 3. Inconsistencies and risks found during the crawl

| # | Finding | Where | Severity |
|---|---|---|---|
| I-1 | **Two different phone numbers and two email domains.** +971 50 276 0242 / info@ummahacademy**.net** on most pages, but **+20 115 464 4519** (tel: link points to +20 101 807 2869!) / info@ummahacademy**.com** / "Cairo, Egypt" in the blog sidebar, and `wa.me/201154644519` on the 404 page. | Blog template, 404 | P0 |
| I-2 | **"100+ Azhari scholars"** (home, about) vs **3 teachers profiled** and **"3 Ijazah-holding scholars", "25+ years combined teaching"** (teachers page). | Home, About, Teachers | P0 (credibility) |
| I-3 | **Satisfaction metrics conflict:** "95% Satisfaction rate — verified parent reviews" (stats strip) vs "85% Parent satisfaction" (impact block) vs "95% student retention". | Home | P1 |
| I-4 | **"ICESCO Aligned"** and **"GDPR Compliant"** under "Trusted & Accredited By" — accreditation-style claims with no evidence linked. | Home | P0 (legal) |
| I-5 | **Recordings promised as a given** ("Every session recorded… in your Family Portal"), while the Family Portal page labels the Recording Library, dashboard and billing **"Coming soon"**. | Home, Pricing vs Family Portal | P1 |
| I-6 | Response-time promises differ: "within 5 minutes" (contact form), "within 2 hours" (FAQ / final CTA), "typically within a day" (contact SEO copy). | Contact, FAQ, Home | P2 |
| I-7 | Stock photos of unidentified people captioned as named teachers (e.g. "Ustadha Omneya Ali teaching a student" is a Pexels image). | Teachers | P1 (trust/ethics) |
| I-8 | Testimonial and Hall-of-Fame avatars look AI-generated or stock; consent and evidence unknown. The carousel duplicates 2 of the 5 testimonials. | Home | P1 |
| I-9 | Every track page has **two separate FAQ blocks** with overlapping questions (e.g. Hifz has 7 + 8). | Track pages | P2 |
| I-10 | "SEO copy" blocks ("Welcome — Quran & Arabic Classes Online…") are bolted onto the bottom of every page, disconnected from the design. | All pages | P2 |
| I-11 | Inline bilingual duplication (English line + Arabic line on nearly every heading) plus emoji icons, creating visual noise. Arabic mixes Egyptian colloquial ("مش متأكد… خد اختبار") with MSA. | All pages | P2 |
| I-12 | Blog filter chips link to `#` (non-functional); 4 legacy posts are thin; a live post links to a 404 (`/online-quran-memorization-hifz/`). | Blog | P2 |
| I-13 | Resource "Download" buttons for the 4 e-books have no target; worksheet PDFs live under `/wp-content/uploads/` and will die on migration. | Resources | P1 |
| I-14 | Placement test gates the result behind a WhatsApp number. | Placement test | P2 (conversion/ethics) |
| I-15 | The homepage is ~14 sections and about 20,700 px tall on a 390 px phone, with three competing primary CTAs: placement test, contact form and WhatsApp. | Home | P1 |

## 4. Content assets

- **Imagery.** About 40 stock photos (Pexels) plus several AI-generated images ("ChatGPT-Image-Jul-23-2026…png"). The sandbox could not download them, and they would die with the WordPress install anyway. They are replaced with art-directed renders of abstract glass objects in `src/assets/art/`, plus CSS/SVG visuals.
- **Logo.** `wp-content/uploads/2024/07/Asset-3.png` could not be retrieved. A refreshed SVG identity is proposed in `src/components/Logo.astro`; the old logo can be swapped back in that single file.
- **Blog.** 23 posts in total: 19 substantive (Aug 2026), all migrated verbatim with internal links made relative, and 4 thin (2025), which are pruned.
