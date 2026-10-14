# Ummah Academy — native website

Live 1-on-1 Qur'an, Tajweed, Arabic and Islamic Studies with Al-Azhar scholars.
This repository is the **native-code** replacement for the WordPress/Elementor site at ummahacademy.net.

- **Stack:** [Astro](https://astro.build) (static output) · hand-written CSS design system ("Sakinah Glass") · vanilla TypeScript islands · self-hosted fonts · Phosphor icons inlined at build time.
- **Zero runtime framework**, roughly 5 KB of JS on most pages, and every URL identical to WordPress.

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
  pages/            routes (URLs mirror WordPress, e.g. /quran-memorization-hifz/)
  content/blog/     migrated articles (Markdown) → served at /<slug>/
  components/       design-system components (Header, PageHero, PlanCard, TrialForm…)
  data/             single source of truth: site/contact, tracks, pricing, people, placement test
  layouts/          BaseLayout (SEO head, JSON-LD, fonts, aurora, header/footer)
  scripts/          client islands: site.ts, trial-form.ts, placement.ts, analytics.ts
  styles/global.css design tokens + glass system
  assets/art/       art-directed renders (optimised to AVIF/WebP at build)
public/             favicon, OG image, robots.txt
docs/               research, audits, strategy, QA and the final report
scripts/            check-links.mjs
```

## Configuration (environment variables)

| Variable | Purpose |
|---|---|
| `PUBLIC_LEAD_ENDPOINT` | Optional HTTPS endpoint that receives trial requests as JSON (Google Apps Script, Zapier, Make, CRM). Without it, requests are handed off to WhatsApp. |
| `PUBLIC_PORTAL_URL` | Base URL of the student/family portal (currently WordPress). Set it before DNS cut-over, e.g. `https://portal.ummahacademy.net`. |

## Deploy

Vercel (`vercel.json`): the framework preset is Astro, the output goes to `dist/`, trailing slashes are on, and legacy WordPress URLs get 301s and security headers. See `docs/06-launch-checklist.md` before pointing the production domain here.

## Documentation

Start with [`docs/README.md`](docs/README.md).
