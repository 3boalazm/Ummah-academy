/**
 * Post-build step (Astro `astro:build:done`): render a social card for every page whose
 * <meta property="og:image"> points at /og/… (BaseLayout does that for every indexable
 * page except the home pages, which keep their hand-made cards).
 *
 * The built HTML is the single source of truth — no second list of titles to keep in sync:
 *   title    ← the page's <h1> (the .accent phrase gets the brand gradient)
 *   kicker   ← BreadcrumbList (parent section) + BlogPosting.articleSection
 *   subtitle ← Person.jobTitle on teacher profiles
 *   cta      ← the header's "book a free trial" label, already in the page's language
 *
 * A card that fails to render never fails the deploy: that page falls back to the default
 * card and a warning is logged. `npm run check:cards` is the gate that catches it.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCard, loadFonts } from './render.mjs';

// Cards are cached by content: an unchanged page re-uses its card on the next build.
// The key includes the renderer's own source, so a design change re-renders everything.
const CACHE = path.resolve('node_modules/.cache/ua-og');
const RENDERER = crypto
  .createHash('sha1')
  .update(fs.readFileSync(new URL('./render.mjs', import.meta.url)))
  .digest('hex')
  .slice(0, 12);

const SITE = 'https://ummahacademy.net';
const DEFAULT_CARD = { en: '/og/default.png', ar: '/og/default-ar.png', de: '/og/default-de.png', fr: '/og/default-fr.png', it: '/og/default-it.png' };

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', '#39': "'" };
export const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? m;
  });
const strip = (s) => decode(s.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ');

/** The facts a card is made of, read from one built page. Exported for tests. */
export function extract(html, pathname) {
  const lang = html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] ?? 'en';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];
  let title = [];
  if (h1) {
    const re = /<span class="accent"[^>]*>([\s\S]*?)<\/span>/g;
    let last = 0;
    for (const m of h1.matchAll(re)) {
      if (m.index > last) title.push({ text: strip(h1.slice(last, m.index)) });
      title.push({ text: strip(m[1]), accent: true });
      last = m.index + m[0].length;
    }
    if (last < h1.length) title.push({ text: strip(h1.slice(last)) });
    title = title.filter((s) => s.text.trim());
    if (title.length) {
      title[0].text = title[0].text.trimStart();
      title[title.length - 1].text = title[title.length - 1].text.trimEnd();
    }
  }
  if (!title.length) {
    const og = html.match(/<meta property="og:title" content="([^"]*)"/)?.[1] ?? '';
    title = [{ text: decode(og).replace(/\s+[|·—–-]\s+(Ummah Academy|أكاديمية الأمة)$/, '') }];
  }
  const nodes = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const d = JSON.parse(m[1]);
      (Array.isArray(d) ? d : [d]).forEach((n) => nodes.push(n));
    } catch {
      /* check-jsonld reports this */
    }
  }
  const crumbs = nodes.find((n) => n['@type'] === 'BreadcrumbList')?.itemListElement?.map((i) => i.name) ?? [];
  const section = nodes.find((n) => n['@type'] === 'BlogPosting')?.articleSection;
  const person = nodes.find((n) => n['@type'] === 'ProfilePage')?.mainEntity ?? nodes.find((n) => n['@type'] === 'Person');
  const parent = crumbs.length >= 3 ? crumbs[crumbs.length - 2] : crumbs.length === 2 ? crumbs[1] : '';
  const same = (a, b) => a.trim().toLocaleLowerCase(lang) === b.trim().toLocaleLowerCase(lang);
  const headline = title.map((s) => s.text).join('');
  const kicker = [parent, section].filter((k) => k && !same(k, headline)).join(' · ');
  const cta = strip(html.match(/class="cta-long"[^>]*>([\s\S]*?)<\/span>/)?.[1] ?? '').trim();
  return {
    lang,
    title,
    kicker: kicker || undefined,
    subtitle: person?.jobTitle,
    cta: cta || undefined,
    url: `ummahacademy.net${pathname.replace(/\/$/, '')}`,
  };
}

async function pool(items, size, fn) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        await fn(items[i]);
      }
    })
  );
}

export default async function buildCards({ dir, logger }) {
  const dist = fileURLToPath(dir);
  const t0 = Date.now();
  const jobs = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d)) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.html')) {
        const html = fs.readFileSync(p, 'utf8');
        const og = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
        if (!og || !og.startsWith(`${SITE}/og/`) || og.includes('/og/default')) continue;
        const pathname = '/' + path.relative(dist, p).replace(/\\/g, '/').replace(/index\.html$/, '');
        jobs.push({ file: p, html, og, pathname, out: path.join(dist, og.slice(SITE.length)) });
      }
    }
  })(dist);

  await loadFonts();
  fs.mkdirSync(CACHE, { recursive: true });
  let bytes = 0;
  let max = 0;
  let cached = 0;
  const failed = [];
  await pool(jobs, 4, async (job) => {
    try {
      const card = extract(job.html, job.pathname);
      const key = crypto.createHash('sha1').update(RENDERER).update(JSON.stringify(card)).digest('hex');
      const hit = path.join(CACHE, `${key}.jpg`);
      let jpg;
      if (fs.existsSync(hit)) {
        jpg = fs.readFileSync(hit);
        cached++;
      } else {
        jpg = await renderCard(card);
        fs.writeFileSync(hit, jpg);
      }
      fs.mkdirSync(path.dirname(job.out), { recursive: true });
      fs.writeFileSync(job.out, jpg);
      bytes += jpg.length;
      max = Math.max(max, jpg.length);
    } catch (e) {
      failed.push(job.pathname);
      const lang = job.html.match(/<html[^>]*\slang="([^"]+)"/)?.[1] ?? 'en';
      fs.writeFileSync(job.file, job.html.split(job.og).join(`${SITE}${DEFAULT_CARD[lang] ?? DEFAULT_CARD.en}`));
      logger.warn(`social card failed for ${job.pathname} (${e.message}) — using the default card`);
    }
  });
  const ok = jobs.length - failed.length;
  // health file for post-deploy checks: https://<host>/og/manifest.json → failed must be 0
  fs.mkdirSync(path.join(dist, 'og'), { recursive: true });
  fs.writeFileSync(path.join(dist, 'og/manifest.json'), JSON.stringify({ renderer: RENDERER, cards: ok, failed: failed.length, avgKB: ok ? Math.round(bytes / ok / 1024) : 0 }) + '\n');
  logger.info(
    `${ok} social cards (${ok - cached} rendered, ${cached} from cache) in ${((Date.now() - t0) / 1000).toFixed(1)}s · avg ${ok ? Math.round(bytes / ok / 1024) : 0} KB · max ${Math.round(max / 1024)} KB${failed.length ? ` · ${failed.length} FAILED` : ''}`
  );
}
