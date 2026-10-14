# Ummah Academy — native website

Live 1-on-1 Qur'an, Tajweed, Arabic and Islamic Studies with Al-Azhar scholars.
This repository is the **native-code** replacement for the WordPress/Elementor site at ummahacademy.net.

- **Stack:** [Astro](https://astro.build) (static output) · hand-written CSS design system ("Sakinah Glass") · vanilla TypeScript islands · self-hosted fonts · Phosphor icons inlined at build time.
- **Zero runtime framework**, roughly 2–7 KB of JS per page, and every URL identical to WordPress.
- **Bilingual**: English at the root and a full Arabic (RTL) version under `/ar/`: 23 mirrored routes, an Arabic blog whose articles pair with their English counterparts via `translationOf`, `hreflang` tags and sitemap alternates.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # serve the production build
npm run qa         # build + internal link/fragment checker
CHROME_PATH=/path/to/chrome npm run pdfs   # regenerate the free worksheets → public/downloads/
```

Node ≥ 20.19.

## Project map

```
src/
  pages/            routes (URLs mirror WordPress, e.g. /quran-memorization-hifz/); pages/ar/ = Arabic
  views/            page templates shared by both languages (Home, TrackPage, Pricing, Contact…)
  content-i18n/     bilingual copy: course template (tracks.ts), privacy + terms (legal.ts)
  content/blog/     migrated articles (Markdown) → served at /<slug>/
  content/blog-ar/  Arabic articles → /ar/blog/<slug>/ (optional translationOf: <english-slug>)
  i18n/             locale helpers (lp(), counterpart(), UI strings)
  components/       design-system components (Header, BookingWizard, TrackCard, SanadChain…)
  data/             single source of truth: site/contact, tracks, pricing, people, placement test (EN/AR)
  layouts/          BaseLayout (SEO head, JSON-LD, fonts, aurora, header/footer)
  scripts/          client islands: site.ts, booking.ts, placement.ts, attribution.ts, analytics.ts
  styles/global.css design tokens + glass system
  assets/art/       art-directed renders (optimised to AVIF/WebP at build)
public/             favicon, OG image, robots.txt, downloads/ (generated worksheets)
docs/               research, audits, strategy, QA and the final report
scripts/            check-links.mjs, build-pdfs.mjs + pdfs/ (worksheet templates)
```

## Configuration (environment variables)

| Variable | Purpose |
|---|---|
| `PUBLIC_LEAD_ENDPOINT` | Optional HTTPS endpoint that receives trial requests as JSON, including first-touch UTM attribution (Google Apps Script, Zapier, Make, CRM). Without it, requests are handed off to WhatsApp, and the thank-you page says so. |
| `PUBLIC_PORTAL_URL` | Base URL of the student/family portal (currently WordPress). Set it before DNS cut-over, e.g. `https://portal.ummahacademy.net`. |
| `PUBLIC_PLAUSIBLE_DOMAIN` / `PUBLIC_PLAUSIBLE_SRC` | Optional. Turns on Plausible (cookieless, so no banner). `_SRC` swaps the script, e.g. a proxy or the file-downloads variant. |
| `PUBLIC_GTM_ID` | Optional. Google Tag Manager in Consent Mode v2: nothing loads until the visitor clicks "Allow" on the bilingual banner. Setting it also adds a footer "Privacy choices" link. |

With none of the analytics variables set, the site ships **no third-party scripts and no cookies**.

## Deploy

Vercel (`vercel.json`): the framework preset is Astro, the output goes to `dist/`, trailing slashes are on, and legacy WordPress URLs get 301s and security headers. See `docs/06-launch-checklist.md` before pointing the production domain here.

## Documentation

Start with [`docs/README.md`](docs/README.md).

## Adding or editing content

- **Prices, tracks, teachers, testimonials, placement questions:** edit `src/data/*.ts`. Each file has an English and an Arabic version side by side.
- **Course pages:** `src/content-i18n/tracks.ts` (one object per course page per language).
- **Page copy:** the `C = ar ? {...} : {...}` block at the top of each file in `src/views/`.
- **Blog:** add a Markdown file to `src/content/blog/`. The file name is the URL slug.
- **Arabic blog:** add a Markdown file to `src/content/blog-ar/`. Set `translationOf` to the English slug when it's the Arabic counterpart of an English article. The build checks that the slug exists.
- **Teachers:** each teacher in `src/data/people.ts` gets a profile at `/teachers/<id>/` and `/ar/teachers/<id>/`. Add the id to `BILINGUAL_ROUTES` in `src/i18n/index.ts`; the build fails if you forget. `ijazah: true` only when the published bio states one.
- **Worksheets:** edit `scripts/pdfs/sheets/*.mjs`, run `npm run pdfs`, and commit the PDFs and `src/data/downloads.json`. A sheet links directly on `/resources/` only if its PDF exists.
