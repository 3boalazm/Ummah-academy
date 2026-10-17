// Splits dist/ into zip parts under ~8.5 MB so they fit browser-upload limits.
// Parts never split a top-level folder across zips, EXCEPT oversized ones (og/), which are
// halved and flagged in deploy-parts/README.txt so the pieces can be merged after extraction.
// Usage: node scripts/split-deploy.mjs   → deploy-parts/part1.zip … partN.zip
import { readdirSync, statSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const dist = 'dist';
const out = 'deploy-parts';
const LIMIT = 8.5 * 1024 * 1024;

const files = [];
(function walk(d) {
  for (const e of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push([relative(dist, p).split('\\').join('/'), statSync(p).size]);
  }
})(dist);
files.sort((a, b) => a[0].localeCompare(b[0]));

// group by top-level entry; every loose root file (index.html, .htaccess, …) is one group
const groups = new Map();
for (const [f, s] of files) {
  const key = f.includes('/') ? f.split('/')[0] : '(root)';
  if (!groups.has(key)) groups.set(key, { files: [], size: 0 });
  const g = groups.get(key);
  g.files.push(f);
  g.size += s;
}

// halve any group that cannot fit in one part
const units = [];
const notes = [];
for (const [key, g] of groups) {
  if (g.size <= LIMIT) {
    units.push({ name: key, files: g.files, size: g.size });
    continue;
  }
  const pieces = Math.ceil(g.size / LIMIT);
  const per = g.size / pieces;
  let cur = [];
  let sz = 0;
  const bucket = [];
  for (const f of g.files) {
    const s = files.find((x) => x[0] === f)[1];
    if (sz + s > per && cur.length) {
      bucket.push({ files: cur, size: sz });
      cur = [];
      sz = 0;
    }
    cur.push(f);
    sz += s;
  }
  bucket.push({ files: cur, size: sz });
  bucket.forEach((b, i) => units.push({ name: `${key}#${i + 1}`, files: b.files, size: b.size }));
  notes.push(`${key}/ is split across ${bucket.length} zips (${bucket.map((_, i) => `${key}#${i + 1}`).join(', ')}) — merge after extracting.`);
}

// first-fit bin packing, biggest first
units.sort((a, b) => b.size - a.size);
const parts = [];
for (const u of units) {
  const slot = parts.find((p) => p.size + u.size <= LIMIT);
  if (slot) {
    slot.files.push(...u.files);
    slot.size += u.size;
    slot.names.push(u.name);
  } else parts.push({ files: [...u.files], size: u.size, names: [u.name] });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
const readme = [];
parts.forEach((p, i) => {
  const listFile = join(out, `list${i + 1}.txt`);
  writeFileSync(listFile, p.files.join('\n') + '\n');
  execFileSync('tar', ['-a', '-c', '-f', join(out, `part${i + 1}.zip`), '-C', dist, '-T', listFile]);
  rmSync(listFile);
  readme.push(`part${i + 1}.zip  ${(p.size / 1048576).toFixed(1)} MB  ${p.names.join(', ')}`);
});
writeFileSync(join(out, 'README.txt'), [...readme, '', ...notes, ''].join('\n'));
console.log(readme.join('\n'));
if (notes.length) console.log('\n' + notes.join('\n'));
console.log(`\n${files.length} files -> ${parts.length} parts in ${out}/`);
