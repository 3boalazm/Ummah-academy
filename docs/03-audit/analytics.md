# Audit · Analytics & growth

## 1. State in v1

- A vendor-neutral `track()` shim exists (dataLayer + Plausible) and fires CTA, WhatsApp, placement and form events.
- **Missing:** attribution (UTM/referrer), wizard step events, pricing interactions, language switch, scroll depth, and any defined KPI targets.

## 2. Funnel definition

| Stage | Event(s) | Definition |
|---|---|---|
| Visit | page view | Any session |
| Engaged | `router_select`, `track_card_click`, `scroll_75` | Showed intent beyond the hero |
| Intent | `trial_cta_click`, `placement_start`, `whatsapp_click` | Clicked a conversion path |
| Booking started | `booking_step` (step=1 interaction) | First wizard interaction |
| Booking submitted | `booking_submit` (received=true/false) | Wizard completed |
| Hand-off | `trial_whatsapp_handoff` | Pressed "Send on WhatsApp" on thank-you |
| Confirmed trial | *(offline: CRM)* | Staff confirmed teacher and time |
| Paid | *(offline: billing)* | First paid month |

**North-star:** confirmed trials per week (not form clicks).

## 3. Event dictionary (implemented in v2)

| Event | Properties (no PII) |
|---|---|
| `router_select` | `audience` = child \| self, `goal` |
| `trial_cta_click` | `location` (data-track or path) |
| `whatsapp_click` | `location` |
| `booking_step` | `step` = 1–3, `direction` = next \| back |
| `booking_error` | `step`, `fields` |
| `booking_submit` | `course`, `learner`, `received` |
| `trial_whatsapp_handoff` | `received` |
| `placement_start` / `placement_result` | `track`, `level` |
| `plan_finder_change` | `minutes`, `per_week` |
| `language_switch` | `to` |
| `blog_filter` | `topic` |
| `resource_download` *(Phase 3)* | `resource` = worksheet id |
| `consent_update` *(Phase 3, GTM only)* | `analytics` = granted |
| `language_hint` *(Phase 4)* | `action` = accept \| dismiss, `to` = offered language |

*Phase 4:* **every** event also carries `page_lang` (`en`, `ar`, `de`, `fr` or `it`, from `<html lang>`), so each funnel step can be split by language. `language_switch` fires from the header menu, the phone sheet, the footer row and the article "Also available in" chips. The hint fires `language_hint` instead.

**Attribution:** on the first page view, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`/`fbclid` presence, the referrer and the landing path are stored in `localStorage` (`ua:attr`, first-touch) and attached to the lead webhook payload. They are never added to the WhatsApp text.

## 4. Targets (first 90 days after launch; to calibrate)

| KPI | Baseline | Target |
|---|---|---|
| Visit → booking submitted | unknown (no tracking on WordPress) | 3–5% |
| Booking started → submitted | unknown | ≥ 55% |
| Placement start → result | unknown | ≥ 70% (no gate) |
| Submitted → confirmed trial | unknown (CRM) | ≥ 60% |

## 5. Experiment backlog (after baseline exists)

1. Hero headline: "The Qur'an, taught the way it was transmitted" vs a benefit-led variant ("Read the Qur'an correctly — with a scholar, 1-on-1").
2. Router on/off (measures segment routing value).
3. Booking: 3-step wizard vs single page.
4. Sticky mobile bar vs none.
5. Pricing default: 30 vs 60 minutes pre-selected.

## 6. Tooling recommendation

- **Plausible** (cookieless; no consent banner needed in most jurisdictions) **or** GA4 via GTM with Consent Mode v2 (requires a banner).
- **Microsoft Clarity** for session replay and heatmaps, with masking on.
- Tie the lead webhook into a CRM (HubSpot free, Pipedrive or a Google Sheet to start) so "confirmed trial" and "paid" can be joined back to attribution.
