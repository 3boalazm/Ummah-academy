/** Inventory of the built site: every HTML page in dist/ with its language and robots state. */
import fs from 'node:fs';
import path from 'node:path';

/* Resolved from this file, not from the working directory: a probe run from elsewhere used to
   serve nothing but 404s, and reported an empty — apparently clean — page. */
export const DIST = path.resolve(import.meta.dirname, '../../dist');
export const LANGS = ['en', 'ar', 'de', 'fr', 'it'];
export const PREFIX = { en: '', ar: '/ar', de: '/de', fr: '/fr', it: '/it' };

export function listPages({ langs = LANGS, only, includeNoindex = true } = {}) {
  if (!fs.existsSync(DIST)) throw new Error('dist/ not found — run `npm run build` first');
  const out = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        if (f === 'admin' || f === '_astro' || f === 'og') continue;
        walk(p);
      } else if (f.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8');
        const rel = '/' + path.relative(DIST, p).replace(/\\/g, '/');
        const url = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
        const lang = html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] ?? 'en';
        const noindex = /<meta name="robots" content="noindex/.test(html);
        out.push({ url, lang, noindex, file: p });
      }
    }
  })(DIST);
  return out
    .filter((pg) => langs.includes(pg.lang))
    .filter((pg) => includeNoindex || !pg.noindex)
    .filter((pg) => !only || only.some((o) => pg.url.includes(o)))
    .sort((a, b) => a.url.localeCompare(b.url));
}

/** Run async jobs with a fixed number of workers. */
export async function pool(items, size, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}
