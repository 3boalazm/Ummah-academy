/**
 * Social cards. Every indexable page except the home pages gets its own 1200 × 630 card,
 * rendered after the build from the page itself (scripts/og/build.mjs): its <h1>, its
 * section or category, and the "book a free trial" label in its language.
 */
export const ogCardPath = (pathname: string) => `/og${pathname.replace(/\/$/, '')}.jpg`;
