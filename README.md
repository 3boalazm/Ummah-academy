# Ummah Academy — native website

Live 1-on-1 Qur'an, Tajweed, Arabic and Islamic Studies with Al-Azhar scholars.
This repository is the **native-code** replacement for the WordPress/Elementor site at ummahacademy.net.

- **Stack:** [Astro](https://astro.build) (static output) · hand-written CSS design system ("Sakinah Glass") · vanilla TypeScript islands · self-hosted fonts · Phosphor icons inlined at build time.
- **Zero runtime framework**, roughly 2–7 KB of JS per page, and every URL identical to WordPress.
- **Bilingual**: English at the root and a full Arabic (RTL) version of the 15 core routes under `/ar/`, with `hreflang` tags and sitemap alternates.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # serve the production build
npm run qa         # build + internal link/fragment checker
```

Node ≥ 20.19.

## Project map

```
src/
  pages/            routes (URLs mirror WordPress, e.g. /quran-memorization-hifz/); pages/ar/ = Arabic
  views/            page templates shared by both languages (Home, TrackPage, Pricing, Contact…)
  content-i18n/     bilingual copy for the course template (tracks.ts)
  content/blog/     migrated articles (Markdown) → served at /<slug>/
  i18n/             locale helpers (lp(), counterpart(), UI strings)
  components/       design-system components (Header, BookingWizard, TrackCard, SanadChain…)
  data/             single source of truth: site/contact, tracks, pricing, people, placement test (EN/AR)
  layouts/          BaseLayout (SEO head, JSON-LD, fonts, aurora, header/footer)
  scripts/          client islands: site.ts, booking.ts, placement.ts, attribution.ts, analytics.ts
  styles/global.css design tokens + glass system
  assets/art/       art-directed renders (optimised to AVIF/WebP at build)
public/             favicon, OG image, robots.txt
docs/               research, audits, strategy, QA and the final report
scripts/            check-links.mjs
```

## Configuration (environment variables)

| Variable | Purpose |
|---|---|
| `PUBLIC_LEAD_ENDPOINT` | Optional HTTPS endpoint that receives trial requests as JSON, including first-touch UTM attribution (Google Apps Script, Zapier, Make, CRM). Without it, requests are handed off to WhatsApp, and the thank-you page says so. |
| `PUBLIC_PORTAL_URL` | Base URL of the student/family portal (currently WordPress). Set it before DNS cut-over, e.g. `https://portal.ummahacademy.net`. |

## Deploy

Vercel (`vercel.json`): the framework preset is Astro, the output goes to `dist/`, trailing slashes are on, and legacy WordPress URLs get 301s and security headers. See `docs/06-launch-checklist.md` before pointing the production domain here.

## Documentation

Start with [`docs/README.md`](docs/README.md).

## Adding or editing content

- **Prices, tracks, teachers, testimonials, placement questions:** edit `src/data/*.ts`. Each file has an English and an Arabic version side by side.
- **Course pages:** `src/content-i18n/tracks.ts` (one object per course page per language).
- **Page copy:** the `C = ar ? {...} : {...}` block at the top of each file in `src/views/`.
- **Blog:** add a Markdown file to `src/content/blog/`. The file name is the URL slug.
