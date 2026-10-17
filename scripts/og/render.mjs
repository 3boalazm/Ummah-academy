/**
 * Social cards (Open Graph images), rendered with sharp — already a dependency.
 *
 * sharp's libvips ships Pango + HarfBuzz + FriBidi, so Arabic is shaped and laid out
 * right-to-left correctly with no browser and no extra package. Fonts are loaded from
 * files only (never system fonts), so a card renders identically on a laptop, in CI and
 * on Vercel's build image:
 *   - Geist SemiBold/Medium: vendored static TTFs (scripts/og/fonts, SIL OFL 1.1) —
 *     the npm Geist package used by the site only ships WOFF2;
 *   - Instrument Serif, IBM Plex Sans Arabic, Amiri: the site's own @fontsource WOFF
 *     files, unwrapped to TTF in-process (WOFF 1.0 tables are just zlib-compressed).
 *
 * Design: the site's "Sakinah Glass" — a dawn aurora, the faint اقرأ calligraphy, and a
 * frosted glass panel (the background really is blurred behind it). Arabic cards are
 * mirrored. 1200 × 630 JPEG, typically 50–90 KB (WhatsApp drops images over ~300 KB).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// A bare machine without /etc/fonts makes fontconfig print an error (harmless — our fonts
// are registered from files). Point it at a minimal config instead, before first use.
if (!process.env.FONTCONFIG_FILE && !fs.existsSync('/etc/fonts/fonts.conf')) process.env.FONTCONFIG_FILE = path.join(HERE, 'fonts.conf');
export const W = 1200;
export const H = 630;

const C = {
  bg: '#f4f1f8',
  ink: '#1e1530',
  ink2: '#4a4060',
  ink3: '#6a6182',
  accentInk: '#5a2f8a',
  grad: ['#8f2f9e', '#5b3a8e', '#1d5fa8'],
};

/* ── Fonts ──────────────────────────────────────────────────────────────── */

/** WOFF 1.0 → SFNT (TTF/OTF): inflate each table and rebuild the table directory. */
export function woffToSfnt(buf) {
  if (buf.toString('ascii', 0, 4) !== 'wOFF') throw new Error('not a WOFF 1.0 file');
  const flavor = buf.readUInt32BE(4);
  const numTables = buf.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20;
    const tag = buf.toString('ascii', o, o + 4);
    const offset = buf.readUInt32BE(o + 4);
    const compLength = buf.readUInt32BE(o + 8);
    const origLength = buf.readUInt32BE(o + 12);
    const checksum = buf.readUInt32BE(o + 16);
    const raw = buf.subarray(offset, offset + compLength);
    tables.push({ tag, checksum, data: compLength < origLength ? inflateSync(raw) : Buffer.from(raw) });
  }
  tables.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));
  let entrySelector = 0;
  while (1 << (entrySelector + 1) <= numTables) entrySelector++;
  const searchRange = (1 << entrySelector) * 16;
  const header = Buffer.alloc(12 + numTables * 16);
  header.writeUInt32BE(flavor, 0);
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(searchRange, 6);
  header.writeUInt16BE(entrySelector, 8);
  header.writeUInt16BE(numTables * 16 - searchRange, 10);
  const parts = [header];
  let offset = header.length;
  tables.forEach((t, i) => {
    const o = 12 + i * 16;
    header.write(t.tag, o, 'ascii');
    header.writeUInt32BE(t.checksum, o + 4);
    header.writeUInt32BE(offset, o + 8);
    header.writeUInt32BE(t.data.length, o + 12);
    const pad = (4 - (t.data.length % 4)) % 4;
    parts.push(t.data, Buffer.alloc(pad));
    offset += t.data.length + pad;
  });
  return Buffer.concat(parts);
}

const resolveFontsource = (pkg, file) => {
  try {
    return require.resolve(`${pkg}/files/${file}`);
  } catch {
    return path.join(process.cwd(), 'node_modules', pkg, 'files', file);
  }
};

