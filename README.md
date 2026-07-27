# Ummah Academy — Website Rebuild

A ground-up rebuild of ummahacademy.net as modular Elementor HTML widgets — replacing a template-bound WordPress/Elementor site (Lorem ipsum text, a fake phone number, broken images, emoji icons, CDN font dependencies) with one consistent design system across every page.

## A note on provenance

Most of this project was built turn-by-turn in this conversation. **Five files were not** — `footer.html`, `career.html`, `contact.html`, `courses.html`, and `family-portal.html`, plus an expansion to `script.js` (a new `initCoursesTabs()` function), appeared in the shared working directory over a ~15-minute window while this session was independently building the 10 files in `courses/`. Everything checked out structurally (balanced tags, resolved CSS variables, valid JS, the same `ua-` conventions and design tokens as the rest of the project) and is included here as-is, but it wasn't written or reviewed by this session — if there's a parallel session/tab working on this same project, worth confirming with it directly before treating these five as final.

## Folder structure

```
shared/       Used on every single page — enqueue/paste these once, site-wide
homepage/     Ordered sections for the Home page specifically
pages/        Complete, standalone pages
courses/      One detail page per individual course, linked from pages/courses.html
```

## Deploying in Elementor

1. **Enqueue `shared/styles.css` and `shared/script.js`** once, site-wide (e.g. via your theme's `functions.php` or a snippets plugin — not per-page).
2. **Paste `shared/header.html`** into Elementor's Theme Builder as the global Header template, and **`shared/footer.html`** as the global Footer template — both render on every page, neither is a body-section widget.
3. **Homepage:** create the page, paste each file in `homepage/` as its own HTML widget, in filename order. **There are real gaps in this sequence** — see the table below. Don't paste 01–04 back-to-back assuming that's the finished homepage.
4. **Every other page** (About, Blog, FAQ, Teachers, Courses listing, Contact, Career, Family Portal): create the page, paste the matching file from `pages/` as one HTML widget.
5. **Each individual course** (e.g. `/courses/quran-recitation/`): create the page, paste the matching file from `courses/` as one HTML widget. `pages/courses.html` is the listing page these link out from.

Every file is a self-contained fragment (no `<html>`/`<head>`/`<style>` wrapper) — that's intentional, so each pastes cleanly into its own Elementor HTML widget.

## What's built vs. what's still open

**Global chrome:** Header ✅ and Footer ✅ (both `shared/`) — the site finally has a real footer.

**Homepage** — original spec called for 15 ordered sections. Actually built, in true final order:

| # | Section | Status |
|---|---|---|
| 1 | Hero | ✅ Built — `homepage/01-hero.html` |
| 2 | Trust Bar (merged with "Statistics") | ✅ Built — `homepage/02-trust-bar.html` |
| 3 | How It Works | ❌ Not built |
| 4 | Learning Paths | ❌ Not built |
| 5 | Why Ummah Academy | ✅ Built — `homepage/03-why-ummah-academy.html` |
| — | Comparison (added mid-project, not in the original 15) | ✅ Built — `homepage/04-comparison.html` |
| 6 | Featured Courses | ❌ Not built |
| 7 | Teachers (homepage teaser) | ❌ Not built |
| 8 | Methodology | ❌ Not built |
| 9 | Technology | ❌ Not built |
| 10 | Community | ❌ Not built |
| 11 | Testimonials | ❌ Not built |
| 12 | Pricing (homepage teaser) | ❌ Not built |
| 13 | FAQ (homepage teaser) | ❌ Not built |
| 14 | Final CTA | ❌ Not built |
| 15 | Footer | ✅ Built (site-wide, `shared/footer.html`) |

**Standalone pages — built:** About, Blog, FAQ, Teachers (v2), **Courses listing, Contact, Career, Family Portal** (these last four: see "A note on provenance" above).
**Standalone pages — still not built:** Pricing, Login/Register, Resources.
**Individual course detail pages — built (10/10):** Qur'an Recitation, Tajweed, Hifz, Aqeedah, Islamic Studies for Kids, Fiqh, Tafseer, Noor Al-Bayan, Arabic Grammar, Arabic Conversation — all in `courses/`. Content is a first pass, translated and expanded from a provided course list; more detail was flagged as coming later.

**Received but not yet reconciled into this system at all:** a Login/Register (Auth) page, a Pricing page (its real numbers — $128/$96/$64 for Track A, $74/$59/$59/$40 for Track B — are already reflected in the course pages' sidebar/meta where relevant), and a Resources (free library) page. All three were uploaded as raw source but not yet rebuilt — next in the queue.

## Design system quick reference

- **Colors:** deep aubergine primary (`#2E1D46`), dark slate-teal ink (`#24393C`), warm neutral background (`#FAFAFA`), plus a Secondary set (blue/indigo/magenta/rose) and Accent tints — all as CSS custom properties at the top of `styles.css` (`--ua-accent`, `--ua-ink`, `--ua-bg`, etc.).
- **Type:** no webfonts/CDN — a serif system stack for headings, the native OS sans stack for body text.
- **Naming:** every class is `ua-` prefixed; base resets are scoped under `.ua-homepage` so they can't leak into the surrounding WordPress theme — add that class to whichever Elementor Container wraps your page content.
- **Icons:** inline SVG throughout, no emoji, no icon font.

## Known open items (flagged along the way, not yet resolved)

- **Real teacher photos** — Omneya Ali, Sara Ahmed, and Nour Hassan still show initials-on-gradient placeholders everywhere. No real photos of them exist in the site's Media Library as of the last check.
- **Hero stat figures** (50+ countries, 100+ scholars, 1,000+ students, 95% rating) — flagged in-file as illustrative until confirmed against real analytics.
- **Blog category filter links** point to `#` — need real WordPress category archive URLs.
- **Teachers-page and Course-Explorer filter buttons** are presentational — need the same lightweight JS pattern Trust Bar's counters already use.
- **The Auth, Pricing, and Resources pages** (see above) are queued for the same reconciliation process every other page here already went through.
- A separate, live WordPress site (same domain) was going through its own concurrent maintenance pass during parts of this project (broken image cleanup, security headers, object cache) — independent of these files, not repeated here.

## File-by-file

| File | What it is |
|---|---|
| `shared/styles.css` | Every design token, reset, and component style for the whole site |
| `shared/script.js` | Namespaced (`UmmahAcademy`) vanilla JS — scroll effects, reveal animations, counters, nav/mobile menu, course tabs |
| `shared/header.html` | Floating pill nav, desktop + mobile |
| `shared/footer.html` | Site-wide footer |
| `homepage/01-hero.html` | Cinematic full-bleed photo hero |
| `homepage/02-trust-bar.html` | Animated stat counters |
| `homepage/03-why-ummah-academy.html` | Four differentiator cards |
| `homepage/04-comparison.html` | Ummah Academy vs. generic platforms table |
| `pages/about.html` | Mission, timeline, teacher preview, methodology, CTA |
| `pages/blog.html` | Post listing with search + category filters |
| `pages/faq.html` | Categorized FAQ with sticky in-page nav |
| `pages/teachers.html` | Full faculty directory (v2) |
| `pages/courses.html` | Course catalog / listing page |
| `pages/contact.html` | Contact / booking page |
| `pages/career.html` | Teacher recruitment page |
| `pages/family-portal.html` | Family Portal marketing page |
| `courses/*.html` | 10 individual course detail pages |
