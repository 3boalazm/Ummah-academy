# 05 · QA report (v2 + Phase 3)

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
