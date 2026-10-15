# 06 · Launch checklist

> Nothing on this list was invented on the site. Items marked **Business** need confirmation or assets from the academy before the domain points at the new build.

## A. Business confirmations (P0)

- [x] **WhatsApp number.** **+971 50 276 0242** was confirmed by the business on 2026-10-15. It is the only number on the site (`src/data/site.ts`). The +20 numbers from the old site stay retired.
- [ ] **E-mail and address.** **info@ummahacademy.net** is used everywhere. The live site also shows info@ummahacademy.com and "Cairo, Egypt". Confirm the right domain and whether an address should be published. An address is also required for the German Impressum: see §C and ABO-51.
- [ ] **Figures shown in the proof strip and About:** 50+ countries, 1,000+ students, 100+ teachers, 12+ Ijazahs, 95% continue after month one, 400+ hours/month, plus timeline facts (2022–2026). Provide evidence or adjust.
- [ ] **Teachers:** confirm the three department leads' credentials and consent to be named. Each now has a full profile page (`/teachers/<id>/`, EN and AR), so this matters more. Provide real portraits (replacing the monograms) if desired.
- [ ] **Testimonials:** written consent from the 5 named families. Note that the Arabic, German, French and Italian versions are translations and are labelled as such.
- [ ] **Response-time promise:** "usually within minutes, always within 2 hours".
- [ ] **Recordings:** the site now says "available on request; library rolling out in the Family Portal". Confirm or update once the library is live.
- [ ] **Pricing:**
  - Confirm the six plans and the merge of "Deen" into "Consistent".
  - Confirm whether adults may take 30-minute plans. Course pages show the live "from" prices ($64 for adult tracks), while 30-minute plans start at $40.
- [ ] **Placement test question bank** (`src/data/placement.ts` for EN and AR; `src/locales/{de,fr,it}/data/placement.ts`): academic review by the Tajweed department (ABO-39).
- [ ] **Arabic copy:** native editorial review (written in Modern Standard Arabic). Phase 3 adds the 3 Arabic articles (`src/content/blog-ar/`) and the Arabic Resources, Family Portal and legal pages.
- [ ] **Worksheets** (`public/downloads/`, source in `scripts/pdfs/sheets/`): academic review of the Tajweed examples, the Nahw answers and the letter names and example words. Regenerate with `npm run pdfs` after edits.
- [ ] **Legal:** privacy and terms are the live templates. Have them reviewed against the actual legal entity, children's data, recordings and WhatsApp processing. The Arabic pages are a translation that says the English text prevails. Update both after the review (`src/content-i18n/legal.ts`). If GTM is enabled, mention analytics cookies and the consent banner in the policy.
- [ ] **Logo:** approve the proposed SVG mark (`src/components/Logo.astro`), or swap in the legacy logo.

## B. Technical migration (P0)

1. **Portal/LMS.** Move the WordPress portal (`/login/`, `/my-account/`, `/register/…`, `/dashboard/`) to a sub-domain, e.g. `portal.ummahacademy.net`. Then:
   - set `PUBLIC_PORTAL_URL=https://portal.ummahacademy.net` in Vercel;
   - add 301s in `vercel.json`: `/login/` → portal login, `/my-account/` → portal, `/register/:path*` → portal.
2. **Lead capture (recommended).** Create a webhook (a Google Apps Script web app writing to a Sheet, or Zapier/Make → CRM). Set `PUBLIC_LEAD_ENDPOINT`. It receives JSON including UTM attribution. Enable CORS for the domain.
3. **Downloads.** ✅ Done in Phase 3: six original worksheets ship in `public/downloads/` and the Resources page links them directly. Still open:
   - the four third-party books stay "request on WhatsApp" until licensing is decided;
   - if old `/wp-content/uploads/*.pdf` URLs get traffic, add 301s to the matching new file or to `/resources/`.
4. **Analytics.** ✅ Code ready in Phase 3. Pick one and set it in Vercel; no code change is needed:
   - `PUBLIC_PLAUSIBLE_DOMAIN=ummahacademy.net` (cookieless, no banner), and/or
   - `PUBLIC_GTM_ID=GTM-XXXX`. This uses Consent Mode v2: GTM loads only after "Allow", and the bilingual banner plus a footer "Privacy choices" link appear automatically. Configure GA4 inside GTM.

   Events: `docs/03-audit/analytics.md` (Phase 3 adds `resource_download` and `consent_update`).
5. **Search Console.** Verify the domain, submit `/sitemap-index.xml`, and monitor coverage and 404s for two weeks after cut-over.
6. **DNS cut-over.**
   - Point the apex and `www` to Vercel.
   - Keep the WordPress database backed up.
   - Keep WordPress online on the portal sub-domain for the LMS.
7. **Smoke test on production:**
   - the 301s listed in `vercel.json`;
   - `curl -I` on 10 high-traffic URLs;
   - the booking flow on iOS Safari and Android Chrome;
   - the WhatsApp deep link opening the app.

## C. Phase 4: five languages (DE · FR · IT)

> The site is fully built in German, French and Italian ([`12-phase4-changelog.md`](12-phase4-changelog.md)). These items decide whether those markets can be actively targeted at launch.

**Business and legal (P0 before advertising in DE/FR/IT markets)**

- [ ] **Impressum data (ABO-51).** Germany's § 5 DDG also binds foreign providers who address German users. Fill in `SITE.legalEntity` in `src/data/site.ts`:
  - legal name and form;
  - full postal address;
  - representative;
  - register and number;
  - VAT ID.

  `/legal-notice/` in 5 languages and its footer link then appear automatically. Never publish placeholders.
- [ ] **Teaching language (ABO-50).** The pages say lessons are in Arabic and English. If teachers who can explain in German, French or Italian join, add the codes to `SITE.teachingLanguages` and update the sentences in `src/locales/{de,fr,it}` (listed in ABO-50).
- [ ] **Native-speaker review (ABO-52).** One reviewer per language for ~65k words, using `docs/11-i18n-glossary.md`. Priority order: home, pricing, booking, placement, track pages, FAQ, then the articles.
- [ ] **Legal translations (ABO-44).** The DE/FR/IT Privacy and Terms state that the English text prevails. Ask counsel whether a GDPR Art. 27 EU representative is required.
- [ ] **Currency (ABO-43).** Prices are shown in USD (`40 $`). Decide whether to show EUR/CHF.

**Technical (at cut-over)**

1. **Search Console:** after submitting `/sitemap-index.xml` (it already lists all five locales with alternates), check the hreflang and coverage reports for `/de/`, `/fr/` and `/it/`.
2. **Analytics:** segment by language. Every event already carries the page language; `language_switch` and `language_hint` are tracked.
3. **No language redirects** at the edge (Vercel). The site never redirects by browser language, which is deliberate for SEO and shared links. The in-page hint does that job.
4. **Before release:** keep `npm run qa` green. Production builds fail on a half-translated locale, and `check:i18n` fails on English leaks or broken hreflang.

## D. Nice to have (P2)

- [ ] Real teacher photos with art-directed backgrounds matching the glass palette.
- [ ] A sibling/family discount and/or a money-back guarantee (competitive gap; business decision).
- [x] Arabic blog articles: the first 3 shipped in Phase 3. Next candidates are in `docs/04-strategy/seo-plan.md` §6.
- [x] Teacher profile pages (Phase 3).
- [ ] A Git-based CMS (Sveltia/Decap/Keystatic) for the blog and FAQ.
- [ ] Per-page OG images (the template exists in the QA tooling; default cards ship in all five languages).
