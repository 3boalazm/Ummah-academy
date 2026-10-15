// Unit tests for the logic editors depend on: prices, Arabic grammar, FAQ text, typography,
// social-card extraction. Run: npm test (Node ≥ 22.18 — runs the TypeScript modules directly).
import assert from 'node:assert/strict';
import { arDollarNoun, prices, fillPrices, PRICE_FACTS } from '../src/data/prices.ts';
import { faqHtml, faqGroups } from '../src/data/faq.ts';
import { typo, price } from '../src/i18n/index.ts';
import { ogCardPath } from '../src/data/og.ts';
import { extract } from './og/build.mjs';
import { frenchSpacing } from './markdown-french-spacing.mjs';

const NB = '\u00a0';
let n = 0;
const t = (name, fn) => {
  fn();
  n++;
  if (process.argv.includes('-v')) console.log(`  ✓ ${name}`);
};

t('Arabic counted noun for dollars', () => {
  const table = { 1: 'دولار واحد', 2: 'دولاران', 3: 'دولارات', 10: 'دولارات', 11: 'دولارًا', 40: 'دولارًا', 99: 'دولارًا', 100: 'دولار', 101: 'دولار', 102: 'دولار', 103: 'دولارات', 110: 'دولارات', 111: 'دولارًا', 128: 'دولارًا', 200: 'دولار', 1000: 'دولار' };
  for (const [k, v] of Object.entries(table)) assert.equal(arDollarNoun(Number(k)), v, `n=${k}`);
  for (let i = 1; i <= 1000; i++) assert.ok(arDollarNoun(i).startsWith('دولار'), `n=${i}`);
});

t('price formats per language', () => {
  assert.equal(price('en', 40), '$40');
  assert.equal(price('de', 40), `40${NB}$`);
  assert.equal(price('ar', 128), `١٢٨${NB}$`);
  assert.equal(prices('en').from, `$${PRICE_FACTS.from}`);
  assert.equal(prices('ar').from, '٤٠ دولارًا');
  assert.equal(prices('ar').sym.from, `٤٠${NB}$`);
  assert.equal(prices('fr').n.to, '128');
  assert.ok(PRICE_FACTS.from <= PRICE_FACTS.from60 && PRICE_FACTS.from60 <= PRICE_FACTS.to);
});

t('price tokens in CMS text', () => {
  assert.equal(fillPrices('ar', 'من {{from:number}} إلى {{to}} شهريًا'), 'من ٤٠ إلى ١٢٨ دولارًا شهريًا');
  assert.equal(fillPrices('en', 'From {{ from }} to {{to}}'), 'From $40 to $128');
  assert.equal(fillPrices('it', '{{gold:symbol}}'), `96${NB}$`);
  assert.throws(() => fillPrices('en', '{{cheapest}}'), /Unknown price token/);
});

t('FAQ answers: links, prices, escaping, French spacing', () => {
  assert.equal(faqHtml('de', 'Siehe [Preise](/pricing/).'), 'Siehe <a href="/de/pricing/">Preise</a>.');
  assert.equal(faqHtml('en', 'See [pricing](/pricing/).'), 'See <a href="/pricing/">pricing</a>.');
  assert.equal(faqHtml('en', 'a <b> & [x](https://example.com)'), 'a &lt;b&gt; &amp; <a href="https://example.com" rel="noopener">x</a>');
  assert.equal(faqHtml('fr', 'Combien ? Voir [tarifs](/pricing/) : {{from}}'), `Combien${NB}? Voir <a href="/fr/pricing/">tarifs</a>${NB}: 40${NB}$`);
  assert.throws(() => faqHtml('en', '[x](pricing)'), /must start with \//);
  assert.throws(() => faqGroups('en', { groups: [{ id: 'Bad Id', title: 'x', items: [{ q: 'q', a: 'a' }] }] }), /anchor/);
  assert.throws(() => faqGroups('en', { groups: [{ id: 'a', title: 'x', items: [{ q: 'q', a: '' }] }] }), /missing/);
});

t('French typography is idempotent and French-only', () => {
  assert.equal(typo('fr', '« Bonjour » ? Oui : non !'), `«${NB}Bonjour${NB}»${NB}? Oui${NB}: non${NB}!`);
  assert.equal(typo('fr', typo('fr', 'Pourquoi ?')), `Pourquoi${NB}?`);
  assert.equal(typo('de', 'Warum ?'), 'Warum ?');
  assert.equal(frenchSpacing('Note : https://x.fr/a:b'), `Note${NB}: https://x.fr/a:b`);
});

t('social card path and extraction', () => {
  assert.equal(ogCardPath('/de/pricing/'), '/og/de/pricing.jpg');
  assert.equal(ogCardPath('/quran-recitation-course/'), '/og/quran-recitation-course.jpg');
  const html = `<html lang="en"><h1 class="x">Recite the Qur’an <span class="accent">correctly &amp; well.</span></h1>
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"position":1,"name":"Home"},{"position":2,"name":"Courses"},{"position":3,"name":"Recitation"}]}</script>
    <span class="cta-long" x>Book free trial</span></html>`;
  const card = extract(html, '/quran-recitation-course/');
  assert.deepEqual(card.title, [{ text: 'Recite the Qur’an ' }, { text: 'correctly & well.', accent: true }]);
  assert.equal(card.kicker, 'Courses');
  assert.equal(card.cta, 'Book free trial');
  assert.equal(card.url, 'ummahacademy.net/quran-recitation-course');
  const dup = extract('<html lang="en"><h1>Privacy Policy</h1><script type="application/ld+json">{"@type":"BreadcrumbList","itemListElement":[{"name":"Home"},{"name":"Privacy Policy"}]}</script></html>', '/privacy-policy/');
  assert.equal(dup.kicker, undefined, 'a kicker equal to the title is dropped');
});

console.log(`✓ ${n} unit test groups passed`);