const FONT_FILES = [
  path.join(HERE, 'fonts/Geist-SemiBold.ttf'),
  path.join(HERE, 'fonts/Geist-Medium.ttf'),
  ['@fontsource/instrument-serif', 'instrument-serif-latin-400-italic.woff'],
  ['@fontsource/instrument-serif', 'instrument-serif-latin-ext-400-italic.woff'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-700-normal.woff'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-latin-700-normal.woff'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-500-normal.woff'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-latin-500-normal.woff'],
  ['@fontsource/amiri', 'amiri-arabic-700-normal.woff'],
];

let fontsReady;
/** Register every font with fontconfig once per process (libvips keeps app fonts). */
export function loadFonts() {
  fontsReady ??= (async () => {
    const dir = path.join(os.tmpdir(), 'ua-og-fonts');
    fs.mkdirSync(dir, { recursive: true });
    for (const f of FONT_FILES) {
      let file = f;
      if (Array.isArray(f)) {
        const src = resolveFontsource(...f);
        file = path.join(dir, path.basename(src).replace(/\.woff$/, '.ttf'));
        if (!fs.existsSync(file)) fs.writeFileSync(file, woffToSfnt(fs.readFileSync(src)));
      }
      if (!fs.existsSync(file)) throw new Error(`font missing: ${file}`);
      await sharp({ text: { text: '.', fontfile: file, rgba: true } }).png().toBuffer();
    }
  })();
  return fontsReady;
}

/* ── Primitives ─────────────────────────────────────────────────────────── */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pt = (px) => Math.round(px * 1024); // Pango sizes are 1024ths of a point; dpi 72 → 1 pt = 1 px

