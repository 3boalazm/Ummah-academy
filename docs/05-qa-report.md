# 05 · QA report (v2 + Phase 3 + Phase 4)

**Environment:** Astro 7.3.8 static build, served by `astro preview`. Headless Chromium 153 (via `@sparticuz/chromium` and Puppeteer) in the sandbox. Date: 14 Oct 2026.

## 1. Results

| Gate | Result |
|---|---|
| Build | ✅ **55 pages** in ~2 s, 0 errors, 0 warnings |
| Internal links and fragments (`npm run check:links`) | ✅ **4,012 links, 0 broken** |
| Accessibility: axe-core 4 (wcag2a/aa, wcag21a/aa, wcag22aa, best-practice) on **54 pages** (EN + AR) | ✅ **0 violations**. One issue found mid-pass and fixed: `role="tabpanel"` on a `<ul>` broke list semantics on the home pricing teaser |
| Horizontal overflow at 390 px and 1440 px, every page | ✅ None. Three found and fixed: About hero card offset, a non-wrapping link button on Courses, the 9 px hero watermark in v1 |
| Header fit at 360 / 390 / 430 px (EN and AR) | ✅ No clipping. Found and fixed: the "Sign in" link ignored the mobile-hide utility |
| Console errors across all pages | ✅ None |
| Glyph coverage | ✅ `→`, `≈` and `✓` are missing from the Geist subset, so they were replaced with icons, `~` or plain words. ﷺ is routed through an Amiri `unicode-range` face |

## 2. Functional flows (automated, mobile viewport 390×844)

| Flow | Steps verified | Result |
|---|---|---|
| Booking wizard (EN) | Prefill from `?course=Tajweed Rules&plan=Gold`; errors hidden before interaction; step 1 blocks without a learner; steps 1→2→3 with live "Step n of 3"; step 3 flags 3 invalid fields when empty; valid submit goes to `/thank-you/`; personalised title; WhatsApp deep link carries the full summary (course, plan, schedule, teacher preference, timezone) | ✅ |
| Placement test (AR) | Deep link `/ar/placement-test/?track=kids` opens the quiz; 8 answers with auto-advance; instant result (level + recommended tier); booking link prefilled with `course`, `level` and `learner=My child` | ✅ |
| Sticky mobile CTA | Hidden at the top; visible after scrolling past the hero | ✅ |
| Language switch | Path-aware (e.g. `/pricing/` ↔ `/ar/pricing/`); English-only pages fall back to `/ar/` | ✅ (manual) |

## 3. Performance budget (from `dist/`, gzipped)

| Asset | Size |
|---|---|
| Global CSS | 9.5 KB |
| Page CSS (largest: home) | 4.2 KB |
| Site JS (header, menu, reveals, sticky, attribution, analytics) | ~1.9 KB |
| Booking wizard JS | 2.7 KB |
| Placement engine JS | 4.2 KB |
| Home HTML (EN / AR) | 18.8 / 20.0 KB |
| Hero image | AVIF/WebP responsive, 4–20 KB per width |

No third-party scripts or fonts are loaded from external CDNs, and there are no tracking cookies.

## 4. Visual review

Stitched viewport captures (fixed backgrounds rendered correctly) were reviewed at 1440 px and 390 px for:

- Home (EN and AR), contact, pricing, track pages (Hifz EN, Ummah Cubs AR) and teachers.
- The v1 versions of every page before the overhaul.

Desktop home height went from **13,473 px (v1) to ~7,900 px (v2)**; mobile from ~20,700 px to ~11,000 px.

## 5. Known limitations (not tested here)

- **Cross-browser / real devices:** only Chromium was automated. Safari (iOS 18+/26), Firefox and Samsung Internet need manual passes, including `backdrop-filter` rendering, `<dialog>`, and `::details-content` (progressive enhancement; it falls back to an instant toggle).
- **Screen readers:** semantics were validated by axe. A manual VoiceOver/NVDA pass is still recommended, especially for the wizard and the placement test.
- **Lighthouse:** run in Phase 3 (see §6). Production on Vercel (Brotli, CDN) should score at or above the local numbers, which were measured without compression.
- **Lead delivery:** without `PUBLIC_LEAD_ENDPOINT`, requests reach the academy only when the visitor presses "Send on WhatsApp". The thank-you page says so explicitly.

## 6. Phase 3 re-run (15 Oct 2026)

