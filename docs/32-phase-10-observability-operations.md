# Phase 10 — Observability and operational signals

**Status:** Implementation slice; operational deployment wiring remains unverified.
**Branch:** `phase-10/observability-operations`
**Parent:** Phase 9 production-readiness validation.
**Goal:** Give every HTTP request a correlation identifier and emit structured, privacy-minimizing access records without logging request bodies, query strings, cookies, IP addresses, or raw record IDs.

## Implemented

- Every incoming HTTP request receives a random `X-Request-Id` response header.
- The server emits one JSON access record when the response finishes: event, severity, request ID, method, sanitized path, status code and duration.
- HTTP 4xx responses are `warn`; 5xx responses are `error`; other responses are `info`.
- Query strings are removed and identifiers after known record collections are redacted as `:id`.
- No body, authorization/cookie header, IP address, query parameter or record ID is intentionally included in access logs.
- Unit tests cover redaction, status classification and request-record shape; both test entry points include them.

## Operational use

The runtime operator can route JSON stdout to the hosting platform's log collector and search by `requestId` or status. The `X-Request-Id` value can be supplied to support staff without sharing student details. Log access, retention and export must follow the academy's privacy policy.

## Verification and limits

- Require CI on the exact Phase 10 head, including portal consent journey and all marketing browser suites.
- The current health endpoint remains a lightweight process response, not proof of DB connectivity, backup freshness, provider reachability or production readiness.
- No external log vendor, alerting destination, uptime monitor or on-call schedule has been configured; credentials and operator ownership are not available in this repository.
- Phase 9 remains NO-GO for real data until a transactional DB, restore drill, production runtime, secret/bootstrap, session revocation, authorization/CSRF, child privacy and provider gates are evidenced.

## Exit criteria

- [x] Correlation ID response header emitted for requests.
- [x] Structured access log emitted on response completion.
- [x] Record IDs and query strings redacted before logging.
- [x] Unit tests cover the log contract and severity.
- [ ] Latest CI succeeds on the exact head.
- [ ] Runtime owner configures collection, retention, alerts, uptime checks and incident response.
- [ ] Readiness probe checks real dependencies after a production DB/runtime exists.

**Decision:** Phase 10 source slice is reviewable; operational observability is not accepted until runtime collection and alerting are verified. This phase does not authorize production cut-over.
