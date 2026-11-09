# Homepage UI elements — implementation from `public/pics`

This pass changes the **home page composition itself**, rather than only adjusting shared colour tokens. Reference files are inspirations for layout and behaviour, not licensed imagery; all art on the page still comes from our own `src/assets/art`.

| Reference | Adaptation on the homepage |
|---|---|
| 01, 27 (snap and reveal) | Four programme cards become a horizontal CSS scroll-snap rail below 900px. Each is a real course link, with visible previous/next controls, native swipe and keyboard-focusable rail. At desktop widths the existing four-card grid remains. No narrow-slit accordion or JS-only navigation. |
| 05, 10, 41 (layered cards) | The hero's two decorative cards are gently offset around the original learner illustration; they carry non-numeric service copy, not a fake progress percentage or appointment. |
| 06, 18, 26, 53 (stacked process, branching choices) | Replaced the home mock classroom screen with a three-layer editorial diagram of the actual trial/learning journey. Its words come from three milestones in the already translated four-step list alongside it; the diagram is decorative to assistive tech and that list remains the full accessible explanation. |
| 19, 36, 50 (CTA and progress) | The existing booking and placement CTAs stay separate. No new progress bar is shown without actual student data. |

The desktop and mobile rendering use the same real course cards, links and images. RTL uses logical inline margins and logical scroll edges, not assumptions about the browser's sign for `scrollLeft`. Explicit button scrolling respects `prefers-reduced-motion`. Navigation labels and diagram heading cover EN/AR/DE/FR/IT in `src/data/home-ui.ts`.

## Checks and limits

`npm run build`, `npm run verify`, `npm run check:css`, and the unit checks passed. A headless Chromium binary was obtained for a QA attempt, but it cannot start in this sandbox because the OS lacks `libnspr4.so` and `libnss3.so`; the browser suites therefore did not run. Visual and screen-reader review on physical phones remains a release gate. Avoid claiming the mock diagram is an actual classroom product or using external Pinterest/Dribbble screenshots as student photos.
