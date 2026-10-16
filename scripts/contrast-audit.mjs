/**
 * Pixel contrast audit — the check axe cannot do.
 *
 * axe evaluates `color` against a computed `background-color`. This site is glass over a pastel
 * aurora: almost nothing has a flat background, so axe passes text that a visitor cannot read.
 * This script measures what is really painted:
 *
 *   1. for every visible text box it records the computed colour and the box's shape (radius,
 *      inline decorations such as a badge inside the paragraph, which are then excluded);
 *   2. it paints the glyphs out (`color: transparent`) and screenshots — so the backdrop is read
 *      from real pixels, with no antialiased fringe to confuse it;
 *   3. the backdrop is the median of those pixels plus, in the direction that hurts (the
 *      brightest quarter under light text, the darkest under dark text), the worst part of a
 *      gradient;
 *   4. the verdict is the worse of the two against WCAG AA (4.5:1, or 3:1 for large text).
 *
 * Only text that is wholly on screen and wholly on top (five hit-tested points) is measured: a
 * box half hidden under the sticky header is not a contrast problem, it is a measurement error.
 *
 * Usage:
 *   node scripts/contrast-audit.mjs "/,/pricing/" [dark|light] [maxRows]
 *
 * Sensitivity control (the audit must find a known-bad rule, or a green run means nothing):
 *   CONTRAST_CONTROL='.theme-night{--ink-3:#6b5a86}' node scripts/contrast-audit.mjs "/" dark
 *
 * Exits non-zero when anything is below AA, so it can be wired into a gate later.
 */
import { launch, newPage, open, settle } from '../qa/lib/browser.mjs';
import { serve } from '../qa/lib/server.mjs';
import { DIST, PREFIX } from '../qa/lib/pages.mjs';

const PAGES = process.argv[2] ? process.argv[2].split(',') : ['/', '/pricing/', '/contact/', '/courses/', '/faq/'];
const THEME = process.argv[3] ?? process.env.CONTRAST_THEME ?? 'dark';
const ONLY_WORST = Number(process.argv[4] ?? 40);
const ARABIC = process.env.CONTRAST_LANG !== 'en'; // the Arabic pages carry the longest strings

