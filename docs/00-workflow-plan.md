# 00 · Workflow Plan — Ummah Academy native rebuild

> Written **before** any code was touched. This is the operating plan for the whole engagement: how the work is phased, how research is done, which "team hats" review what, and what "done" means.

---

## 1. The brief (as understood)

| # | Ask | Interpretation / acceptance criteria |
|---|-----|--------------------------------------|
| 1 | Convert ummahacademy.net (WordPress + Elementor) into **native code** in this repo | A real, version-controlled codebase. No WordPress runtime, no page builder. Every public page and the blog are ported. Same URLs, so SEO equity is not lost. |
| 2 | New look: **super-modern, not traditional at all, glassy (glassmorphism / "liquid glass"), calm** | A bespoke "calm glass" design system: frosted panels over a slow dawn-coloured aurora, editorial type, generous whitespace, restrained motion. Accessible: AA contrast, reduced-motion and reduced-transparency fallbacks. |
| 3 | Then take the **new** site as if seeing it for the first time and **shake it up** | A second, independent pass (v2). Audit v1 through six disciplines, then restructure panels, fix the user flow, remove filler and add what is missing. Full licence to change everything. |
| 4 | Quality bar: "no different from the best studio in the world" | Studio-grade craft: design system, performance budget, accessibility, structured data, analytics plan, documentation. |
| 5 | Deliverables | Every analysis as a Markdown file in `docs/`. A final report. A Google Doc handoff and a Linear project with done and next issues. |

---

## 2. Phases

```
Phase 0  Discovery & research ──► Phase 1  v1 "Native conversion" ──► Phase 2  v2 "Fresh-eyes overhaul" ──► Phase 3  QA, docs, handoff
   (crawl, inventory,               (faithful content port into          (multi-team audit of v1 →                (QA evidence, report,
    competitors, design              the new glass design system)         restructure, new flows, AR locale)        Google Doc, Linear)
    research, stack decision)
```

### Phase 0 — Discovery & research
1. **Repo audit.** Review what exists, what is reusable (brand palette, content) and what is obsolete (Elementor fragments).
2. **Live-site crawl.** Fetch every public page plus the WordPress REST API for pages and posts. The output is a content inventory: pages, sections, claims, prices, contacts, URLs and inconsistencies.
3. **Competitive scan.** Review comparable 1-on-1 Quran academies. Benchmark pricing, offers and table-stakes claims versus true differentiators.
4. **Design research.** Study liquid-glass and glassmorphism patterns and their known accessibility pitfalls. Decide on principles.
5. **Decisions.** Lock the stack, the URL strategy, the design direction and the imagery strategy.

### Phase 1 — v1 "Native conversion" (faithful)
- Scaffold the codebase, design tokens and glass component library.
- Port **every** page with its live content and section order. This phase converts; it does not editorialise.
- Port the blog (content collection) and keep the WordPress URLs unchanged.
- Build check, link check and screenshots, then **commit v1**.

### Phase 2 — v2 "Fresh-eyes overhaul"
- Start again with an empty notebook and walk through the v1 site as a first-time visitor on mobile and on desktop.
- Six team hats each write an audit (see §4) → consolidated, prioritised findings.
- Write the strategy docs: new information architecture (IA), user flows, content strategy, SEO keyword map and measurement plan.
- Implement: restructure the panels, simplify the navigation, fix the conversion flow, remove filler, and add the missing features.
- QA again, then **commit v2**.

### Phase 3 — QA, documentation, handoff
- Automated QA: build, internal link check, axe accessibility scan, screenshots at 3 viewports, and a performance budget check.
- Write the final report in Arabic, since the client writes in Arabic.
- Hand off: the Google Doc, the Linear project (completed work plus a launch-gate backlog), and the branch pushed.

---

## 3. Research method

| Question | Method | Evidence kept in |
|----------|--------|------------------|
| What exactly is on the live site? | Fetch every page; list pages and posts via the WP REST API (`/wp-json/wp/v2/pages`, `/posts`) | `docs/01-discovery/live-site-inventory.md` |
| What do competitors promise and charge? | Targeted web searches; read competitor pages and roundup articles; record prices | `docs/01-discovery/competitive-research.md` (with source links) |
| What does "modern glass" mean in 2026 and how is it made accessible? | Apple Liquid Glass references plus implementation and accessibility guides | `docs/01-discovery/design-research.md` |
| Does the design actually work? | Headless Chromium screenshots at 1440 / 1024 / 390 px, reviewed visually after every major change | `docs/05-qa-report.md` |
| Is it accessible? | axe-core run on every built page in headless Chromium; manual keyboard-flow review | `docs/05-qa-report.md` |
| Is it SEO-safe? | URL parity table (old → new), meta and structured-data audit, sitemap | `docs/04-strategy/seo-plan.md` |

