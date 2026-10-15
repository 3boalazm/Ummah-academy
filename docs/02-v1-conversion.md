# 02 · Phase 1 — v1 "Native conversion"

**Goal:** convert the WordPress/Elementor site into a native codebase in the new calm-glass design, **without editorialising**. Every page, section and piece of copy from the live site is ported in its original order, including its flaws. Changing it is Phase 2's job.

## 1. What was built

| Area | Result |
|---|---|
| Stack | Astro 7 static build, hand-written CSS design system, vanilla TypeScript islands, Fontsource fonts, Phosphor icons inlined at build |
| Pages | 21 marketing/legal pages + 19 blog posts + 404 + RSS + sitemap = **40 HTML pages** |
| URLs | Identical to WordPress (trailing slashes, root-level post slugs); legacy and thin URLs 301-redirected in `vercel.json` |
| Design system | `src/styles/global.css` with layers for tokens, base, layout, glass, components, motion and utilities: aurora, glass tiers, night panels, buttons, chips, forms, accordions, tables, prose |
| Components | Header (glass pill, mega-menu, `<dialog>` mobile sheet), Footer, SectionHead, PageHero, TrackCard, CourseCard, PlanCard, TeacherCard, TestimonialCard, FeatureGrid, Steps, Faq (+FAQPage JSON-LD), CtaPanel, MiniCta, TeachingBlock, SanadChain, ClassroomMockup, PostCover, RelatedPosts, Breadcrumbs (+JSON-LD), TrialForm, Logo, Icon |
| Data | Single source of truth in `src/data/*`: site and contact, tracks and courses, pricing, people, placement question bank |
| Blog | Content collection (`src/content/blog`). 19 posts migrated verbatim with internal links made relative and a broken live link fixed. Generated CSS/SVG covers. Prev/next navigation, related posts, BlogPosting JSON-LD, RSS |
| Forms | Trial booking (5 required fields, progress meter, timezone detection, prefill from `?course=` / `?teacher=` / `?plan=`). Optional `PUBLIC_LEAD_ENDPOINT` POST, then an honest WhatsApp hand-off on `/thank-you/`. Career application hands off to email or WhatsApp (CV attached in email) |
| Placement test | A working engine: 4 tracks, a self-assessed level step and a 1-of-8 question flow with a WhatsApp "gate" (as on the live site), plus scored results, strengths and focus areas, a recommended course, booking prefill and a WhatsApp share. The question bank was authored for the rebuild and **needs academic review** |
| SEO | Unique titles and descriptions (live titles kept), canonical, OG/Twitter, JSON-LD (EducationalOrganization, Course, OfferCatalog, ItemList, FAQPage, BreadcrumbList, Blog, BlogPosting), sitemap, robots, RSS |
| Analytics hooks | `src/scripts/analytics.ts`, vendor-neutral and PII-free: `trial_cta_click`, `whatsapp_click`, `placement_*`, `trial_form_*`, `blog_filter`, `menu_open` |

## 2. Deliberate fidelity (kept in v1 even though Phase 2 will change it)

- The homepage keeps all **15 sections**, including both stats blocks (95% vs 85%), the Hall of Fame, "ICESCO Aligned / GDPR Compliant" badges and the bottom SEO block.
- **Inline Arabic sub-lines** under English headings, as on the live site.
- Track pages keep **both FAQ blocks**.
- The placement test keeps the **self-assessed level step** and the **WhatsApp gate** before results.
- Copy is verbatim, including the inconsistent response-time promises.

## 3. Unavoidable deviations from the live site

| Live | v1 | Why |
|---|---|---|
| Stock photos / AI photos of people | Art-directed glass-object renders + CSS/SVG mockups (classroom, portal) | Media cannot be migrated (WordPress uploads die on cut-over); people photos misrepresented teachers |
| Emoji icons | Phosphor duotone icons | Consistency, accessibility, rendering parity across OSes |
| Raster logo | Proposed SVG mark (eight-point star + arch) | Logo file not retrievable; swappable in one component |
| Teacher photos | Monogram portraits with an "Ijazah verified" badge | No real photos available; launch checklist item |
| Testimonial avatars | Initials | Same |
| Resource PDF links (WordPress uploads) | "Get it free" → WhatsApp request | Prevents broken links until files are moved to `/public/downloads/` |
| `/login/`, `/register/…` (WordPress LMS) | Linked through `PUBLIC_PORTAL_URL` | The portal is an app, not part of the marketing site |
| 4 thin 2025 posts | 301 redirects | Thin content |
| Blog filter chips (dead `#` links) | Working client-side filters | A conversion should not ship known-broken controls |

## 4. QA at v1

- `npm run build`: **40 pages in ~2.6s**, 0 errors.
- `npm run check:links`: **2,862 internal links, 0 broken** (after adding the touch icon).
- Visual review at 1440 px and 390 px: no horizontal overflow (a 9px watermark overflow was found and fixed). One honorific-glyph rendering issue was fixed with a `unicode-range` font face.
