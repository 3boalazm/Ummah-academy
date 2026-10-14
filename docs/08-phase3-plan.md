# 08 · Phase 3 plan: close every gap that doesn't need a business decision

> Written **before** any Phase 3 code, as with Phases 1 and 2 (see `00-workflow-plan.md`).
> Trigger: the instruction "كمل" (continue) after v2 shipped.
> Scope rule: do everything that is unblocked now. Anything that needs the academy's own facts, money or
> approval stays a launch gate in Linear (ABO-37 → ABO-44, ABO-48).

## 1. Where v2 left off

| Backlog item | Blocked by the business? | Phase 3 action |
|---|---|---|
| ABO-47 · Arabic content: blog, Family Portal, Resources, legal | No | **Do it.** The last English-only corners of the site get Arabic versions, plus the first Arabic articles |
| ABO-49 · Teacher profile pages and a CMS | Profiles: no (the bios are already public). Photos: yes | **Profiles: do it**, with monogram portraits until real photos arrive. CMS: evaluate after the rest |
| ABO-45 · Free-library PDFs | WordPress files can't be fetched from here, and third-party book editions need licences | **Write original worksheets** (no licence risk). The books stay "request on WhatsApp" |
| ABO-46 · Analytics | The tool choice belongs to the business | **Make it a config switch**: Plausible or GTM/GA4 with Consent Mode v2 and a bilingual consent banner, all off until an env var is set |
| ABO-42 · Cross-browser and device QA | Real devices: yes. Lighthouse: no | **Run Lighthouse** (mobile and desktop) on the key EN and AR pages and fix what it finds |
| ABO-37/38/39/43/44/48 · facts, evidence, pricing, legal, logo | Yes | Stay open. Each gets a short comment on what Phase 3 changed |

## 2. Workstreams

### W1 · Arabic parity (ABO-47)
- **i18n**: add `/blog/`, `/resources/`, `/family-portal/`, `/privacy-policy/`, `/terms-of-service/` and the teacher
  profiles to `BILINGUAL_ROUTES`. Add a per-page override for alternates, because an Arabic article is not a
  1:1 path twin of an English one (`translationOf` in front-matter → correct `hreflang` and language switch).
- **Views**: move Resources, Family Portal, Privacy and Terms into `src/views/*` with EN and AR copy, the same
  pattern the 15 funnel routes use. Arabic legal pages state that the English text prevails until legal review.
- **404**: one static file serves every path on Vercel, so it becomes bilingual and puts Arabic first on `/ar/…`.
- **Arabic blog**: a separate `blogAr` collection at `/ar/blog/<slug>/`, written for Arab families living abroad
  (not machine translation). First three cornerstone articles, from `04-strategy/seo-plan.md` §6:
  1. كيف تختار معلم قرآن لطفلك؟
  2. تحفيظ القرآن للأطفال في الغربة
  3. ما هي الإجازة والسند؟
  The Arabic blog index also lists the English library underneath, clearly labelled, so it is never thin.
- **Clean-up**: remove the "(بالإنجليزية)" notes wherever an Arabic page now exists. Arabic "related articles"
  prefer Arabic posts and fall back to English with a label.

### W2 · Teacher profiles (ABO-49, part)
- `/teachers/<id>/` and `/ar/teachers/<id>/` for the three published leads.
- Each page has: who she is, what she teaches, who she's best for, credentials, the Sanad explainer, what
  families say about her (only testimonials that name her), her track, and a "Book with …" CTA that pre-fills
  the booking wizard.
- `Person` JSON-LD (`alumniOf`, `knowsAbout`, `knowsLanguage`, `worksFor`) as an E-E-A-T signal.
- Cards on Teachers, Home and track pages link to the profiles.

### W3 · Original free-library PDFs (ABO-45, part)
Authored from scratch: brand-consistent, printable A4, bilingual, built from HTML by a script in the repo
(`scripts/pdfs/`).
1. Tajweed rules summary: one colour-coded page with Qur'anic examples.
2. Daily wird tracker: 30 days.
3. Hifz schedule template: weekly sabaq / sabqi / manzil plan.
4. Arabic letter tracing: all 28 letters in their positional forms.
5. Nahw exercises: with an answer key.
6. Ummah Cubs activity pack: pillars matching, a word search, a deeds chart and a geometric colouring page.

The Resources page detects at build time which PDFs exist in `public/downloads/`. If a file exists, the button
links straight to it and shows the file size. If not, it falls back to the WhatsApp request, so no link can break.

### W4 · Analytics, ready to switch on (ABO-46, part)
- `PUBLIC_PLAUSIBLE_DOMAIN` loads Plausible, which is cookieless and needs no banner.
- `PUBLIC_GTM_ID` loads GTM only after consent. Consent Mode v2 defaults are all "denied", the banner is a
  bilingual glass panel, the choice is stored locally, and a "Privacy choices" link in the footer reopens it.
- With neither variable set, nothing loads and no banner appears, which is today's behaviour.

### W5 · Evidence (ABO-42, part)
- Lighthouse 12, mobile and desktop, on: home, a track page, pricing and contact, each in EN and AR, plus one
  Arabic article.
- Re-run the existing gates on every new page: build, link checker, axe, overflow sweep, header fit, flows.

### W6 · Hand-off
- `docs/09-phase3-changelog.md`, plus updates to `05-qa-report.md`, `06-launch-checklist.md`, `REPORT.md`,
  `README.md` and the docs index.
- Linear: progress comments, state changes, and new issues only for genuinely new follow-ups.
- Google Doc: append a Phase 3 section.
- Commit and push to the session branch.

## 3. Quality bar (unchanged from v2)
- Zero broken internal links, zero axe violations, no horizontal overflow at 360 px, RTL correct.
- No new unverifiable claims. Everything new that needs academic eyes (Arabic articles, tajweed sheet, nahw key)
  is added to ABO-39 for review.
- Per-page JS stays small. The PDFs are static files, so they add nothing to page weight.

## 4. Risks
| Risk | Mitigation |
|---|---|
| Errors in Qur'anic text in the tajweed sheet | Only short, well-known phrases; each example is checked twice; added to the ABO-39 academic review |
| Arabic legal text read as binding | A notice that the English version prevails, and that the text is pending the legal review in ABO-44 |
| Thin Arabic blog | The English library is listed under the Arabic articles; 3 substantial articles of 900+ words |
| A consent banner annoying visitors who were never tracked | The banner only exists when GTM is configured |
