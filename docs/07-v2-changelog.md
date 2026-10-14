# 07 · Phase 2 changelog (v1 → v2), mapped to audit findings

| Audit # | Change | Where |
|---|---|---|
| A1 | New positioning hero: *"The Qur'an, taught the way it was transmitted."* (AR: *تعلَّم القرآن كما نُقِل إلينا — بسندٍ متصل*) | `src/views/Home.astro` |
| A2 | Home rebuilt from 15 to 10 sections (≈ −41% height); one claim per section, each with proof | Home |
| A3 | One primary CTA (*Book 2 free sessions*), a secondary (*Find my level*), WhatsApp as tertiary (footer, menu, sticky bar) | Header, Home, track pages |
| A4 | "Who's learning?" router: a child card and five adult goal links, plus the placement test | Home |
| A5 | Removed "ICESCO Aligned" and "GDPR Compliant" badges, the duplicate and conflicting metrics, and the "3 Ijazah-holding scholars" stat; teachers reframed as department leads; recordings described honestly | Home, Teachers, Pricing, FAQ, Family Portal |
| A6 | Pricing rebuilt: **plan finder** (length × frequency), plans grouped by session length, per-session price, "Deen" merged into "Consistent", pricing FAQ | `src/views/Pricing.astro`, `src/data/pricing.ts` |
| A7 | **3-step booking wizard**: tiles, segmented controls, timezone detection, country guess with dial-code hint, child-age step, per-step validation, prefill from any CTA | `BookingWizard.astro`, `scripts/booking.ts`, `views/Contact.astro` |
| A8 | Placement test v2: no self-rating step, no contact gate, instant result, "Book with this plan" prefill, optional WhatsApp share; full Arabic bank with grammar-level questions | `views/Placement.astro`, `scripts/placement.ts`, `data/placement.ts` |
| A9 | **Arabic RTL site** for 15 routes (30 pages) with a path-aware language switch, hreflang tags and sitemap alternates. Inline Arabic sub-lines removed from English pages, so Arabic fonts no longer load on them | `src/i18n`, `src/views/*`, `src/pages/ar/*` |
| A10 | **One track template** for all five course pages: at-a-glance card, stages, method, teacher + Sanad + story, recommended plans, **one merged FAQ** (was two per page) | `views/TrackPage.astro`, `content-i18n/tracks.ts` |
| A11 | New layouts to break "card soup": bento with a night Sanad tile, vertical timeline beside the classroom mockup, horizontal story and timeline rails, split FAQ with sticky head, plan finder | Home, About, Teachers, Pricing |
| A12 | Hall of Fame, trust-badge row and SEO "Welcome" blocks removed; their keywords woven into real copy | All pages |
| A13 | **First-touch attribution** (UTM, click-id type, referrer host, landing page) stored locally and sent with the lead webhook payload | `scripts/attribution.ts` |
| A14 | **Sticky mobile action bar** (Book + WhatsApp) after the hero, hidden over the footer and booking forms | `StickyCta.astro`, `scripts/site.ts` |
| A15 | Single source of truth for contact | `src/data/site.ts` |
| A16 | Teacher monograms get department palette variants and an "Ijazah verified" seal | `TeacherCard.astro` |
| A17 | Resources fall back to a WhatsApp request instead of dead links | `pages/resources.astro` |
| — | Thank-you page states honestly whether the request was received (webhook) or still needs sending on WhatsApp; bilingual | `views/ThankYou.astro` |
| — | Careers page bilingual; its audience is Arabic-speaking Al-Azhar graduates | `views/Career.astro` |
| — | Arabic OG card; hero pointer tilt; analytics events: router, booking steps, plan finder, language switch | various |
