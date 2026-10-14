# 05 · QA report (v2)

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
- **Lighthouse:** not run (no Lighthouse runtime in the sandbox). The expected profile is static HTML, tiny JS, preloaded font and optimised images.
- **Lead delivery:** without `PUBLIC_LEAD_ENDPOINT`, requests reach the academy only when the visitor presses "Send on WhatsApp". The thank-you page says so explicitly.
