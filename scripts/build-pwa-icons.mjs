#!/usr/bin/env node
/**
 * Browser-tab favicon, home-screen and PWA icons — all cut from one source: the round Ummah
 * Academy badge (scripts/brand/ummah-badge.webp, 2000 × 2000, transparent outside the circle).
 * Usage: npm run pwa:icons   (writes to public/, committed like the OG cards)
 *
 *  favicon.ico             16 / 32 / 48 px PNGs in one ICO — the tab icon every browser falls back to
 *  favicon-96.png          96 px (a multiple of 48, as search engines ask for)
 *  apple-touch-icon.png    180 px, badge on the badge's own purple: iOS rounds the corners itself,
 *                          and transparent pixels would turn black there
 *  icons/icon-192 / 512    "any" icons — the round badge as it is
 *  icons/maskable-512      badge inside Android's 80 % safe zone on solid purple, so an adaptive
 *                          launcher mask (circle, squircle, teardrop…) can never crop the logo
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = path.resolve('scripts/brand/ummah-badge.webp');
const PUBLIC = path.resolve('public');
const ICONS = path.join(PUBLIC, 'icons');

/** The badge's flat background purple (sampled from the artwork), used wherever a square must be filled. */
const BG = { r: 48, g: 19, b: 70, alpha: 1 }; // #301346

const badge = (size) => sharp(SRC).resize(size, size, { fit: 'cover' }).png().toBuffer();

/** The badge centred on a solid square, `fill` being the share of the square the badge's diameter takes. */
async function onSquare(size, fill) {
  const inner = Math.round(size * fill);
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: await badge(inner), gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** An ICO is a small directory followed by the images; modern browsers accept PNG payloads. */
function ico(entries) {
  const head = Buffer.alloc(6);
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = head.length + dir.length;
  entries.forEach(({ size, data }, i) => {
    const at = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, at); // width
    dir.writeUInt8(size >= 256 ? 0 : size, at + 1); // height
    dir.writeUInt16LE(1, at + 4); // colour planes
    dir.writeUInt16LE(32, at + 6); // bits per pixel
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([head, dir, ...entries.map((e) => e.data)]);
}

const report = (file, note) => {
  const kb = (fs.statSync(file).size / 1024).toFixed(1);
  console.log(`✓ ${path.relative(process.cwd(), file)}  ${note}  ${kb} KB`);
};

fs.mkdirSync(ICONS, { recursive: true });

const favicons = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await badge(size) })));
fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), ico(favicons));
report(path.join(PUBLIC, 'favicon.ico'), '16/32/48');

fs.writeFileSync(path.join(PUBLIC, 'favicon-96.png'), await badge(96));
report(path.join(PUBLIC, 'favicon-96.png'), '96×96');

fs.writeFileSync(path.join(PUBLIC, 'apple-touch-icon.png'), await onSquare(180, 0.94));
report(path.join(PUBLIC, 'apple-touch-icon.png'), '180×180');

for (const size of [192, 512]) {
  const out = path.join(ICONS, `icon-${size}.png`);
  fs.writeFileSync(out, await badge(size));
  report(out, `${size}×${size}`);
}

const maskable = path.join(ICONS, 'maskable-512.png');
fs.writeFileSync(maskable, await onSquare(512, 0.8));
report(maskable, '512×512 maskable');
