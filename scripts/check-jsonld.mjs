// Structured-data checker for the static build (dist/): every JSON-LD block must parse and
// carry the properties Google's rich results need for its type. Runs in `npm run qa`.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.html')) files.push(p);
  }
})(DIST);

const REQUIRED = {
  EducationalOrganization: ['name', 'url', 'logo'],
  BreadcrumbList: ['itemListElement'],
  FAQPage: ['mainEntity'],
  BlogPosting: ['headline', 'datePublished', 'author', 'image'],
  Course: ['name', 'description', 'provider'],
  Person: ['name'],
  WebSite: ['name', 'url'],
  ItemList: ['itemListElement'],
};

let blocks = 0;
let errors = 0;
const types = {};
const fail = (page, msg) => {
  errors++;
  console.log(`✗ ${page}: ${msg}`);
};
// Required properties are enforced on top-level entities; nested ones (provider, author,
// publisher…) are often references to the organisation node and legitimately minimal.
const visit = (node, page, depth = 0) => {
  if (Array.isArray(node)) return node.forEach((n) => visit(n, page, depth));
  if (!node || typeof node !== 'object') return;
  const type = node['@type'];
  if (type) {
    for (const t of [].concat(type)) {
      types[t] = (types[t] ?? 0) + 1;
      if (depth === 0) for (const key of REQUIRED[t] ?? []) if (node[key] === undefined || node[key] === '') fail(page, `${t} without "${key}"`);
    }
    if (type === 'BreadcrumbList')
      node.itemListElement?.forEach((it, i) => {
        if (it.position !== i + 1 || !it.name || (!it.item && i < node.itemListElement.length - 1)) fail(page, `BreadcrumbList item ${i + 1} incomplete`);
      });
    if (type === 'FAQPage')
      node.mainEntity?.forEach((q) => {
        if (q['@type'] !== 'Question' || !q.name || !q.acceptedAnswer?.text) fail(page, `FAQPage question incomplete: ${q.name ?? '?'}`);
      });
  }
  for (const v of Object.values(node)) if (v && typeof v === 'object') visit(v, page, depth + 1);
};

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const page = '/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    blocks++;
    let data;
    try {
      data = JSON.parse(m[1]);
    } catch (e) {
      fail(page, `invalid JSON-LD: ${e.message}`);
      continue;
    }
    const root = Array.isArray(data) ? data : [data];
    for (const r of root) if (!r['@context'] && !Array.isArray(data)) fail(page, 'JSON-LD without @context');
    visit(data, page);
  }
}
const summary = Object.entries(types)
  .sort((a, b) => b[1] - a[1])
  .map(([t, n]) => `${t} ${n}`)
  .join(' · ');
console.log(`\n${files.length} pages, ${blocks} JSON-LD blocks (${summary}), ${errors} error(s).`);
process.exit(errors ? 1 : 0);
