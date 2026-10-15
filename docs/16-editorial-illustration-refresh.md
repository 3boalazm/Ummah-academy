# Editorial illustration and learner journey refresh

Date: 2026-10-15

## Visual direction

Extended the approved restrained editorial illustration style with four distinct scenes: school-age Quran learners, teenage Arabic learners, a parent reading with children, and an adult online teacher. Natural proportions, warm ivory, muted lavender, sage and walnut keep it welcoming without a toddler-cartoon feel. The earlier adult-learning and kids-learning illustrations remain in use.

The new artwork appears through shared templates in all five website languages:

- Quran, Arabic and Islamic studies programme cards and course pages.
- Topic-specific blog covers, related-post cards and article headers.
- About page and desktop contact-page sidebar.
- Illustrated next-step choices after blog listings, resources and FAQs.

Artwork is decorative with empty alt text; real translated headings and links carry the information. These scenes are not actual students, teachers, testimonials or classroom software. Existing teacher portraits and testimonials were not replaced or altered. No text is baked into the artwork. WebP masters are 85–147 KB, with responsive Astro derivatives, dimensions and lazy loading. The existing homepage hero retains eager/high-priority loading.

## Journey and wording

- Homepage: introduction → learner choice → programmes → teaching approach → trial steps → stories → pricing → FAQs → booking. Programmes now appear before the long explanation of the method.
- Blog/resources/FAQ: replace the closing booking-only CTA with three clear choices: explore courses, check level, or book a trial. This is a shared component with complete EN/AR/DE/FR/IT copy and localized destination links.
- Mobile: next-step cards use compact side-by-side artwork; the booking form remains ahead of the contact-page illustration, which is hidden at narrow widths.
- Refined primary English and Arabic copy for the homepage, courses, contact and resources, plus the Arabic About introduction. More direct learner-focused headings, less repetition, clearer explanations of booking and downloads. Removed the fixed two-hour response promise from the revised EN/AR homepage/contact copy rather than adding new operational promises.
- Added keyboard focus to horizontally overflowing tables while they need scrolling, preserving existing authored tab stops. This fixes two issues found by the accessibility pass on About and an Arabic article.

## Validation

- `npm run qa`: passed; 197 generated HTML pages, 190 indexable pages, 17,762 internal links without broken links, all existing static checks, and 7 unit-test groups.
- Browser overflow checks: 116 distinct pages × 4 viewport widths (320, 390, 768, 1280) = 464 page/width checks, zero failures. Includes relevant programme, content, About and contact routes in all five languages, plus all five homepages checked separately.
- axe checks on the same 116 pages at 320px: zero failures.
- Browser conversion flows in all five languages: 15 flows passed, covering booking, placement, and the new next-step navigation choices. Next-step tests click all three choices and verify localized destination URLs and headings.
- Inspected Arabic desktop homepage and Arabic mobile next-step screenshots locally. Browser test downloads and scratch screenshots are outside Git; no browser dependency was added to package.json.

The static build is ready for normal deployment. Local preview is not evidence that production has been deployed.
