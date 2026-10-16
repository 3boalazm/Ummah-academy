# 14 · Phase 5 delivery — the layer that lets the academy run the site

> **Trigger:** «كمل» after Phase 4 shipped. **Plan:** `docs/13-phase5-plan.md` (written before
> any code). **Rule:** do everything that does not need the academy's own facts, money or
> approval; the business gates stay open and are listed in §7.
>
> This file is the changelog: what exists now, how it is proven, and what changed in the
> repository. The dark-mode + installable-app work that came after the plan is its own
> document — **`docs/18-dark-mode-and-installable-app.md`** — and is only summarised here.

---

## 1 · W1 · The quality bar moved into the repository

Before Phase 5 the QA tooling lived in a scratch folder outside the repo, and a sandbox reset
deleted it. A quality bar nobody can re-run is not a quality bar.

| Now in the repo | What it does |
|---|---|
| `qa/run.mjs` + `qa/lib/{browser,server,pages}.mjs` | Starts its own static server over `dist/`, launches the machine's Chrome (or `CHROME_PATH`), runs suites with a shared page pool, writes `qa/report/latest.md` and `latest.json`, exits 1 on any failure |
| `qa/suites/canary.mjs` | **10 injected bugs** — proof that every check can fail. A refactor can no longer leave a check silently blind |
| `qa/suites/overflow.mjs` | Every page × the default widths (now including the unround 540 / 820 / 900 / 1180 px that caught a card bug): nothing leaves the viewport, no text is clipped |
| `qa/suites/header.mjs` | **Every pixel from 320 to 2560 px × five languages**: no overlap, CTA on one line |
| `qa/suites/popovers.mjs` | Mega menu, language menu/sheet, mobile `<dialog>` and the language hint **in their open state**: they fit, they close (Escape + outside click), they are axe-clean |
| `qa/suites/axe.mjs` | WCAG 2.2 AA + best practice on every page, motion frozen and reveals shown so contrast is never measured mid-fade |
| `qa/suites/flows.mjs` | Booking wizard and placement test, all tracks, five languages |
| `qa/suites/touch.mjs` | Ten emulated devices, tap targets ≥ 24 px, fields ≥ 16 px, mega menu by tap, hit-test warnings under 44 × 44 |
| `qa/suites/keyboard.mjs` | *(added after the plan)* Every page: one `h1`, no skipped heading levels, no positive `tabindex`. Then six keyboard journeys: skip link first and lands in `<main>`, a 40-step Tab walk with a visible focus ring on every stop, Escape in both menus returns focus to its button, the mobile `<dialog>` traps Tab and restores focus, and a **keyboard-only booking** from step 1 to the thank-you page |
| `qa/suites/theme.mjs`, `pwa.mjs`, `offline.mjs`, `cms.mjs` | The dark-mode, installability, offline and editor checks — see `docs/18` |
| `qa/README.md` | How to run everything, what each suite proves, and why it exists |

Static gates grew with the phase: `check:cards`, `check:cms`, `check:css`, `check:sitemap`
(hreflang truth in one place), plus `scripts/test-units.mjs` (6 groups) — all inside `npm run qa`.

`.github/workflows/qa.yml` runs on every push and pull request (docs-only changes skipped):
build + static gates first, then the browser suites as **four parallel jobs** on the runner's
Chrome, each uploading its report. Vercel runs `npm run build && npm run verify` inside the
deploy, so a broken link, an English leak, a stale price or invalid structured data **fails the
deploy** and the previous version stays live.

**New in this phase:** `scripts/qa-chrome-sandbox.sh` — where there is no Chrome and no
permission to install one (a bare container), the repository builds its own: the Chromium
binary from `@sparticuz/chromium` plus NSPR/NSS from source, then prints
`CHROME_PATH=/tmp/ua-chrome/chrome`. That is how the suites were run in the sandbox that wrote
this phase.

## 2 · W2 · A social card for every page

- A post-build step (`scripts/og/build.mjs`, wired as an Astro integration) reads the **built
  HTML** — no second registry of titles — and renders a card per indexable page: the `h1` with
  the accent phrase in Instrument Serif italic, a kicker, the short URL, the logo and the glass panel.
