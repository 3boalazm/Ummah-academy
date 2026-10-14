# 04 · Information architecture, flows and page blueprints (v2)

## 1. Sitemap

```
/                               Home                      (EN · AR /ar/)
├── /courses/                   All courses + chooser      (EN · AR)
│   ├── /quran-recitation-course/        Recitation & Tajweed   (EN · AR)
│   ├── /quran-memorization-hifz/        Hifz & Ijazah          (EN · AR)
│   ├── /online-arabic-classes/          Arabic Language        (EN · AR)
│   ├── /ummah-cubs-kids-islamic-studies/ Ummah Cubs (5–14)     (EN · AR)
│   └── /online-islamic-studies-classes/ Islamic Studies        (EN · AR)
├── /teachers/                  Faculty, Sanad, vetting    (EN · AR)
├── /pricing/                   Plan finder + all plans    (EN · AR)
├── /about/                     Story, method, difference  (EN · AR)
├── /placement-test/            3-minute level test        (EN · AR)
├── /contact/                   3-step booking wizard      (EN · AR)
│   └── /thank-you/             Honest hand-off (noindex)  (EN · AR)
├── /faq/                       Grouped FAQ                (EN · AR)
├── /career/                    Teacher recruitment        (EN · AR)
├── /family-portal/             Portal explainer           (EN)
├── /resources/                 Free library               (EN)
├── /blog/ + 19 articles        Content hub (root slugs)   (EN)
└── /privacy-policy/, /terms-of-service/                   (EN)
```

That is 15 bilingual routes (30 pages), plus 6 English-only pages, plus 19 articles: **55 HTML pages**. URLs are identical to WordPress; Arabic lives under `/ar/` with `hreflang` pairs in the `<head>` and the sitemap.

## 2. Navigation

| Zone | Items |
|---|---|
| Header (desktop) | Logo · **Courses ▾** (4 tracks with prices, compare, placement test) · Teachers · Pricing · About · Blog · `العربية` · Sign in · **[Book free trial]** |
| Header (mobile) | Logo · `ع` · **[Free trial]** · ☰ (native `<dialog>` sheet with tracks, links, Book, WhatsApp, Sign in, language) |
| Sticky (mobile) | **Book free trial** · WhatsApp. Appears after the hero; hidden over the footer and on the booking pages |
| Footer | Learn · Academy (incl. Family Portal, Teach with us) · Resources · contact buttons · legal · language |

## 3. Primary journeys

1. **Parent:** Home → "For my child" router card → Ummah Cubs page → *Book* (course and learner prefilled) → wizard → thank-you → WhatsApp.
2. **Adult with a goal:** Home → goal link (e.g. "Perfect my Tajweed") → track page → *Book* (course prefilled) → wizard.
3. **Undecided:** Any page → *Find my level* → 8 questions → instant result → *Book with this plan* (course and level prefilled).
4. **Price-led:** Pricing → plan finder (length × frequency) → *Start with 2 free sessions* (plan prefilled).
5. **Teacher-led:** Teachers → *Book with Omneya* (teacher prefilled).
6. **Content-led (SEO):** Article → in-article CTA for its track → track page or booking.

Every entry point carries context into the booking wizard through query parameters (`course`, `plan`, `teacher`, `level`, `learner`). That context reaches staff in the WhatsApp message or webhook payload, so nobody has to ask twice.

## 4. Page blueprints

### Home (10 sections, about 7,900 px on desktop vs 13,500 px in v1)

1. **Hero.** Promise ("The Qur'an, taught the way it was transmitted"), a single primary CTA, a secondary "Find my level", three reassurances, and the arch visual with live UI cards.
2. **Proof strip.** One consistent set of four client figures.
3. **Router.** "Who's learning?": a child card, or five goal links for adults, plus the placement test.
4. **Why (bento).** Verified Sanad (night tile with the chain), Itqan, safety, time zones, price.
5. **After you book.** A classroom mockup plus a 4-step timeline.
6. **Tracks.** 4 cards with "from" prices.
7. **Stories.** A rail of 5 testimonials with result chips (no duplicates).
8. **Pricing teaser.** A 30/60 tab switch with three plans each and per-session prices.
9. **FAQ.** Six objections, with a sticky heading.
10. **CTA.** A night panel.

Removed from v1:

- The duplicate stats band.
- The impact panel (folded into the proof strip).
- The comparison table (moved to About).
- The Hall of Fame.
- The "ICESCO/GDPR" badges.
- The SEO "Welcome" block.
- The inline Arabic sub-lines.

### Track template (5 pages)

Hero with breadcrumbs, H1, lede, Book and Find-my-level CTAs, and an **at-a-glance card** (format, levels, audience, curriculum, from-price) → stages or course cards → "How lessons work" (3) → teacher spotlight + Sanad chain + one story → recommended plans (3) → merged FAQ (8) → related reading → CTA.

### Booking (`/contact/`)

Intro → **wizard** → reassurance (what you get, direct contact) → what happens next (3) → trial FAQ. On mobile the form sits directly under the H1.

### Pricing

Hero → **plan finder** → all plans grouped by session length → what every plan includes → payment methods → pricing FAQ → CTA.

## 5. Content guidelines (voice and tone)

- **Calm and specific.** Name the mechanism (Ijazah, Sanad, Itqan, 30-minute sessions) instead of adjectives.
- **One claim per section, with proof.** No superlatives in our own voice; customers may supply them.
- **Honest states.** "Coming soon" where it applies; recordings "on request"; the booking hand-off says whether a request has been received.
- **English:** British spelling for diaspora markets (memorise, programme). **Arabic:** warm Modern Standard Arabic, never colloquial. The italic serif accent becomes a colour accent.
