#!/usr/bin/env node
/**
 * PWA icons — the favicon mark on the academy's night background.
 * Usage: npm run pwa:icons   (writes public/icons/*.png, committed like the OG cards)
 *
 *  icon-192 / icon-512   regular icons: the mark fills ~62 % of the tile
 *  maskable-512          keeps the mark inside Android's 80 % safe zone, so an
 *                        adaptive launcher mask can never crop the mihrab
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const OUT = path.resolve('public/icons');

/** The mark, in its original 40 × 40 viewBox (kept in sync with public/favicon.svg). */
const MARK = `
  <rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="url(#g)"/>
  <rect x="8.5" y="8.5" width="23" height="23" rx="5.5" fill="url(#g)" transform="rotate(45 20 20)"/>
  <path d="M15.6 27.2v-6.1a4.4 4.4 0 0 1 8.8 0v6.1z" fill="#fff" fill-opacity=".95"/>
  <circle cx="20" cy="17.2" r="1.25" fill="url(#g)"/>`;

const tile = (scale) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#33204d"/><stop offset=".55" stop-color="#22153a"/><stop offset="1" stop-color="#120b1f"/>
    </linearGradient>
    <radialGradient id="glow" cx="150" cy="120" r="320" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#8f2f9e" stop-opacity=".5"/><stop offset="1" stop-color="#8f2f9e" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="g" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#c86bd8"/><stop offset=".5" stop-color="#8f6fd0"/><stop offset="1" stop-color="#5aa2e8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bg)"/>
  <rect width="512" height="512" fill="url(#glow)"/>
  <g transform="translate(256 256) scale(${scale}) translate(-20 -20)">${MARK}</g>
</svg>`;

const targets = [
  { file: 'icon-192.png', size: 192, scale: 7.4 },
  { file: 'icon-512.png', size: 512, scale: 7.4 },
  { file: 'maskable-512.png', size: 512, scale: 6.2 },
];

fs.mkdirSync(OUT, { recursive: true });
for (const { file, size, scale } of targets) {
  const out = path.join(OUT, file);
  await sharp(Buffer.from(tile(scale)), { density: 300 }).resize(size, size).png().toFile(out);
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`✓ ${path.relative(process.cwd(), out)}  ${size}×${size}  ${kb} KB`);
}
