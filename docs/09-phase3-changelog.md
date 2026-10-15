# 09 · Phase 3 changelog: everything that didn't need a business decision

> Plan: [`08-phase3-plan.md`](08-phase3-plan.md). Trigger: "كمل" (continue) after v2.
> Commits on `arena/8f0d374d-ummah-academy`: `788d268` (W1 + W2), `5fc7a50` (W3 – W5), then this documentation.
> Rule kept from Phases 1–2: nothing on the site states a fact the academy hasn't published. Where Phase 3 had to
> write new material (articles, worksheets, Arabic legal text), it is flagged for review in Linear.

## 1. At a glance

| | v2 | Phase 3 |
|---|---|---|
| Pages built | 55 | **69** (+14) |
| Bilingual routes (EN ↔ AR) | 15 | **23**, plus 3 translated article pairs |
| English-only corners left | Blog, Resources, Family Portal, Privacy, Terms, 404 | **None** (the 19 English articles stay English, linked from the Arabic blog) |
| Arabic articles | 0 | **3** original cornerstone articles (~2,600 words) |
| Free-library downloads | 0 (all "request on WhatsApp") | **6** original bilingual PDFs, 18 pages |
| Teacher profile pages | 0 | **6** (3 teachers × EN/AR) with `ProfilePage` structured data |
| Analytics | `track()` shim only | **Config switch**: Plausible and/or GTM with Consent Mode v2 and a bilingual banner |
| Internal links checked | 4,012 | **5,078**, 0 broken |
| axe violations | 0 / 54 pages | **0 / 68 pages** + both 404 variants |
| Lighthouse (mobile) | not run | **Perf 88–99 · A11y 100 · Best practices 100 · SEO 100** on 10 key pages |

## 2. W1 · Arabic parity (Linear ABO-47)

**Arabic blog** (`src/content/blog-ar/`, routes `/ar/blog/` and `/ar/blog/<slug>/`)

| Article | Pairs with (EN) | Notes |
|---|---|---|
| [كيف تختار معلم قرآن لطفلك؟ دليل عملي للأسر في الغربة](../src/content/blog-ar/choosing-a-quran-teacher-for-your-child.md) | `how-to-choose-the-right-quran-teacher-for-your-child` | Featured. Questions to ask before the trial, red flags, how to judge the trial |
| [تحفيظ القرآن للأطفال في الغربة: خطة واقعية تبدأ من البيت](../src/content/blog-ar/quran-memorization-for-children-abroad.md) | `quran-memorization-for-kids-a-practical-guide-for-parents` | Age guide, new/recent/old revision, a weekly table, links to the Hifz template PDF |
| [ما هي الإجازة والسند في القرآن؟](../src/content/blog-ar/what-is-ijazah-and-sanad.md) | `what-is-an-ijazah-understanding-quran-certification-and-sanad` | The Hafs chain, how an Ijazah is earned, types, a 5-step check for families |

- Written for Arab families abroad, not translated. Hadith and athar quoted only with their source (al-Bukhari 5027,
  Muslim 798, Ibn al-Mubarak in the introduction to Sahih Muslim). **Needs the academic and Arabic review in ABO-39.**
- A `blogAr` collection with its own Arabic categories and an optional `translationOf` field. The build fails if
  `translationOf` points at an English article that doesn't exist.
- **Translation pairs** emit reciprocal `hreflang` and drive the language switch (EN article ↔ its AR twin).
  Unpaired pages switch to the other language's blog index, and never to a broken twin.
- The Arabic index lists the Arabic articles first, then the English library under a labelled heading
  (cards marked `lang="en" dir="ltr"`).
- **Related articles** on Arabic pages now prefer Arabic posts, then fall back to English ones with a "بالإنجليزية" chip.

**Shared views for the last English-only pages.** These are Blog, Article, Resources, Family Portal and Legal (Privacy + Terms). Each English route is now a 5-line wrapper around a view, and the Arabic route is its twin.

- **Legal:** the English text is the live site's, verbatim. The Arabic is a faithful translation with a notice that
  the English version prevails, pending the legal review in **ABO-44**.
- **404:** a single static file serves every missing URL on Vercel, so it is bilingual. On `/ar/…` paths an inline
  script moves the Arabic panel first. The old hard-coded `/blog/` link is fixed.

## 3. W2 · Teacher profiles (ABO-49, first half)

Routes are `/teachers/<id>/` and `/ar/teachers/<id>/` for `omneya-ali`, `sara-ahmed` and `nour-hassan`. Each profile has:

- Hero: role, name, specialty, the published bio, "best for" chips, and two CTAs:
  - **Book with her**, which pre-fills the wizard with `?teacher=`;
  - **Ask about her availability** on WhatsApp.
- Credentials and **how she earned her place**: the academy's 4-stage vetting, already published on `/teachers/`.
- **The Sanad block appears only when her published bio states an Ijazah** (Omneya). The same rule now drives the
  card badge everywhere. "Ijazah verified" became "Credentials verified" for Sara and Nour, whose bios don't claim one.
  This removes an over-claim v2 had.
- "What she teaches" (the track's courses), testimonials **only where the quote names her** (Nour ← Sarah
  Al-Mansouri, Omneya ← Amina Bergström), booking steps, FAQ, and the other two leads.
- `ProfilePage` + `Person` JSON-LD (`alumniOf` and `hasCredential` only where published).
- Entry points:
  - the name and a "Full profile" button on every teacher card (Teachers page, all track pages);
  - a "with Teacher …" link on the testimonials that name her.
- The build asserts every profile is registered in `BILINGUAL_ROUTES`.

## 4. W3 · Six original printable PDFs (ABO-45)

