# 15 · Search launch runbook — day 0 to day 28

> **For:** whoever runs the cut-over (the academy, or the developer on call).
> **Time:** ~40 minutes on day 0, then ~10 minutes a week.
> **Goal:** the five languages get discovered as themselves — not as English duplicates — and a
> technical mistake is visible within days instead of months.
>
> Everything below is a UI walkthrough plus repository commands. Nothing here needs code
> changes. Business gates (accounts, the domain, a Google login the academy owns) are marked
> **[academy]**.

---

## 0 · What is already in place

| Piece | Where | State |
|---|---|---|
| Sitemap with hreflang for all five languages (189 URLs) | `/sitemap-index.xml`, built by `scripts/sitemap-hreflang.mjs` | ✅ checked on every build (`npm run check:sitemap`) |
| `robots.txt`: everything allowed except `/admin/` | `public/robots.txt` | ✅ |
| Preview deployments return `X-Robots-Tag: noindex` | `vercel.json` | ✅ so previews never compete with production |
| `/admin/` is `noindex, nofollow` and unlisted | `vercel.json`, `public/robots.txt` | ✅ |
| Social cards for 184 pages (WhatsApp-safe, < 150 KB) | `/og/*.jpg` | ✅ |
| Canonical + `og:locale` + hreflang on every page | `src/layouts/BaseLayout.astro` | ✅ |
| Structured data: Organization, Course, FAQ, BlogPosting… | every page | ✅ 379 blocks, 0 errors |
| IndexNow key file | `public/<32 hex>.txt` | ✅ |
| 14 legacy URLs redirect permanently | `vercel.json` | ✅ |
| Search-engine verification meta tags (only when set) | `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_BING_SITE_VERIFICATION` | ⬜ needs tokens **[academy]** |

---

## 1 · Day 0, before the DNS switch (30 minutes)

### 1.1 Own the property
1. **Google Search Console** → *Add property* → **Domain** (not URL prefix). **[academy]**
2. It asks for a **DNS TXT record**. Copy it into the DNS panel of `ummahacademy.net`.
   - **Prefer DNS.** It covers `www`, the apex and every future sub-domain, and it survives a re-deploy.
   - Only if the DNS panel is not reachable: choose the *URL prefix* property and set the token in Vercel as `PUBLIC_GOOGLE_SITE_VERIFICATION`. The site then adds the meta tag to the home page. Same for `PUBLIC_BING_SITE_VERIFICATION`.
3. Wait for *Verified* before continuing.

### 1.2 Confirm the ground is clean (2 minutes, no login needed)

```bash
npm run build            # 195 pages
npm run verify           # links, i18n, JSON-LD, sitemap
curl -s https://ummahacademy.net/robots.txt
curl -s https://ummahacademy.net/sitemap-index.xml | head -5
```

- `robots.txt` must show `Sitemap: https://ummahacademy.net/sitemap-index.xml`.
- The sitemap index must list five `sitemap-N.xml` files (one per language).
- No `noindex` page may appear in the sitemap — the build checks this, so a green `verify` is proof.

### 1.3 Prepare IndexNow (needs the new site live — so this waits for §2)

```bash
npm run indexnow -- --dry-run      # prints the payload, sends nothing
```

The script refuses to send until `https://ummahacademy.net/<key>.txt` serves the key, which is
exactly the right behaviour: it cannot fire against the old WordPress site. On a fresh clone,
the key file is already in `public/`.

### 1.4 Tell the team
The **301s in `vercel.json`** cover 14 known legacy URLs. Ask the academy for the top 10 old
URLs from WordPress analytics and add one line per URL to `vercel.json` if any of them is not
covered. **[academy]** — one line, then the deploy.

---

## 2 · Day 0, cut-over day (20 minutes)

1. **DNS:** apex and `www` → Vercel. Keep WordPress online on the portal sub-domain.
2. **Smoke test the redirects and the money path** (the full device pass is `docs/17-device-qa-protocol.md`):

```bash
for u in /login/ /my-account/ /careers/ /home/ /feed/ /category/islam /2025/anything; do
  printf '%-22s ' "$u"; curl -s -o /dev/null -w '%{http_code} → %{redirect_url}\n' "https://ummahacademy.net$u"
done
curl -s https://ummahacademy.net/pricing/ | grep -c 'application/ld+json'   # structured data survived
```

3. **Search Console → Sitemaps →** submit `sitemap-index.xml`. Status should move to *Success* within a day; if it says *Couldn't fetch*, re-check `robots.txt` before doing anything else.
4. **Bing Webmaster Tools →** *Import from Google Search Console* (one click, keeps the verification). **[academy]**
5. **IndexNow, launch day:**

```bash
npm run indexnow -- --all         # every URL in the sitemap, once
```

