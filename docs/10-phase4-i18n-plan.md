# 10 · Phase 4 plan — five languages (EN · AR · DE · FR · IT)

> Written **before** any Phase 4 code was touched, as the standing rule requires.
>
> **Outcome:** every workstream below shipped. See [`12-phase4-changelog.md`](12-phase4-changelog.md) and [`05-qa-report.md`](05-qa-report.md) §7. Where the build differs from this plan, an *as built* note says so.
>
> **The ask (2026-10-15), translated:**
> 1. "+971 50 276 0242 is the WhatsApp number."
> 2. "I need the whole site translated, with a language switch for German, French and Italian. Go for it."

---

## 1. What "done" means

| # | Ask | Acceptance criteria |
|---|-----|---------------------|
| 1 | WhatsApp number confirmed | `+971 50 276 0242` is marked **confirmed** in code, docs and Linear (ABO-37). The e-mail domain and the Cairo address are still open, so ABO-37 stays open for those. |
| 2 | The **whole** site in German, French and Italian | Every page that exists in English also exists in DE/FR/IT. That covers the 23 routes, 3 teacher profiles, the booking wizard, placement test, legal pages, 404 and **all 19 blog articles** (57 translated articles). No English UI string leaks onto a DE/FR/IT page. A post-build checker enforces this. |
| 3 | A language switch | One glass language menu works on every page: header popover, mobile sheet and footer. It goes to the **true translation** of the current page, never to a 404. It works with the keyboard and without JS, and does no forced redirects. |
| 4 | Same quality bar as Phases 1–3 | Zero broken links and zero axe violations across all locales. No overflow from 360 px to 1440 px, including German compound words. Valid hreflang clusters. Lighthouse holds. Plus docs, Linear, the Google Doc and a final report. |

---

## 2. Research (done before building)

### 2.1 How the market talks — terminology & positioning

