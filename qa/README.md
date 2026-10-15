# QA — the quality bar, re-runnable by anyone

Two layers. Both run on the **built** site (`dist/`), so they test what visitors get.

| Layer | Command | Needs | Time |
|---|---|---|---|
| **Static gates** | `npm run qa` | Node only | ~10 s (first build with new social cards: +15 s) |
| **Browser suites** | `npm run qa:browser` | Chrome or Chromium | ~6 min for all suites |

`npm run qa` is the build plus every static check. Vercel runs `npm run build && npm run verify` on every deploy, so a broken link, an English leak or invalid structured data **fails the deploy** and the previous version stays live. The social-card check is not part of the deploy gate: a missing card falls back to the default card and must never block a content fix. CI catches it instead.

## Static gates (`scripts/`)

| Script | Fails when |
|---|---|
| `check:links` | An internal link or `#fragment` points nowhere (≈ 17,000 links) |
| `check:i18n` | An hreflang cluster isn't reciprocal, or English UI text leaks onto a DE/FR/IT page |
| `check:jsonld` | A JSON-LD block doesn't parse, or misses what its rich-result type needs (for example, BlogPosting without `image`) |
| `check:cards` | A page's `og:image` is missing, isn't 1200 × 630, is over 250 KB, or an indexable page fell back to a default card |

## Browser suites (`qa/`)

```bash
npm run build
npm run qa:browser                      # everything, all five languages
node qa/run.mjs axe flows               # selected suites
node qa/run.mjs overflow --lang=de,fr --widths=320,1024 --only=/pricing/
node qa/run.mjs header --step=4         # coarser header scan (default: every 1 px)
CHROME_PATH=/path/to/chrome node qa/run.mjs touch
```

The runner starts its own static server, so nothing else needs to be running. Chrome is auto-detected; otherwise it uses `CHROME_PATH`. It writes `qa/report/latest.md` and `latest.json`, and the exit code is 1 on any failure.

| Suite | What it proves | Why it exists |
|---|---|---|
| `canary` | Every check below **can fail**: it injects a known bug (a too-wide element, a wrapping CTA, a mega panel off-screen, a tiny tap target, a field iOS would zoom into, an image without alt) and expects each check to report it | So a refactor can never leave a check silently blind |
| `overflow` | Nothing leaves the viewport, and no text is cut off by a clipping container, at 320 / 360 / 390 / 768 / 1024 / 1280 px | `body { overflow-x: clip }` hides overflow instead of scrolling, so the suite measures boxes, not `scrollWidth` |
| `header` | The header fits at **every width from 320 to 1440 px** in all five languages (5,605 layouts): no overlap, CTA on one line | Five label lengths break at different widths, and sparse samples missed bugs in Phase 4 |
| `popovers` | Mega menu, language menu/sheet, mobile `<dialog>` and language hint, all **in their open state**: they fit, can be closed (Escape and outside click), and pass axe | The mega-menu bug lived since v2 because closed-state sweeps can't see it |
| `axe` | WCAG 2.2 AA plus axe best practices on every page | Motion is frozen and reveals are shown first, so contrast is never measured mid-fade |
| `flows` | Booking wizard (validation → thank-you → WhatsApp message with the bilingual language line) and the placement test (all four tracks → result → prefilled booking), in all five languages | These are the two conversion paths |
| `touch` | Seven emulated devices (iPhone SE to iPad Pro landscape) × key pages × languages. Checks: tap targets ≥ 24 px (WCAG 2.2 SC 2.5.8), form fields ≥ 16 px so iOS doesn't zoom, no overflow, and the mega menu works **by tap** on a touch tablet. A warning tier flags primary controls whose *effective* hit area, measured by hit-testing, is under 44 × 44 | Real-device testing is still a launch gate ([docs/17](../docs/17-device-qa-protocol.md)). This catches everything an emulator can |

## CI

`.github/workflows/qa.yml` runs on every push and pull request (docs-only changes are skipped):

1. **Build and static gates.** `npm ci`, then `npm run qa`. `dist/` is uploaded as an artifact.
2. **Browser suites**, as three parallel jobs, on the runner's preinstalled Google Chrome. Each job uploads its report.

CMS drafts arrive as pull requests (editorial workflow), so every draft is checked before anyone can publish it.

## Adding a check

- Add a function to a suite in `qa/suites/`, or a new suite exporting `default async ({ browser, base, pages, opts }) => ({ checked, unit, failures, warnings? })`, and list it in `qa/run.mjs`.
- **Add a canary for it** in `qa/suites/canary.mjs`.