6. **Request indexing for the ten pages that matter** (Google Search Console → *URL Inspection* → *Request indexing*), one per language where it makes sense: home, pricing, `/courses/`, the four track pages, `/contact/`, the three strongest articles. Bing picks these up from the IndexNow call automatically.
7. **Analytics** (if not on yet): set `PUBLIC_PLAUSIBLE_DOMAIN` or `PUBLIC_GTM_ID` in Vercel. Nothing else is needed; every event already carries the page language. **[academy]**

---

## 3 · Days 1–7 (10 minutes a day, then twice a week)

| Check | Where | What "good" looks like |
|---|---|---|
| Pages indexed | Search Console → *Pages* | The number climbs from 0; "Discovered – currently not indexed" is normal in week 1 |
| Sitemap status | *Sitemaps* | Success · 189 discovered |
| 404s | *Pages → Not found (404)* | A short list of genuinely deleted URLs, all of which 301 correctly — not thousands |
| Rich results | *Enhancements* | FAQ, Courses, Breadcrumbs, Articles: 0 errors, warnings only where Google is cautious |
| Core Web Vitals | *Experience* | No field data yet at this traffic — ignore until it appears, then aim for "Good" |
| Language variants | *Pages →* filter `/de/`, `/fr/`, `/it/` | All five locales appear; no locale is stuck at zero while others grow |

Also run the on-device smoke test once after the first deploy: booking on an iPhone and an
Android (`docs/17-device-qa-protocol.md` §4, minutes 14–20).

---

## 4 · Weeks 2–4 (30 minutes a week)

1. **Per-language KPIs** — compare *Performance → Queries* filtered to `/de/`, `/fr/`, `/it/`, `/ar/`, `/`:
   - impressions per language (is the language being discovered at all?);
   - clicks, CTR and average position for the money pages (`pricing`, each track page);
   - the top query per language. If German queries arrive and German pages do not, the problem is usually the *content*, not the setup — the technical layer is already proven.
2. **404 review.** Add a redirect to `vercel.json` for anything with real traffic; leave the rest for the 404 page (which offers WhatsApp and search).
3. **301 checks.** Re-run the loop in §2.2 after any redirect change.
4. **Coverage hygiene.** *URL Inspection* → *Test live URL* on one page per language. It must show *URL is available to Google* and the correct canonical.
5. **Backlinks.** Search Console → *Links*. The academy's existing profiles (Facebook, Instagram, YouTube, WhatsApp Business) should link to the new domain, not the old one. **[academy]**

---

## 5 · Day 28 — the review

Answer these five questions in the Linear issue (ABO-42 gets the device part, the search
follow-ups get their own comment):

1. How many of the 189 URLs are indexed? Any systematic gap (one language, one page type)?
2. Which queries already bring impressions — do they match the pages that were written for them?
3. Is any locale invisible (zero impressions)? If yes: is it a coverage problem (look at *Pages*) or a demand problem (no one searching in that language yet)?
4. Are the money pages in the top 20 for their brand + course queries?
5. What did the 404 report cost us — any old URL that mattered?

Then set the next review 30 days out. Search is a compound effect: the technical work is done
by day 28; the content work continues.

---

## 6 · When something goes wrong

| Symptom | Most likely cause | Fix |
|---|---|---|
| *Couldn't fetch* the sitemap | `robots.txt` blocks it, or DNS is not pointing at Vercel yet | `curl` both URLs; fix DNS first |
| Pages indexed: "Alternate page with proper canonical tag" | Correct behaviour for hreflang clusters | Nothing — verify the canonical on one page per language |
| "Crawled – currently not indexed" for many pages | Normal for a new site with little demand | Continue with content; do not re-submit in bulk |
| Zero impressions for one language | Not enough content in that language, or queries nobody makes yet | Content decision, not a technical one. `docs/11-i18n-glossary.md` has the register rules |
| Rich result errors on FAQ | An answer without text, or a question repeated | Fix in the CMS (`docs/16-cms-guide.md`), the build validates fields |
| WhatsApp shows no preview | An `og:image` over ~300 KB, or WhatsApp's week-long cache | `npm run check:cards` shows the size; the check is part of QA for this reason |
| IndexNow returns 403/422 | The key file is missing on the live domain, or the URL is not on that host | `curl https://ummahacademy.net/<key>.txt`; the script already refuses to send otherwise |
| The site suddenly 404s everything | A deploy failed and the previous version was replaced by nothing | Vercel → *Deployments* → roll back to the last good one (the link is in the deploy log) |

---

## 7 · What is deliberately *not* done

- **No language redirects / no geo-IP redirects.** They break shared links and hreflang. The in-page language hint does that job.
- **No `hreflang` for `x-default` beyond the English default** — English is already the default and is declared as such.
- **No paid indexing services, no link schemes.** The API budget is zero.
- **No analytics beyond Plausible or GTM + Consent Mode v2.** Nothing loads before the visitor allows it.
