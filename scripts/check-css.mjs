// Cross-browser CSS gate (part of `npm run qa`): the minifier must keep the vendor prefixes our
// browser baseline needs (vite.build.cssTarget in astro.config.mjs). Without the pin, Astro's
// server build minified CSS for a modern target and silently dropped them — the glass lost its
// blur on Safari/iOS before 18, iOS lost -webkit-text-size-adjust and German hyphenation.
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('dist/_astro');
const css = fs.readdirSync(dir).filter((f) => f.endsWith('.css')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
const count = (re) => (css.match(re) || []).length;
const errors = [];
const pairs = [
  ['backdrop-filter', 'Safari/iOS < 18: the frosted glass'],
  ['hyphens', 'Safari/iOS < 17: German hyphenation'],
  ['line-clamp', 'all engines: two-line clamps (mega-menu subtitles)'],
];
for (const [prop, why] of pairs) {
  const plain = count(new RegExp(`(?<![-\\w])${prop}:`, 'g'));
  const webkit = count(new RegExp(`-webkit-${prop}:`, 'g'));
  if (plain && webkit < plain) errors.push(`${prop}: ${plain} unprefixed vs ${webkit} -webkit- (${why})`);
}
if (/text-size-adjust:/.test(css) && !/-webkit-text-size-adjust:/.test(css)) errors.push('-webkit-text-size-adjust missing (iOS Safari text zoom)');
if (/@supports not \(backdrop-filter/.test(css)) errors.push('@supports fallback for the glass lost its -webkit- branch');
if (errors.length) {
  errors.forEach((e) => console.log(`✗ ${e}`));
  console.log('\nCSS lost vendor prefixes — check vite.build.cssTarget in astro.config.mjs.');
  process.exit(1);
}
console.log(`✓ CSS prefixes OK — -webkit-backdrop-filter ×${count(/-webkit-backdrop-filter:/g)}, hyphens, line-clamp and text-size-adjust kept for Safari/iOS 16.4+.`);