`npm run pdfs` (needs `CHROME_PATH`) renders `scripts/pdfs/sheets/*.mjs` with `puppeteer-core` into `public/downloads/`.

- It also writes `src/data/downloads.json`.
- Fonts are embedded, so the output doesn't depend on the machine.
- The Resources page links a sheet directly **only if its file exists at build time**. Otherwise it falls back to the WhatsApp request, so a link can never break.

| File | Pages | Size | Content |
|---|---|---|---|
| `ummah-academy-tajweed-rules-summary.pdf` | 1 | 231 KB | Noon/Meem sakinah, Qalqalah, Ghunnah, the Madd family with counts; Qur'anic examples (Hafs, Shatibiyyah) |
| `ummah-academy-arabic-letter-tracing.pdf` | 7 | 2.4 MB | 28 letters, 4 per page: dotted → faint → free writing, the 4 positional forms, name, sound hint, example word |
| `ummah-academy-daily-wird-tracker.pdf` | 1 | 135 KB | 30-day recitation / new memorisation / revision / adhkar chart with parent check |
| `ummah-academy-hifz-schedule-template.pdf` | 2 | 302 KB | Weekly new/recent/long-term plan + Juz ʿAmma tracker (Al-Fatihah + 78–114, ayah counts, 6 revision ticks) |
| `ummah-academy-nahw-exercises.pdf` | 3 | 274 KB | 7 drills (sentence types, mubtada'/khabar, verb–doer–object, prepositions, case endings, i'rab, your turn) + answer key |
| `ummah-academy-cubs-activity-pack.pdf` | 4 | 411 KB | Five Pillars matching, prophets word search (with upside-down solution), good-deeds star chart, 8-point star colouring page |

- Each PDF is A4 and print-friendly (light backgrounds). It carries the brand, the site and a "2 free lessons" footer, and is tagged.
- The four **books** (Noor Al-Bayan, Al-Ajrumiyyah, Al-Jazariyyah, Adhkar for Kids) stay "request on WhatsApp": they
  are third-party editions and need a licence decision.
- `resource_download` analytics event; `vercel.json` caches `/downloads/*` for a day.
- **Needs the academic review in ABO-39** (rules, examples, grammar answers).

## 5. W4 · Analytics as a config switch (ABO-46)

`src/components/Analytics.astro` + `src/components/ConsentBanner.astro`. Nothing loads unless an env var is set:

| Env var | Behaviour |
|---|---|
| `PUBLIC_PLAUSIBLE_DOMAIN` (+ optional `PUBLIC_PLAUSIBLE_SRC`) | Plausible, cookieless, so no banner. A queue stub means early `track()` calls aren't lost |
| `PUBLIC_GTM_ID` | GTM in **Consent Mode v2 "basic"**: every consent type defaults to denied. **GTM isn't requested at all until the visitor clicks Allow.** Ads storage is never granted. A bilingual, non-modal banner is shown, plus a "Privacy choices" footer link to change the choice |

Verified end-to-end in a test build (first visit → No thanks → reload → reopen from footer → Allow → next page):

- GTM was requested **only** after Allow.
- The choice persisted across pages.
- The consent states were `default:denied`, followed by `update:granted` or `update:denied`.

## 6. W5 · QA

See [`05-qa-report.md`](05-qa-report.md) §6 for the full tables. Summary:

- **Build:** 69 pages, no errors.
- **Links and anchors:** 5,078, 0 broken.
- **axe:** 0 violations on 68 pages + 404 (EN and AR paths).
- **Overflow:** no horizontal overflow at 390/1440 on any page.
- **Header fit:** OK at 360/390/430.
- **Flows:** wizard and placement flows still pass.
- **JSON-LD:** valid on every page (`ProfilePage` ×6, `BlogPosting` ×22, …).
- **Lighthouse mobile:** Perf 88–99, 100 elsewhere.

**Bugs found and fixed in passing:**

- **Blog lead card (pre-existing since v2):** the cover's `aspect-ratio` drove the column width when stretched, which hid the lead article's text on desktop.
- **RTL arrows:** they pointed the wrong way in related-article and blog cards on Arabic pages. English cards inside Arabic pages keep LTR arrows.
- **Ijazah badge:** "Ijazah verified" was shown for teachers whose bios don't state one (see §3).

**Tried and reverted:** I tried animating above-the-fold heroes with CSS so the LCP wouldn't wait for JavaScript. It gave no measurable LCP gain, and it exposed web-font swaps as layout shift: CLS on the English home went from 0 to 0.29. So the original reveal stays.

## 7. Still needs the academy (unchanged gates + what Phase 3 adds to them)

| Linear | What's needed | Phase 3 addition |
|---|---|---|
| ABO-37 | Confirm canonical contact details | — |
| ABO-38 | Evidence for figures; consent for names and testimonials | The teacher profiles name the teachers more prominently: confirm consent |
| ABO-39 | Academic and Arabic review | **Add:** the 3 Arabic articles, the 6 PDFs, and the Arabic legal translation's wording |
| ABO-43 | Pricing decisions | — |
| ABO-44 | Legal review | The Arabic legal pages say English prevails until this is done |
| ABO-46 | Pick an analytics tool | Set one env var in Vercel; no code needed |
| ABO-48 | Logo approval | — |
| ABO-42 | Real-device QA (Safari iOS, Firefox, Samsung Internet) | Chromium-based automated QA and Lighthouse are done |

**Not done (optional, low priority):**

- A Git-based CMS (Sveltia/Decap at `/admin/`). The content collections are CMS-ready.
- Per-page OG images. The EN and AR default cards still ship.
