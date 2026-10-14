import { document, icon } from '../shared.mjs';

/* ---------- 1 · Five Pillars matching ---------- */
const PILLARS = [
  { en: 'Shahadah', ar: 'الشهادة', icon: 'hand-pointing', text: 'Believing and saying: there is no god but Allah, and Muhammad ﷺ is His Messenger.' },
  { en: 'Salah', ar: 'الصلاة', icon: 'hands-praying', text: 'Praying five times every day.' },
  { en: 'Zakah', ar: 'الزكاة', icon: 'hand-coins', text: 'Giving part of our money to people in need.' },
  { en: 'Sawm', ar: 'الصوم', icon: 'moon-stars', text: 'Fasting in the month of Ramadan.' },
  { en: 'Hajj', ar: 'الحج', icon: 'mosque', text: 'Visiting the Ka‘bah in Makkah once in our life, if we are able.' },
];
const shuffled = [2, 4, 0, 3, 1].map((i) => PILLARS[i]);
const page1 = `
<p class="howto">${icon('pencil-simple', 'bold', 14)} Draw a line from each pillar to what it means. Then colour the pictures! <span class="ar">صِل كل ركن بمعناه، ثم لوّن الصور!</span></p>
<div class="match">
  <ol class="match__col">
    ${PILLARS.map((p, i) => `<li class="pill"><span class="pill__n">${i + 1}</span><span class="pill__icon">${icon(p.icon, 'light', 30)}</span><span class="pill__name"><b>${p.en}</b><span class="ar">${p.ar}</span></span><span class="dotpt"></span></li>`).join('')}
  </ol>
  <ul class="match__col match__col--r">
    ${shuffled.map((p) => `<li class="mean"><span class="dotpt"></span><span>${p.text}</span></li>`).join('')}
  </ul>
</div>
<div class="fill">
  <p><b>Fill in the missing word</b> <span class="ar">أكمل الفراغ</span></p>
  <p>There are <span class="blank"></span> pillars of Islam. The first pillar is the <span class="blank"></span>.</p>
  <p>We fast in the month of <span class="blank"></span>. We pray <span class="blank"></span> times a day.</p>
  <p class="muted small upside">Answers: 5 · Shahadah · Ramadan · 5</p>
</div>
`;

/* ---------- 2 · Prophets word search (deterministic) ---------- */
const PROPHETS = [
  ['ADAM', 'آدم'],
  ['NUH', 'نوح'],
  ['IBRAHIM', 'إبراهيم'],
  ['ISMAIL', 'إسماعيل'],
  ['YUSUF', 'يوسف'],
  ['MUSA', 'موسى'],
  ['HARUN', 'هارون'],
  ['DAWUD', 'داود'],
  ['YUNUS', 'يونس'],
  ['ISA', 'عيسى'],
  ['MUHAMMAD', 'محمد ﷺ'],
];
const N = 12;
function rng(seed) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
function buildGrid(seed) {
  const r = rng(seed);
  const g = Array.from({ length: N }, () => Array(N).fill(''));
  const placed = [];
  const words = [...PROPHETS].sort((a, b) => b[0].length - a[0].length);
  for (const [w] of words) {
    let ok = false;
    for (let t = 0; t < 400 && !ok; t++) {
      const dir = r() < 0.5 ? [0, 1] : [1, 0];
      const row = Math.floor(r() * (N - (dir[0] ? w.length : 0) + (dir[0] ? 0 : 0)));
      const col = Math.floor(r() * (N - (dir[1] ? w.length : 0)));
      const rr = dir[0] ? Math.floor(r() * (N - w.length + 1)) : row;
      const cc = dir[1] ? Math.floor(r() * (N - w.length + 1)) : col;
      let fits = true;
      for (let k = 0; k < w.length; k++) {
        const ch = g[rr + dir[0] * k][cc + dir[1] * k];
        if (ch && ch !== w[k]) fits = false;
      }
      if (!fits) continue;
      for (let k = 0; k < w.length; k++) g[rr + dir[0] * k][cc + dir[1] * k] = w[k];
      placed.push({ w, rr, cc, dir });
      ok = true;
    }
    if (!ok) return null;
  }
  const solution = g.map((row) => row.map((c) => Boolean(c)));
  const AZ = 'ABDEFGHIKLMNORSTUWY';
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (!g[i][j]) g[i][j] = AZ[Math.floor(r() * AZ.length)];
  return { g, solution, placed };
}
let ws = null;
for (let s = 7; !ws; s++) ws = buildGrid(s);
const cells = (sol) =>
  ws.g
    .map((row, i) => row.map((c, j) => `<span class="${sol && ws.solution[i][j] ? 'on' : ''}">${c}</span>`).join(''))
    .join('');
