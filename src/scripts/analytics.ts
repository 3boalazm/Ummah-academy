/**
 * Vendor-neutral analytics shim. Pushes events to window.dataLayer (GTM/GA4)
 * and forwards to Plausible if present. Never send names, phone numbers or
 * free-text notes — only categorical values. See docs/04-strategy/measurement-plan.md
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
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...props });
    window.plausible?.(event, { props });
    if (import.meta.env.DEV) console.debug('[track]', event, props);
  } catch {
    /* never break the page for analytics */
  }
}