Rules of evidence:
- Claims copied from the live site are marked as **client claims**. Contradictions between pages are logged and never silently "fixed".
- Nothing is invented: no fake teachers, statistics, reviews, accreditations or prices. When the redesign needs something that does not exist (for example a real teacher photo), it uses a neutral placeholder treatment and logs the gap on the launch checklist.

---

## 4. Team hats (who reviews what in Phase 2)

| Hat | Lens | Output |
|-----|------|--------|
| **Business / strategy** | Positioning, offer, pricing architecture, differentiation versus table stakes, trust and risk | `03-audit/business.md` |
| **Marketing & content** | Message hierarchy, copy quality, CTA strategy, proof, objections, bilingual approach | `03-audit/marketing-content.md` |
| **UX / product** | IA, navigation, user flows (discover → choose → trial), friction, mobile ergonomics | `03-audit/ux-flows.md` |
| **Design** | Visual hierarchy, panel rhythm, glass usage, typography, imagery, motion, consistency | `03-audit/design.md` |
| **Analytics / growth** | Funnel definition, events, KPIs, experiment backlog | `03-audit/analytics.md` |
| **Engineering / SEO / a11y** | Performance, semantics, structured data, URL parity, accessibility, maintainability | `03-audit/technical-seo-a11y.md` |

Each finding gets a **severity** (P0 blocker → P3 polish), an **owner hat** and a **decision** (fix now / later / reject).

---

## 5. Technology decisions (made in Phase 0)

| Decision | Choice | Why |
|----------|--------|-----|
| Framework | **Astro** (static output) | Ships HTML-first with almost no JS, which suits a content and marketing site. It offers components, content collections for the blog, built-in i18n routing, image optimisation and first-class Vercel support. It is the "native code" studios use for marketing sites today. |
| Styling | Hand-written modern CSS (custom properties, `@layer`, nesting, container queries) plus Astro scoped styles | A bespoke glass design system needs fine control. It also avoids utility-class noise and keeps dependencies near zero. |
| JS | Vanilla TypeScript islands (navigation, forms, placement test, plan finder) | No framework runtime on the client. The JS budget is about 25 KB gzipped per page. |
| Fonts | Self-hosted via Fontsource: Geist (UI), Instrument Serif (accent), IBM Plex Sans Arabic plus Amiri (Arabic) | No third-party font CDN, which is better for privacy and performance. Proper Arabic typography. |
| Icons | Phosphor icon set, inlined at build time | A consistent, soft, modern set with zero runtime. Replaces the live site's emoji icons. |
| Images | Self-hosted and optimised by Astro (AVIF/WebP). Art-directed renders of abstract glass objects instead of stock photos of strangers. | WordPress `wp-content` URLs die on migration. The stock photos currently imply that unknown people are the teachers. |
| URLs | **Identical to WordPress**, with trailing slashes | Zero redirect debt and preserved rankings. The few pruned URLs get 301s in `vercel.json`. |
| Forms | Client-side validation, then an optional webhook (`PUBLIC_LEAD_ENDPOINT`), then a WhatsApp hand-off | Matches how the academy already operates (WhatsApp-first) with no backend. It is honest about what has and has not been sent. |
| Hosting | Vercel (already configured) | No change of provider. |

---

## 6. Quality gates (definition of done)

- [ ] `npm run build` passes with zero errors.
- [ ] Zero broken internal links (custom checker over `dist/`).
- [ ] No serious or critical axe violations on any built page.
- [ ] Every page reviewed visually at desktop and mobile widths.
- [ ] Unique `<title>` and meta description, canonical, Open Graph and JSON-LD on every page.
- [ ] `prefers-reduced-motion` and `prefers-reduced-transparency` respected.
- [ ] Every analysis written to `docs/`. Final report written. Google Doc created. Linear project with done and backlog issues.

---

## 7. Risk register

| Risk | Mitigation |
|------|------------|
| Sandbox cannot download images from the live site | Self-host generated art-direction imagery and use CSS/SVG visuals. Logged as a launch item if the client wants specific photos. |
| Unverifiable or contradictory claims on the live site (e.g. "100+ scholars" vs 3 profiled teachers, 95% vs 85% satisfaction) | Ported faithfully in v1. Rationalised in v2 and listed on the launch checklist for business verification. |
| Glass hurts readability | Text always sits on high-opacity glass; solid fallbacks for reduced transparency and forced colours; axe contrast checks. |
| Arabic quality | Written in MSA by hand and flagged for native editorial review before launch. |
| Losing blog SEO | Every post is migrated with an identical slug; thin legacy posts are 301-redirected to their closest topic page. |