- Arabic cards are rendered right-to-left in IBM Plex Sans Arabic (HarfBuzz + FriBidi through
  `sharp`/libvips — no browser, no new runtime dependency). Geist ships only WOFF2, so two
  static TTFs are vendored with their OFL licence.
- `og:image`, `og:image:alt` and `twitter:image` point at `/og/<path>.jpg`.
- **Budget:** 1200 × 630 JPEG, target < 150 KB, hard QA failure at 250 KB (WhatsApp drops
  heavier previews without an error and caches the failure for about a week).
- A card failure never blocks a deploy — it falls back to the default card and `npm run
  check:cards` is what turns red.

## 3 · W3 · Editing without code

- **`/admin/`** — Sveltia CMS **pinned to `0.239.1` with an SRI hash**, GitHub backend, sign-in
  with a fine-grained token (no OAuth server), **editorial workflow**: Save creates a draft
  branch + pull request, Vercel builds a preview, Publish merges to `main`. `noindex`, excluded
  from `robots.txt` and the sitemap.
- **Seven collections:** articles in EN, AR, DE, FR, IT + the FAQ page + prices, matching the
  Astro schemas field for field (categories as selects, `translationOf` as a relation, glossary
  slug rules).
- **The FAQ moved out of TypeScript** into `src/content/faq/<lang>.json`; the build enforces that
  all five languages keep the same topics and the same number of questions.
- **Prices have one home:** `src/data/prices.json` (six monthly plans) with helpers in
  `src/data/prices.ts`. Every mention anywhere — titles, meta descriptions, FAQ answers, track
  pages, home, contact, JSON-LD, the booking wizard, the pricing page — is computed from it, in
  all five languages, including Arabic counted-noun agreement. CMS text uses tokens
  (`{{from}}`, `{{to}}`, `{{from:number}}`), so a price change is one edit in one place and
  switching currency (ABO-43) becomes one function.
- **Proof of safe refactor:** the visible text of all 195 pages was compared before and after
  the price centralisation and is identical except for the listed changes.
- `npm run check:cms` validates `config.yml` against Sveltia's JSON schema and checks that all
  79 articles match their fields.
- **Editor guide:** `docs/16-cms-guide.md`, Arabic and English.

## 4 · W4 · Search launch kit

- `PUBLIC_GOOGLE_SITE_VERIFICATION` / `PUBLIC_BING_SITE_VERIFICATION` add a meta tag to the home
  page **only when set**; DNS verification is recommended and documented.
- **IndexNow:** a key file in `public/`, and `npm run indexnow -- --dry-run | --all | /pricing/ …`
  which submits the sitemap or chosen URLs to Bing, Yandex, Naver, Seznam and Yep. It refuses to
  send until the live domain serves the key file — so it cannot fire against the old site.
- `robots.txt` reviewed; the sitemap now carries **hreflang alternates for all 189 URLs** on top
  of the pages' own `<link rel="alternate">`, and `check:sitemap` keeps the two in agreement
  (Google retired its hreflang report, so this check *is* the validator).
- **Runbook:** `docs/15-search-launch-runbook.md` — day 0 to day 28, including what to do when
  something goes wrong.

## 5 · W5 · Touch and device readiness

- The `touch` suite runs **ten device profiles**, portrait and landscape, including two tablets
  that get the desktop header on touch hardware.
- Audit outcomes: tap targets ≥ 24 px everywhere (WCAG 2.2 SC 2.5.8), primary controls under
  44 × 44 reported as warnings with their effective hit area measured by hit-testing, form fields
  ≥ 16 px so iOS does not zoom, safe-area insets for the sticky CTA, `dvh` units checked.
- `check:css` guards the Safari/iOS 16.4+ features actually relied on (prefixes, `hyphens`,
  `line-clamp`, `text-size-adjust`).