| Market | What competitors say | Takeaway for us |
|---|---|---|
| **DE** | "Koran online lernen", "Einzelsitzungen mit Azhari Online-Nachhilfelehrer", "Tajweed" ([Surah Institute DE](https://surahinstitute.com/de/koran-online-lernen/)). Preply DE sells "Online-Einzelunterricht in Koran", a "Probe-Einheit" and "Tajwid" ([Preply](https://preply.com/de/Hamburg/nachhilfe-koran)). | Keep **Tajweed** (the most recognised spelling). Use **Einzelunterricht**, **Probestunde** and **Lehrkräfte**. |
| **FR** | "cours de Coran en ligne", "règles du Tajwid", "ijazas (chaînes de transmission certifiées)", "cours individuels en tête-à-tête", "rapports envoyés aux parents" ([coursdecoran.com](https://coursdecoran.com/)). Also "cours de Tajwid en ligne… professeurs égyptiens qualifiés" ([Bayan Academy](https://bayanacademy.net/cours-de-tajwid-en-ligne-gratuits/)). | **tajwid**, **ijaza**, **sanad (chaîne de transmission)**, **cours particuliers en tête-à-tête**, **séances d’essai gratuites**. |
| **IT** | "Corsi di Corano online", "lezioni di Tajweed", "insegnanti madrelingua arabi di al-Azhar", "tutor femminile" ([Surah Institute IT](https://surahinstitute.com/it/course/corano-e-arabo-online-con-lezioni-di-tajweed-per-principianti/), [Al Islam Academy IT](https://www.alislamacademy.com/it/%F0%9F%91%B6-corsi-di-corano-online-per-bambini/)). | **Corano**, **Tajweed**, **lezioni individuali**, **insegnanti di al-Azhar**, **lezioni di prova gratuite**. |

**A positioning risk the business must see.** French and Dutch competitors sell *teachers who speak the family's language*. For example, coursdecoran.com says its teachers master "l’arabe, le français et les règles du Tajwid", and [Koraninstituut Online](https://koraninstituutonline.nl/) offers German- and French-speaking teachers.

Ummah Academy's teachers teach in **Arabic and English**. A German page that implies German-language lessons would set the wrong expectation.

→ **Decision:**
- The teaching language comes from one data field, `SITE.teachingLanguages = ['ar','en']`. Its names are rendered per locale with `Intl.DisplayNames`.
- Every DE/FR/IT page that touches the topic states it plainly.
- The business decides whether to hire DE/FR/IT-speaking teachers. This is a new Linear gate.

### 2.2 Legal notes for EU audiences

- **Impressum (Germany).** § 5 DDG requires a provider identification for commercial digital services. It also applies to foreign providers who address the German market. See [IT-Recht Kanzlei](https://www.it-recht-kanzlei.de/impressum.html) and [easyrechtssicher](https://easyrechtssicher.de/blog/anwendbares-recht-im-internet): "Wer den deutschen Markt bedient, wird nach deutschem Recht gemessen."
  - → **Decision:** build an Impressum/Legal-notice page that renders **only when real company data exists** in `SITE.legalEntity`. We never publish placeholder legal data. Filling it in is a new launch gate in Linear.
- **Cookie consent (FR/IT/DE).** Refusing must be as easy and as visible as accepting.
  - → **Decision:** the consent banner's "No thanks" and "Allow" buttons get **equal visual weight** in every language.
- **Legal translations.** As with Arabic in Phase 3, the DE/FR/IT Privacy and Terms pages are convenience translations and **the English text prevails**. This is stated on each page and stays under ABO-44.

### 2.3 Typography & fonts (verified with fontTools)

- **Fonts.**
  - The Geist (latin subset) and Instrument Serif italic (latin subset) files contain every glyph DE/FR/IT need: ä ö ü ß é è ê à ç œ « » „ “ ’ – — … NBSP €.
  - The only gap is U+202F (narrow no-break space).
  - → French spacing uses **U+00A0**, e.g. `« … »`, `?`, `!`, `:` and `;`.
- **Quotes.**
  - DE `„…“`.
  - FR `« … »`.
  - IT `«…»`.
- **Numbers.**
  - DE/IT `1.000+`, FR `1 000+`.
  - Percentages: DE/FR `95 %`, IT `95%`.
  - Clock: 24-hour `19:00` in all three.
- **German compound words** (e.g. *Einstufungstest*, *Datenschutzerklärung*):
  - `hyphens: auto` on `:lang(de)` headings and text, with `overflow-wrap: break-word` as a safety net.
  - Verified by an overflow sweep from 360 px to 1440 px.
- **Register.** DE uses formal **Sie** and FR **vous**, the norm for a parent-facing education service. IT uses **tu**, the norm for modern Italian web copy.

Full terminology: [`11-i18n-glossary.md`](11-i18n-glossary.md).

---

## 3. Architecture decisions

| Topic | Decision | Why |
|---|---|---|
| Locale registry | One table holding code, native name, `dir`, `Intl` locale, OG locale and prefix. Adding a sixth language means one entry plus a `src/locales/<code>/` folder. *As built:* the table is `LOCALE` in `src/i18n/index.ts` (no separate `locales.ts`). The steps are in the README, "Languages (i18n)". | Single source of truth |
| URLs | EN stays at `/` (WordPress parity). The others use `/ar/`, `/de/`, `/fr/` and `/it/` + the **same page slug**, e.g. `/de/pricing/`. Articles: `/de/blog/<localised-slug>/`. | Keeps one route map. Localised article slugs carry the keywords people actually search. |
| Routes | One dynamic set, `src/pages/[locale]/…`, serves AR, DE, FR and IT. The 22 duplicated `pages/ar/*` wrappers go away. | No copy-paste per language |
| Copy | All UI and page copy moves out of the views into `src/locales/<lang>/<module>.ts`. EN is the typed reference; every other locale must match its shape (`satisfies`). EN/AR are extracted by script, and the EN/AR HTML is diffed before and after to **prove zero regressions**. | Translators work per language, and views become language-agnostic |
| Data text | Tracks, track pages, teachers, testimonials, plans, placement test and legal: DE/FR/IT supply **text only**. Ids, prices, links and images stay in one canonical place. | Prices can't drift between five copies |
| Countries | ISO codes are added and the names are rendered with `Intl.DisplayNames` per locale. Austria, Switzerland and Luxembourg are added. | Correct names for free; the DACH audience can find its country |
| Blog | One new collection, `blogTr`, at `src/content/blog-tr/<lang>/<slug>.md`, with `translationOf` **required**. Every EN article's cluster (EN, AR?, DE, FR, IT) is computed once. | Reciprocal hreflang by construction |
| hreflang | Every page emits its full cluster plus `x-default` (EN), and only for translations that really exist. The sitemap gets the five locales. | SEO hygiene |
| Language menu | Glass `<details>` popover in the header (native names, current marked, `lang`/`hreflang` on each link). Five chips in the mobile sheet and a language row in the footer. Works without JS; JS only adds outside-click and Escape. | Accessible, robust |
| Language hint | A soft, dismissible glass hint is **written in the visitor's language**: "Diese Seite gibt es auch auf Deutsch". It shows only when the browser prefers a locale that has a translation of *this* page. It never redirects, and remembers the choice. | Helps people arriving from social links without hurting SEO |
| WhatsApp hand-off | The message is written in the visitor's language and ends with a `Language: Deutsch (de)` line (*as built:* the bilingual `Sprache / Language: Deutsch (de)`), so the team knows how to reply. The webhook payload carries `lang`. | Ops clarity |
| Formatting | `Intl` handles dates, numbers and prices. Prices stay **USD**, e.g. `40 $`, and the pricing page says "in US dollars". | Honest. EUR pricing is a business call (ABO-43). |
| QA guards | **Build-time:** a shape-parity check across locales (the build fails on a missing key). **Post-build** `npm run check:i18n`: reciprocal hreflang, every alternate resolves, `<html lang>` is correct, and no English sentence leaks onto DE/FR/IT pages. | Automated quality |

---

## 4. Workstreams & checklist

- [x] **W0 · Contact.** WhatsApp confirmed in `site.ts`, the launch checklist and Linear ABO-37.
- [x] **W1 · Extraction.** EN/AR copy moves from views and components into `src/locales/{en,ar}`. A dist diff must show identical HTML.
- [x] **W2 · Engine.**
  - Locale registry, `[locale]` routes, alternates/clusters, formatting helpers, BaseLayout (hreflang, OG locale), sitemap.
  - Language menu (header, mobile, footer), language hint, `:lang(de)` hyphenation.
- [x] **W3 · UI & pages ×3.** UI strings, Home, Courses, 5 track pages, Pricing, Teachers + 3 profiles, About, Contact + booking wizard, Placement, FAQ, Career, Thank-you, Resources, Family portal, Blog index, Article chrome, 404, consent.
- [x] **W4 · Data ×3.** Tracks and courses, track-page content, teachers, testimonials (marked "translated"), plans, placement questions, countries, legal (Privacy, Terms).
- [x] **W5 · Blog ×3.** 19 articles per language (57 total), localised slugs, related posts, one RSS feed per language.
- [x] **W6 · Scripts.** Booking messages and validation in 5 languages, placement script strings, equal-weight consent buttons, `Impressum` page gated on real data.
- [x] **W7 · QA.**
  - Build, `check:links`, `check:i18n`, axe on every page.
  - Overflow sweep at 360/390/768/1024/1440 for DE/FR/IT.
  - Header fit, booking-flow test in DE/FR/IT, Lighthouse sample, JSON-LD parse, screenshots.
  - *As built:* the sweep ran at 320/360/768/1024/1280 px for all five languages, and the header was checked at every width from 320 to 1440 px.
- [x] **W8 · Handoff.** Changelog, glossary, QA report §7, README "add a language", REPORT §11 (Arabic), Google Doc section, Linear issues and project update.

**Order.** W0, then W1 (proven no-op), then W2 (no new copy yet; DE/FR/IT fall back to EN during development and the build lists every fallback), then W3–W6 module by module, translating DE, FR and IT together while the English source is fresh, then W7 and W8. The work is committed after each workstream.

---

## 5. Business gates this phase creates or touches

| Gate | Linear | Notes |
|---|---|---|
| Teaching language for DE/FR/IT families | **ABO-50** | Copy says Arabic and English. If DE/FR/IT-speaking teachers are hired, change `SITE.teachingLanguages` and the teaching-language sentences in `src/locales/{de,fr,it}` (listed in ABO-50). |
| Impressum data (legal entity, address, register, representative, VAT) | **ABO-51** | The page appears automatically once `SITE.legalEntity` is filled in |
| Native-speaker review of DE/FR/IT copy | **ABO-52** | Translations are careful and human-quality, but a native reviewer per language should sign off before launch. The Islamic terminology is in the glossary. |
| Legal review of translated Privacy and Terms | ABO-44 | The English text prevails until reviewed |
| EUR price display | ABO-43 | USD for now |
| E-mail domain and address | ABO-37 | WhatsApp is now confirmed |

## 6. Risks

| Risk | Mitigation |
|---|---|
| Volume (~45k words) leads to inconsistency | Glossary first, translating module by module, and an automated leak checker |
| German text length breaks layouts | Hyphenation, short CTA variants and a sweep at 360 px |
| Religious quotations mistranslated | Translate the **meaning** from the vetted English, keep the references (e.g. al-Bukhārī 5027) and add no new quotations |
| Route refactor breaks AR | Dist diff of every AR page before and after W1–W2 |
