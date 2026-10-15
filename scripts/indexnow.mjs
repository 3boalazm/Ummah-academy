#!/usr/bin/env node
/**
 * IndexNow: tell Bing, Yandex, Naver, Seznam and Yep that pages changed (Google does not
 * take part — it reads the sitemap). Bing's index also feeds Copilot and DuckDuckGo.
 * Run it AFTER a deploy that is live on the real domain — never before the cut-over.
 *
 *   npm run indexnow -- --dry-run                    # show what would be sent
 *   npm run indexnow -- --all                        # every URL in the sitemap (launch day)
 *   npm run indexnow -- /pricing/ /de/pricing/       # just these pages
 *
 * The key file public/<key>.txt is public by design: it proves we own the domain.
 * Safety: refuses to send unless the live site serves that exact key file.
 */
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'ummahacademy.net';
const SITE = `https://${HOST}`;
const keyFile = fs.readdirSync('public').find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file (public/<32 hex>.txt) found');
const key = keyFile.replace('.txt', '');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');

let urls = args.filter((a) => a.startsWith('/')).map((p) => SITE + p);
if (args.includes('--all')) {
  const index = fs.readFileSync(path.join('dist', 'sitemap-index.xml'), 'utf8');
  urls = [];
  for (const sm of index.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const xml = fs.readFileSync(path.join('dist', sm[1].replace(SITE, '')), 'utf8');
    for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>/g)) urls.push(m[1]);
  }
}
if (!urls.length) {
  console.log('Nothing to send. Pass page paths (/pricing/) or --all (needs `npm run build` first).');
  process.exit(1);
}
const body = { host: HOST, key, keyLocation: `${SITE}/${keyFile}`, urlList: urls.slice(0, 10000) };
if (dry) {
  console.log(JSON.stringify({ ...body, urlList: `${body.urlList.length} URLs: ${body.urlList.slice(0, 5).join(', ')}…` }, null, 2));
  process.exit(0);
}
const live = await fetch(body.keyLocation).then((r) => (r.ok ? r.text() : '')).catch(() => '');
if (live.trim() !== key) {
  console.error(`✗ ${body.keyLocation} does not serve the key yet — is the new site live on ${HOST}? Nothing sent.`);
  process.exit(1);
}
const res = await fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`${res.status === 200 || res.status === 202 ? '✓' : '✗'} IndexNow ${res.status} ${res.statusText} — ${body.urlList.length} URL(s) submitted`);
process.exit(res.status === 200 || res.status === 202 ? 0 : 1);
