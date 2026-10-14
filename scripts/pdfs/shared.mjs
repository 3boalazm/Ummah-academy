/**
 * Shared print template for the free worksheets (A4, print-friendly, bilingual).
 * Fonts are embedded as data URIs so rendering never depends on system fonts.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const nm = (rel) => path.join(ROOT, 'node_modules', rel);
const woff2 = (rel) => `url(data:font/woff2;base64,${fs.readFileSync(nm(rel)).toString('base64')}) format('woff2')`;

const AR_RANGE = 'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';

const FONTS = `
@font-face { font-family: 'Geist'; font-weight: 100 900; src: ${woff2('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}; unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
@font-face { font-family: 'Geist'; font-weight: 100 900; src: ${woff2('@fontsource-variable/geist/files/geist-latin-ext-wght-normal.woff2')}; unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF; }
@font-face { font-family: 'Instrument Serif'; font-style: italic; src: ${woff2('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2')}; }
${[400, 500, 600, 700].map((w) => `@font-face { font-family: 'Plex Arabic'; font-weight: ${w}; src: ${woff2(`@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-${w}-normal.woff2`)}; unicode-range: ${AR_RANGE}; }`).join('\n')}
${[400, 700].map((w) => `@font-face { font-family: 'Amiri'; font-weight: ${w}; src: ${woff2(`@fontsource/amiri/files/amiri-arabic-${w}-normal.woff2`)}; unicode-range: ${AR_RANGE}; }`).join('\n')}
`;

/** Phosphor icon inlined as SVG (same source as the website). */
export function icon(name, weight = 'regular', size = 16) {
  const file = weight === 'regular' ? `${name}.svg` : `${name}-${weight}.svg`;
  const raw = fs.readFileSync(nm(`@phosphor-icons/core/assets/${weight}/${file}`), 'utf8');
  return raw.replace('<svg ', `<svg width="${size}" height="${size}" fill="currentColor" aria-hidden="true" `);
}

const MARK = `<svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true"><defs><linearGradient id="ua-g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8f2f9e"/><stop offset="0.5" stop-color="#4a2f72"/><stop offset="1" stop-color="#1d5fa8"/></linearGradient></defs><rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="url(#ua-g)"/><rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="url(#ua-g)" transform="rotate(45 20 20)"/><path d="M15.6 27.2v-6.1a4.4 4.4 0 0 1 8.8 0v6.1z" fill="#fff" fill-opacity="0.95"/><circle cx="20" cy="17.2" r="1.25" fill="url(#ua-g)"/></svg>`;

const BASE = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: 'Geist', 'Plex Arabic', 'Amiri', sans-serif;
  color: #1e1530;
  font-size: 10.5pt;
  line-height: 1.45;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.sheet {
  position: relative;
  width: 210mm;
  height: 297mm;
  padding: 13mm 14mm 0;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  display: flex;
  flex-direction: column;
}
.sheet:last-child { page-break-after: auto; break-after: auto; }
.sheet::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 2.2mm;
  background: linear-gradient(100deg, #8f2f9e 0%, #5b3a8e 48%, #1d5fa8 100%);
}
.ar { font-family: 'Plex Arabic', 'Amiri', 'Geist', sans-serif; direction: rtl; unicode-bidi: isolate; }
.q { font-family: 'Amiri', 'Geist', serif; direction: rtl; unicode-bidi: isolate; font-size: 1.35em; line-height: 1.6; }
.muted { color: #6a6182; }
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8mm;
  padding-bottom: 3.5mm;
  border-bottom: 0.3mm solid #e4dcef;
}
.brand { display: flex; align-items: center; gap: 2.5mm; }
.brand b { display: block; font-size: 10.5pt; font-weight: 650; letter-spacing: -0.01em; }
.brand small { display: block; font-family: 'Plex Arabic', 'Geist', sans-serif; font-size: 8.5pt; color: #6a6182; line-height: 1.2; }
.head__tag { font-size: 8pt; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #5a2f8a; }
.title { margin: 4mm 0 3mm; display: flex; align-items: flex-end; justify-content: space-between; gap: 8mm; }
.title h1 { margin: 0; font-size: 21pt; line-height: 1.1; letter-spacing: -0.03em; font-weight: 650; }
.title h1 em { font-family: 'Instrument Serif', serif; font-weight: 400; letter-spacing: -0.01em; color: #5a2f8a; }
.title .ar { font-size: 16pt; font-weight: 700; color: #5a2f8a; line-height: 1.3; white-space: nowrap; }
.lede { margin: 0 0 4mm; color: #4a4060; font-size: 9.5pt; max-width: 172mm; }
.body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6mm;
  height: 11mm;
  margin-top: auto;
  border-top: 0.3mm solid #e4dcef;
  font-size: 7pt;
  color: #6a6182;
  white-space: nowrap;
}
.foot b { color: #5a2f8a; font-weight: 600; }
.chip { display: inline-block; padding: 0.6mm 2.4mm; border-radius: 99px; background: #f1eaf9; color: #5a2f8a; font-size: 8pt; font-weight: 600; }
.card { border: 0.3mm solid #e4dcef; border-radius: 3.5mm; padding: 3.5mm 4mm; background: #fcfbfe; }
.box { display: inline-block; width: 4.2mm; height: 4.2mm; border: 0.35mm solid #9d93b5; border-radius: 1mm; vertical-align: middle; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 0.3mm solid #e4dcef; padding: 1.6mm 2mm; text-align: start; vertical-align: middle; }
th { background: #f6f2fb; font-size: 8.5pt; font-weight: 600; color: #4a4060; }
th .ar, td .ar { display: block; font-size: 8pt; font-weight: 500; color: #6a6182; }
`;

/**
 * @param {{ title: string, titleHtml?: string, titleAr: string, tag: string, lede?: string, pages: string[], css?: string }} o
 */
export function document(o) {
  const n = o.pages.length;
  const sheets = o.pages
    .map(
      (body, i) => `<section class="sheet">
  <header class="head">
    <div class="brand">${MARK}<span><b>Ummah Academy</b><small>أكاديمية الأمة</small></span></div>
    <span class="head__tag">${o.tag}</span>
  </header>
  <div class="title"><h1>${o.titleHtml ?? o.title}</h1><span class="ar" lang="ar">${o.titleAr}</span></div>
  ${i === 0 && o.lede ? `<p class="lede">${o.lede}</p>` : ''}
  <div class="body">${body}</div>
  <footer class="foot">
    <span><b>ummahacademy.net</b> · Free to print and share for personal, family and classroom use</span>
    <span>2 free live lessons: ummahacademy.net/contact · ${i + 1}/${n}</span>
  </footer>
</section>`
    )
    .join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${o.title} | Ummah Academy</title><style>${FONTS}${BASE}${o.css ?? ''}</style></head><body>${sheets}</body></html>`;
}
