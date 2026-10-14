# 01 · Design research — "modern, glassy, calm"

## 1. Brief decoded

The client asked for something *"مودرن فشيخ"* (super modern), *"مش تقليدي خالص"* (not traditional at all), *"استايل الجلاسي"* (glassmorphism) and *"رايقة"* (calm). The reference point in 2025–26 is Apple's **Liquid Glass** language, introduced at WWDC 2025 across iOS 26, iPadOS 26 and macOS Tahoe 26 ([DEV guide](https://dev.to/gruszdev/apples-liquid-glass-revolution-how-glassmorphism-is-shaping-ui-design-in-2025-with-css-code-1221)). In Liquid Glass, controls float above content as translucent layers, hierarchy comes from depth, and text sits on solid-enough layers ([Medium overview](https://medium.com/@expertappdevs/liquid-glass-2026-apples-new-design-language-6a709e49ca8b)).

## 2. Known pitfalls (and our rules)

| Pitfall (from research) | Rule in this design system |
|---|---|
| Glass text often reaches only ~2:1 contrast instead of the 4.5:1 WCAG AA requires ([implementation guide](https://buymeacoffee.com/reactbd/apple-liquid-glass-ui-design-trends-2025-developer-implementation-guide)) | Text-bearing glass uses **≥ 0.56–0.9 white opacity**, ink `#1E1530` on light glass (≈ 14:1), and secondary ink `#4A4060` (≈ 8:1) |
| Overused blur clutters and costs performance ([CSS guide](https://www.abinandhan.in/blog/how-to-create-apples-liquid-glass-ui-style-for-the-web-complete-css-guide)) | Glass is reserved for cards, navigation and panels; the background is a *cheap* CSS aurora (gradients, no filter); blur drops from 22 to 16 px on mobile |
| Users who disable transparency or motion | `prefers-reduced-transparency` swaps to solid white panels; `prefers-reduced-motion` disables aurora drift, reveals, floats and view transitions; `forced-colors` adds borders |
| Missing fallbacks | `@supports not (backdrop-filter)` sets near-opaque panels |
| Nested glass | Avoided; inner surfaces use flat tints instead of a second blur |

## 3. Visual language — "Sakinah Glass" (سكينة = tranquillity)

- **Light:** a dawn (Fajr) sky. Lavender `#ADA7C9`, blush `#F1E8EC`, sky `#AFCCEA`, mauve `#CEB3C1` and rose `#C87B80` drift slowly behind everything. These come from the client's brand board, used with a lighter hand.
- **Night panels:** an Isha sky. Deep aubergine `#1B1129` → `#24163A` with magenta and blue glows and a faint star field. They are used sparingly for emphasis: impact, the "Ummah" meaning section, CTAs and the footer.
- **Glass recipe:** a gradient white fill, a 22px backdrop blur with saturation 170%, a 1px *rim light* (masked gradient border, bright top-left), a *specular sheen* (radial highlight) and a three-layer soft shadow tinted aubergine.
- **Typography:**
  - **Geist** for UI and headlines (tight tracking, −0.035 to −0.045em).
  - **Instrument Serif Italic** for one accent phrase per headline, with a magenta→indigo→blue gradient.
  - **IBM Plex Sans Arabic** for Arabic, and **Amiri** for Qur'anic text and the honorific ﷺ (mapped through a `unicode-range` font face so it never falls back to a broken glyph).
- **Motif:** the *arch* (mihrab), drawn as a modern semicircular frame rather than ornament, and the eight-point star (*Rub el Hizb*, the marker inside the Mushaf) in the logo. The word **اقرأ** ("Read", the first revealed word) appears as a giant outlined watermark in the hero.
- **Imagery:** art-directed 3D renders of *objects*, not people: a glass arch, a glass Mushaf on a rehal, a glass calligraphic stroke, glass toys and a glass eight-point star. The style is consistent (same palette and light), there is no stock-photo cliché, and nobody is misrepresented as a teacher.
- **Icons:** the Phosphor duotone set, inlined at build time. This replaces the emoji icons.
- **Motion:** slow aurora drift (46–64s loops), reveal-on-scroll (0.9s ease-out), gentle floating cards and cross-document view transitions. Everything is disabled by reduced-motion preferences.

## 4. Reference qualities (not copied)

- Apple Liquid Glass: depth hierarchy and rim light.
- Linear and Vercel: crisp type, restraint, dark showcase panels.
- Calm and Headspace: serenity, generous whitespace and soft gradients.