const collect = () => {
  const out = [];
  const inlineOk = new Set(['A', 'SPAN', 'STRONG', 'B', 'EM', 'I', 'BR', 'SMALL', 'SVG', 'SUP', 'CODE', 'U', 'S', 'ABBR', 'TIME', 'CITE', 'Q', 'LI', 'WBR']);
  const skip = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'TITLE', 'SVG', 'PATH']);
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    if (skip.has(el.tagName)) continue;
    if (el.closest('.sr-only, [hidden], [aria-hidden="true"]')) continue;
    let hiddenByAncestor = false;
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const ns = getComputedStyle(n);
      if (ns.visibility === 'hidden' || ns.display === 'none' || Number(ns.opacity) < 0.05) { hiddenByAncestor = true; break; }
      if (n.tagName === 'DETAILS' && !n.open && n !== el) { hiddenByAncestor = true; break; }
    }
    if (hiddenByAncestor) continue;
    const text = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!text) continue;
    // leaf-ish: every element child must be inline and carry no block text of its own
    const kids = [...el.children];
    if (!kids.every((k) => inlineOk.has(k.tagName) || getComputedStyle(k).display.startsWith('inline'))) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    /* only text wholly on screen: a box half above the viewport gets clamped onto the sticky
       header and measures that instead of its own backdrop. */
    if (r.top < 4 || r.bottom > innerHeight - 4 || r.left < 4 || r.right > innerWidth - 4) continue;
    /* The text has to be the thing actually painted at that spot: a label inside a closed
       dropdown, or one covered by an overlay, is not on screen even though it has a box. */
    /* every part of the box has to be on top: a badge whose centre pokes out below the sticky
       header still has its top half behind the header's glass. */
    const pts = [[0.5, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];
    const covered = pts.some(([fx, fy]) => {
      const hit = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy);
      return !hit || (hit !== el && !el.contains(hit) && !hit.contains(el));
    });
    if (covered) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0' || cs.color === 'rgba(0, 0, 0, 0)') continue;
    const key = `${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    /* inline decorations inside the box (a badge, a chip, an avatar) are not the text's
       backdrop: their pixels are excluded from the sample. */
    const excl = [];
    for (const d of el.querySelectorAll('*')) {
      const dcs = getComputedStyle(d);
      const painted = (dcs.backgroundColor !== 'rgba(0, 0, 0, 0)' && !/rgba\(0, 0, 0, 0\)/.test(dcs.backgroundColor)) || dcs.backgroundImage !== 'none';
      if (!painted) continue;
      const dr = d.getBoundingClientRect();
      if (dr.width > 1 && dr.height > 1) excl.push([Math.round(dr.left), Math.round(dr.top), Math.round(dr.right), Math.round(dr.bottom)]);
    }
    /* the element's painted shape: a round badge is not its square box, and the corners show
       whatever is behind — page background, an illustration — which the text never sits on. */
    const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, Math.min(r.width, r.height) / 2);
    out.push({
      id: out.length,
      excl,
      radius: Math.round(radius),
      sel: `${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`,
      text: text.slice(0, 48),
      color: cs.color,
      fontSize: parseFloat(cs.fontSize),
      weight: Number(cs.fontWeight) || 400,
      x: Math.round(r.left),
      y: Math.round(r.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
    });
  }
  return out;
};

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = ([r, g, b]) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const parseColor = (s) => {
  const m = s.match(/(\d+(?:\.\d+)?)/g);
  return m ? m.slice(0, 3).map(Number) : [0, 0, 0];
};

const server = await serve(DIST);
const browser = await launch();
const findings = [];
let measured = 0;

for (const path of PAGES) {
  const page = await newPage(browser, { width: 1280, height: 900 });
  await open(page, server.base + (PREFIX.ar ?? '') + path.replace(/^\/ar/, ''));
  await settle(page);
  if (THEME === 'dark') {
    await page.evaluate(() => {
      document.documentElement.dataset.theme = 'dark';
      try { localStorage.setItem('ua:theme', 'dark'); } catch { /* ignore */ }
    });
  } else {
    await page.evaluate(() => {
      delete document.documentElement.dataset.theme;
      try { localStorage.setItem('ua:theme', 'light'); } catch { /* ignore */ }
    });
  }
  await new Promise((r) => setTimeout(r, 250));

  /* Sensitivity control: inject a known-bad rule and the audit must find it, otherwise a green
     run means nothing. Usage: CONTRAST_CONTROL='.theme-night{--ink-3:#ab9fc6}' node contrast-probe.mjs */
  if (process.env.CONTRAST_CONTROL) {
    await page.addStyleTag({ content: process.env.CONTRAST_CONTROL });
    await new Promise((r) => setTimeout(r, 250));
  }

  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = 800;
  for (let top = 0; top < Math.min(height, 24000); top += step) {
    await page.evaluate((t) => window.scrollTo(0, t), top);
    /* reveal-on-scroll transitions run for ~0.6 s; sampling mid-flight reads a half-faded
       panel and reports contrast that is not on screen once the page has settled. */
    await new Promise((r) => setTimeout(r, 700));
    const items = await page.evaluate(collect);
    if (!items.length) continue;
    /* The glyphs are painted *out* before the backdrop is read: no mask, no antialiased fringe,
       no guessing which pixel is text. The boxes stay exactly where they were. */
    await page.addStyleTag({ content: 'body, body * { color: transparent !important; text-shadow: none !important; -webkit-text-fill-color: transparent !important; }' });
    const b64 = await page.screenshot({ encoding: 'base64' });
    const res = await page.evaluate(async (b64, items) => {
      const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
      const bmp = await createImageBitmap(blob);
      const cv = new OffscreenCanvas(bmp.width, bmp.height);
      const cx = cv.getContext('2d');
      cx.drawImage(bmp, 0, 0);
      const out = [];
      for (const it of items) {
        /* Inset the sample: a button's rounded corner and its shadow are part of the box but
           never sit under a glyph, and reading them as "backdrop" invents failures. */
        const padX = Math.min(Math.round(it.w * 0.12), 12);
        const padY = Math.min(Math.round(it.h * 0.22), 12);
        const x = Math.max(0, it.x + padX), y = Math.max(0, it.y + padY);
        const w = Math.min(it.w - padX * 2, cv.width - x), h = Math.min(it.h - padY * 2, cv.height - y);
        if (w < 2 || h < 2) continue;
        const data = cx.getImageData(x, y, w, h).data;
        const fgv = (it.color.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
        const px = [];
        const skip = (sx, sy) => (it.excl ?? []).some((e) => sx >= e[0] && sx <= e[2] && sy >= e[1] && sy <= e[3]);
        /* inside the rounded-rect paint area only */
        const rr = it.radius ?? 0;
        const inShape = (sx, sy) => {
          if (!rr) return true;
          const left = it.x, top = it.y, right = it.x + it.w, bottom = it.y + it.h;
          if (sx < left || sx > right || sy < top || sy > bottom) return false;
          const cx = Math.min(Math.max(sx, left + rr), right - rr);
          const cy = Math.min(Math.max(sy, top + rr), bottom - rr);
          return Math.hypot(sx - cx, sy - cy) <= rr;
        };
        for (let i = 0; i < data.length; i += 4) {
          const sx = x + ((i / 4) % w), sy = y + Math.floor(i / 4 / w);
          if (skip(sx, sy) || !inShape(sx, sy)) continue;
          const c = [data[i], data[i + 1], data[i + 2]];
          px.push([c[0], c[1], c[2], 0.2126 * (c[0] / 255) + 0.7152 * (c[1] / 255) + 0.0722 * (c[2] / 255)]);
        }
        if (px.length < 24) { out.push({ id: it.id, median: null, worst: null, p05: 0, p95: 0 }); return; }
        const byL = [...px].sort((a, b) => a[3] - b[3]);
        const pick = (q, fromTop = false) => {
          const n = Math.max(1, Math.round(byL.length * q));
          const arr = fromTop ? byL.slice(-n) : byL.slice(0, n);
          const m = arr.length;
          return [Math.round(arr.reduce((t, p) => t + p[0], 0) / m), Math.round(arr.reduce((t, p) => t + p[1], 0) / m), Math.round(arr.reduce((t, p) => t + p[2], 0) / m)];
        };
        const mid = pick(0.5);
        /* Light text is at risk from the brightest part of its backdrop, dark text from the
           darkest — a gradient is only as good as its worst corner under the words. */
        const fgLight = (0.2126 * fgv[0] + 0.7152 * fgv[1] + 0.0722 * fgv[2]) > 140;
        const worst = pick(0.25, fgLight);
        out.push({ id: it.id, median: mid, worst, p05: byL[Math.floor(byL.length * 0.05)][3], p95: byL[Math.floor(byL.length * 0.95)][3] });
      }
      return out;
    }, b64, items);
    await page.evaluate(() => { for (const st of document.querySelectorAll('style')) if (st.textContent.includes('text-fill-color: transparent')) st.remove(); });
    const byId = new Map(items.map((i) => [i.id, i]));
    for (const r of res) {
      const it = byId.get(r.id);
      if (!r.median) continue;
      const fg = parseColor(it.color);
      const thr = it.fontSize >= 24 || (it.fontSize >= 18.66 && it.weight >= 700) ? 3 : 4.5;
      /* the verdict is the worse of the typical and the darkest-tenth backdrop */
      const cMedian = ratio(fg, r.median);
      const cWorst = ratio(fg, r.worst);
      const c = Math.min(cMedian, cWorst);
      measured++;
      if (c + 0.02 < thr) {
        findings.push({ page: path, theme: THEME, ratio: +c.toFixed(2), ratioMid: +cMedian.toFixed(2), need: thr, ...it, backdrop: r.median, worst: r.worst, spread: +(r.p95 - r.p05).toFixed(3) });
      }
    }
  }
  await page.close();
}

await browser.close();
await server.close?.();

// group: same class + colour + size = one finding
const groups = new Map();
for (const f of findings) {
  const key = `${f.page}|${f.sel}|${f.color}|${f.fontSize}|${f.weight}`;
  const g = groups.get(key);
  if (!g || f.ratio < g.ratio) groups.set(key, f);
}
const rows = [...groups.values()].sort((a, b) => a.ratio - b.ratio);
console.log(`measured ${measured} text boxes · ${findings.length} below AA · ${rows.length} distinct\n`);
for (const r of rows.slice(0, ONLY_WORST)) {
  console.log(
    `${String(r.ratio).padStart(5)} (mid ${r.ratioMid}, need ${r.need})  ${r.page}  ${r.sel}  ${r.fontSize}px/${r.weight}  @${r.x},${r.y} ${r.w}x${r.h}  fg=${r.color}  bg=rgb(${r.backdrop.join(',')})  worst=rgb(${r.worst.join(',')})  spread=${r.spread}  “${r.text}”`
  );
}
process.exitCode = rows.length ? 1 : 0;
