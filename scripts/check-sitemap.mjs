// Sitemap gate (part of `npm run verify`, so it runs on every deploy):
//  - every indexable page is in the sitemap, and nothing else is (no noindex page, no 404)
//  - every <loc> equals that page's canonical URL
//  - every hreflang alternate in the sitemap exists, and the sitemap's alternates for a page
//    are exactly the page's own <link rel="alternate" hreflang> set (one truth, two places)
// Google no longer reports hreflang errors in Search Console (International Targeting report
// retired in 2022) — this check and check:i18n are the hreflang validators.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const SITE = 'https://ummahacademy.net';
const errors = [];
const fail = (m) => errors.push(m);
const toPath = (u) => u.replace(SITE, '') || '/';
const fileOf = (p) => path.join(DIST, decodeURI(p), p.endsWith('/') ? 'index.html' : '');

// pages in the build
const pages = new Map();
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (dir === DIST && ['admin', 'og', '_astro', 'downloads'].includes(f.name)) continue;
      walk(p);
    } else if (f.name === 'index.html') {
      const html = fs.readFileSync(p, 'utf8');
      const url = '/' + path.relative(DIST, path.dirname(p)).split(path.sep).join('/');
      const key = url === '/' ? '/' : `${url}/`;
      pages.set(key, {
        noindex: /<meta name="robots" content="noindex/.test(html),
        canonical: html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],
        hreflang: Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]])),
      });
    }
  }
})(DIST);

// sitemap entries
const index = fs.readFileSync(path.join(DIST, 'sitemap-index.xml'), 'utf8');
const entries = new Map();
for (const sm of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = fs.readFileSync(path.join(DIST, toPath(sm[1])), 'utf8');
  for (const u of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = u[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    const alts = Object.fromEntries([...u[1].matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g)].map((m) => [m[1], m[2]]));
    if (entries.has(loc)) fail(`sitemap lists ${loc} twice`);
    entries.set(loc, alts);
  }
}

for (const [loc, alts] of entries) {
  const p = toPath(loc);
  const page = pages.get(p);
  if (!page) {
    fail(`sitemap: ${loc} is not a page in the build`);
    continue;
  }
  if (page.noindex) fail(`sitemap: ${loc} is noindex and must not be listed`);
  if (page.canonical !== loc) fail(`sitemap: ${loc} but the page's canonical is ${page.canonical}`);
  for (const [lang, href] of Object.entries(alts)) if (!pages.has(toPath(href))) fail(`sitemap: ${loc} → hreflang ${lang} ${href} does not exist`);
  const own = Object.entries(page.hreflang).filter(([l]) => l !== 'x-default');
  const sm = Object.entries(alts).filter(([l]) => l !== 'x-default');
  const key = (xs) => JSON.stringify(xs.sort(([a], [b]) => a.localeCompare(b)));
  if (sm.length && key(sm) !== key(own)) fail(`sitemap: ${loc} alternates ${key(sm)} ≠ page hreflang ${key(own)}`);
  if (!sm.length && own.length) fail(`sitemap: ${loc} has no alternates but the page declares ${own.length} hreflang links`);
}
for (const [p, page] of pages) {
  if (page.noindex || p === '/404/') continue;
  if (!entries.has(`${SITE}${p}`)) fail(`indexable page ${p} is missing from the sitemap`);
}

if (errors.length) {
  errors.slice(0, 40).forEach((e) => console.log(`✗ ${e}`));
  if (errors.length > 40) console.log(`… ${errors.length - 40} more`);
  console.log(`\nsitemap: ${errors.length} problem(s).`);
  process.exit(1);
}
const withAlts = [...entries.values()].filter((a) => Object.keys(a).length).length;
console.log(`✓ sitemap OK — ${entries.size} URLs (= every indexable page), ${withAlts} with hreflang alternates matching the pages exactly.`);
