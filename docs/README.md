# Documentation index

| # | Document | What it covers |
|---|---|---|
| — | [REPORT.md](REPORT.md) | **Final report (Arabic)**: everything that was done, decisions, numbers, what's needed from the business |
| 00 | [00-workflow-plan.md](00-workflow-plan.md) | The operating plan written before any code: phases, research method, team hats, quality gates, risks |
| 01 | [01-discovery/live-site-inventory.md](01-discovery/live-site-inventory.md) | Crawl of ummahacademy.net: URL map, business facts, 15 inconsistencies found |
| 01 | [01-discovery/competitive-research.md](01-discovery/competitive-research.md) | Competitors, published prices, table stakes vs differentiators (sourced) |
| 01 | [01-discovery/design-research.md](01-discovery/design-research.md) | Liquid Glass and glassmorphism research, accessibility rules, the "Sakinah Glass" language |
| 02 | [02-v1-conversion.md](02-v1-conversion.md) | Phase 1: the faithful native conversion, deliberate fidelity, unavoidable deviations |
| 03 | [03-audit/README.md](03-audit/README.md) | Phase 2 fresh-eyes audit: 17 prioritised findings |
| 03 | [business](03-audit/business.md) · [marketing & content](03-audit/marketing-content.md) · [UX & flows](03-audit/ux-flows.md) · [design](03-audit/design.md) · [analytics](03-audit/analytics.md) · [tech, SEO & a11y](03-audit/technical-seo-a11y.md) | One audit per team hat |
| 04 | [04-strategy/ia-and-blueprints.md](04-strategy/ia-and-blueprints.md) | v2 sitemap, navigation, journeys, page blueprints, voice and tone |
| 04 | [04-strategy/seo-plan.md](04-strategy/seo-plan.md) | Migration safety, keyword map, structured data, content roadmap |
| 04 | [04-strategy/design-system.md](04-strategy/design-system.md) | Tokens, surfaces, components, patterns, accessibility rules |
| 05 | [05-qa-report.md](05-qa-report.md) | Build, links, axe, overflow, flows, performance, limitations. §6 covers Phase 3; §7 covers the five languages |
| 06 | [06-launch-checklist.md](06-launch-checklist.md) | Business confirmations and technical cut-over steps. §C has the five-language gates (Impressum, teaching language, native review) |
| 07 | [07-v2-changelog.md](07-v2-changelog.md) | Every v2 change mapped to an audit finding |
| 08 | [08-phase3-plan.md](08-phase3-plan.md) | Phase 3 plan (after "كمل"): close every gap that doesn't need a business decision |
| 09 | [09-phase3-changelog.md](09-phase3-changelog.md) | Phase 3 delivery: Arabic blog and parity, teacher profiles, 6 PDFs, analytics switch, Lighthouse |
| 10 | [10-phase4-i18n-plan.md](10-phase4-i18n-plan.md) | Phase 4 plan (German, French, Italian), written before code: market terminology, EU legal notes, typography, architecture, workstreams, gates |
| 11 | [11-i18n-glossary.md](11-i18n-glossary.md) | DE/FR/IT voice and register, untranslated names, Islamic and UI terms, honesty rules, and the EN → DE/FR/IT article slug map |
| 12 | [12-phase4-changelog.md](12-phase4-changelog.md) | Phase 4 delivery: the i18n engine, language menu and hint, 23 routes and 19 articles in each of DE/FR/IT (57 article translations), QA, bugs fixed, business gates (with screenshots) |
| 13 | [13-phase5-plan.md](13-phase5-plan.md) | Phase 5 plan (after "كمل"): the layer that lets the academy run the site without a developer — QA in the repo, social cards, CMS, search launch kit, device readiness |
| 14 | [14-phase5-changelog.md](14-phase5-changelog.md) | Phase 5 delivery: the QA bar moved into the repo (12 browser suites + CI), a social card for every page, the Sveltia CMS and one source of truth for prices, the search launch kit, touch/device readiness — plus the numbers and the four bugs those gates found |
| 15 | [15-search-launch-runbook.md](15-search-launch-runbook.md) | Day 0 → day 28 in search: property verification, sitemap and hreflang, IndexNow, per-language KPIs, redirect checks, and what to do when something goes wrong |
| 16 | [16-cms-guide.md](16-cms-guide.md) | The editor guide (Arabic + English): how to sign in, what each collection edits, the draft → preview → publish journey, the price tokens, and how to read a failed build |
| 17 | [17-device-qa-protocol.md](17-device-qa-protocol.md) | The tests an emulator cannot pass: a 30-minute real-device script (install, panels, dark mode, booking, offline, Arabic), screen-reader protocols for VoiceOver/TalkBack/NVDA, and the results table for ABO-42 |
| 18 | [18-dark-mode-and-installable-app.md](18-dark-mode-and-installable-app.md) | Light ⇄ dark for the whole design system, installable as an app (manifest, icons, service worker, bottom-left pill), and the heaviest layout sweep in the repo (20 widths × 194 pages) with the three bugs it found and fixed |
| 19 | [19-operations-audit.md](19-operations-audit.md) | Operations audit of students, families and teachers: what the marketing repo actually had, the portal that now exists, permissions, ledger rules, and what is still not production |
| 20 | [20-phase-0-baseline.md](20-phase-0-baseline.md) | Phase 0 source-based baseline: repo/deployment split, portal architecture, blockers, risk register, business decisions, and Phase 0 exit criteria |
| 21 | [21-requirements-ledger.md](21-requirements-ledger.md) | Requirements and acceptance ledger with stable IDs, statuses, priorities, and test/evidence requirements across the academy operating system |
| 22 | [22-phase-0-route-inventory.md](22-phase-0-route-inventory.md) | Source-based inventory of portal HTTP routes and the authorization, record-scope, state-transition, and negative-test acceptance still required |
| 23 | [23-portal-phase-2-domain-model.md](23-portal-phase-2-domain-model.md) | Operations portal Phase 2: domain relationship contract, synthetic-seed integrity tests, and remaining acceptance gates |
| 24 | [24-portal-phase-3-authorization-minimization.md](24-portal-phase-3-authorization-minimization.md) | Operations portal Phase 3: role-specific teacher directory projections and privacy regression tests |
| 26 | [26-phase-5-scheduling-integrity.md](26-phase-5-scheduling-integrity.md) | Phase 5 scheduling integrity: recurring-series atomicity, duration/time-zone validation, tests, and remaining teacher/scheduling acceptance gates |
| 27 | [27-phase-5-reschedule-history.md](27-phase-5-reschedule-history.md) | Phase 5 reschedule history: multi-step chain preservation, conflict rollback, and remaining route/time-zone acceptance gates |
| 29 | [29-phase-7-subscription-credit-idempotency.md](29-phase-7-subscription-credit-idempotency.md) | Phase 7.1: API idempotency route scoping, credit/payment baseline, acceptance gates and remaining business decisions |
| 30 | [30-phase-8-messaging-consent-outbox.md](30-phase-8-messaging-consent-outbox.md) | Phase 8.1: consent-gated manual outbox, append-only send attempts, delivery evidence and provider/legal gates |
| 31 | [31-phase-9-production-readiness.md](31-phase-9-production-readiness.md) | Phase 9: production readiness validation, regression gates, and evidence-based no-go decision |
| 32 | [32-phase-10-observability-operations.md](32-phase-10-observability-operations.md) | Phase 10: request correlation, privacy-safe structured logs, and runtime operations gates |
| 33 | [33-phase-11-backup-restore-rehearsal.md](33-phase-11-backup-restore-rehearsal.md) | Phase 11: verified local backup creation, safe overwrite refusal, and restore-candidate validation |
| 34 | [34-phase-12-health-readiness.md](34-phase-12-health-readiness.md) | Phase 12: privacy-safe readiness checks and operational health endpoint |
| 35 | [35-phase-13-graceful-shutdown.md](35-phase-13-graceful-shutdown.md) | Phase 13: bounded graceful shutdown, signal handling and operational limits |
