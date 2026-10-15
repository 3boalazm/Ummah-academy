/**
 * Post-build (after @astrojs/sitemap): give every sitemap URL exactly the hreflang
 * alternates its page declares in <head>. The sitemap integration can only mirror paths
 * (/about/ ↔ /de/about/), so translated articles with localised slugs had none; the page
 * itself is the single source of truth, the sitemap now repeats it. Checked by
 * scripts/check-sitemap.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://ummahacademy.net';

export default function hreflangSitemap({ dir, logger }) {
  const dist = fileURLToPath(dir);
  const indexFile = path.join(dist, 'sitemap-index.xml');
  if (!fs.existsSync(indexFile)) return;
  const linksOf = new Map();
  const pageLinks = (loc) => {
    if (!linksOf.has(loc)) {
      const file = path.join(dist, decodeURI(loc.slice(SITE.length)), 'index.html');
      const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      linksOf.set(loc, [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));
    }
    return linksOf.get(loc);
  };
  let urls = 0;
  let withAlts = 0;
  for (const sm of fs.readFileSync(indexFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const file = path.join(dist, sm[1].slice(SITE.length));
    const xml = fs.readFileSync(file, 'utf8').replace(/<url>([\s\S]*?)<\/url>/g, (_, body) => {
      const loc = body.match(/<loc>([^<]+)<\/loc>/)[1];
      const links = pageLinks(loc);
      urls++;
      if (links.length) withAlts++;
      const rest = body.replace(/<xhtml:link [^>]*\/>/g, '').replace(/<loc>[^<]+<\/loc>/, '');
      return `<url><loc>${loc}</loc>${links.map(([l, h]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${h}"/>`).join('')}${rest}</url>`;
    });
    fs.writeFileSync(file, xml);
  }
  logger.info(`sitemap: ${urls} URLs, ${withAlts} with hreflang alternates taken from their pages`);
}
