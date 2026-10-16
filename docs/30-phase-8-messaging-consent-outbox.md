# Phase 8.1 — consent-gated messaging and manual outbox integrity

**Status:** Initial implementation slice on `phase-8/messaging-consent-outbox`; CI verification pending.
**Scope:** Message consent, draft generation, manual-send lifecycle, delivery evidence, retries and auditability.
**Non-goal:** This does not connect a WhatsApp provider and does not send messages automatically.

## Implemented

- Guardian WhatsApp consent has explicit `unknown`, `opted_in`, and `opted_out` states with source, timestamp, actor, and reason.
- Guardian self-service can change only their own preference. Admin/ops opt-in records require a signed form or recorded verbal consent; a generic support request cannot establish opt-in.
- Unknown consent is the default for legacy/demo records. Draft generation does not create a send link for unknown consent. Opted-out recipients are excluded; opting out cancels unsent outbox items and clears links.
- Updating a phone refreshes pending drafts, while the academy's own WhatsApp sender number remains prohibited as a recipient.
- The manual lifecycle is explicit: `needs_consent`, `needs_phone`, `queued`, `opened`, `attempted`, `sent`, `failed`, `delivered`, `cancelled`.
- Only documented state transitions are accepted. Failed attempts can be retried; each transition appends actor, time, prior/next status and reason.
- `sent` does not mean delivered. `delivered` requires recorded evidence, and only then is `deliveryConfirmed` true.
- API route and domain tests cover consent gating, opt-out cancellation, state transitions, evidence requirement, attempt history and guardian ownership.

## Safety and business gates still open

- No provider integration, sending credentials, webhooks, provider signature validation, delivery callbacks, automated retry worker, rate controls or provider outage handling exists.
- The outbox remains a manual draft workflow. Staff must use the approved external process; this code does not open or send WhatsApp on its own.
- Business/legal must approve consent language, valid evidence sources, record retention, communication windows, locale/template approval, child-related messaging policy and applicable jurisdiction requirements before production.
- Consent metadata must be included in the production database migration and protected by transactional uniqueness/retention policy before real records are migrated.
- Full role-by-role browser QA, provider integration tests, operational alerts and successful CI are required before MSG-001/MSG-002 can be ACCEPTED.

## Verification commands

```sh
npm run test:portal
npm test
npm run build
```

Do not treat the presence of an outbox row, a WhatsApp URL, or a manual `sent` state as proof of consent or delivery. No live messages were sent by this implementation.
