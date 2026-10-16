# Search & AI discovery launch runbook

Updated: 2026-10-15. Production canonical origin: https://ummahacademy.net.

## Scope and limits

No legitimate implementation can guarantee first position on Google or a recommendation from every AI model. Crawling, indexing, ranking and citations are separate decisions made by external services. `llms.txt` is an experimental discovery convention, not a Google requirement, crawler permission file, training instruction, endorsement or ranking guarantee. Public HTML remains the primary source.

This checkout already had static HTML, canonicals, five-language hreflang, sitemap parity checks, RSS, teacher profiles, course/article schema, social cards and configurable search verification. This change extends those foundations rather than replacing them.

## Shipped in this change

- Stable organization → localized WebSite → canonical WebPage relationships in JSON-LD; articles get stable IDs linked to their page.
- Large image preview permission on indexable pages; existing noindex pages retain noindex.
- `/llms.txt` generated at build time from academy facts and the complete published article inventory in all five languages. Linked from page heads; no invented social profiles, ratings or endorsements.
- An original Arabic guide for adult beginners choosing online Tajweed lessons, with relevant programme, teacher, qualification, pricing and booking links. No guaranteed learning timeline.
- `npm run check:seo` validates indexable-page titles, descriptions, H1 count, production canonicals, linked schema identities, crawler discovery and every link in the generated overview. Included in `verify` (therefore Vercel builds and CI).

## Launch steps requiring the site owner

1. **Deploy first:** merge/deploy through the normal repository workflow. A commit or push alone is not proof that these changes are on the production domain. Confirm root, `/ar/`, the new article, `/llms.txt`, `/robots.txt`, `/sitemap-index.xml` and representative course pages return HTTP 200 publicly. Ensure CDN/firewall/bot challenges do not block genuine search crawlers. Do not whitelist arbitrary user-agent strings as an authentication mechanism.
2. **Google Search Console:** add a Domain property for `ummahacademy.net`, verify using the DNS TXT value supplied by Google. Alternatively set `PUBLIC_GOOGLE_SITE_VERIFICATION` to the supplied meta token and redeploy. Never put account passwords or private API credentials in these public variables.
3. Submit `https://ummahacademy.net/sitemap-index.xml`. Inspect the English and Arabic home pages, important course pages and the new article. Request indexing of representative priority URLs; this does not force indexing. Check Google's selected canonical and rendered HTML.
4. **Bing Webmaster Tools:** verify the same domain (DNS or `PUBLIC_BING_SITE_VERIFICATION`) and submit the sitemap. The existing `npm run indexnow` is optional: review its configuration and submit only real changed production URLs after deployment. It is not Google indexing submission.
5. Confirm the public email, teacher credentials and all advertised qualifications with the academy. Add real legal identity and genuine public profiles only once verified. Never publish fabricated reviews, affiliation, student counts, address, accreditations or `sameAs` links.
6. Configure existing Plausible or consent-aware GTM analytics, if wanted. Measure completed trial requests, not only CTA clicks. Keep consent requirements and personal-data handling in place.

No Search Console/Bing submission, production deployment, live indexing audit or account configuration is claimed by this repository change. Access to those accounts and unrestricted production network access were not available for this task.

## First 90 days: reach interested families, not generic traffic

### Days 1–14: baseline and indexing

- Record Search Console impressions, clicks, CTR, average position and indexed pages, split by country, language, device, query and landing page. Record qualified trials and trial-to-paid conversion separately.
- Start with intent clusters: online Quran classes for kids, Quran/Tajweed for adult beginners, Quran memorization, Quranic Arabic, Islamic studies for children. Arabic examples: `تعليم القرآن أونلاين للأطفال`, `تعلم التجويد للكبار`, `تحفيظ القرآن عن بعد`. These are hypotheses to validate against actual Search Console data, not researched search-volume claims.
- Map each intent to one primary course page; avoid near-duplicate pages aimed at slight keyword variations or cities where there is no real local presence.
- Review excluded URLs, accidental noindex, server errors, alternate canonicals and sitemap fetching before writing more content. Keep staging noindex and production indexable.

### Days 15–45: helpful content and trust

- Interview teachers and parents about actual questions. Publish one useful, reviewed guide weekly where there is a genuine gap: initial reading assessment, practice between classes, Hifz revision, choosing a teacher, schedules across time zones.
- Give a direct answer near the start, practical steps and honest limitations. Link to the relevant programme and the next useful guide without stuffing keywords.
- Have a qualified teacher review religious/teaching claims. Credit a real named reviewer and profile only with permission and actual review. Change `updated` only when content materially changes.
- Improve course copy using real search queries and admission objections. Explain prerequisites, age suitability, lesson format, teaching languages and current terms. Do not claim that all five website languages are teaching languages.
- Seek permission-based mentions from relevant community organizations, parent resources and partner educators. Do not buy link farms, mass-submit directory spam, manufacture reviews or scrape competitors' articles.

### Days 46–90: evaluate and iterate

- Compare 28-day windows for non-brand search clicks, impressions, CTR and qualified trial conversion. Note seasonality and deployment dates. Average position alone is not a business KPI.
- For pages with impressions but low CTR, test accurate titles/descriptions aligned with intent. For pages receiving clicks but few qualified trials, improve the offer explanation and booking flow.
- Track AI referrals when a referrer exists. Keep a small fixed monthly set of real user questions and manually record date, service, response and whether a source link is present. Responses vary by model, location and session; a single answer is not evidence of broad ranking.
- Consolidate overlapping content rather than generating hundreds of thin AI pages. Continue improving proof, clarity and useful answers even when AI referrals are not measurable.

## Local validation

```sh
npm ci
npm run qa
```

`qa` builds the static output and runs link, i18n, JSON-LD, sitemap, SEO, card, CMS, CSS and unit gates. Browser suites are separately available through `npm run qa:browser` and CI. Passing static checks does not replace Google's Rich Results Test, Search Console inspection, live performance testing or monitoring after deployment.
