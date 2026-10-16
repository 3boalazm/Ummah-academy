# 17 · Device QA protocol — the tests an emulator cannot pass

> **Why this file exists.** The browser suites in `qa/` run a real Chrome and measure real
> pixels, but they run on a desktop engine with a fake touchscreen, a fake URL bar and a fake
> keyboard. Those three fakes hide exactly the bugs that a family on an iPhone will meet.
>
> This is the **launch gate for ABO-42**: real devices, real screen readers, real networks.
> An emulator can prove the layout; only a device proves the app.
>
> **Who runs it:** the academy (or a tester) on the phones the families actually use. It needs
> **no developer** and no access to this repository.

---

## 1. What the emulated layer already covers (so you don't repeat it)

| Covered before you pick up a phone | Where |
|---|---|
| 20 viewport widths × 194 pages: nothing overflows, nothing is clipped | `node qa/run.mjs overflow` |
| Header fit at **every** width from 320 to 2560 px × 5 languages | `node qa/run.mjs header` |
| 10 emulated devices: tap targets ≥ 24 px, form fields ≥ 16 px, mega menu **by tap**, effective hit area warnings under 44 × 44 | `node qa/run.mjs touch` |
| Every page: one `h1`, no skipped heading levels, full keyboard walk, visible focus ring | `node qa/run.mjs keyboard` |
| Light ⇄ dark: axe contrast on 10 pages × 5 languages, overflow in both themes | `node qa/run.mjs theme` |
| Installability: manifest, icons, service worker, the bottom-left pill | `node qa/run.mjs pwa` |
| Offline: a visited page (styled) and an unvisited URL both open | `node qa/run.mjs offline` |

Everything below is what is **left** once those are green: the URL bar, the soft keyboard, the
notch, the iOS text engine, the share sheet, and an actual thumb.

## 2. Devices to test (minimum)

| Slot | Suggested | Why it must be in the matrix |
|---|---|---|
| Small iPhone | iPhone SE (2nd/3rd gen) or older iPhone | Smallest screen in use; no notch (safe-area insets differ from the 15) |
| Modern iPhone | iPhone 13 and newer | Notch: `env(safe-area-inset-*)`, iOS Safari's collapsing toolbar, `100dvh` |
| Small Android | Any 360 px Android | Samsung Internet and Chrome Android behave differently |
| Modern Android | Pixel or Galaxy, current Android | Chrome's install prompt (the one the pill listens to) |
| Tablet | iPad (any) | Touch hardware that gets the **desktop** header — the case the mega menu is worst at |
| Desktop | Windows or macOS, Chrome/Safari/Firefox | Hover, keyboard, real screen reader (NVDA) |

If only one device is available: **an iPhone in Safari** finds the most bugs. Add an Android
phone for the install flow.

## 3. Before you start (2 minutes, once per device)

1. Open `https://ummahacademy.net` in the browser you want to test.
2. Turn **Reduce Motion** on if you want to test the motion-free path: iOS *Settings → Accessibility → Motion*, Android *Settings → Accessibility → Remove animations*.
3. Note the device, OS version and browser version — they go in the table in §7.
4. Keep a second browser open with the **production URL of the old site** if the cut-over has
   happened, so the redirects in §4 step 12 can be checked on the device too.

## 4. The 30-minute script

Each step lists what to do, what must happen, and what counts as a bug. **Report every
"what must happen" that does not hold**, with a screenshot.

### Minutes 0–3 · First load (home)
1. Open the home page on mobile data **and** on Wi-Fi. 
   - Must: text appears before the images, no layout jump, no horizontal scrollbar anywhere on the page.
2. Rotate to landscape and back. Must: nothing overlaps, the sticky "Book" bar is still reachable.
3. Scroll down and back up. Must: the sticky mobile CTA appears after the first screen and does **not** cover the footer or a form.

