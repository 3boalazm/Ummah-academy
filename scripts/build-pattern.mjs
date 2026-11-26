/**
 * Brand calligraphy pattern → public/pattern/calligraphy-{a,b}.svg
 *
 * The brand sheet sets its colours on a dense field of heavy Arabic letter strokes, cropped at the
 * edges. This builds that texture from real letterforms (Rakkas, a heavy calligraphic display face,
 * OFL) as plain vector paths: one seamless tile, filled black, so CSS can use it as a mask and paint
 * it in any palette colour (`.pattern` in src/styles/brand.css).
 *
 *   node scripts/build-pattern.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const opentype = require('opentype.js');
const fontFile = require.resolve('@fontsource/rakkas/files/rakkas-arabic-400-normal.woff');
const font = opentype.loadSync(fontFile);

const OUT = path.resolve('public/pattern');
mkdirSync(OUT, { recursive: true });

/** Small deterministic PRNG, so the tile is the same on every build. */
const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// weighted towards the tall swooping strokes of the brand sheet (alif, lam, kaf, ta, lam-alif)
const LETTERS = ['ل', 'ا', 'ك', 'ط', 'لا', 'ل', 'ا', 'ع', 'ن', 'ب', 'ح', 'ر', 'و', 'ي', 'ص', 'د', 'ج', 'ق'];

function tile({ name, seed, cols, rows, w, h, size }) {
  const rand = rng(seed);
  const glyphs = [];
  const cw = w / cols;
  const ch = h / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch0 = LETTERS[Math.floor(rand() * LETTERS.length)];
      const s = size * (0.85 + rand() * 0.45);
      const x = c * cw + rand() * cw * 0.5 - cw * 0.15;
      const y = r * ch + ch * 0.95 + rand() * ch * 0.3;
      const rot = (rand() - 0.5) * 34;
      const p = font.getPath(ch0, 0, 0, s);
      const d = p.toPathData(1);
      if (!d) continue;
      const bb = p.getBoundingBox();
      const cx = (bb.x1 + bb.x2) / 2;
      const cy = (bb.y1 + bb.y2) / 2;
      glyphs.push({ d, x, y, rot, cx, cy, half: Math.max(bb.x2 - bb.x1, bb.y2 - bb.y1) / 2 + 4 });
    }
  }
  // calligraphic dots: small rotated squares scattered between the strokes
  const dot = (k) => `M0 ${-k} L${k} 0 L0 ${k} L${-k} 0 Z`;
  for (let i = 0; i < cols * rows * 0.8; i++) {
    const k = size * (0.05 + rand() * 0.03);
    glyphs.push({ d: dot(k), x: rand() * w, y: rand() * h, rot: (rand() - 0.5) * 30, cx: 0, cy: 0, half: k + 2 });
  }

  // Seamless: a glyph crossing an edge is repeated on the opposite side.
  const uses = [];
  for (const g of glyphs) {
    for (const dx of [-w, 0, w]) {
      for (const dy of [-h, 0, h]) {
        const gx = g.x + dx;
        const gy = g.y + dy;
        if (gx + g.half < 0 || gx - g.half > w || gy + g.half < 0 || gy - g.half > h) continue;
        uses.push(`<path transform="translate(${(gx).toFixed(1)} ${(gy).toFixed(1)}) rotate(${g.rot.toFixed(1)}) translate(${(-g.cx).toFixed(1)} ${(-g.cy).toFixed(1)})" d="${g.d}"/>`);
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g fill="#000">${uses.join('')}</g></svg>\n`;
  writeFileSync(path.join(OUT, `${name}.svg`), svg);
  console.log(`${name}.svg  ${glyphs.length} glyphs, ${uses.length} placements, ${(svg.length / 1024).toFixed(1)} KB`);
}

// a: the dense field of the brand sheet · b: an airier version for large, quiet surfaces
tile({ name: 'calligraphy-a', seed: 11, cols: 7, rows: 4, w: 640, h: 420, size: 190 });
tile({ name: 'calligraphy-b', seed: 23, cols: 5, rows: 3, w: 720, h: 440, size: 230 });