Same environment, plus Lighthouse 12.8 (mobile preset: simulated Slow 4G, 4× CPU) against `astro preview`. The preview server doesn't compress responses, so these are conservative numbers.

| Gate | Result |
|---|---|
| Build | ✅ **69 pages** (+14: Arabic blog index and 3 articles, Arabic Resources, Family Portal, Privacy, Terms, 6 teacher profiles), 0 errors |
| Internal links and fragments | ✅ **5,078 links, 0 broken** |
| axe-core (same rule set) | ✅ **0 violations** on all 68 `index.html` pages, plus `/does-not-exist/` and `/ar/does-not-exist/` (the bilingual 404) |
| Horizontal overflow at 390 / 1440 px | ✅ None on any page |
| Header fit 360 / 390 / 430 px | ✅ No clipping (EN and AR) |
| Booking wizard and placement flows | ✅ Unchanged results (see §2) |
| Structured data | ✅ Every JSON-LD block parses. Types: `EducationalOrganization` (every page), `ProfilePage` ×6, `BlogPosting` ×22, `Blog` ×2, `BreadcrumbList` ×48, `FAQPage` ×18, `Course` ×10 |
| hreflang | ✅ The 3 EN↔AR article pairs emit reciprocal `hreflang` + `x-default`; unpaired articles emit none; the sitemap pairs only true path twins |
| Consent flow (test build with `PUBLIC_GTM_ID` + `PUBLIC_PLAUSIBLE_DOMAIN`) | ✅ GTM requested **only** after "Allow". The choice persists; it can be reopened from the footer; "No thanks" keeps GTM unloaded across reloads |
| PDFs | ✅ 6 files, 18 pages, the expected page count each (no overflow pages). Every page was reviewed visually at 110 dpi |

**Lighthouse, mobile**

| Page | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|---|
| `/` | 91 | 100 | 100 | 100 | 2.6 s | 2.9 s | 0 ms | 0 | 315 KB |
| `/ar/` | 88 | 100 | 100 | 100 | 2.8 s | 3.2 s | 0 ms | 0.001 | 366 KB |
| `/pricing/` | 99 | 100 | 100 | 100 | 1.6 s | 1.7 s | 0 ms | 0 | 121 KB |
| `/contact/` | 99 | 100 | 100 | 100 | 1.6 s | 1.7 s | 0 ms | 0 | 123 KB |
| `/quran-memorization-hifz/` | 96 | 100 | 100 | 100 | 2.1 s | 2.4 s | 0 ms | 0 | 237 KB |
| `/blog/` | 97 | 100 | 100 | 100 | 2.1 s | 2.3 s | 0 ms | 0.002 | 225 KB |
| `/ar/blog/what-is-ijazah-and-sanad/` | 93 | 100 | 100 | 100 | 2.4 s | 2.7 s | 0 ms | 0.001 | 291 KB |
| `/teachers/omneya-ali/` | 95 | 100 | 100 | 100 | 2.3 s | 2.4 s | 0 ms | 0 | 227 KB |
| `/ar/resources/` | 98 | 100 | 100 | 100 | 1.7 s | 2.1 s | 0 ms | 0.001 | 185 KB |
| `/ar/family-portal/` | 97 | 100 | 100 | 100 | 2.0 s | 2.1 s | 0 ms | 0.001 | 227 KB |

The home pages' LCP element is the hero image, revealed by the scroll-reveal script.

- **Tried:** a CSS-only reveal for above-the-fold heroes.
- **Result:** no measurable LCP gain, and CLS on `/` rose from 0 to 0.29. Making the hero visible earlier exposed web-font swaps (the Amiri honorific face, Instrument Serif and Plex Arabic) as layout shift.
- **Decision:** reverted.

The remaining home-page cost is render-blocking CSS plus the uncompressed local server.

**Fixed during the pass**

- The blog lead card's cover hid the text on desktop. This was pre-existing in v2.
- Arrow direction was wrong in Arabic related-article and blog cards.
- The "Ijazah verified" badge appeared on teachers whose bios don't state an Ijazah.

## 7. Phase 4 re-run: five languages (15 Oct 2026)

Same environment (Chromium 153 headless via Puppeteer, `astro preview`, no compression) plus Lighthouse 12.8.2. Every check covers all five languages unless stated otherwise.