- **Protocols an emulator cannot replace:** `docs/17-device-qa-protocol.md` — a 30-minute
  real-device script (install, panels, dark mode, booking, offline, Arabic) and a screen-reader
  protocol for VoiceOver, TalkBack and NVDA, with a results table to paste into ABO-42.

## 6 · After the plan: the whole system in the dark, and installable

Summarised; the full document is **`docs/18-dark-mode-and-installable-app.md`**.

- **Light ⇄ dark for the entire design system**, not per page: tokens plus every component that
  had hard-coded a light surface, a header switch that persists and survives navigation, a
  labelled row on phones, `theme-color` synced to the OS bar, and no white flash at load.
- **Installable as an app:** manifest, real icons including maskable, an offline service worker
  that caches a visited page *and* its stylesheet, and a **simple popup pill at the bottom-left**
  (mirrored to the bottom-right in Arabic) that appears only when the browser offers an install,
  remembers "Not now", and never shows inside an installed app.
- **The heavy sweep that asked the user's question** — every screen responsive, no bugs, links
  and panels working — on the production build: 194 pages × 20 widths = 3,880 layouts,
  header at every pixel from 320 to 2560 px × 5 languages, axe light and dark, popovers measured
  open, offline verified with the network cut. Three real bugs found and fixed (header under
  860 px, Arabic header 860–1099 px, a course-card CTA at 540–1180 px), and the widths that found
  the last one are now part of the default gate.
- **Keyboard completeness** (this changelog): `qa/suites/keyboard.mjs` walks all 194 pages for
  heading structure and `tabindex` hygiene, then drives six journeys with nothing but Tab, Enter,
  Space, Escape and the arrow keys — including a full booking made without a mouse.
- **One accessibility bug fixed while writing it:** the booking wizard's step-1 errors were
  visible but not programmatic — the radio group now carries `aria-invalid="true"` and an
  `aria-describedby` pointing at the visible error, and the invalid state is cleared the moment
  an option is chosen. (The first fix used `toggleAttribute`, which writes a valueless
  `aria-invalid=""` that assistive tech reads as *false*; the suite caught it.)

## 7 · Where Phase 5 stopped (business gates, unchanged)

| Needs | Item |
|---|---|
| Academy accounts | Google Search Console + Bing verification (§4), editor GitHub tokens (`docs/16-cms-guide.md`), `PUBLIC_LEAD_ENDPOINT` webhook |
| Academy facts | Impressum data (ABO-51), teaching languages (ABO-50), native-speaker review (ABO-52), legal translations (ABO-44), currency (ABO-43) |
| Money | Play Store TWA (~$25 + signing key) and App Store listings; push notifications need something to notify about |
| A human with a phone | `docs/17-device-qa-protocol.md` — the real-device and screen-reader pass (ABO-42) |

Nothing in the site is blocked on these: they add reach, not correctness.

## 8 · Numbers

Recorded from the run that closed the phase (`qa/report/latest.md`):

| Gate | Result |
|---|---|
| Build | **195 pages** · 184 own social cards · largest 98 KB |
| Static gates | links **17,118 checked, 0 broken** · JSON-LD 379 blocks, 0 errors · sitemap 189 URLs with hreflang · i18n 189 clusters, 0 English leaks · cards, CSS, CMS, 6 unit groups: green |
| Browser suites | canary 10 · overflow 1,940 · header 5,605 · popovers 125 · axe 194 · flows 10 · touch 355 · theme 62 · pwa 90 · offline 7 · **keyboard 209** · cms 1 (+1 environment warning) — **0 failures** |
| Deep one-off sweep | 194 pages × 20 widths = 3,880 layouts, 0 overflows; header 320 → 2560 px |
| Bugs found by the phase's own gates | 3 layout (header ×2, card CTA ×1) + 1 accessibility (booking step-1 error) |

> **Environment note (honest limitation):** the sandbox that ran this has no route to
> `unpkg.com`, so the `cms` suite reports a warning instead of running against the CDN. The
> pinned bundle was fetched from the npm registry instead and its hash verified against the SRI
> in `public/admin/index.html`. In CI, where the CDN is reachable, the browser enforces the hash
> for real.