/** Render Pango markup to a raw RGBA layer (no PNG round-trips: they dominate the cost). */
async function text(markup, { width, align = 'left' } = {}) {
  const { data, info } = await sharp({ text: { text: markup, font: 'Geist 20', width, align, rgba: true, dpi: 72, wrap: 'word-char' } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { input: data, raw: { width: info.width, height: info.height, channels: 4 }, width: info.width, height: info.height };
}
const layer = (img, left, top) => ({ input: img.input, raw: img.raw, left: Math.round(left), top: Math.round(top) });

const svg = (body, w = W, h = H) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const roundRect = (w, h, r, fill, extra = '') => svg(`<rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}" ${extra}/>`, w, h);

/** Crop an overlay to the canvas so it can be composited at any (even negative) offset. */
async function clipTo(input, width, height, left, top) {
  const x0 = Math.max(0, left);
  const y0 = Math.max(0, top);
  const x1 = Math.min(W, left + width);
  const y1 = Math.min(H, top + height);
  if (x1 <= x0 || y1 <= y0) return null;
  const data = await sharp(input)
    .extract({ left: x0 - left, top: y0 - top, width: x1 - x0, height: y1 - y0 })
    .png()
    .toBuffer();
  return { input: data, left: x0, top: y0 };
}

/** Fill a white-on-transparent text image with the brand gradient. */
async function gradientFill(mask) {
  const grad = svg(
    `<defs><linearGradient id="g" x1="0" y1="0.3" x2="1" y2="0.7"><stop offset="0" stop-color="${C.grad[0]}"/><stop offset=".48" stop-color="${C.grad[1]}"/><stop offset="1" stop-color="${C.grad[2]}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`,
    mask.width,
    mask.height
  );
  const data = await sharp(grad).ensureAlpha().composite([{ input: mask.input, raw: mask.raw, blend: 'dest-in' }]).raw().toBuffer();
  return { ...mask, input: data };
}

/* ── The static layer (cached per direction) ────────────────────────────── */

const CARD = { w: 828, h: 518, y: 56, r: 40 };
const cardX = (rtl) => (rtl ? W - 56 - CARD.w : 56);

/** The brand logo (src/assets/brand/logo-ink.svg), LOGO_H px tall; its width follows the artboard ratio. */
const LOGO_H = 58;
const LOGO_W = Math.round(LOGO_H * (184.13 / 321.59));
const LOGO_SVG = fs.readFileSync(path.resolve(HERE, '../../src/assets/brand/logo-ink.svg'));
const LOGO = () => sharp(LOGO_SVG, { density: 300 }).resize({ height: LOGO_H }).png().toBuffer();

const baseCache = new Map();
async function base(rtl) {
  if (baseCache.has(rtl)) return baseCache.get(rtl);
  const job = (async () => {
    const m = (x) => (rtl ? 100 - x : x);
    const aurora = svg(`
      <defs>
        <radialGradient id="a" cx="${m(8)}%" cy="4%" r="62%"><stop offset="0" stop-color="#b9b0d8" stop-opacity=".85"/><stop offset="1" stop-color="#b9b0d8" stop-opacity="0"/></radialGradient>
        <radialGradient id="b" cx="${m(96)}%" cy="0%" r="58%"><stop offset="0" stop-color="#a9c8ec" stop-opacity=".95"/><stop offset="1" stop-color="#a9c8ec" stop-opacity="0"/></radialGradient>
        <radialGradient id="c" cx="${m(70)}%" cy="105%" r="55%"><stop offset="0" stop-color="#e3c4d6" stop-opacity=".9"/><stop offset="1" stop-color="#e3c4d6" stop-opacity="0"/></radialGradient>
        <radialGradient id="d" cx="${m(16)}%" cy="100%" r="48%"><stop offset="0" stop-color="#f3e3ec" stop-opacity=".9"/><stop offset="1" stop-color="#f3e3ec" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="${C.bg}"/>
      <rect width="${W}" height="${H}" fill="url(#d)"/><rect width="${W}" height="${H}" fill="url(#c)"/>
      <rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/>`);

    // اقرأ — "Read", the first revealed word — as a faint embossed watermark
    const wordRaw = await text(`<span font_family="Amiri" font_weight="700" size="${pt(520)}" foreground="#ffffff" alpha="66%">اقرأ</span>`);
    const word = { ...wordRaw, input: await sharp(wordRaw.input, { raw: wordRaw.raw }).png().toBuffer() };
    const shadowRaw = await text(`<span font_family="Amiri" font_weight="700" size="${pt(520)}" foreground="#2e1d46" alpha="9%">اقرأ</span>`);
    const wordShadow = await sharp(shadowRaw.input, { raw: shadowRaw.raw }).blur(10).png().toBuffer();
    const wx = rtl ? -70 : W - word.width + 70;
    const wy = -150;
    const backdrop = await sharp(aurora)
      .composite(
        (await Promise.all([clipTo(wordShadow, word.width, word.height, wx, wy + 14), clipTo(word.input, word.width, word.height, wx, wy)])).filter(Boolean)
      )
      .png()
      .toBuffer();

    // frosted glass: blur the backdrop where the panel sits, clip to the rounded shape
    const x = cardX(rtl);
    const mask = roundRect(CARD.w, CARD.h, CARD.r, '#fff');
    const frost = await sharp(backdrop)
      .extract({ left: x, top: CARD.y, width: CARD.w, height: CARD.h })
      .blur(26)
      .composite([{ input: mask, blend: 'dest-in' }])
      .png()
      .toBuffer();
    const shadow = await sharp(roundRect(CARD.w, CARD.h, CARD.r, '#2e1d46', 'fill-opacity="0.16"'))
      .extend({ top: 60, bottom: 60, left: 60, right: 60, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .blur(26)
      .png()
      .toBuffer();
    const tint = svg(
      `<defs><linearGradient id="t" x1="0" y1="0" x2="0.55" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".86"/><stop offset=".5" stop-color="#fff" stop-opacity=".68"/><stop offset="1" stop-color="#fff" stop-opacity=".58"/></linearGradient>
       <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset=".4" stop-color="#fff" stop-opacity=".45"/><stop offset=".65" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#fff" stop-opacity=".8"/></linearGradient></defs>
       <rect x=".75" y=".75" width="${CARD.w - 1.5}" height="${CARD.h - 1.5}" rx="${CARD.r}" fill="url(#t)" stroke="url(#rim)" stroke-width="1.5"/>`,
      CARD.w,
      CARD.h
    );
    const logo = await LOGO();
    return sharp(backdrop)
      .composite([
        await clipTo(shadow, CARD.w + 120, CARD.h + 120, x - 60, CARD.y - 60 + 22),
        { input: frost, left: x, top: CARD.y },
        { input: tint, left: x, top: CARD.y },
        { input: logo, left: rtl ? x + CARD.w - 58 - LOGO_W : x + 58, top: CARD.y + 50 },
      ])
      .png()
      .toBuffer();
  })();
  baseCache.set(rtl, job);
  return job;
}

/* ── One card ───────────────────────────────────────────────────────────── */

/**
 * @param {object} card
 * @param {'en'|'ar'|'de'|'fr'|'it'} card.lang
 * @param {{text: string, accent?: boolean}[]} card.title   H1 segments; `accent` = the gradient phrase
 * @param {string} [card.kicker]    small label above the title (section, category…)
 * @param {string} [card.subtitle]  one line under the title (e.g. a teacher's role)
 * @param {string} [card.url]       short URL shown in the footer
 * @param {string} [card.cta]       pill in the footer (the page's own "book a free trial" label)
 * @returns {Promise<Buffer>} JPEG
 */
export async function renderCard({ lang, title, kicker, subtitle, url, cta }) {
  await loadFonts();
  const rtl = lang === 'ar';
  const x = cardX(rtl);
  const pad = 58;
  const inner = CARD.w - pad * 2;
  const left = x + pad;
  const right = x + CARD.w - pad;
  const place = (img) => (rtl ? right - img.width : left); // start-aligned in either direction
  const layers = [];

  // wordmark beside the logo
  const wordmark = rtl
    ? await text(`<span font_family="IBM Plex Sans Arabic" font_weight="700" size="${pt(29)}" foreground="${C.ink}">أكاديمية الأمة</span>`)
    : await text(
        `<span font_family="Geist" font_weight="600" size="${pt(28)}" letter_spacing="${pt(-0.6)}" foreground="${C.ink}">Ummah<span font_weight="500" foreground="${C.ink2}"> Academy</span></span>`
      );
  layers.push(layer(wordmark, rtl ? right - LOGO_W - 16 - wordmark.width : left + LOGO_W + 16, CARD.y + 50 + (LOGO_H - wordmark.height) / 2));

  let y = CARD.y + 140;

  // kicker as the site's eyebrow pill
  if (kicker) {
    const k = rtl
      ? await text(`<span font_family="IBM Plex Sans Arabic" font_weight="700" size="${pt(21)}" foreground="${C.accentInk}">${esc(kicker)}</span>`)
      : await text(
          `<span font_family="Geist" font_weight="600" size="${pt(17)}" letter_spacing="${pt(1.9)}" foreground="${C.accentInk}">${esc(kicker.toLocaleUpperCase(lang))}</span>`
        );
    const pw = Math.min(k.width + 36, inner);
    const ph = k.height + 16;
    const pill = svg(
      `<rect x=".75" y=".75" width="${pw - 1.5}" height="${ph - 1.5}" rx="${ph / 2}" fill="#fff" fill-opacity=".62" stroke="#fff" stroke-opacity=".95" stroke-width="1.5"/>`,
      pw,
      ph
    );
    const px = rtl ? right - pw : left;
    layers.push({ input: pill, left: px, top: y }, layer(k, px + (pw - k.width) / 2, y + 8));
    y += ph + 26;
  }

  // title: largest size that fits the space left, accent phrase in the brand gradient
  const footerTop = CARD.y + CARD.h - 52 - 50;
  const subH = subtitle ? 46 : 0;
  const maxH = footerTop - 22 - subH - y;
  const titleMarkup = (size, pass) => {
    const base = rtl
      ? `font_family="IBM Plex Sans Arabic" font_weight="700" size="${pt(size)}"`
      : `font_family="Geist" font_weight="600" size="${pt(size)}" letter_spacing="${pt(-size * 0.024)}"`;
    const accent = rtl ? '' : `font_family="Instrument Serif" font_style="italic" font_weight="400" letter_spacing="${pt(-size * 0.012)}"`;
    const body = title
      .map((s) => {
        const show = pass === 'main' ? !s.accent : !!s.accent;
        return `<span ${s.accent ? accent : ''} foreground="${pass === 'main' ? C.ink : '#ffffff'}" alpha="${show ? '100%' : '1'}">${esc(s.text)}</span>`;
      })
      .join('');
    return `<span ${base} line_height="${rtl ? 1.16 : 1.04}">${body}</span>`;
  };
  // short titles (a teacher's name, "Pricing") get poster-size type; long ones shrink to fit.
  // Binary search over even sizes: ~4 renders instead of up to 25.
  const sizes = [];
  for (let px = rtl ? 72 : 80; px >= 30; px -= 2) sizes.push(px);
  let lo = 0;
  let hi = sizes.length - 1;
  let pick = sizes.length - 1;
  let main = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const img = await text(titleMarkup(sizes[mid], 'main'), { width: inner });
    if (img.height <= maxH && img.width <= inner) {
      pick = mid;
      main = img;
      hi = mid - 1;
    } else lo = mid + 1;
  }
  const size = sizes[pick];
  main ??= await text(titleMarkup(size, 'main'), { width: inner });
  const titleTop = y;
  layers.push(layer(main, place(main), titleTop));
  if (title.some((s) => s.accent)) {
    const accent = await gradientFill(await text(titleMarkup(size, 'accent'), { width: inner }));
    layers.push(layer(accent, place(accent), titleTop));
  }
  y = titleTop + main.height;

  if (subtitle) {
    const s = rtl
      ? await text(`<span font_family="IBM Plex Sans Arabic" font_weight="500" size="${pt(27)}" foreground="${C.ink2}">${esc(subtitle)}</span>`, { width: inner })
      : await text(`<span font_family="Geist" font_weight="500" size="${pt(27)}" letter_spacing="${pt(-0.3)}" foreground="${C.ink2}">${esc(subtitle)}</span>`, { width: inner });
    layers.push(layer(s, place(s), y + 14));
  }

  // footer: the call to action at the end, the short URL at the start (shortened to fit)
  let ctaWidth = 0;
  if (cta) {
    const t = rtl
      ? await text(`<span font_family="IBM Plex Sans Arabic" font_weight="700" size="${pt(21)}" foreground="#ffffff">${esc(cta)}  ←</span>`)
      : await text(`<span font_family="Geist" font_weight="600" size="${pt(20)}" letter_spacing="${pt(-0.2)}" foreground="#ffffff">${esc(cta)}  →</span>`);
    const pw = t.width + 44;
    const ph = 50;
    const pill = svg(
      `<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.grad[0]}"/><stop offset=".55" stop-color="${C.grad[1]}"/><stop offset="1" stop-color="${C.grad[2]}"/></linearGradient></defs><rect width="${pw}" height="${ph}" rx="${ph / 2}" fill="url(#p)"/>`,
      pw,
      ph
    );
    const px = rtl ? left : right - pw;
    layers.push({ input: pill, left: px, top: footerTop }, layer(t, px + 22, footerTop + (ph - t.height) / 2));
    ctaWidth = pw;
  }
  if (url) {
    const room = inner - ctaWidth - 28;
    const render = (s) => text(`<span font_family="Geist" font_weight="500" size="${pt(20)}" foreground="${C.ink3}">${esc(s)}</span>`);
    let u = await render(url);
    for (let n = url.length - 2; u.width > room && n > 16; n -= 3) u = await render(`${url.slice(0, n).replace(/[-/]+$/, '')}…`);
    layers.push(layer(u, rtl ? right - u.width : left, footerTop + (50 - u.height) / 2));
  }

  return sharp(await base(rtl))
    .composite(layers)
    .flatten({ background: C.bg })
    .jpeg({ quality: 84, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
}
