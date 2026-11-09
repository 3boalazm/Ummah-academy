# Editorial UI refresh — first site-wide implementation

The `public/pics` folder is a mixed reference board, not a single licensed UI kit. This change applies its recurring **visual** motifs, not just its content ideas: framed editorial hero (02/07/29), restrained stacked cards (05/10/41), compact metadata chips (15/42), strong dark closing surfaces (19/22/23), a readable journey (06/18/53), and stronger type hierarchy (20/26). The reference images themselves are not published as site assets.

## Scope shipped

- New public-site visual layer `src/styles/editorial-refresh.css`, imported by the shared `BaseLayout`: neutral paper canvas, quieter ambient light, firmer card outlines, varied restrained accents, squarer buttons/chips, framed mastheads, stronger hero and CTA/footer contrast. Light/dark, RTL, mobile and reduced-motion rules included. This covers all public pages using the shared layout, not the separate operations portal.
- Applied to shared hero, header, glass, button, chip, cards and footer, with existing copy and routes preserved.
- `LearningPath` on all five course pages uses real editorial copy and two separate choices; it is explicitly not a live progress widget.

## Boundaries and next QA gate

This is a broad visual foundation, **not** a claim that every one of 64 conflicting references has been copied or that every route has received individual art direction. The portal's operational UI needs its own design and access-control review before changing it. No third-party screenshots, faces, partner logos, made-up outcomes or unlicensed art were added. Before production sign-off: inspect representative page templates on real phones and keyboard/screen readers, and collect owner feedback on the new art direction. Automated build, link/i18n/SEO/CSS gates pass.

## Follow-up visual pass

- Reworked the home audience choice, benefits bento, proof strip, price teaser and floating hero cards into the same restrained framed-card language; gave course navigation/chooser, pricing finder/offers, article filters/cards, and teacher cards/sanad panel distinct but coordinated treatments. This is implemented via shared and template-class selectors rather than copying third-party image files.
- Removed the fabricated “68% progress / lesson 12 of 18” and fixed countdown/time from the homepage floating cards across all five languages. These decorative cards now state the academy's offer without implying a real learner record or upcoming appointment.
- Full static build, 20,215 internal-link check, i18n, OG cards, CMS, CSS-prefix/SEO/schema/sitemap checks and 166 automated tests passed. Browser/device visual QA remains outstanding here because this workspace does not have Chrome/Chromium installed.

The editorial learning-path copy now also has a unit gate for all five languages and rejects synthetic percentage claims. Decorative home cards deliberately no longer show a fake lesson number, progress percentage, countdown or time; the live-lesson marker is static, not a live status indicator.

## Final pre-PR pass

- Added a small language-aware sequence number to the three `NextSteps` choices so the shared resource/blog/FAQ cards have the same editorial card rhythm. The choices remain independent, not a required sequence.
- Removed a mobile maximum-width rule on decorative home cards that could compress longer French/German labels unnecessarily.
- Re-ran `npm run build`, `npm run verify`, `npm run check:cards`, `npm run check:cms`, `npm run check:css`, and `npm test`: all passed (166 portal tests; 8 unit test groups). Browser screenshot/axe/overflow suites could not run here because Chrome/Chromium is not installed; this is an outstanding PR review gate, not a claimed pass.
