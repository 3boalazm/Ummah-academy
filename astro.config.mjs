// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
