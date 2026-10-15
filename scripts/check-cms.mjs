// CMS gate (part of `npm run qa`): public/admin/config.yml must describe the content that is
// actually in the repo, and must never offer an editor a value the build would reject.
//  - every collection folder/file exists; FAQ files exist for every locale
//  - every existing article's front-matter fits the collection's fields (no unknown keys,
//    required fields present, select values allowed, relations point at real articles)
//  - select options equal the enums in src/content.config.ts
//  - src/data/prices.json and src/content/faq/*.json have exactly the fields the CMS edits
//  - widget names are real Sveltia widgets; the pinned version matches the schema comment
// (The browser suite `qa/run.mjs cms` then boots the real CMS against this config.)
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();
const CONFIG = 'public/admin/config.yml';
const raw = fs.readFileSync(CONFIG, 'utf8');
const config = YAML.parse(raw);
const errors = [];
const fail = (msg) => errors.push(msg);
const rel = (p) => path.relative(ROOT, p);

const WIDGETS = new Set(['string', 'text', 'datetime', 'select', 'relation', 'boolean', 'richtext', 'markdown', 'list', 'object', 'number', 'hidden', 'image', 'file', 'code', 'color', 'map', 'uuid', 'keyvalue', 'compute']);
const walkFields = (fields, where, fn) =>
  (fields ?? []).forEach((f) => {
    if (!f.name) fail(`${where}: a field has no name`);
    if (!WIDGETS.has(f.widget ?? 'string')) fail(`${where}.${f.name}: unknown widget "${f.widget}"`);
    fn(f, where);
    if (f.fields) walkFields(f.fields, `${where}.${f.name}`, fn);
  });

// version pin: script src, schema comment
const html = fs.readFileSync('public/admin/index.html', 'utf8');
const pinned = html.match(/@sveltia\/cms@([\d.]+)\/dist\/sveltia-cms\.js/)?.[1];
const schemaPin = raw.match(/@sveltia\/cms@([\d.]+)\/schema/)?.[1];
if (!pinned) fail('public/admin/index.html: Sveltia must be pinned to an exact version');
if (!/integrity="sha384-[A-Za-z0-9+/=]{64}"/.test(html)) fail('public/admin/index.html: the Sveltia script needs an sha384 integrity hash');
if (pinned && schemaPin && pinned !== schemaPin) fail(`config.yml schema comment is @${schemaPin} but index.html loads @${pinned}`);
if (!/<meta name="robots" content="noindex/.test(html)) fail('public/admin/index.html must be noindex');

// enums declared in the Astro content schema
const contentConfig = fs.readFileSync('src/content.config.ts', 'utf8');
const enums = {};
for (const m of contentConfig.matchAll(/const (\w+) = defineCollection\(\{([\s\S]*?)\n\}\);/g)) {
  const body = m[2];
  enums[m[1]] = Object.fromEntries([...body.matchAll(/(\w+): z\.enum\(\[([\s\S]*?)\]\)/g)].map((e) => [e[1], [...e[2].matchAll(/'([^']+)'/g)].map((x) => x[1])]));
}
const astroOf = (folder) => (folder === 'src/content/blog' ? 'blog' : folder === 'src/content/blog-ar' ? 'blogAr' : 'blogTr');

const frontMatter = (file) => {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  return m ? YAML.parse(m[1]) : null;
};
const optionValues = (f) => (f.options ?? []).map((o) => (typeof o === 'object' ? o.value : o));

const slugsByCollection = {};
for (const c of config.collections ?? []) {
  if (c.folder) slugsByCollection[c.name] = fs.existsSync(c.folder) ? fs.readdirSync(c.folder).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, '')) : [];
}

let articles = 0;
for (const c of config.collections ?? []) {
  const where = `collection ${c.name}`;
  walkFields(c.fields, where, () => {});
  (c.files ?? []).forEach((f) => walkFields(f.fields, `${where}/${f.name}`, () => {}));

  if (c.folder) {
    if (!fs.existsSync(c.folder)) {
      fail(`${where}: folder ${c.folder} does not exist`);
      continue;
    }
    const fields = Object.fromEntries((c.fields ?? []).map((f) => [f.name, f]));
    const astro = enums[astroOf(c.folder)] ?? {};
    for (const [key, values] of Object.entries(astro)) {
      const opts = optionValues(fields[key] ?? {});
      if (JSON.stringify([...opts].sort()) !== JSON.stringify([...values].sort())) fail(`${where}.${key}: CMS options [${opts.join(', ')}] ≠ src/content.config.ts [${values.join(', ')}]`);
    }
    for (const file of fs.readdirSync(c.folder).filter((f) => f.endsWith('.md'))) {
      articles++;
      const fm = frontMatter(path.join(c.folder, file));
      const id = `${c.folder}/${file}`;
      if (!fm) {
        fail(`${id}: no front-matter`);
        continue;
      }
      for (const k of Object.keys(fm)) if (!fields[k]) fail(`${id}: front-matter key "${k}" is not a field in ${where} — editors couldn't see or keep it`);
      for (const f of Object.values(fields)) {
        if (f.name === 'body') continue;
        const v = fm[f.name];
        const required = f.required !== false && f.widget !== 'boolean';
        if (required && (v === undefined || v === '') && f.default === undefined) fail(`${id}: required field "${f.name}" is missing`);
        if (v !== undefined && f.widget === 'select' && !optionValues(f).includes(v)) fail(`${id}: ${f.name} "${v}" is not one of the CMS options`);
        if (v !== undefined && f.widget === 'relation' && !(slugsByCollection[f.collection] ?? []).includes(v)) fail(`${id}: ${f.name} "${v}" is not an article in ${f.collection}`);
      }
    }
  }

  for (const f of c.files ?? []) {
    const targets = f.file.includes('{{locale}}') ? (config.i18n?.locales ?? []).map((l) => f.file.replace('{{locale}}', l)) : [f.file];
    for (const t of targets) {
      if (!fs.existsSync(t)) {
        fail(`${where}/${f.name}: ${t} does not exist`);
        continue;
      }
      const data = JSON.parse(fs.readFileSync(t, 'utf8'));
      // the data must have exactly the CMS fields (recursively for objects and lists)
      const check = (value, fields, at) => {
        const names = new Set(fields.map((x) => x.name));
        for (const k of Object.keys(value ?? {})) if (!names.has(k)) fail(`${t}: "${at}${k}" is not editable in the CMS`);
        for (const x of fields) {
          const v = value?.[x.name];
          if (v === undefined && x.required !== false && x.widget !== 'hidden') fail(`${t}: "${at}${x.name}" is missing`);
          if (x.widget === 'object' && x.fields) check(v, x.fields, `${at}${x.name}.`);
          if (x.widget === 'list' && x.fields) (v ?? []).forEach((item, i) => check(item, x.fields, `${at}${x.name}[${i}].`));
          if (x.widget === 'number' && v !== undefined && (!Number.isInteger(v) || v < (x.min ?? -Infinity) || v > (x.max ?? Infinity))) fail(`${t}: "${at}${x.name}" = ${v} is outside the CMS limits`);
        }
      };
      check(data, f.fields, '');
    }
  }
}

if (errors.length) {
  errors.forEach((e) => console.log(`✗ ${e}`));
  console.log(`\n${CONFIG}: ${errors.length} problem(s).`);
  process.exit(1);
}
console.log(`✓ CMS config OK — ${config.collections.length} collections, ${articles} articles match their fields, Sveltia @${pinned} pinned with SRI.`);
