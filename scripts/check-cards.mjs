// Social-card gate for the static build (dist/), part of `npm run qa`:
//  - every og:image resolves to a file in dist/ — JPEG or PNG, exactly 1200 × 630;
//  - under 250 KB (WhatsApp silently drops previews above ~300 KB);
//  - every indexable page except the home pages has its OWN card (not a default
//    fallback), so a failed render in scripts/og/build.mjs cannot slip through;
//  - card URLs are unique per page.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');
const DIST = path.resolve('dist');
const SITE = 'https://ummahacademy.net';
const HOMES = new Set(['/', '/ar/', '/de/', '/fr/', '/it/']);
const LIMIT = 250 * 1024;

const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(DIST);

let errors = 0;
const fail = (page, msg) => {
  errors++;
  console.log(`✗ ${page}: ${msg}`);
};
const seen = new Map();
const meta = new Map();
let own = 0;
let total = 0;
let maxBytes = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const page = '/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  if (page.startsWith('/admin/')) continue;
  const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
  if (!og) {
    fail(page, 'no og:image');
    continue;
  }
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const isDefault = og.includes('/og/default');
  if (!noindex && !HOMES.has(page) && page !== '/404.html') {
    if (isDefault) fail(page, `uses the default card (${og.slice(SITE.length)}) — its own card was not rendered`);
    else own++;
  }
  if (!isDefault) {
    if (seen.has(og)) fail(page, `shares its card with ${seen.get(og)}`);
    seen.set(og, page);
  }
  if (!og.startsWith(`${SITE}/`)) {
    fail(page, `og:image is not on ${SITE}: ${og}`);
    continue;
  }
  const local = path.join(DIST, decodeURI(og.slice(SITE.length)));
  if (!fs.existsSync(local)) {
    fail(page, `og:image missing in dist: ${og.slice(SITE.length)}`);
    continue;
  }
  if (!meta.has(local)) {
    const m = await sharp(local).metadata();
    meta.set(local, { ...m, bytes: fs.statSync(local).size });
  }
  const m = meta.get(local);
  total++;
  maxBytes = Math.max(maxBytes, m.bytes);
  if (m.width !== 1200 || m.height !== 630) fail(page, `card is ${m.width}×${m.height}, expected 1200×630`);
  if (!['jpeg', 'png'].includes(m.format)) fail(page, `card format ${m.format}`);
  if (m.bytes > LIMIT) fail(page, `card is ${Math.round(m.bytes / 1024)} KB (limit ${LIMIT / 1024} KB)`);
  const type = html.match(/<meta property="og:image:type" content="([^"]+)"/)?.[1];
  if (type && type !== `image/${m.format}`) fail(page, `og:image:type ${type} but the file is ${m.format}`);
}
console.log(`\n${files.length} pages, ${total} og:images checked, ${own} pages with their own card, largest ${Math.round(maxBytes / 1024)} KB, ${errors} error(s).`);
process.exit(errors ? 1 : 0);
