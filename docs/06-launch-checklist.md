# 06 · Launch checklist

> Nothing on this list was invented on the site. Items marked **Business** need confirmation or assets from the academy before the domain points at the new build.

## A. Business confirmations (P0)

- [ ] **Canonical contact.** WhatsApp **+971 50 276 0242** and **info@ummahacademy.net** are used everywhere. The live site also shows +20 115 464 4519, a tel link to +20 101 807 2869, info@ummahacademy.com and "Cairo, Egypt". Confirm the right ones (`src/data/site.ts`).
- [ ] **Figures shown in the proof strip and About:** 50+ countries, 1,000+ students, 100+ teachers, 12+ Ijazahs, 95% continue after month one, 400+ hours/month, plus timeline facts (2022–2026). Provide evidence or adjust.
- [ ] **Teachers:** confirm the three department leads' credentials and consent to be named. Provide real portraits (replacing the monograms) if desired.
- [ ] **Testimonials:** written consent from the 5 named families. Note the Arabic versions are translations and are labelled as such.
- [ ] **Response-time promise:** "usually within minutes, always within 2 hours".
- [ ] **Recordings:** the site now says "available on request; library rolling out in the Family Portal". Confirm or update once the library is live.
- [ ] **Pricing:**
  - Confirm the six plans and the merge of "Deen" into "Consistent".
  - Confirm whether adults may take 30-minute plans. Course pages show the live "from" prices ($64 for adult tracks), while 30-minute plans start at $40.
- [ ] **Placement test question bank** (`src/data/placement.ts`, EN and AR): academic review by the Tajweed department.
- [ ] **Arabic copy:** native editorial review (written in Modern Standard Arabic).
- [ ] **Legal:** privacy and terms are the live templates. Have them reviewed against the actual legal entity, children's data, recordings and WhatsApp processing.
- [ ] **Logo:** approve the proposed SVG mark (`src/components/Logo.astro`), or swap in the legacy logo.

## B. Technical migration (P0)

1. **Portal/LMS.** Move the WordPress portal (`/login/`, `/my-account/`, `/register/…`, `/dashboard/`) to a sub-domain, e.g. `portal.ummahacademy.net`. Then:
   - set `PUBLIC_PORTAL_URL=https://portal.ummahacademy.net` in Vercel;
   - add 301s in `vercel.json`: `/login/` → portal login, `/my-account/` → portal, `/register/:path*` → portal.
2. **Lead capture (recommended).** Create a webhook (a Google Apps Script web app writing to a Sheet, or Zapier/Make → CRM). Set `PUBLIC_LEAD_ENDPOINT`. It receives JSON including UTM attribution. Enable CORS for the domain.
3. **Downloads.** Copy the PDFs from `/wp-content/uploads/*.pdf` into `public/downloads/`. Point the Resources buttons at them (they currently fall back to a WhatsApp request).
4. **Analytics.** Add Plausible (cookieless), or GTM + GA4 with Consent Mode v2 and a consent banner. Events are already pushed to `window.dataLayer` (`docs/03-audit/analytics.md`).
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

## C. Nice to have (P2)

- [ ] Real teacher photos with art-directed backgrounds matching the glass palette.
- [ ] A sibling/family discount and/or a money-back guarantee (competitive gap; business decision).
- [ ] Arabic blog articles (`docs/04-strategy/seo-plan.md` §6).
- [ ] A Git-based CMS (Keystatic/Decap) for the blog and FAQ.
- [ ] Per-page OG images (the template exists in the QA tooling; default EN/AR cards ship now).