| Gate | Result |
|---|---|
| Build | ✅ **195 pages** in ~2 s: EN 42 · AR 26 · DE 42 · FR 42 · IT 42 · `404.html`. Production builds are strict: a locale missing a module fails the build |
| Locale shape parity (build time) | ✅ AR/DE/FR/IT × 23 modules match the English reference: keys, array lengths, value types. Documented exception: the Arabic blog index's extra sections |
| Internal links and fragments | ✅ **16,907 links, 0 broken** |
| i18n (`npm run check:i18n`) | ✅ `<html lang>`/`dir` and the self-canonical are correct on 195 pages. **189 hreflang clusters** are reciprocal, each with `x-default`. **0 English leaks** on DE/FR/IT pages (visible text, alt, aria-label, title, placeholder, meta description) |
| axe-core (wcag2a/aa, wcag21a/aa) | ✅ **0 violations on 194 pages**. Open states were also checked: the language menu (header popover and phone sheet); the language hint (DE→EN, AR→FR at 390 px, IT→DE, EN→AR); the Courses mega menu (5 languages × 1024/1440 px) |
| Horizontal overflow | ✅ **0 on 194 pages at 320, 360, 768, 1024 and 1280 px**. Found and fixed: the About stats in DE/FR/IT at 320 px (localised `1.000+`, 6–12 px) |
| Header fit | ✅ **Every width from 320 to 1440 px in 1 px steps × 5 languages** (5,605 layouts): no control leaves the bar, no CTA or nav item wraps, and the wordmark is never clipped. Found and fixed: the CTA wrapped in FR/IT at 390 and 460 px and in AR at 340 px |
| Courses mega menu (open) | ✅ The panel fits the viewport at 860/960/1024/1099/1100/1280/1440 px × 5 languages, every child stays inside the panel, and no subtitle is truncated. Found and fixed: **since v2** the open panel ran off-screen from 860 to about 1200 px (25 of 35 checks), off the left edge in Arabic, and its aside overflowed the panel by ~10 px |
| Language hint | ✅ It shows only when the browser prefers another language that has a translation of this page. The text and CTA are in that language (`lang`/`dir` set, RTL for Arabic), on one line on desktop (5 combinations × 1280/768/390 px). Never shown after an explicit choice |
| Booking wizard and placement flows | ✅ Pass in all 5 languages: localised step labels and validation, a WhatsApp message in the visitor's language with a `Language:` line, the thank-you page, and placement results with prefilled booking links |
| Structured data | ✅ **379 JSON-LD blocks on 195 pages parse**, and `inLanguage` always matches `<html lang>`. Content is localised (e.g. DE breadcrumb "Startseite › Lehrkräfte", FR/IT `FAQPage` questions). Types: `EducationalOrganization` ×285, `FAQPage` ×45, `BreadcrumbList` ×144, `BlogPosting` ×130, `Course` ×90, `ProfilePage` ×15, `Blog` ×5, `WebSite` ×5 |
| Impressum gate | ✅ With `SITE.legalEntity = null` there is no page and no footer link. With temporary data, 5 pages, the footer link and a valid hreflang cluster appear (the data was reverted afterwards) |
| Consent | ✅ "No thanks" and "Allow" have equal weight in every language. The GTM-after-Allow behaviour is unchanged from §6 |

**Lighthouse, mobile (Phase 4 sample)**

