# Audit · Engineering, SEO & accessibility

## 1. Performance

| Check | v1 | Note / v2 action |
|---|---|---|
| JS per page | ~5–9 KB (site + page island) | Keep islands tiny; no framework runtime |
| CSS | 1 global stylesheet + scoped; inlined when small | OK |
| Images | AVIF/WebP via Astro, responsive `srcset`, hero `fetchpriority=high` | OK |
| Fonts | Geist (preloaded) + Instrument Serif + **Arabic fonts on every English page** (because of the inline Arabic sub-lines) | Removing the sub-lines means Arabic fonts load only on `/ar/` (plus the tiny honorific face) |
| Backdrop-filter count | ~25–40 glass elements on home | Fewer cards in v2; blur reduced on mobile |

## 2. SEO

| Check | Status | v2 |
|---|---|---|
| URL parity with WordPress | ✅ identical | Keep |
| Titles / descriptions | ✅ unique; live titles kept | Tighten a few (≤ 60 / 155 chars) |
| Canonical | ✅ | — |
| JSON-LD | ✅ Organization, Course, FAQPage, Breadcrumb, Blog, BlogPosting | Add `inLanguage`; FAQ only once per page |
| Duplicate FAQs on track pages | ⚠️ two blocks | Merge into one |
| `hreflang` | n/a | Add en / ar / x-default pairs + sitemap i18n |
| Internal linking | Good (track ↔ blog ↔ pricing) | Track template links to its cornerstone articles |
| Thin legacy posts | Pruned + 301 | — |
| RSS | ✅ `/rss.xml` (+ `/feed/` → 301) | — |

## 3. Accessibility (WCAG 2.2 AA targets)

| Area | v1 | v2 |
|---|---|---|
| Landmarks, skip link, one H1 per page | ✅ | Keep |
| Keyboard: mega-menu, dialog menu, accordions | ✅ native `<dialog>`, `<details>` | Keep |
| Focus visibility | ✅ 2.5 px violet ring | Keep |
| Contrast on glass | Mostly ✅ (ink on ≥ 56% white) | Verified with axe in QA |
| Forms: labels, errors, `aria-invalid`, `aria-describedby` | ✅ | Per-step fieldsets in the wizard |
| Motion / transparency preferences | ✅ | Keep |
| Language of parts | Arabic spans marked `lang="ar"` | Full `lang="ar" dir="rtl"` documents for `/ar/` |

## 4. Maintainability

- Five track pages are hand-built with diverging structures. → One `TrackPage` view driven by data, available in both languages.
- Strings are hard-coded per page. → `src/i18n/` dictionaries and localized data; components accept `lang`.
- Content editing still requires Git. → Recommend a Git-based CMS (Keystatic or Decap) for the blog and FAQs (backlog).
