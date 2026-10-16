/**
 * Service worker registration.
 *
 * Registered in a secure context only (https in production; browsers also treat
 * localhost/127.0.0.1 as secure, which is what `npm run preview` and the QA
 * runner use) and never in `astro dev`, where a worker would serve stale
 * modules over HMR. The worker itself (public/sw.js) keeps HTML network-first
 * and only caches immutable assets, so a deploy is picked up on the next
 * navigation.
 */
if ('serviceWorker' in navigator && isSecureContext && !import.meta.env.DEV) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is a bonus — never break the page over it */
    });
  });
}
