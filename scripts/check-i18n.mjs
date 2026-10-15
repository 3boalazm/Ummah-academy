#!/usr/bin/env node
/**
 * Post-build i18n checks on dist/ (no dependencies):
 *  1. <html lang> matches the URL prefix (/ar/ /de/ /fr/ /it/, else en) and dir is right.
 *  2. Canonical points at the page itself.
 *  3. hreflang clusters are reciprocal: every alternate exists, lists the same set,
 *     includes itself, and has an x-default.
 *  4. English leaks: on German/French/Italian pages, no visible text (or aria-label /
 *     alt / title / placeholder / meta description) may be an English sentence that
 *     also appears on English pages — unless it sits inside an element marked with
 *     another lang (e.g. the language menu, foreign-language cards).
 * Exit code 1 on any failure. Usage: node scripts/check-i18n.mjs [distDir]
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(process.argv[2] || 'dist');
const SITE = 'https://ummahacademy.net';
const PREFIXED = ['ar', 'de', 'fr', 'it'];
const CHECK_LEAKS = ['de', 'fr', 'it'];
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
// Proper nouns and product names that are legitimately identical in every language
const ALLOW = [/^Ummah (Academy|Cubs)$/, /^Noor Al-Bayan$/, /^Al-Ajrumiyya?h?$/, /^Google Meet$/, /^Western Union$/];

const files = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (dir === DIST && f.name === 'admin') continue; // the CMS app (public/admin), not a site page
      walk(p);
    } else if (f.name.endsWith('.html')) files.push(p);
  }
})(DIST);

const urlOf = (file) => {
  const rel = '/' + path.relative(DIST, file).split(path.sep).join('/');
  return rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
};
const langOfUrl = (u) => PREFIXED.find((l) => u === `/${l}/` || u.startsWith(`/${l}/`)) ?? 'en';
const decode = (s) =>
  s
    .replace(/&nbsp;/g, '\u00a0')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : undefined;
};

/** visible strings (and translatable attributes) with the effective lang of their element */
function strings(html, pageLang) {
  const out = [];
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|svg|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ');
  const stack = [{ name: '#root', lang: pageLang, hidden: false }];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[4] !== undefined) {
      const top = stack[stack.length - 1];
      const t = decode(m[4]).replace(/\s+/g, ' ').trim();
      if (t && !top.hidden) out.push({ text: t, lang: top.lang });
      continue;
    }
    const [, close, rawName, rest] = m;
    const name = rawName.toLowerCase();
    if (close) {
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].name === name) {
        stack.length = i;
        break;
      }
      continue;
    }
    const parent = stack[stack.length - 1];
    const lang = attr(rest, 'lang') || parent.lang;
    const hidden = parent.hidden || /\shidden(\s|=|$)/.test(rest) && name !== 'html';
    for (const a of ['aria-label', 'alt', 'title', 'placeholder']) {
      const v = attr(rest, a);
      if (v) out.push({ text: v.trim(), lang, attr: a });
    }
    if (name === 'meta' && /name="description"|property="og:(title|description)"/.test(rest)) out.push({ text: attr(rest, 'content') ?? '', lang: pageLang, attr: 'meta' });
    if (!VOID.has(name) && !rest.trim().endsWith('/')) stack.push({ name, lang, hidden });
  }
  return out;
}

// An English "sentence": 3+ words and at least one English function word (names, e-mails and terms don't qualify)
const FUNCTION = new Set('the and of to your you our we with for is are this that from by on in can will how what more all not no it be or as an when who why'.split(' '));
const isSentence = (t) => {
  const words = t.match(/[A-Za-z]{2,}/g) ?? [];
  return words.length >= 3 && words.some((w) => FUNCTION.has(w.toLowerCase())) && !ALLOW.some((r) => r.test(t));
};

const pages = files.map((f) => {
  const html = fs.readFileSync(f, 'utf8');
  const url = urlOf(f);
  return { file: f, url, html, lang: langOfUrl(url) };
});
const byUrl = new Map(pages.map((p) => [p.url, p]));
const errors = [];
const err = (p, msg) => errors.push(`${p.url}: ${msg}`);

// English reference strings
const english = new Set();
for (const p of pages) if (p.lang === 'en' && !p.url.startsWith('/404')) for (const s of strings(p.html, 'en')) if (isSentence(s.text)) english.add(s.text);

let clusters = 0;
let leaks = 0;
for (const p of pages) {
  if (p.url === '/404.html') continue;
  const htmlTag = p.html.match(/<html[^>]*>/i)?.[0] ?? '';
  const lang = attr(htmlTag, 'lang');
  const dir = attr(htmlTag, 'dir');
  if (lang !== p.lang) err(p, `<html lang="${lang}"> but the URL is ${p.lang}`);
  if (dir !== (p.lang === 'ar' ? 'rtl' : 'ltr')) err(p, `dir="${dir}"`);

  const canonical = p.html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical !== SITE + p.url) err(p, `canonical ${canonical}`);

  const alts = [...p.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((x) => [x[1], x[2].replace(SITE, '')]);
  if (alts.length) {
    clusters++;
    const set = JSON.stringify(alts.slice().sort());
    if (!alts.some(([l, u]) => l === p.lang && u === p.url)) err(p, 'hreflang cluster does not include the page itself');
    if (!alts.some(([l]) => l === 'x-default')) err(p, 'hreflang without x-default');
    for (const [l, u] of alts) {
      const other = byUrl.get(u);
      if (!other) {
        err(p, `hreflang ${l} → ${u} does not exist`);
        continue;
      }
      const back = [...other.html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((x) => [x[1], x[2].replace(SITE, '')]);
      if (JSON.stringify(back.slice().sort()) !== set) err(p, `hreflang not reciprocal with ${u}`);
      if (l !== 'x-default' && other.lang !== l) err(p, `hreflang ${l} points at a ${other.lang} page (${u})`);
    }
  }

  if (CHECK_LEAKS.includes(p.lang)) {
    for (const s of strings(p.html, p.lang)) {
      if (s.lang !== p.lang) continue; // marked as another language on purpose
      if (isSentence(s.text) && english.has(s.text)) {
        leaks++;
        if (leaks <= 60) err(p, `English leak${s.attr ? ` [${s.attr}]` : ''}: "${s.text.slice(0, 110)}"`);
      }
    }
  }
}

const summary = `${pages.length} pages · ${clusters} hreflang clusters checked · ${leaks} English leak(s) on DE/FR/IT pages`;
if (errors.length) {
  console.error(errors.slice(0, 120).join('\n'));
  console.error(`\n✗ ${errors.length} problem(s). ${summary}`);
  process.exit(1);
}
console.log(`✓ i18n OK — ${summary}`);
