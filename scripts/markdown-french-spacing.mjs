/**
 * Markdown plugin (Sätteri, Astro's Markdown processor): French typography for articles
 * typed in the CMS — a no-break space before ? ! : ; » and after «. Only text nodes of files
 * under src/content/blog-tr/fr/ are touched (never code, URLs or other languages).
 * Idempotent: existing no-break spaces are kept. Same rule as `typo()` in src/i18n/index.ts,
 * which handles article titles and descriptions.
 */
import { fileURLToPath } from 'node:url';

const NBSP = '\u00a0';
export const frenchSpacing = (s) => s.replace(/[ \u00a0]+([?!:;»])/g, `${NBSP}$1`).replace(/«[ \u00a0]+/g, `«${NBSP}`);

export default function frenchSpacingPlugin(ctx) {
  const file = ctx?.fileURL ? fileURLToPath(ctx.fileURL).replace(/\\/g, '/') : '';
  if (!file.includes('/content/blog-tr/fr/')) return null;
  return {
    name: 'ua-french-spacing',
    text(node, c) {
      const value = frenchSpacing(node.value);
      if (value !== node.value) c.setProperty(node, 'value', value);
    },
  };
}
