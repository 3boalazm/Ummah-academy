// Built-output regression gate; runs on deploy as part of verify.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('dist');
const site = 'https://ummahacademy.net';
const pages = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory() && !['admin', '_astro', 'og', 'downloads'].includes(item.name)) walk(path.join(dir, item.name));
    else if (item.isFile() && item.name.endsWith('.html')) pages.push(path.join(dir, item.name));
  }
}
walk(root);
const errors = [];
const titles = new Map();
let count = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const page = path.relative(root, file);
  if (/<meta name="robots" content="noindex/.test(html)) continue;
  count++;
  const check = (ok, message) => { if (!ok) errors.push(`${page}: ${message}`); };
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  check(title?.trim(), 'missing title');
  check(!titles.has(title), `duplicate title (also ${titles.get(title)})`);
  titles.set(title, page);
  check(/<meta name="description" content="[^"]+"/.test(html), 'missing description');
  check((html.match(/<h1(?:\s|>)/g) ?? []).length === 1, 'must have exactly one H1');
  check(html.includes('max-image-preview:large'), 'large image previews not enabled');
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  check(canonical?.startsWith(`${site}/`) && canonical.endsWith('/'), 'canonical must use production origin and trailing slash');
  const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .flatMap((m) => { try { return [].concat(JSON.parse(m[1])); } catch { return []; } });
  const webpage = nodes.find((n) => n['@type'] === 'WebPage');
  const website = nodes.find((n) => n['@type'] === 'WebSite');
  check(webpage?.url === canonical && webpage?.['@id'] === `${canonical}#webpage`, 'WebPage identity does not match canonical');
  check(website?.['@id'] && webpage?.isPartOf?.['@id'] === website['@id'], 'WebPage must reference its WebSite');
  check(website?.publisher?.['@id'] === `${site}/#organization`, 'WebSite must identify academy publisher');
}
// Every URL offered to AI readers must resolve to a generated resource, never a
// staging origin, invented route, or redirect that would silently lose context.
const overview = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
assert.ok(overview.startsWith('# Ummah Academy'));
const links = [...overview.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]);
assert.ok(links.length > 20, 'overview must include programmes and article discovery');
for (const link of links) {
  const url = new URL(link);
  if (url.origin !== site) { errors.push(`llms.txt: unexpected origin ${link}`); continue; }
  const target = path.join(root, decodeURIComponent(url.pathname), url.pathname.endsWith('/') ? 'index.html' : '');
  if (!fs.existsSync(target)) errors.push(`llms.txt: broken link ${link}`);
}
const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${site}/sitemap-index.xml`));
assert.ok(/User-agent: \*\s+Allow: \//.test(robots), 'public crawling must remain allowed');
for (const error of errors) console.error(`✗ ${error}`);
console.log(`SEO: ${count} indexable pages, ${links.length} overview links, ${errors.length} error(s).`);
process.exitCode = errors.length ? 1 : 0;
