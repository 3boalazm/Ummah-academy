// Internal link + fragment checker for the static build (dist/).
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

const idsCache = new Map();
const idsOf = (file) => {
  if (!idsCache.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
};
const resolve = (urlPath) => {
  const clean = decodeURI(urlPath.split('?')[0]);
  const candidates = [path.join(DIST, clean), path.join(DIST, clean, 'index.html'), path.join(DIST, clean + '.html')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
};

let broken = 0;
let checked = 0;
for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const page = '/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(url)) continue;
    checked++;
    const [p, frag] = url.split('#');
    const target = p ? resolve(p) : file;
    if (!target) {
      console.log(`✗ ${page} → ${url} (missing page)`);
      broken++;
      continue;
    }
    if (frag && target.endsWith('.html') && !idsOf(target).has(frag)) {
      console.log(`✗ ${page} → ${url} (missing #${frag})`);
      broken++;
    }
  }
}
console.log(`\n${files.length} pages, ${checked} internal links checked, ${broken} broken.`);
process.exit(broken ? 1 : 0);