const page2 = `
<p class="howto">${icon('magnifying-glass', 'bold', 14)} Find the names of ${PROPHETS.length} prophets, peace be upon them. Words go across and down. <span class="ar">ابحث عن أسماء الأنبياء عليهم السلام.</span></p>
<div class="ws">
  <div class="ws__grid">${cells(false)}</div>
  <ul class="ws__list">${PROPHETS.map(([en, ar]) => `<li><span class="box"></span><b>${en}</b><span class="ar">${ar}</span></li>`).join('')}</ul>
</div>
<div class="ws__solution">
  <div class="ws__mini">${cells(true)}</div>
  <p class="muted small">Solution — no peeking!<br><span class="ar">الحل — لا تنظر قبل أن تنتهي!</span></p>
</div>
`;

/* ---------- 3 · Good deeds chart ---------- */
const DEEDS = [
  ['I said Bismillah before eating', 'قلتُ بسم الله قبل الأكل'],
  ['I prayed on time', 'صلّيتُ في الوقت'],
  ['I read Qur’an', 'قرأتُ القرآن'],
  ['I helped at home', 'ساعدتُ في البيت'],
  ['I was kind to my brothers and sisters', 'كنتُ لطيفًا مع إخوتي'],
  ['I said salam to my family', 'ألقيتُ السلام على أهلي'],
  ['I made du‘a for my parents', 'دعوتُ لوالديّ'],
];
const DAYS = [
  ['Mon', 'الاثنين'],
  ['Tue', 'الثلاثاء'],
  ['Wed', 'الأربعاء'],
  ['Thu', 'الخميس'],
  ['Fri', 'الجمعة'],
  ['Sat', 'السبت'],
  ['Sun', 'الأحد'],
];
const star = `<svg viewBox="0 0 24 24" class="star" aria-hidden="true"><path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.87l-5.5 2.88 1.05-6.12L3.1 9.3l6.15-.9z"/></svg>`;
const page3 = `
<div class="fields"><label>My name <span class="ar">اسمي</span><i></i></label><label>Week <span class="ar">الأسبوع</span><i></i></label></div>
<p class="howto">${icon('star', 'bold', 14)} Colour a star every time you do a good deed. How many stars can you collect this week? <span class="ar">لوّن نجمة عن كل عمل صالح!</span></p>
<table class="deeds">
  <thead><tr><th>Good deed<span class="ar">العمل الصالح</span></th>${DAYS.map(([en, ar]) => `<th class="d">${en}<span class="ar">${ar}</span></th>`).join('')}</tr></thead>
  <tbody>${DEEDS.map(([en, ar]) => `<tr><td><b>${en}</b><span class="ar">${ar}</span></td>${DAYS.map(() => `<td class="d">${star}</td>`).join('')}</tr>`).join('')}</tbody>
</table>
<div class="total">
  <span>${icon('trophy', 'light', 30)}</span>
  <p><b>My stars this week</b><span class="ar">نجومي هذا الأسبوع</span></p>
  <span class="total__box"></span>
</div>
<p class="hadith">“The most beloved deeds to Allah are those done regularly, even if they are small.” <span class="muted">(al-Bukhari and Muslim)</span><span class="ar">«أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ» متفق عليه</span></p>
`;

