# Ummah Academy — native website

Live 1-on-1 Qur'an, Tajweed, Arabic and Islamic Studies with Al-Azhar scholars.
This repository is the **native-code** replacement for the WordPress/Elementor site at ummahacademy.net.

- **Stack:** [Astro](https://astro.build) (static output) · hand-written CSS design system ("Sakinah Glass") · vanilla TypeScript islands · self-hosted fonts · Phosphor icons inlined at build time.
- **No runtime framework:** about 2 KB of site JS per page (gzipped), and every English URL is identical to WordPress.
- **Five languages:**

  | Language | Where |
  |---|---|
  | English | at the root |
  | Arabic (RTL) | `/ar/` |
  | German | `/de/` |
  | French | `/fr/` |
  | Italian | `/it/` |

  - All 23 routes exist in every language.
  - The 19 articles are translated into DE/FR/IT under localised slugs; there are also 3 original Arabic articles.
  - A glass language menu always opens the true translation.
  - Reciprocal `hreflang` everywhere, and automated i18n QA.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/ (195 pages; production builds fail on a half-translated locale)
npm run preview    # serve the production build
npm run qa         # build + internal link/fragment checker + i18n checker
CHROME_PATH=/path/to/chrome npm run pdfs   # regenerate the free worksheets → public/downloads/
```

Node ≥ 20.19.

## Project map

```
src/
  pages/            English routes (URLs mirror WordPress, e.g. /quran-memorization-hifz/)
  pages/[locale]/   the same routes for ar · de · fr · it (+ blog/, teachers/[id], rss.xml)
  views/            page templates shared by all languages (Home, TrackPage, Pricing, Contact…)
  locales/<lang>/   ALL human-language copy: 23 modules per language (ui, home, pricing, booking…)
  locales/<lang>/data/  de · fr · it text overlays for tracks, track pages, teachers, plans, placement, legal
  i18n/index.ts     locale registry (LOCALE, LANGS), routing (lp, langTargets…), Intl formatting (price, pct, fmtDate)
  content-i18n/     course-page template (tracks.ts) and privacy + terms (legal.ts), EN + AR
  content/blog/     English articles → /<slug>/
  content/blog-ar/  Arabic articles → /ar/blog/<slug>/ (optional translationOf: <english-slug>)
  content/blog-tr/  de/ fr/ it/ translated articles → /<lang>/blog/<localised-slug>/ (translationOf required)
  components/       design-system components (Header, LangMenu, LangHint, BookingWizard, TrackCard…)
  data/             single source of truth: site/contact, tracks, pricing, people, placement test, countries
  layouts/          BaseLayout (SEO head, hreflang, JSON-LD, fonts, aurora, header/footer)
  scripts/          client islands: site.ts, booking.ts, placement.ts, attribution.ts, analytics.ts
  styles/global.css design tokens + glass system
  assets/art/       art-directed renders (optimised to AVIF/WebP at build)
public/             favicon, OG cards (og/default[-ar|-de|-fr|-it].png), robots.txt, downloads/
docs/               research, audits, strategy, QA, glossary and the final report
scripts/            check-links.mjs, check-i18n.mjs, build-pdfs.mjs + pdfs/ (worksheet templates)
```

## Configuration (environment variables)

| Variable | Purpose |
|---|---|
| `PUBLIC_LEAD_ENDPOINT` | Optional HTTPS endpoint that receives trial requests as JSON, including `lang` and first-touch UTM attribution (Google Apps Script, Zapier, Make, CRM). Without it, requests are handed off to WhatsApp, and the thank-you page says so. |
| `PUBLIC_PORTAL_URL` | Base URL of the student/family portal (currently WordPress). Set it before DNS cut-over, e.g. `https://portal.ummahacademy.net`. |
| `PUBLIC_PLAUSIBLE_DOMAIN` / `PUBLIC_PLAUSIBLE_SRC` | Optional. Turns on Plausible (cookieless, so no banner). `_SRC` swaps the script, e.g. a proxy or the file-downloads variant. |
| `PUBLIC_GTM_ID` | Optional. Google Tag Manager in Consent Mode v2: nothing loads until the visitor clicks "Allow" on the consent banner (in the page's language). Setting it also adds a footer "Privacy choices" link. |
| `I18N_LENIENT` / `I18N_STRICT` | Build-time only. Production builds are strict about missing locale modules; `I18N_LENIENT=1` lets a work-in-progress locale render English for missing modules, and `I18N_STRICT=1` makes `astro dev` strict too. |

With none of the analytics variables set, the site ships **no third-party scripts and no cookies**. Every analytics event carries `page_lang`.

## Deploy

Vercel (`vercel.json`): the framework preset is Astro, the output goes to `dist/`, trailing slashes are on, and legacy WordPress URLs get 301s and security headers.

- The site **never redirects by browser language**. The in-page language hint suggests a translation instead.
- See `docs/06-launch-checklist.md` before pointing the production domain here. §C covers the five-language gates: Impressum, teaching language and native review.

## Documentation

Start with [`docs/README.md`](docs/README.md).

## Adding or editing content

- **Page copy (any language):** `src/locales/<lang>/<module>.ts`.
  - The views in `src/views/` contain no copy.
  - English (`src/locales/en`) is the typed reference. Every other language must have the same keys, array lengths and value types, or the build fails with a list of the differences.
- **Prices, ids, links, images:** `src/data/*.ts`, the single source for all languages.
- **Data text:** tracks, teachers, testimonials, placement questions.
  - English and Arabic sit side by side in `src/data/*.ts`.
  - German, French and Italian are text-only overlays in `src/locales/<lang>/data/`.
- **Course pages:** `src/content-i18n/tracks.ts` (EN + AR) and `src/locales/<lang>/data/trackPages.ts` (DE/FR/IT).
- **Blog:**
  - **English:** add a Markdown file to `src/content/blog/`. The file name is the URL slug.
  - **Arabic:** add a Markdown file to `src/content/blog-ar/`. Set `translationOf` to the English slug when it's the counterpart of an English article.
  - **German/French/Italian:** add `src/content/blog-tr/<lang>/<localised-slug>.md` with a **required** `translationOf: <english-slug>`. The hreflang cluster, the "Also available in" row and the language menu targets follow automatically.
  - The build checks that every `translationOf` exists.
  - Slugs and terminology: `docs/11-i18n-glossary.md`.
- **Teachers:** each teacher in `src/data/people.ts` gets a profile at `/teachers/<id>/` in every language. Add the path to `TRANSLATED_ROUTES` in `src/i18n/index.ts`; the build fails if you forget. Set `ijazah: true` only when the published bio states one.
- **Legal notice / Impressum:** fill in `SITE.legalEntity` in `src/data/site.ts` with real data, and `/legal-notice/` plus a footer link appear in all five languages. Leave it `null` until then; never publish placeholders.
- **Worksheets:** edit `scripts/pdfs/sheets/*.mjs`, run `npm run pdfs`, and commit the PDFs and `src/data/downloads.json`. A sheet links directly on `/resources/` only if its PDF exists.

## Languages (i18n)

**How it works**

- **URLs:** English lives at the root. The other languages reuse the **same page slugs** under a prefix (`/de/pricing/`). Articles are the exception: they get localised slugs (`/de/blog/<slug>/`).
- **Language menu:**
  - Each page builds its targets with `langTargets()`: the true translation when it exists, otherwise the closest section in that language. So the menu can never 404.
  - It works without JavaScript (`<details>`). On phones it becomes a sheet, and the footer repeats it as a row.
- **Language hint:** when the browser prefers another language that has a translation of *this* page, a dismissible hint appears **in that language**. It never redirects. Any explicit choice (`localStorage` `ua:lang`) silences it.
- **SEO:** each page emits `hreflang` for every real translation plus `x-default` (English), and `og:locale` + `og:locale:alternate`. JSON-LD is localised, and the sitemap lists all five locales. `noindex` pages emit no hreflang.
- **Formatting:**
  - Prices stay in USD, written the local way: `$40` · `٤٠ $` · `40 $`.
  - Dates use `Intl`, and country names come from `Intl.DisplayNames`.
- **Guards:**
  - **Build time:** locale shape parity, and strict production builds.
  - **Post-build:** `npm run check:i18n` checks `lang`/`dir`, canonical, reciprocal hreflang clusters, and **English leaks** on DE/FR/IT pages (visible text, alt, aria-label, title, placeholder, meta description).

**Adding a sixth language**, e.g. Turkish `tr`:

1. **`src/i18n/index.ts`:**
   - add `'tr'` to the `Lang` type;
   - add a `LOCALE.tr` entry (native name, English name, `dir`, `Intl` tag, OG locale, `prefix: '/tr'`, pill label);
   - add `'tr'` to `LANGS` (menu order) and `PREFIXED`.
2. **Copy:**
   - copy `src/locales/de/` to `src/locales/tr/` (23 modules, `index.ts` and `data/`) and translate it;
   - register it in `src/locales/index.ts` (`import * as tr from './tr'` and the `REGISTRY` entry);
   - `astro dev` renders any module you haven't translated yet in English and warns; production builds refuse to ship it.
3. **Data overlays:** add `tr` to the `OVERLAY` / `TRANSLATED` maps in
   - `src/data/tracks.ts`
   - `src/content-i18n/tracks.ts`
   - `src/data/people.ts`
   - `src/data/pricing.ts`
   - `src/data/placement.ts`
   - `src/content-i18n/legal.ts`
4. **Blog:**
   - add `src/content/blog-tr/tr/*.md`, each with `translationOf`;
   - extend the `blogTr` glob in `src/content.config.ts` (`'{de,fr,it,tr}/*.md'`).
5. **Site plumbing:**
   - add the panel text to the `T` table and a `.nf__panel--tr` rule in `src/pages/404.astro`;
   - add `tr` to the sitemap `i18n.locales` in `astro.config.mjs`;
   - add `tr` to `PREFIXED` (and to `CHECK_LEAKS` for a Latin-script language) in `scripts/check-i18n.mjs`.
6. **Assets:**
   - add an OG card at `public/og/default-tr.png` (1200×630) and point `ogImage` in `src/locales/tr/ui.ts` at it;
   - check glyph coverage:
     - Geist loads its latin-ext, Cyrillic and Vietnamese subsets on demand (`unicode-range`).
     - The italic accent font is imported as **latin only** (`@fontsource/instrument-serif/latin-400-italic.css`), so a language with letters such as ğ ş İ needs its latin-ext file.
     - Non-Latin scripts need their own font imported in `BaseLayout.astro`.
7. **Verify:** run `npm run qa` and check the language menu on a few pages. Also run an overflow check at 320 px, because longer languages break tight layouts first.
