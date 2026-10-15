# 13 · Phase 5 plan — run it without us

> Written **before** any Phase 5 code, as the standing rule requires (see `00-workflow-plan.md`).
>
> **Trigger:** «كمل» ("continue") after Phase 4 shipped.
>
> **Scope rule (same as Phase 3):** do everything that does not need the academy's own facts, money or approval. The business gates stay open in Linear: ABO-37, 38, 39, 43, 44, 50, 51, 52.
>
> **Theme:** the site is complete in five languages. What is missing is the layer that lets the academy **run it without a developer in the room**:
> - edit content and prices safely;
> - share every page with a proper preview card;
> - launch in search with a runbook;
> - keep the quality bar automatically, on every change.

---

## 1. What is unblocked

| Open item | Needs the business? | Phase 5 action |
|---|---|---|
| **ABO-49** · CMS for articles, FAQ and prices; per-page social images | No. Only the editor accounts need the business, and those come later | **W2 + W3** |
| **ABO-42** · Real devices, screen readers, Lighthouse, post-cut-over checks | Real devices and DNS: yes. Everything that can be automated or scripted: no | **W1** (suite + CI), **W5** (touch and device audit, test protocols), **W4** (search runbook) |
| Launch checklist §B5 · Search Console | Verifying the domain: yes. Preparing everything else: no | **W4** |
| The QA tooling lived **outside** the repo (`/home/user/tools`) | No | **W1**. A sandbox restore between Phases 4 and 5 deleted that folder: proof that a quality bar nobody can re-run is not a quality bar |
| ABO-37/38/39/43/44/50/51/52 | Yes | Stay open. Each gets a comment where Phase 5 changes something. For example, ABO-43 (currency) becomes a one-line switch once W3 centralises prices |

---

## 2. Research (done before building)

### 2.1 Social cards: what the platforms accept