/* ---------- 4 · Geometric colouring page (8-point star & cross) ---------- */
function starPath(cx, cy, R) {
  const r = R * Math.cos(Math.PI / 4) / Math.cos(Math.PI / 8);
  const pts = [];
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const rad = k % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}
function octPath(cx, cy, R) {
  const pts = [];
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4 + Math.PI / 8;
    pts.push(`${(cx + R * Math.cos(a)).toFixed(2)},${(cy + R * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}
const W = 180, H = 214, D = 30;
let shapes = '';
for (let y = -D; y <= H + D; y += D) {
  for (let x = -D; x <= W + D; x += D) {
    shapes += `<path d="${starPath(x, y, D / 2)}"/>`;
    shapes += `<path d="${octPath(x, y, D * 0.27)}"/>`;
    shapes += `<circle cx="${x}" cy="${y}" r="${(D * 0.12).toFixed(2)}"/>`;
  }
}
// small diamonds in the crosses between stars
for (let y = -D / 2; y <= H + D; y += D) {
  for (let x = -D / 2; x <= W + D; x += D) {
    const s = D * 0.13;
    shapes += `<path d="M${x},${y - s}L${x + s},${y}L${x},${y + s}L${x - s},${y}Z"/>`;
  }
}
const page4 = `
<p class="howto">${icon('paint-brush', 'bold', 14)} Colour the eight-pointed stars — the same shape that marks each quarter-hizb in the Mushaf. <span class="ar">لوّن النجوم الثمانية!</span></p>
<div class="colour">
  <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <defs><clipPath id="frame"><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10"/></clipPath></defs>
    <g clip-path="url(#frame)" fill="none" stroke="#3a2d52" stroke-width="0.45" stroke-linejoin="round">${shapes}</g>
    <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="10" fill="none" stroke="#3a2d52" stroke-width="0.8"/>
  </svg>
</div>
<p class="sign">Coloured by <span class="blank wide"></span> <span class="ar">لوّنها:</span></p>
`;

const css = `
.howto { display: flex; align-items: center; flex-wrap: wrap; gap: 2mm; margin: 0 0 4mm; padding: 2.4mm 3.5mm; border-radius: 3mm; background: #f6f1fc; font-size: 9.5pt; font-weight: 550; color: #3a2d52; }
.howto svg { color: #5a2f8a; }
.howto .ar { font-weight: 600; color: #5a2f8a; margin-inline-start: auto; }
.match { display: grid; grid-template-columns: 1fr 1fr; gap: 26mm; margin-bottom: 6mm; }
.match__col { list-style: none; margin: 0; padding: 0; display: grid; gap: 5mm; }
.pill, .mean { position: relative; display: flex; align-items: center; gap: 3mm; min-height: 25mm; border: 0.35mm solid #e4dcef; border-radius: 4mm; padding: 2.5mm 4mm; background: #fff; }
.pill__n { position: absolute; top: 1.5mm; left: 2.5mm; font-size: 7.5pt; font-weight: 700; color: #b2a8c8; }
.pill__icon { display: grid; place-items: center; width: 15mm; height: 15mm; border-radius: 50%; background: #f6f1fc; color: #5a2f8a; flex: none; }
.pill__name b { display: block; font-size: 13pt; }
.pill__name .ar { display: block; font-size: 12pt; font-weight: 700; color: #5a2f8a; text-align: start; }
.mean span:last-child { font-size: 10pt; line-height: 1.4; color: #3a2d52; }
.dotpt { position: absolute; width: 3.4mm; height: 3.4mm; border-radius: 50%; background: #5a2f8a; top: 50%; translate: 0 -50%; }
.pill .dotpt { right: -1.7mm; }
.mean .dotpt { left: -1.7mm; }
.mean { padding-inline-start: 5mm; }
.fill { border: 0.35mm dashed #cfc3e3; border-radius: 4mm; padding: 3.5mm 5mm; font-size: 10.5pt; }
.fill p { margin: 0 0 3mm; line-height: 2; }
.fill p:first-child { line-height: 1.4; }
.fill .ar { color: #5a2f8a; font-weight: 600; margin-inline-start: 2mm; }
.upside { rotate: 180deg; width: fit-content; margin: 0 !important; line-height: 1.4 !important; }
.blank { display: inline-block; width: 26mm; border-bottom: 0.35mm solid #9d93b5; height: 6mm; }
.blank.wide { width: 70mm; }
.small { font-size: 7.6pt; }
.ws { display: flex; flex-direction: column; align-items: center; gap: 6mm; }
.ws__grid { display: grid; grid-template-columns: repeat(${N}, 12.6mm); grid-auto-rows: 12.6mm; border: 0.4mm solid #3a2d52; border-radius: 3mm; overflow: hidden; }
.ws__grid span { display: grid; place-items: center; font-size: 16pt; font-weight: 600; color: #1e1530; border-right: 0.2mm solid #e4dcef; border-bottom: 0.2mm solid #e4dcef; }
.ws__grid span:nth-child(${N}n) { border-right: 0; }
.ws__list { list-style: none; margin: 0; padding: 0 4mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.6mm 6mm; width: 100%; }
.ws__list li { display: flex; align-items: center; gap: 2mm; font-size: 10.5pt; white-space: nowrap; }
.ws__list .ar { color: #5a2f8a; font-weight: 600; font-size: 10pt; }
.ws__solution { margin-top: auto; margin-bottom: 4mm; display: flex; align-items: center; gap: 4mm; rotate: 180deg; align-self: flex-start; }
.ws__mini { display: grid; grid-template-columns: repeat(${N}, 3.2mm); grid-auto-rows: 3.2mm; border: 0.25mm solid #9d93b5; }
.ws__mini span { display: grid; place-items: center; font-size: 5pt; color: #b2a8c8; }
.ws__mini span.on { background: #e9dcf7; color: #3a2d52; font-weight: 700; }
.fields { display: grid; grid-template-columns: 1.4fr 1fr; gap: 6mm; margin-bottom: 4mm; }
.fields label { display: flex; align-items: flex-end; gap: 1.5mm; font-size: 9.5pt; font-weight: 600; color: #4a4060; white-space: nowrap; }
.fields .ar { font-size: 9pt; font-weight: 500; color: #6a6182; }
.fields i { flex: 1; border-bottom: 0.3mm solid #9d93b5; height: 6mm; }
.deeds th { text-align: center; padding: 1.6mm 1mm; font-size: 8.5pt; }
.deeds th:first-child { text-align: start; padding-inline-start: 3mm; }
.deeds td { height: 19mm; }
.deeds td:first-child { padding-inline-start: 3mm; font-size: 9.5pt; }
.deeds td .ar { display: block; font-size: 9pt; color: #5a2f8a; text-align: start; }
.deeds .d { width: 16.5mm; text-align: center; }
.deeds th.d .ar { text-align: center; }
.star { width: 11mm; height: 11mm; fill: none; stroke: #9d84c2; stroke-width: 1.1; stroke-linejoin: round; }
.total { display: flex; align-items: center; gap: 4mm; margin-top: 5mm; padding: 3mm 5mm; border-radius: 4mm; background: #f6f1fc; color: #5a2f8a; }
.total p { margin: 0; flex: 1; font-size: 11pt; }
.total .ar { display: block; font-weight: 600; text-align: left; }
.total__box { width: 26mm; height: 14mm; border-radius: 3mm; border: 0.4mm solid #9d84c2; background: #fff; }
.hadith { margin: 5mm 0 0; font-size: 9pt; color: #4a4060; text-align: center; }
.hadith .ar { display: block; font-family: 'Amiri', serif; font-size: 12pt; color: #5a2f8a; margin-top: 1mm; direction: rtl; }
.colour { flex: 1; display: grid; place-items: center; min-height: 0; padding-bottom: 2mm; }
.colour svg { width: 100%; height: 100%; max-height: 196mm; }
.sign { display: flex; align-items: baseline; gap: 2mm; margin: 0 0 4mm; font-size: 10pt; }
.sign .ar { color: #5a2f8a; font-weight: 600; }
`;

export default {
  id: 'ummah-cubs-activity-pack',
  file: 'ummah-academy-cubs-activity-pack.pdf',
  html: () =>
    document({
      title: 'Ummah Cubs Activity Pack',
      titleHtml: 'Ummah Cubs <em>activity pack</em>',
      titleAr: 'أنشطة أشبال الأمة',
      tag: 'Kids · Ages 5–11',
      lede: 'Four printable activities to enjoy together: match the Five Pillars, find the prophets’ names, collect good-deed stars, and colour an Islamic geometric pattern.',
      pages: [page1, page2, page3, page4],
      css,
    }),
};
