/**
 * Vendor-neutral analytics shim. Pushes events to window.dataLayer (GTM/GA4)
 * and forwards to Plausible if present. Never send names, phone numbers or
 * free-text notes — only categorical values. Event dictionary: docs/03-audit/analytics.md.
 * Loaders (Plausible / GTM + consent) live in src/components/Analytics.astro.
 */
type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    plausible?: (event: string, opts?: { props?: Props }) => void;
  }
}

export function track(event: string, props: Props = {}): void {
  try {
    // every event carries the page language, so funnels can be split by locale (en/ar/de/fr/it)
    const all: Props = { page_lang: document.documentElement.lang || undefined, ...props };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...all });
    window.plausible?.(event, { props: all });
    if (import.meta.env.DEV) console.debug('[track]', event, all);
  } catch {
    /* never break the page for analytics */
  }
}
