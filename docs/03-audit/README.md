# 03 · Fresh-eyes audit of v1 — consolidated findings

> Method: walked the v1 build as a first-time visitor on a 390 px phone and a 1440 px desktop, wearing each team hat separately. Then cross-checked against the live-site inventory (`01-discovery/live-site-inventory.md`) and the competitive research.
>
> Severity: **P0** blocks launch · **P1** hurts conversion or trust materially · **P2** quality and polish · **P3** nice to have.

| # | Finding | Hat | Sev | Decision (v2) |
|---|---|---|---|---|
| A1 | Value proposition is generic ("Learn Islam. Live It. Grow With It."). Nothing says *who* it is for, *how* it works or *why this academy* in the first screen. | Business / Marketing | P1 | Rewrite the hero around the real differentiator: Qur'an taught **with a verified Sanad**, live 1-on-1, any time zone, 2 free sessions. |
| A2 | Homepage = 15 sections, ~20,700 px on mobile. The same 5 claims (Al-Azhar, 1-on-1, flexible, female teachers, certificates) repeat 8–10 times. | Marketing / UX | P1 | Cut to 10 purposeful sections; one claim per section, each with proof. |
| A3 | Three competing primary CTAs (Explore courses, Placement test, Book trial) plus WhatsApp everywhere. | UX / Growth | P1 | One primary CTA ("Book 2 free sessions"), one secondary ("Find my level"), WhatsApp as a persistent tertiary option. |
| A4 | No audience routing: parents of 5–14-year-olds (the biggest segment) and adult learners get the same page. | UX / Business | P1 | Add a "Who is learning?" router right after the hero. |
| A5 | Contradictory or unverifiable claims: 100+ scholars vs "3 Ijazah-holding scholars"; 95% vs 85% satisfaction; "ICESCO Aligned", "GDPR Compliant"; recordings promised but "coming soon". | Business / Legal | P0 | Remove accreditation-style badges and conflicting metrics. Reconcile the teachers page ("department leads"). Mark portal features honestly. List all claims on the launch checklist. |
| A6 | 7 pricing plans with opaque names; "Consistent" and "Deen" are identical ($59, 16 sessions). Per-session value is hidden on the home page. | Business / UX | P1 | Plan finder (session length × frequency). Merge Deen into Consistent as a subject choice. Show per-session price. |
| A7 | Booking form front-loads 5 required fields including selects; on mobile it sits below 6 sections of the contact page. | UX / Growth | P1 | 3-step booking wizard (who/what → when → contact) at the top of `/contact/`, with tap-friendly tiles, timezone auto-detect and country auto-guess. |
| A8 | Placement test asks the user to self-rate their level *before* testing it, and gates the result behind a WhatsApp number. | UX / Ethics | P1 | Remove both. Show results instantly; sharing on WhatsApp becomes optional; "Book with this recommendation" pre-fills booking. |
| A9 | Inline Arabic sub-lines on English pages: visual noise, slower pages (Arabic fonts load on every page), and still no real Arabic experience. | Marketing / Eng | P1 | Clean English pages plus a proper **Arabic (RTL) version** of the core pages at `/ar/`, with a language switch and hreflang. |
| A10 | Track pages are inconsistent: the Recitation page uses old filler (8 generic info blocks), and every page has two overlapping FAQ blocks. | Content / Eng | P2 | One track template for all 5 track pages: at-a-glance panel, levels, method, teacher spotlight, pricing, one merged FAQ. |
| A11 | "Card soup": nearly every section is a centred eyebrow + H2 + grid of identical glass cards. | Design | P2 | Vary the rhythm: bento grid, split storytelling, night panels, horizontal story rail, one large proof moment per page. |
| A12 | Hall of Fame (initials only), trust-badge row and bottom "SEO copy" blocks add length without persuasion. | Marketing | P2 | Remove from home. Fold the SEO phrasing into real copy. |
| A13 | No attribution: leads carry no source, medium or campaign. | Growth | P1 | Capture UTM, referrer and landing page on first visit; attach them to the lead webhook payload. |
| A14 | Mobile has no persistent way to act after the hero. | UX | P2 | Sticky bottom action bar (Book · WhatsApp) after the hero; it hides near the footer and on the booking page. |
| A15 | Contact details inconsistent on the live site (+971 vs +20, .net vs .com). | Business | P0 | Single source of truth (`src/data/site.ts`). Business must confirm the canonical number. |
| A16 | Teacher "photos" are monograms; testimonials have no avatars. | Design / Business | P2 | Keep the dignified monogram system; request real photos and consent (launch checklist). |
| A17 | Resource downloads point nowhere (PDFs die with WordPress). | Eng | P1 | WhatsApp-request fallback; move PDFs to `/public/downloads/` before launch. |

Detailed write-ups per hat:

- [business.md](business.md): positioning, offer, pricing architecture, trust and risk
- [marketing-content.md](marketing-content.md): message hierarchy, copy, CTA, proof, bilingual
- [ux-flows.md](ux-flows.md): IA, journeys, friction, mobile ergonomics
- [design.md](design.md): rhythm, hierarchy, glass, type, motion
- [analytics.md](analytics.md): funnel, events, KPIs, experiments
- [technical-seo-a11y.md](technical-seo-a11y.md): performance, SEO, accessibility, maintainability
