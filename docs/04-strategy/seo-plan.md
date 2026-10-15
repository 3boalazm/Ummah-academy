# 04 · SEO plan

## 1. Migration safety

| Item | Implementation |
|---|---|
| URL parity | Every live WordPress URL is preserved exactly (trailing slashes, root-level article slugs) |
| Pruned thin posts | 4 legacy 2025 posts → 301 to the closest topic page (`vercel.json`) |
| WordPress archives | `/category/*`, `/tag/*`, `/author/*`, `/2024–2026/*` → 301 `/blog/`; `/feed/` → 301 `/rss.xml` |
| Broken legacy link | `/online-quran-memorization-hifz/` → 301 `/quran-memorization-hifz/` |
| Canonicals | Self-referencing absolute canonicals on every page |
| Sitemap | `@astrojs/sitemap` with **en/ar `xhtml:link` alternates**; thank-you and 404 excluded |
| Robots | `robots.txt` allows all and points to the sitemap; thank-you is `noindex` |
| hreflang | `en`, `ar`, `x-default` in the `<head>` of all 15 bilingual routes |

## 2. Keyword map (primary intent per URL)

| URL | Primary keyword | Secondary |
|---|---|---|
| `/` | online quran classes | learn quran online, quran classes with al-azhar teachers, free trial quran class |
| `/courses/` | online quran courses | tajweed course online, islamic courses online |
| `/quran-recitation-course/` | online tajweed course | quran recitation classes online, learn tajweed |
| `/quran-memorization-hifz/` | online hifz program | quran memorization online, ijazah online |
| `/online-arabic-classes/` | online arabic classes for muslims | noor al bayan online, quranic arabic course |
| `/ummah-cubs-kids-islamic-studies/` | online quran classes for kids | islamic studies for kids online, quran teacher for kids |
| `/online-islamic-studies-classes/` | online islamic studies classes | aqeedah / fiqh / tafseer / seerah classes online |
| `/teachers/` | al-azhar quran teachers online | female quran teacher online |
| `/pricing/` | online quran classes price | quran tutor cost |
| `/placement-test/` | quran level test | arabic placement test |
| `/ar/` | تعليم القرآن أونلاين | دروس تجويد أونلاين، تحفيظ القرآن للأطفال أونلاين |
| `/ar/ummah-cubs-kids-islamic-studies/` | تحفيظ القرآن للأطفال أونلاين | معلمة قرآن للأطفال |
| `/ar/quran-memorization-hifz/` | تحفيظ القرآن أونلاين بالإجازة | إجازة قرآن أونلاين |

Search volumes were not available in this environment. Validate with Search Console data after launch, and with a keyword tool before writing new content.

## 3. On-page

- **Titles** ≤ ~60 characters with the primary keyword first; **descriptions** ≤ ~155 characters with an offer ("2 free sessions") and audience.
- **One H1 per page**; section headings in logical order.
- The keywords from the live site's bolted-on "SEO paragraphs" are **woven into real copy**: hero subcopy, track ledes and FAQ answers.
- **Internal linking:**
  - track ↔ its cornerstone articles (related reading);
  - articles → track CTAs (an in-article CTA uses the post's track);
  - router and goal links from the home page;
  - breadcrumbs on all inner pages.

## 4. Structured data (JSON-LD)

| Type | Where |
|---|---|
| `EducationalOrganization` (with `contactPoint`, `knowsLanguage`) | Every page |
| `WebSite` | Home |
| `Course` + `Offer` | Each track page |
| `ItemList` of `Course` | Courses |
| `OfferCatalog` | Pricing |
| `FAQPage` | Home, track pages, contact, FAQ (once per page) |
| `BreadcrumbList` | All inner pages |
| `Blog` / `BlogPosting` | Blog index and articles |

All page-level graphs carry `inLanguage`.

> Google limits FAQ rich results to authoritative government and health sites (since 2023). The FAQ markup is still valid and helps understanding, but do not expect FAQ snippets.

## 5. Performance (ranking and conversion)

- Static HTML with about 2–7 KB of gzipped JS per page and 9.5 KB of global CSS.
- AVIF/WebP responsive images; the hero image uses `fetchpriority=high`; the main font is preloaded.
- No third-party scripts by default. Analytics are opt-in via the GTM/Plausible hooks.

## 6. Content roadmap (next 90 days)

1. **Arabic articles** for the `/ar/` audience: *كيف تختار معلم قرآن لطفلك*, *تحفيظ القرآن للأطفال في الغربة*, *ما هي الإجازة والسند؟*
2. **Comparison and decision content:** "Online vs local Quran classes", "30 vs 60-minute lessons".
3. **Local-intent landing pages** only where demand is proven, e.g. "online Quran classes UK". No doorway pages.
4. **Teacher profile pages** with real photos and credentials, once consent is obtained. These are strong E-E-A-T signals.
