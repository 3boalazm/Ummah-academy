# Audit · Design

## 1. What works in v1 (keep)

- **The calm-glass foundation:** a dawn aurora, frosted panels with rim light, aubergine "night" panels for emphasis. It meets the brief: modern, glassy, calm, not traditional.
- **The art direction:** a family of glass objects (arch, Mushaf on a rehal, calligraphic stroke, toys, eight-point star) that reads as one studio-made set.
- **The type pairing:** Geist for structure, with an Instrument Serif italic accent phrase in a gradient. It is editorial and contemporary.
- **The hero composition:** the arch frame, floating glass UI cards and the outlined **اقرأ** watermark.

## 2. What to fix

| Issue | Evidence | v2 direction |
|---|---|---|
| **Card soup.** Nearly every section is a centred head followed by an even grid of identical glass cards, so rhythm flattens and nothing feels important. | Home sections 2, 4, 6, 7, 11, 12 | Mix layouts: a **bento grid** (one hero tile + supporting tiles), **split storytelling** (sticky text + visual), a **horizontal story rail**, and one **night panel** per page as the emotional peak. |
| Every section opens with an eyebrow chip. | 14 eyebrows on home | Eyebrows only where they add wayfinding (≤ 4 per page). |
| Centred headings everywhere. | — | Alternate start-aligned heads paired with side content. |
| Stats appear twice with different styles. | Stats strip + impact panel | One proof strip, integrated near the hero. |
| Decorative Arabic sub-lines compete with headings. | Every section | Removed on English pages; Arabic gets its own fully designed RTL layout. |
| Monogram portraits repeat the same gradient. | Teachers | Give each teacher a palette variant (accent hue per department) to aid recognition. |
| Comparison table uses a red ✕ column. | Section 9 | Moved off the home page. Where kept, the tone is softer and the focus is on "what you get". |

## 3. Glass usage rules (codified)

1. Glass appears only where a surface **floats** over the aurora: cards, navigation, sheets and panels. Content inside a glass card uses flat tints, not nested blur.
2. **Text-bearing glass ≥ 56% white.** Long-form reading (blog, legal) uses `glass--strong` (≥ 74%).
3. **One night panel per page** maximum (plus the footer), so dark stays special.
4. The aurora never sits behind long-form text without a strong glass layer in between.

## 4. Motion rules

- Entrances: reveal once, 0.9s ease-out, 22px rise, staggered by 40–70ms within a group.
- Ambient motion: the aurora (46–64s), the floating hero cards (7–8s) and the Sanad "flow" line. All are `transform`/`background-position` only.
- No parallax on scroll; a gentle pointer-tilt on the hero cards only on hover-capable devices.
- Everything is disabled under `prefers-reduced-motion`; view transitions too.

## 5. RTL design notes (Arabic)

- Layouts mirror through logical properties (`inset-inline`, `margin-inline`, `padding-inline-start`). Directional icons (arrows) flip; the logo and decorative art do not.
- Arabic type runs at 1.06× the base size, line-height 1.8 for body and 1.3 for headings, with no negative tracking.
- The italic serif accent becomes a **colour accent in IBM Plex Sans Arabic Bold** (Arabic has no italic tradition).
- Qur'anic text always uses Amiri, never a UI face.
