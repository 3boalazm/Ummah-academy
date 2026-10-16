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

The runner starts its own static server, so nothing else needs to be running.
On a machine **without** Chrome and without permission to install one (a bare container):

```bash
bash scripts/qa-chrome-sandbox.sh                # builds a browser, prints CHROME_PATH
CHROME_PATH=/tmp/ua-chrome/chrome node qa/run.mjs keyboard
```
 Chrome is auto-detected; otherwise it uses `CHROME_PATH`. It writes `qa/report/latest.md` and `latest.json`, and the exit code is 1 on any failure.

| Suite | What it proves | Why it exists |
|---|---|---|
| `canary` | Every check below **can fail**: it injects a known bug (a too-wide element, a wrapping CTA, a mega panel off-screen, a tiny tap target, a field iOS would zoom into, an image without alt) and expects each check to report it | So a refactor can never leave a check silently blind |
| `overflow` | Nothing leaves the viewport, and no text is cut off by a clipping container, at 320 / 360 / 390 / 540 / 768 / 820 / 900 / 1024 / 1180 / 1280 px (the four unround widths caught a card CTA that overflowed in DE/FR/IT) | `body { overflow-x: clip }` hides overflow instead of scrolling, so the suite measures boxes, not `scrollWidth` |
| `header` | The header fits at **every width from 320 to 1440 px** in all five languages (5,605 layouts): no overlap, CTA on one line | Five label lengths break at different widths, and sparse samples missed bugs in Phase 4 |
| `popovers` | Mega menu, language menu/sheet, mobile `<dialog>` and language hint, all **in their open state**: they fit, can be closed (Escape and outside click), and pass axe | The mega-menu bug lived since v2 because closed-state sweeps can't see it |
| `axe` | WCAG 2.2 AA plus axe best practices on every page | Motion is frozen and reveals are shown first, so contrast is never measured mid-fade |
| `flows` | Booking wizard (validation → thank-you → WhatsApp message with the bilingual language line) and the placement test (all four tracks → result → prefilled booking), in all five languages | These are the two conversion paths |
| `touch` | **Ten** emulated devices (iPhone SE portrait *and* landscape, iPhone 15, iPhone 15 Pro Max, Pixel 7, Galaxy S8, iPad mini, Galaxy Tab S8, iPad Air landscape, iPad Pro 12.9 landscape) × key pages × languages. Checks: tap targets ≥ 24 px (WCAG 2.2 SC 2.5.8), form fields ≥ 16 px so iOS doesn't zoom, no overflow, and the mega menu works **by tap** on a touch tablet. A warning tier flags primary controls whose *effective* hit area, measured by hit-testing, is under 44 × 44 | Real-device testing is still a launch gate ([docs/17](../docs/17-device-qa-protocol.md)). This catches everything an emulator can |
| `keyboard` | Every page: exactly one `h1`, no skipped heading levels, no positive `tabindex`. Then six journeys with nothing but the keyboard: the skip link is the first Tab and lands in `<main>`; a 40-step Tab walk shows a visible focus ring on every stop, never stalls and never leaves the page (cards that draw the ring on their ancestor count); Enter opens the mega menu, Tab enters it, Escape closes it and returns focus to the button; the language `<details>` behaves the same; the mobile `<dialog>` traps Tab x12 and restores focus to the menu button; and the **booking wizard is completed without a mouse**, including an empty submit that must mark the group `aria-invalid`, link the visible error and focus the first option | Keyboard and screen-reader visitors move through the page in document order — a trap, an invisible focus ring or an unannounced error is invisible to every other suite, because they all click |
| `theme` | The light ⇄ dark switch: the OS preference is honoured, the header switch flips/remembers/survives navigation, phones get the labelled row in the mobile sheet (all five languages), and **dark mode is measured**: axe colour-contrast on ten pages × five languages plus an overflow sweep at 320 / 390 / 768 / 1024 / 1440 px | A second theme is a second design system: without this, dark mode rots silently on the next component |
| `offline` | Registered worker, controlled page, and what the cache really holds (a visited page **and the stylesheet**: an offline page must be styled). Then the network is cut: a visited page opens with its own title, an unvisited URL still lands on a real page instead of the browser's error screen, `/admin/*` is never answered from the cache, and going back online restores normal behaviour | "Works offline" is a claim, not a feature, until something tests it |
| `pwa` | Installability end to end: every page links the manifest and the iOS meta tags; the manifest is fetched, parsed and audited **in the page** (name, short_name ≤ 12 chars, start_url, display, colours, 192/512/maskable icons whose real pixel size matches what they declare, working shortcuts); `sw.js` is served as JavaScript with a fetch handler and cache usage; the pill appears only when the browser offers an install, sits inside the viewport, opens its card, remembers “Not now”, and never shows inside an installed app | “Download as a mobile app” is invisible until it breaks — and it breaks through the manifest, not the pill |

## CI

`.github/workflows/qa.yml` runs on every push and pull request (docs-only changes are skipped):

1. **Build and static gates.** `npm ci`, then `npm run qa`. `dist/` is uploaded as an artifact.
2. **Browser suites**, as three parallel jobs, on the runner's preinstalled Google Chrome. Each job uploads its report.

CMS drafts arrive as pull requests (editorial workflow), so every draft is checked before anyone can publish it.

## Adding a check

- Add a function to a suite in `qa/suites/`, or a new suite exporting `default async ({ browser, base, pages, opts }) => ({ checked, unit, failures, warnings? })`, and list it in `qa/run.mjs`.
- **Add a canary for it** in `qa/suites/canary.mjs`.
