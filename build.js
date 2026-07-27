/*
 * Static-site build.
 *
 * The files in shared/, homepage/, pages/ and courses/ are Elementor HTML
 * fragments — no <html>, no <head>, no stylesheet link. That's deliberate
 * (see README) and this script does not change it. It only *composes* those
 * fragments into complete, standalone documents under dist/ so the same
 * source can also be served as a plain static site (Vercel, Netlify, or
 * `npx serve dist` locally).
 *
 * Source files are read, never written.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');

const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');

/* ---------------------------------------------------------------- header --
 * header.html links out to the live WordPress site by absolute URL, which
 * would bounce a visitor off this deployment on the first click. Rewrite the
 * nav targets to the flat /*.html scheme footer.html already uses. Exact-match
 * only — the wp-content image URLs on the same host must survive untouched.
 */
const NAV_REWRITES = {
  'https://ummahacademy.net/': '/index.html',
  'https://ummahacademy.net/about/': '/about.html',
  'https://ummahacademy.net/blog/': '/blog.html',
  'https://ummahacademy.net/contact/': '/contact.html',
  'https://ummahacademy.net/courses/': '/courses.html',
  'https://ummahacademy.net/courses/#arabic': '/courses.html#ua-track-arabic',
  'https://ummahacademy.net/courses/#islamic': '/courses.html#ua-track-islamic',
  'https://ummahacademy.net/courses/#kids': '/courses.html#ua-track-kids',
  'https://ummahacademy.net/courses/#quran': '/courses.html#ua-track-quran',
  'https://ummahacademy.net/pricing/': '/pricing.html',
  'https://ummahacademy.net/teachers/': '/teachers.html',
};

function localiseNav(html) {
  return Object.entries(NAV_REWRITES).reduce(
    (out, [from, to]) => out.split(`href="${from}"`).join(`href="${to}"`),
    html
  );
}

const HEADER = localiseNav(read('shared', 'header.html'));
const FOOTER = read('shared', 'footer.html');

/* ----------------------------------------------------------------- title --
 * Every page fragment carries exactly one <h1>; use it as the document title.
 */
function titleFrom(html, fallback) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return fallback;
  const text = m[1]
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
  return text || fallback;
}

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/* The reset in styles.css is scoped to .ua-homepage so it can't leak into a
 * surrounding WordPress theme. Standalone, nothing surrounds it — so the class
 * goes on <body> and covers header, content and footer alike. */
function document_(title, description, body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeAttr(title)} — Ummah Academy</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="stylesheet" href="/shared/styles.css">
</head>
<body class="ua-homepage">
${HEADER}
<main id="main-content">
${body}
</main>
${FOOTER}
<script src="/shared/script.js" defer></script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ pages */
function emit(outPath, html) {
  const full = path.join(DIST, outPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
  console.log('  ' + outPath.replace(/\\/g, '/'));
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

console.log('building dist/');

// Homepage — every fragment in homepage/, in filename order (01-, 02-, ...).
const homeParts = fs
  .readdirSync(path.join(ROOT, 'homepage'))
  .filter((f) => f.endsWith('.html'))
  .sort();
const homeBody = homeParts.map((f) => read('homepage', f)).join('\n');
emit(
  'index.html',
  document_(
    'Qur’an, Arabic & Islamic Studies Online',
    'Live one-to-one Qur’an, Arabic and Islamic studies with qualified teachers.',
    homeBody
  )
);

// Standalone pages -> flat /<name>.html, matching the links in footer.html.
for (const f of fs.readdirSync(path.join(ROOT, 'pages')).filter((f) => f.endsWith('.html'))) {
  const src = read('pages', f);
  emit(f, document_(titleFrom(src, path.basename(f, '.html')), '', src));
}

// Course detail pages -> /courses/<slug>.html.
for (const f of fs.readdirSync(path.join(ROOT, 'courses')).filter((f) => f.endsWith('.html'))) {
  const src = read('courses', f);
  emit(path.join('courses', f), document_(titleFrom(src, path.basename(f, '.html')), '', src));
}

// Shared assets, referenced from every page by root-absolute path.
fs.mkdirSync(path.join(DIST, 'shared'), { recursive: true });
for (const asset of ['styles.css', 'script.js']) {
  fs.copyFileSync(path.join(ROOT, 'shared', asset), path.join(DIST, 'shared', asset));
  console.log('  shared/' + asset);
}

/* Links that exist in the chrome but have no page behind them yet. Surfaced
 * here rather than silently 404-ing in production. */
const missing = ['pricing.html', 'privacy.html', 'terms.html'].filter(
  (f) => !fs.existsSync(path.join(DIST, f))
);
if (missing.length) {
  console.log('\nnote: linked from footer/header but not built yet — these will 404:');
  missing.forEach((f) => console.log('  /' + f));
}

console.log('\ndone.');