- **WhatsApp** is this business's main channel. It drops the preview image without any error when `og:image` exceeds about **300 KB**. The recommended format is a JPEG at 1200 × 630 ([TechCompare](https://www.techcompare.app/open-graph-viewer/whatsapp-link-previews), [andrewbaker.ninja](https://andrewbaker.ninja/2026/03/05/fix-thumbnail-previews-on-whatsapp-linkedin-x-guide/)).
  - It also caches a failed preview for about a week.
  - It reads the raw HTML only, without running JavaScript ([Cacheplex](https://www.cacheplex.com/blog/whatsapp-link-preview-image-not-showing)).
- → **Decision:**
  - JPEG, 1200 × 630, with a **≤ 150 KB budget** and a hard QA failure at 250 KB.
  - Tags are static in the HTML.
  - Key content sits in the centre-safe area, because square crops happen.

### 2.2 Rendering cards at build time with no new runtime

Verified in the sandbox before planning:

- `sharp` is already a dependency. It ships libvips with **Pango 1.58, HarfBuzz 14.5 and FriBidi 1.0**, so Arabic is correctly shaped and laid out right-to-left.
- It loads only real font files (TTF/OTF).
- The fontsource packages ship **WOFF**. Their tables are only zlib-compressed, so they convert to TTF in-process with Node's own `zlib`. Proven with IBM Plex Sans Arabic and Instrument Serif.
- Geist ships only WOFF2. → **Vendor two static Geist TTFs** from the official `geist` package (SIL OFL 1.1, licence file included).
- → **No browser, no satori, no new dependency.** It works on Vercel's build image because no system fonts are involved.

### 2.3 CMS: Sveltia CMS

- Sveltia CMS is the maintained successor to Netlify/Decap CMS and reads the same `config.yml` ([GitHub](https://github.com/sveltia/sveltia-cms)).
- **"Sign In with Token"** uses a fine-grained GitHub token (Contents RW, plus Pull requests RW for drafts). It needs **no OAuth server** ([docs](https://sveltiacms.app/en/docs/backends/github)).
- The **Editorial Workflow** commits each draft to its own branch and opens a pull request.
- Vercel already builds a preview for every push to this repo (the GitHub deployments API shows 18 preview deployments). So **every CMS draft gets a live preview URL for free.**
- It is pre-1.0 (beta) ([docs](https://sveltiacms.app/en/docs/start)). → **Pin the exact version and add SRI.** The public site never depends on the CMS.
- **Rejected options:**
  - Decap: needs an OAuth proxy.
  - Keystatic: needs server routes, which would break the static deploy.
  - Tina: needs a hosted backend.

### 2.4 Search launch

- Google **retired the International Targeting report** (the hreflang error report) in 2022 and still supports hreflang ([Search Engine Roundtable](https://www.seroundtable.com/google-search-console-deprecates-international-targeting-report-33983.html), [Google Search Central](https://x.com/googlesearchc/status/1562369672430997504)).
  - → Search Console will **not** tell us about hreflang mistakes. Our `check:i18n` is the hreflang validator, and the runbook must say so.
- **IndexNow** reaches Bing, Yandex, Naver, Seznam and Yep, but **not Google** ([pressonify](https://pressonify.ai/blog/indexnow-instant-indexing-press-releases-2026), [IndexerNow](https://www.indexernow.com/blog/indexnow-bing-explained)).
  - It takes a key file at the root and up to 10,000 URLs per call.
  - Bing's index also feeds Copilot and DuckDuckGo.

### 2.5 Touch and devices

- WCAG 2.2 **SC 2.5.8 Target Size (Minimum), level AA**: 24 × 24 CSS px, or enough spacing. 44 × 44 is the AAA / Apple HIG comfort size.
- iOS Safari zooms into any form field whose font size is below 16 px. The booking wizard and placement test are forms.

---

## 3. Workstreams

### W1 · A quality bar anyone can re-run (QA suite in the repo + CI)

- Rebuild the browser QA tools **inside the repo** under `qa/`:
  - one runner;
  - a built-in static server for `dist/`;
  - Chrome from `CHROME_PATH` or auto-detected;
  - `puppeteer-core` (already a devDependency) plus `axe-core`.
- **Suites:**

  | Suite | What it checks |
  |---|---|
  | `overflow` | No horizontal overflow at chosen widths |
  | `header` | Header fit, scanned densely from 320 to 1440 |
  | `popovers` | Mega menu, language menu and sheet, checked **open** |
  | `axe` | Accessibility, in closed and open states |
  | `flows` | Booking and placement flows in 5 languages |
  | `jsonld` | Every JSON-LD block parses |
  | `cards` | The W2 social cards |
  | `touch` | The W5 touch and device audit |

- **Scripts:**
  - `npm run qa` stays the fast static gate: build, links, i18n, plus the new card and price checks.
  - `npm run qa:browser` runs the browser suites.
- **GitHub Actions** (`.github/workflows/qa.yml`) runs on pushes and pull requests:
  - fast gate first, then the browser suites;
  - the report is uploaded as an artifact.
  - If the integration token can't push workflow files, it ships as `qa/ci/qa.yml` with a one-line move instruction.
- **Vercel** runs the static gates inside the deploy build. A broken link, an English leak or a stale price then fails the deploy, and the previous version stays live.

### W2 · A social card for every page

- A post-build step reads the built HTML, so there is no second registry of titles to keep in sync. For every indexable page it renders a card from that page's own facts:
  - the H1, with the accent phrase in Instrument Serif italic and the brand gradient;
  - a kicker: the article category, the breadcrumb section, or "Teacher" plus the job title;
  - the short URL;
  - the logo and the glass panel from the default cards.
- Arabic cards are **mirrored right-to-left** and set in IBM Plex Sans Arabic.
- Home pages keep the hand-made default cards.
- `og:image`, `og:image:alt` and `twitter:image` point at `/og/<path>.jpg`.
- **Failure is never fatal to a deploy:** cards fall back to the default image with a loud warning. The `cards` QA check is what fails.
- **Budget:** under 150 KB per card. The build-time cost is measured and reported.

### W3 · Editing without code: Sveltia CMS and one source of truth for prices

- `/admin/` (noindex, kept out of the sitemap): Sveltia pinned with SRI, GitHub backend, **Editorial Workflow** (draft → PR → Vercel preview → publish).
- **Collections:**
  1. **Articles × 5 languages** (EN, AR, DE, FR, IT), matching the existing Astro schemas field for field: categories as select lists, `translationOf` as a relation to the English articles, and slugs that follow the glossary rules.
  2. **FAQ × 5 languages.** The `/faq/` page groups move from TS modules to `src/content/faq/<lang>.json`. Answers allow Markdown links, and internal links are localised automatically.
  3. **Prices**: `src/data/prices.json` holds the six monthly prices.
- **Price centralisation:**
  - Every price mentioned anywhere is computed from that file: titles, meta descriptions, FAQs, track pages, home, contact, JSON-LD, the booking wizard and the pricing page, in all five languages.
  - Arabic counted-noun agreement (`دولارًا` / `دولارات` / `دولار`) is handled by a helper.
  - CMS-edited text uses tokens such as `{{from}}` and `{{to}}`.
  - Changing a price becomes **one edit in one place**, and switching currency (ABO-43) becomes one function.
- **Proof of a safe refactor:** the visible text of all 195 pages is compared before and after, and must be identical except for changes we list.
- **Safety:**
  - The Astro schemas plus the static gates fail bad edits before they go live.
  - `config.yml` is validated against Sveltia's JSON schema in QA.
  - The admin loads to its sign-in screen with zero console errors.
- **Editor guide:** written in Arabic and English.

### W4 · Search launch kit

- `PUBLIC_GOOGLE_SITE_VERIFICATION` and `PUBLIC_BING_SITE_VERIFICATION` set meta tags only when present. The guide recommends the DNS TXT method.
- **IndexNow:**
  - a key file in `public/`;
  - `npm run indexnow` submits the sitemap URLs, or only those changed since a given commit;
  - meant to run after go-live only.
- Review `robots.txt` and the sitemap: every locale is present and noindex pages are absent.
- **`docs/15-search-launch-runbook.md`**, from day 0 to day 28:
  - property set-up;
  - sitemaps;
  - URL inspection of the top pages per language;
  - the 301 checks;
  - coverage, 404s and per-language KPIs;
  - importing into Bing Webmaster Tools;
  - what to do when something goes wrong.

### W5 · Touch and device readiness

- **Emulated device matrix:**
  - iPhone SE, 15 and 15 Pro Max;
  - Pixel 7;
  - Galaxy S8 (360 px);
  - iPad mini in portrait;
  - iPad Pro in landscape, which is a touch device that gets the desktop header.
- **Audit:**
  - tap targets of at least 24 × 24, flagging primary controls under 44;
  - hover-only interactions;
  - form-field font size of at least 16 px, so iOS doesn't zoom;
  - safe-area insets for the sticky CTA;
  - `dvh` usage.
- **Modern CSS and JS feature matrix:** every feature we rely on, checked against Safari 16.4–26, Firefox ESR and Samsung Internet, with the fallback named for each.
- **Protocols:** a 30-minute **real-device test script**, plus a **screen-reader protocol** for VoiceOver, TalkBack and NVDA. The business or a tester runs them; that is what ABO-42 needs.
- Fix everything the audit finds.

### W6 · Hand-off

- **Docs:**
  - `14-phase5-changelog.md`;
  - `15-search-launch-runbook.md`;
  - `16-cms-guide.md`;
  - `17-device-qa-protocol.md`;
  - `qa/README.md`.
- **Updates to:** `05-qa-report.md` §8, `06-launch-checklist.md`, `REPORT.md` §12 (Arabic), `README.md` and the docs index.
- **Linear:**
  - ABO-49 and ABO-42 progress, with state changes;
  - new issues only for genuinely new follow-ups, such as creating editor accounts;
  - a project update.
- **Google Doc:** a Phase 5 section.
- Commit and push to the session branch.

---

## 4. Quality bar

- Everything from Phase 4 holds:
  - 0 broken links, 0 axe violations, 0 overflow;
  - header fit from 320 to 1440 × 5 languages;
  - flows in 5 languages;
  - JSON-LD parses;
  - Lighthouse holds.
- **New:**
  - every indexable page has its own card: a JPEG at 1200 × 630, under 250 KB, mirrored for Arabic;
  - the CMS config passes the schema check and the admin boots cleanly;
  - the price refactor is proven by the before/after text comparison;
  - every tap target is at least 24 × 24 (WCAG 2.2 AA);
  - CI is green.

## 5. Risks

| Risk | Mitigation |
|---|---|
| Sveltia is pre-1.0 | Pin the exact version and add SRI. The site never depends on the CMS. Fallback: edit the Markdown on GitHub |
| A CMS edit breaks the build | Astro schemas and the static gates fail it, and Vercel keeps the old deploy. Drafts arrive as pull requests with a preview and CI before anything is published |
| Card text renders differently on Vercel | Fonts come from files, never the system. A failure falls back to the default cards, and QA catches it |
| Build time grows | Measure it. Generation runs in parallel, inside sharp's thread pool |
| The integration token can't push workflow files | Ship the workflow as `qa/ci/qa.yml` and document the move |
| The price refactor silently changes copy | Compare the visible text of all 195 pages before and after |
| Arabic grammar breaks when a price changes | The counted-noun agreement helper has unit tests from 1 to 1,000 |