| Page | Perf | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| `/` (EN, control) | 91 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 |
| `/ar/` (control) | 87 | 100 | 100 | 100 | 3.3 s | 0 ms | 0.002 |
| `/de/` | 92 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 |
| `/it/` | 92 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 |
| `/fr/pricing/` | 99 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/it/contact/` | 99 | 100 | 100 | 100 | 1.8 s | 0 ms | 0 |
| `/fr/quran-memorization-hifz/` | 95 | 100 | 100 | 100 | 2.6 s | 0 ms | 0 |
| `/de/blog/ab-welchem-alter-sollten-kinder-koran-lernen/` | 97 | 100 | 100 | 100 | 2.3 s | 0 ms | 0 |

- **No regression from five languages:** EN 91 vs 91 in Phase 3; AR 87 vs 88, which is within run-to-run noise.
- **A sandbox quirk:** headless Chromium here sometimes collects no screenshots, which leaves Speed Index and therefore the Perf score empty. Those runs were repeated.

**Weight (gzipped)**

| Asset | Size |
|---|---|
| Home HTML, EN / AR / DE / FR / IT | 20.4 / 21.4 / 21.2 / 21.3 / 20.9 KB |
| Site JS (header, language menu and hint, reveals, analytics shim) | 1.8 KB |
| Booking / placement JS | 2.4 / 2.2 KB (strings now ship as page JSON) |
| Global CSS | 10.9 KB |

The extra ~1.6 KB of HTML compared with Phase 3 comes from the five `hreflang` links, the language menu and the hint data.

**Known limitations (in addition to §5)**

- **Translations:** careful and glossary-driven, but not yet signed off by native reviewers (ABO-52). Religious passages are listed for the academic review (ABO-39).
- **Browsers:** German hyphenation (`hyphens: auto`) depends on the browser's dictionaries. Chromium and Safari support German; a few long compounds may still break with `overflow-wrap` on older engines. To verify on real devices (ABO-42).

## 8. Phase 5 re-run: the quality bar, the second theme and the app (16 Oct 2026)

Same environment (headless Chromium built from `@sparticuz/chromium` plus NSPR/NSS from source, `package.json`-less static server over `dist/`), but **everything now runs from inside the repository**: `qa/run.mjs` plus 12 suites, and the static gates grew (`check:cards`, `check:cms`, `check:css`, `check:sitemap`, 6 unit groups). See `docs/14-phase5-changelog.md` for what each suite is for and `docs/18-dark-mode-and-installable-app.md` for the dark-mode and installable-app work.

**Static gates**

| Gate | Result |
|---|---|
| Build | ✅ **195 pages**, 184 of them with their own social card (largest 98 KB) |
| Internal links and fragments | ✅ **17,118 links, 0 broken** |
| i18n | ✅ 195 pages · 189 hreflang clusters · **0 English leaks** on DE/FR/IT |
| Structured data | ✅ **379 JSON-LD blocks, 0 errors** |
| Sitemap | ✅ 189 URLs (= every indexable page), 189 with alternates matching the pages exactly |
| Social cards | ✅ 195 `og:image` checked, 0 errors, budget respected |
| CMS config | ✅ 7 collections, 79 articles match their fields, Sveltia `0.239.1` pinned with SRI |
| CSS prefixes | ✅ The Safari/iOS 16.4+ features relied on are present |
| Unit groups | ✅ 6 groups |

**Browser suites — one run, 12 suites, 632 s**

| Suite | Checked | Failures |
|---|---:|---:|
| canary (10 injected bugs) | 10 | 0 |
| overflow (pages × widths) | 1,940 | 0 |
| header (layouts 320 → 1440, every pixel × 5 languages) | 5,605 | 0 |
| popovers (open states) | 125 | 0 |
| axe (WCAG 2.2 AA + best practice) | 194 | 0 |
| flows | 10 | 0 |
| touch (10 devices) | 355 | 0 |
| theme (light ⇄ dark) | 62 | 0 |
| pwa | 90 | 0 |
| offline | 7 | 0 |
| **keyboard** (structure on 194 pages + 6 journeys) | 209 | 0 |
| cms | 1 | 0 (1 environment warning — see below) |

**One-off deep sweeps (documented, not part of the gate)**

- **Overflow:** 194 pages × **20 widths** (320 → 2560 px) = **3,880 layouts, 0 overflows**.
- **Header:** every pixel from 320 to 1440 px × five languages (the gate), plus a 1450 → 2560 px pass above it.
- **Keyboard journeys:** a booking made with nothing but Tab, Enter, Space, Escape and the arrow keys, from step 1 to `/thank-you/` and on into the WhatsApp message.

**Bugs this phase found and fixed:** the theme switch did not fit the header at 320–375 px; the Arabic header overflowed between 860 and 1099 px; a course card's CTA overflowed at 540/820/900/1180 px (now default widths in the gate); the booking wizard's step-1 error was visible but not announced (`aria-invalid` + `aria-describedby` on the radio group, cleared on change).

> **Environment limitation, stated honestly:** this sandbox has no route to `unpkg.com`, so the
> `cms` suite reports a warning instead of loading the pinned bundle from the CDN. The same
> package was fetched from the npm registry and the suite re-run against it
> (`SVELTIA_BUNDLE=<path> node qa/run.mjs cms`) — the editor boots to its sign-in screen with our
> `config.yml`, and the file's hash matches the SRI in `public/admin/index.html`. CI reaches the
> CDN, so the browser enforces the hash there for real.

**Still not tested (unchanged, and it needs a human or the business):** real devices and real
screen readers (`docs/17-device-qa-protocol.md`), Search Console and Bing verification, field
Core Web Vitals (needs traffic), and the app-store listings.
