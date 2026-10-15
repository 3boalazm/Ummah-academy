// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/** Social cards for every indexable page, rendered from the built HTML (scripts/og). */
const socialCards = {
  name: 'ua-social-cards',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const { default: buildCards } = await import('./scripts/og/build.mjs');
      await buildCards({ dir, logger });
    },
  },
};

// Ummah Academy — static, HTML-first build.
// URLs intentionally mirror the WordPress site (trailing slashes, root-level
// blog slugs) so search rankings carry over with zero redirect debt.
export default defineConfig({
  site: 'https://ummahacademy.net',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you/') && !page.includes('/404'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar', de: 'de', fr: 'fr', it: 'it' } },
    }),
    socialCards,
  ],
  server: {
    host: true,
    allowedHosts: true,
  },
  vite: {
    preview: { allowedHosts: true },
    server: { allowedHosts: true },
  },
});
