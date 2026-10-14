# 04 · Design system — "Sakinah Glass"

Source of truth: `src/styles/global.css` (layers: `tokens → base → layout → glass → components → motion → utilities`) plus component-scoped styles.

## 1. Tokens

| Group | Tokens |
|---|---|
| Brand | `--aubergine-800 #2E1D46` (primary), `--indigo-700 #453163`, `--violet-600 #6B3FA0`, `--magenta-600 #8F2F9E`, `--blue-600 #1D5FA8`, `--rose-500 #C87B80`, tints `--sky-200 #AFCCEA`, `--lavender-300 #ADA7C9`, `--mauve-200 #CEB3C1`, `--blush-100 #F1E8EC`, `--gold-400 #D9B26A` (stars, Sanad end-node) |
| Ink | `--ink #1E1530` · `--ink-2 #4A4060` · `--ink-3 #6A6182`; night theme overrides these to light values |
| Accent | `--grad-accent: magenta → indigo → blue` (headline accents, badges, progress) |
| Type | `--font-sans` Geist Variable · `--font-serif` Instrument Serif (italic accents) · `--font-arabic` IBM Plex Sans Arabic · `--font-quran` Amiri · `UA Honorific` (Amiri ﷺ via `unicode-range`) |
| Scale | `--fs-hero`, `--fs-h1`, `--fs-h2`, `--fs-h3`, `--fs-lead` — fluid `clamp()` |
| Shape | `--r-xs 10` · `--r-sm 14` · `--r-md 20` · `--r-lg 28` · `--r-xl 40` · `--r-pill` |
| Glass | `--blur 22px` (16px on mobile) · `--glass-fill` · `--glass-fill-strong` · `--glass-rim` · `--shadow-glass` · `--shadow-lift` |
| Motion | `--ease-out cubic-bezier(.22,1,.36,1)` · reveal 0.9s · aurora 46–64s |

## 2. Surfaces

| Class | Use |
|---|---|
| `.aurora` | Fixed dawn background (4 radial blobs plus grain), animated with transform only |
| `.glass` | Default floating card: gradient white fill, backdrop blur and saturation, rim light (`::before`), specular sheen (`::after`) |
| `.glass--strong` | Text-heavy panels (forms, articles, legal): ≥ 74% white |
| `.glass--interactive` | Hover lift (translateY −4px plus lift shadow) |
| `.theme-night` / `.night-panel` | Isha-sky panels: aubergine gradient with magenta and blue glows, `.stars`, light ink. Max one per page plus the footer |

## 3. Components (in `src/components`)

| Component | Notes |
|---|---|
| `Header` | Glass pill; mega-menu (hover, click and keyboard); `<dialog>` mobile sheet; path-aware language switch |
| `Footer` | Night panel; bilingual columns; contact chips |
| `StickyCta` | Mobile action bar driven by IntersectionObserver |
| `PageHero` | Breadcrumbs, eyebrow, H1 with accent, lede, actions slot, optional visual slot |
| `TrackCard`, `CourseCard` | Art, price, CTA; whole-card link with focus ring |
| `TeacherCard` | Monogram portrait with a palette variant per department and an "Ijazah verified" seal |
| `TestimonialCard` | Stars, quote, result chip, initials avatar |
| `SanadChain` | Animated chain You → Teacher → … → Prophet ﷺ; vertical on mobile |
| `ClassroomMockup` | HTML/CSS live-lesson illustration (Amiri basmala with Tajweed highlights) |
| `BookingWizard` | 3-step form; fieldsets per step, tiles, segmented controls, inline errors |
| `Faq` | Native `<details>` accordion plus `FAQPage` JSON-LD |
| `FeatureGrid`, `Steps` | Icon feature cards; numbered steps |
| `PostCover` | Generated CSS/SVG article covers (no image weight) |
| `Icon` | Phosphor icons inlined at build time (duotone by default) |
| `Logo` | Proposed SVG mark (eight-point star plus arch). Swap the legacy logo in this one file |

## 4. Patterns

- **Section head:** an eyebrow (optional, ≤ 4 per page), an H2 with one accent phrase, a lede ≤ 2 lines.
- **Bento:** one dominant tile (night) plus supporting glass tiles, used for "why" content.
- **Rail:** a horizontal scroll-snap list for testimonials and timelines, keyboard-focusable.
- **Choice tiles and segmented pills:** inputs stay native radios, styled only.

## 5. Accessibility rules

- Text on glass uses ink ≥ 7:1. Secondary ink is used only on ≥ 56% white glass.
- Focus ring: 2.5 px violet with a 3 px offset on every interactive element. Tiles show focus on their visual box.
- `prefers-reduced-motion`: no aurora drift, reveals, floats or view transitions.
- `prefers-reduced-transparency`: solid surfaces. `forced-colors`: borders on glass, buttons and tiles.
- RTL: logical properties throughout; directional icons flip; Qur'anic text always in Amiri.
