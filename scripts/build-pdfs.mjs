#!/usr/bin/env node
/**
 * Renders the free worksheets in scripts/pdfs/sheets/ to public/downloads/*.pdf
 * and writes the manifest the Resources page reads (src/data/downloads.json).
 *
 *   CHROME_PATH=/path/to/chrome npm run pdfs          # all sheets
 *   CHROME_PATH=/path/to/chrome npm run pdfs -- nahw  # only ids containing "nahw"
 *
 * Needs any local Chrome/Chromium (puppeteer-core never downloads one).
 * The PDFs are committed, so Vercel builds don't run this.
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { ROOT } from './pdfs/shared.mjs';

const executablePath = process.env.CHROME_PATH;
if (!executablePath) {
  console.error('Set CHROME_PATH to a Chrome/Chromium binary, e.g.\n  CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run pdfs');
  process.exit(1);
}

const sheetsDir = path.join(ROOT, 'scripts/pdfs/sheets');
const outDir = path.join(ROOT, 'public/downloads');
const manifestPath = path.join(ROOT, 'src/data/downloads.json');
const filter = process.argv[2];

const modules = await Promise.all(
  fs
    .readdirSync(sheetsDir)
    .filter((f) => f.endsWith('.mjs'))
    .sort()
    .map(async (f) => (await import(path.join(sheetsDir, f))).default)
);
const sheets = modules.filter((s) => !filter || s.id.includes(filter));
fs.mkdirSync(outDir, { recursive: true });

const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : { files: {} };
const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
});
try {
  for (const s of sheets) {
    const page = await browser.newPage();
    await page.setContent(s.html(), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true, tagged: true });
    await page.close();
    const out = path.join(outDir, s.file);
    fs.writeFileSync(out, pdf);
    const pages = (Buffer.from(pdf).toString('latin1').match(/\/Type\s*\/Page(?!s)/g) || []).length;
    manifest.files[s.id] = { file: `/downloads/${s.file}`, pages, bytes: pdf.length };
    console.log(`${s.id.padEnd(28)} ${String(pages).padStart(2)} p  ${(pdf.length / 1024).toFixed(0).padStart(5)} KB  public/downloads/${s.file}`);
  }
} finally {
  await browser.close();
}
manifest.generated = new Date().toISOString().slice(0, 10);
manifest.files = Object.fromEntries(Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nmanifest: ${path.relative(ROOT, manifestPath)}`);
