// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import frenchSpacing from './scripts/markdown-french-spacing.mjs';

/** Sitemap hreflang = each page's own hreflang (translated articles have localised slugs). */
const sitemapHreflang = {
  name: 'ua-sitemap-hreflang',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const { default: run } = await import('./scripts/sitemap-hreflang.mjs');
      run({ dir, logger });
    },
  },
};

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
  markdown: {
    // Astro's default processor (Sätteri) + French typography for CMS-typed articles
    processor: satteri({ mdastPlugins: [frenchSpacing] }),
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you/') && !page.includes('/404'),
      i18n: { defaultLocale: 'en', locales: { en: 'en', ar: 'ar', de: 'de', fr: 'fr', it: 'it' } },
    }),
    sitemapHreflang,
    socialCards,
  ],
  server: {
    host: true,
    allowedHosts: true,
  },
  vite: {
    build: {
      // Astro minifies CSS in its server build, whose modern target made lightningcss drop
      // "redundant" vendor prefixes — including -webkit-backdrop-filter, which Safari/iOS
      // before 18 needs for the glass. Pin CSS to Vite's browser baseline, iOS included
      // (iOS Safari is its own target: it still needs -webkit-text-size-adjust).
      cssTarget: ['chrome111', 'edge111', 'firefox114', 'safari16.4', 'ios16.4'],
    },
    preview: { allowedHosts: true },
    server: { allowedHosts: true },
  },
});
