#!/usr/bin/env node
/**
 * Browser QA for the built site (dist/). Usage:
 *
 *   npm run qa:browser                         # every suite, every language
 *   node qa/run.mjs axe flows                  # some suites
 *   node qa/run.mjs overflow --lang=de,fr --widths=320,1024 --only=/pricing/
 *   node qa/run.mjs header --step=4            # coarser header scan (default 1 px)
 *
 * Suites: canary · overflow · header · popovers · axe · flows · touch · theme · pwa · offline · cms   (see qa/README.md)
 * Exit code 1 when anything fails. A JSON + Markdown report is written to qa/report/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromePath, launch } from './lib/browser.mjs';
import { serve } from './lib/server.mjs';
import { DIST, LANGS, listPages } from './lib/pages.mjs';

const SUITES = ['canary', 'overflow', 'header', 'popovers', 'axe', 'flows', 'touch', 'theme', 'pwa', 'offline', 'cms'];

const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const list = (v) => (v ? v.split(',').map((s) => s.trim()).filter(Boolean) : undefined);
const suites = args.filter((a) => !a.startsWith('--'));
const unknown = suites.filter((s) => !SUITES.includes(s));
if (unknown.length) {
  console.error(`Unknown suite(s): ${unknown.join(', ')}. Available: ${SUITES.join(', ')}`);
  process.exit(2);
}
const opts = {
  langs: list(flag('lang')) ?? LANGS,
  only: list(flag('only')),
  widths: list(flag('widths'))?.map(Number),
  step: flag('step') ? Number(flag('step')) : undefined,
  min: flag('min') ? Number(flag('min')) : undefined,
  max: flag('max') ? Number(flag('max')) : undefined,
  concurrency: Number(flag('concurrency') ?? 4),
  verbose: args.includes('--verbose'),
};

const run = suites.length ? suites : SUITES;
const pages = listPages({ langs: opts.langs, only: opts.only }).filter((p) => !p.url.startsWith('/404'));
console.log(`Chrome: ${chromePath() ?? 'not found'}`);
console.log(`Pages: ${pages.length} (${opts.langs.join(', ')})  ·  suites: ${run.join(', ')}\n`);

const server = await serve(DIST);
const browser = await launch();
const results = [];
const started = Date.now();
try {
  for (const name of run) {
    const t0 = Date.now();
    const mod = await import(`./suites/${name}.mjs`);
    const r = await mod.default({ browser, base: server.base, pages, opts });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    results.push({ suite: name, ...r, seconds: Number(secs) });
    const mark = r.failures.length ? '✗' : '✓';
    const warn = r.warnings?.length ? `  (${r.warnings.length} warnings)` : '';
    console.log(`${mark} ${name.padEnd(9)} ${String(r.checked).padStart(6)} ${r.unit.padEnd(12)} ${String(r.failures.length).padStart(4)} failures  ${secs}s${warn}`);
    for (const f of r.failures.slice(0, 25)) console.log(`    ${f.page}  ${f.detail}`);
    if (r.failures.length > 25) console.log(`    … ${r.failures.length - 25} more (see qa/report/latest.md)`);
    for (const w of (r.warnings ?? []).slice(0, opts.verbose ? 999 : 6)) console.log(`    ⚠ ${w.page}  ${w.detail}`);
    if ((r.warnings?.length ?? 0) > 6 && !opts.verbose) console.log(`    ⚠ … ${r.warnings.length - 6} more (see qa/report/latest.md)`);
  }
} finally {
  await browser.close();
  await server.close();
}

const total = results.reduce((n, r) => n + r.failures.length, 0);
const outDir = path.resolve('qa/report');
fs.mkdirSync(outDir, { recursive: true });
const report = { date: new Date().toISOString(), seconds: Math.round((Date.now() - started) / 1000), langs: opts.langs, pages: pages.length, results };
fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(report, null, 2));
const md = [
  `# Browser QA — ${report.date.slice(0, 16).replace('T', ' ')} UTC`,
  '',
  `${pages.length} pages · languages: ${opts.langs.join(', ')} · ${report.seconds}s`,
  '',
  '| Suite | Checked | Failures | Warnings | Time |',
  '|---|---:|---:|---:|---:|',
  ...results.map((r) => `| ${r.suite} | ${r.checked} ${r.unit} | ${r.failures.length} | ${r.warnings?.length ?? 0} | ${r.seconds}s |`),
  '',
  ...results.flatMap((r) => (r.failures.length ? [`## ${r.suite}`, '', ...r.failures.map((f) => `- \`${f.page}\` ${f.detail}`), ''] : [])),
  ...results.flatMap((r) => (r.warnings?.length ? [`## ${r.suite} — warnings (do not fail the run)`, '', ...r.warnings.map((f) => `- \`${f.page}\` ${f.detail}`), ''] : [])),
].join('\n');
fs.writeFileSync(path.join(outDir, 'latest.md'), md);
console.log(`\n${total ? '✗' : '✓'} ${total} failure(s) in ${report.seconds}s — report: qa/report/latest.md`);
process.exit(total ? 1 : 0);