### Minutes 3–6 · The install affordance (the "download as an app" pill)
4. Look at the **bottom-left** corner after ~15 seconds of scrolling (15 s is deliberate: the pill waits for the browser's install event).
   - Must: a small pill with a download icon. In Arabic it is mirrored to the bottom-**right**.
5. Tap it. Must: a card opens *above* the pill (not off-screen), readable in dark mode too.
6. Tap **Install / Add to Home screen**:
   - **Android Chrome** → the browser's install dialog appears.
   - **iOS Safari** → the card shows the *Share → Add to Home Screen* instructions (Safari has no programmatic install).
7. Finish the install. Launch the app from the home screen.
   - Must: it opens **without browser chrome**, with the theme colour bar filled, starting on `/`.
   - Must: the pill is **gone** inside the installed app.
8. Tap a shortcut from the home-screen icon long-press (Courses, Booking, Pricing).
   - Must: each opens the right page.

### Minutes 6–10 · Navigation and panels
9. Tap the menu button. Must: the sheet opens with focus inside, the page behind cannot be scrolled, tapping outside closes it, the back button closes it instead of leaving the page.
10. On a tablet: tap **Courses**. Must: the mega panel opens by tap, fits the screen, every row is tappable, tapping outside closes it.
11. Tap the language switcher → each of the five languages.
    - Must: the URL changes to `/ar/`, `/de/`, `/fr/`, `/it/` and the page stays on the **same** section.
    - Arabic must be **right-to-left**: the header, the sticky bar and the install pill mirror.
12. Redirects (after cut-over): ask someone to open an old URL such as `https://ummahacademy.net/login/` on the device. Must: it lands on the portal or the matching new page, never on a 404.

### Minutes 10–14 · Dark mode
13. *System* dark mode on → reload. Must: the site is dark immediately, **no white flash** at load.
14. Tap the theme switch in the header twice. Must: light → dark → light, and the choice **survives a reload**.
15. On a phone, open the menu sheet: the switch is a labelled row there. Toggle it.
    - Must: the whole site follows — header, cards, forms, the booking wizard, the footer, the install card, and the browser/OS status bar colour.

### Minutes 14–20 · The conversion path (the only one that earns money)
16. Open a course page → tap the main CTA. Must: the booking form is on screen, anchored to `#book`.
17. Complete the wizard with **thumbs and the real keyboard**:
    - radio choices must be one-tap;
    - the country list must open the native picker and scroll normally;
    - the WhatsApp field must open the **numeric** keyboard;
    - step 1 with nothing chosen → the error text must be visible and the first option must be focused.
18. Submit. Must: the page goes to `/thank-you/`, then WhatsApp opens with a prefilled message containing the name, course, country and the closing language line.
19. Go back in the browser from the thank-you page. Must: no error, no blank page.
20. iOS only: check the form does **not** zoom when a field is focused (fields are ≥ 16 px).

### Minutes 20–23 · Placement test
21. Open `/placement/`, answer the questions, get a result.
22. Tap the CTA on the result. Must: the booking form opens **prefilled** with the level and track.

### Minutes 23–26 · Offline
23. Load two pages, then switch to airplane mode.
24. Re-open the first page. Must: it opens, **styled**, with its own title.
25. Open a page you have never visited. Must: the offline page appears (not the browser's dinosaur) and offers WhatsApp/email.
26. Turn the network back on and reload. Must: normal behaviour again, no stale content.

### Minutes 26–30 · Arabic and the other languages
27. Switch to Arabic on the device and repeat: home, a course page, the booking form.
    - Must: mirrored layout, Arabic shaping and numerals, no clipped text, no Latin left-overs in the UI.
28. Quick pass on German, French and Italian home + pricing pages: must be readable, no missing accents, no cut-off words, prices correct (`40 $` … `128 $` at the time of writing).

## 5. Screen-reader protocol (10–15 minutes per reader)

Run one of these **in addition** to §4 — a screen reader surfaces problems sighted testing cannot.

| Reader | Platform | 10-minute script |
|---|---|---|
| **VoiceOver** | iPhone: *Settings → Accessibility → VoiceOver* | Rotor through headings on home (one `h1`, logical order) → navigate by landmark to the booking form → fill it with the on-screen keyboard → the error after an empty submit must be announced → the step change must be announced → submit and confirm the thank-you page reads correctly |
| **TalkBack** | Android: *Settings → Accessibility → TalkBack* | Same script; also swipe through the mega menu and the mobile sheet (must announce as a dialog) |
| **NVDA** | Windows + Firefox/Chrome | Keyboard-only: skip link → menu → booking wizard; confirm the live region announces "Step 1 of 3"; confirm the invalid radio group is announced as invalid with its error text |

Report as a bug: unlabelled controls, an error that is visible but never announced, focus that
does not move after a validation failure, a dialog that does not trap or announce, images
without useful alt text, a language switch that leaves the reader speaking the wrong language.

## 6. What is *not* covered here

- **Lighthouse / Core Web Vitals field data.** Needs real traffic; check it weekly in Search Console after launch (`docs/15-search-launch-runbook.md`).
- **Push notifications.** Not implemented, deliberately: nobody is on the other end of them yet. It is a Phase 6 candidate.
- **Native app store listings** (Play Store TWA, App Store). They need money and accounts (`$25` + a signing key + Apple's developer programme), so they stay a business gate. The site itself installs as an app today, which is what the pill offers.
- **Payments inside the app** — no payments on the site at all yet.

## 7. Recording the result

Copy this table into the Linear issue (ABO-42) comment and attach screenshots. One row per device × language that was actually tested.

| Device | OS | Browser | Date | Tester | §4 | §5 | Bugs found | Notes |
|---|---|---|---|---|---|---|---|---|
| iPhone 13 | iOS 18.5 | Safari | | | ✔ / ✘ | – | | |
| Galaxy A54 | Android 14 | Chrome | | | ✔ / ✘ | – | | |
| iPad (9th) | iPadOS 18 | Safari | | | ✔ / ✘ | – | | |
| Windows laptop | Win 11 | Chrome + NVDA | | | ✔ / ✘ | ✔ / ✘ | | |

**How to report a bug:** what you did → what you expected → what happened → screenshot/video →
device, OS and browser. Send it to the academy's developer channel; anything that blocks the
booking flow should be tagged **P0** and fixed before any paid traffic starts.

## 8. Running the emulated baseline yourself

On any machine with Node and Chrome (the QA runner starts its own server — nothing else needs
to run):

```bash
npm ci
npm run build
npm run qa                # static gates: links, i18n, structured data, cards, prices
npm run qa:browser        # all browser suites, ~10 minutes
```

Single suite, one language, one page — useful while fixing a bug:

```bash
node qa/run.mjs touch --lang=ar --only=/contact/
node qa/run.mjs theme --lang=de
CHROME_PATH=/path/to/chrome node qa/run.mjs keyboard
```

On a machine **without** Chrome, and without permission to install one (a bare container), the
repository builds its own:

```bash
bash scripts/qa-chrome-sandbox.sh        # → CHROME_PATH=/tmp/ua-chrome/chrome
CHROME_PATH=/tmp/ua-chrome/chrome node qa/run.mjs keyboard
```

Reports land in `qa/report/latest.md` and `latest.json`. A red suite is not advice: it is a
blocked release until someone writes in the report why the failure is acceptable.
