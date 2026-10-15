import { document } from '../shared.mjs';

/* Narration of Hafs ’an ’Asim (Shatibiyyah). Examples in standard script with full vowels.
   Needs the academic sign-off tracked in Linear ABO-39 before wide distribution. */
const NOON = [
  { en: 'Izhar', ar: 'الإظهار', letters: 'ء ه ع ح غ خ', how: 'Pronounce the noon clearly — no ghunnah.', ex: 'مَنْ آمَنَ' },
  { en: 'Idgham with ghunnah', ar: 'الإدغام بغنة', letters: 'ي ن م و', how: 'Merge into the next letter with a 2-count ghunnah.', ex: 'مَن يَقُولُ' },
  { en: 'Idgham without ghunnah', ar: 'الإدغام بغير غنة', letters: 'ل ر', how: 'Merge completely — no ghunnah.', ex: 'مِن رَّبِّهِمْ' },
  { en: 'Iqlab', ar: 'الإقلاب', letters: 'ب', how: 'Turn the noon into a hidden meem, with ghunnah.', ex: 'مِنْ بَعْدِ' },
  { en: 'Ikhfa', ar: 'الإخفاء', letters: 'ص ذ ث ك ج ش ق س د ط ز ف ت ض ظ', dense: true, how: 'Hide the noon between izhar and idgham, with ghunnah.', ex: 'مِن قَبْلِكَ' },
];
const MEEM = [
  { en: 'Ikhfa shafawi', ar: 'الإخفاء الشفوي', letters: 'ب', how: 'Hide the meem with ghunnah, lips lightly closed.', ex: 'تَرْمِيهِم بِحِجَارَةٍ' },
  { en: 'Idgham mithlayn', ar: 'إدغام المثلين', letters: 'م', how: 'Merge meem into meem, with ghunnah.', ex: 'وَلَكُم مَّا' },
  { en: 'Izhar shafawi', ar: 'الإظهار الشفوي', letters: 'all other letters', lettersAr: 'باقي الحروف', how: 'Pronounce the meem clearly — take extra care before و and ف.', ex: 'أَلَمْ تَرَ' },
];
const MADD = [
  { en: 'Natural', ar: 'المد الطبيعي', counts: '2', when: 'A madd letter (ا و ي) with no hamza or sukoon after it', ex: 'قَالَ' },
  { en: 'Connected (muttasil)', ar: 'المد المتصل', counts: '4–5', when: 'Hamza after the madd letter in the same word', ex: 'السَّمَاءِ' },
  { en: 'Separated (munfasil)', ar: 'المد المنفصل', counts: '4–5', when: 'Madd letter ends a word, hamza begins the next', ex: 'بِمَا أُنزِلَ' },
  { en: 'Necessary (lazim)', ar: 'المد اللازم', counts: '6', when: 'A permanent sukoon or shaddah after the madd letter', ex: 'الضَّالِّينَ' },
  { en: 'Temporary sukoon (ʿarid)', ar: 'المد العارض للسكون', counts: '2, 4 or 6', when: 'Stopping on a word whose last letter follows a madd letter', ex: 'الرَّحِيمْ', note: 'when stopping' },
  { en: 'Leen', ar: 'مد اللين', counts: '2, 4 or 6', when: 'و or ي with sukoon after a fatha, when stopping', ex: 'خَوْفْ · الْبَيْتْ', note: 'when stopping' },
];

const rule = (r, tone) => `
<div class="rule rule--${tone}">
  <div class="rule__top"><b>${r.en}</b><span class="ar">${r.ar}</span></div>
  <div class="rule__letters ${r.lettersAr ? '' : 'q'} ${r.dense ? 'rule__letters--dense' : ''}">${r.lettersAr ? `<span class="muted">${r.letters}</span>` : r.letters}</div>
  <p>${r.how}</p>
  <div class="rule__ex"><span class="muted">e.g.</span><span class="q">${r.ex}</span></div>
</div>`;

const page = `
<h2 class="sec"><span>Noon sakinah &amp; tanween</span><span class="ar">أحكام النون الساكنة والتنوين</span></h2>
<div class="grid grid--5">${NOON.map((r) => rule(r, 'violet')).join('')}</div>
<p class="tip">Idgham only happens <b>between two words</b>. Inside one word the noon is read clearly: <span class="q">الدُّنْيَا</span></p>

<h2 class="sec"><span>Meem sakinah</span><span class="ar">أحكام الميم الساكنة</span></h2>
<div class="grid grid--3">${MEEM.map((r) => rule(r, 'sky')).join('')}</div>

<div class="duo">
  <div>
    <h2 class="sec"><span>Qalqalah</span><span class="ar">القلقلة</span></h2>
    <div class="rule rule--rose">
      <div class="rule__letters q">ق ط ب ج د <span class="muted small">(قُطْبُ جَدٍّ)</span></div>
      <p>A light echo when the letter has sukoon — strongest when you stop on it.</p>
      <div class="rule__ex"><span class="muted">e.g.</span><span class="q">لَمْ يَلِدْ</span><span class="muted">·</span><span class="q">الْفَلَقْ</span></div>
    </div>
  </div>
  <div>
    <h2 class="sec"><span>Ghunnah</span><span class="ar">الغنة</span></h2>
    <div class="rule rule--rose">
      <div class="rule__letters q">نّ مّ</div>
      <p>Noon and meem with shaddah: hold the nasal sound for 2 counts.</p>
      <div class="rule__ex"><span class="muted">e.g.</span><span class="q">النَّاسِ</span><span class="muted">·</span><span class="q">ثُمَّ</span></div>
    </div>
  </div>
</div>

<h2 class="sec"><span>The madd family</span><span class="ar">المدود</span></h2>
<table class="madd">
  <thead><tr><th>Type</th><th>Counts</th><th>When</th><th>Example</th></tr></thead>
  <tbody>
    ${MADD.map((m) => `<tr><td><b>${m.en}</b><span class="ar">${m.ar}</span></td><td class="counts">${m.counts}</td><td>${m.when}</td><td><span class="q">${m.ex}</span>${m.note ? `<span class="muted small"> ${m.note}</span>` : ''}</td></tr>`).join('')}
  </tbody>
</table>
<p class="tip"><b>One count (harakah)</b> is roughly the time it takes to fold or unfold one finger at a steady pace. <span class="ar">الحركة: مقدار قبض الإصبع أو بسطه بسرعة معتدلة.</span></p>
<p class="tip">Narration of Hafs ’an ’Asim (Shatibiyyah). Examples are in standard script — follow your teacher and your Mushaf. <span class="ar">وفق رواية حفص عن عاصم من طريق الشاطبية. الأمثلة بالرسم الإملائي؛ اتبع معلمك ومصحفك.</span></p>
`;

const css = `
.sec { display: flex; align-items: baseline; justify-content: space-between; gap: 4mm; margin: 2mm 0 1.4mm; font-size: 11pt; font-weight: 650; letter-spacing: -0.01em; }
.sec .ar { font-size: 10.5pt; font-weight: 600; color: #5a2f8a; }
.grid { display: grid; gap: 2mm; }
.grid--5 { grid-template-columns: repeat(5, 1fr); }
.grid--3 { grid-template-columns: repeat(3, 1fr); }
.duo { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm; }
.rule { border: 0.3mm solid #e4dcef; border-inline-start: 1.2mm solid var(--tone); border-radius: 2.6mm; padding: 1.6mm 2.4mm; background: #fcfbfe; display: flex; flex-direction: column; gap: 1mm; }
.rule--violet { --tone: #8f5cc2; }
.rule--sky { --tone: #4f8fd0; }
.rule--rose { --tone: #c87b80; }
.rule__top { display: flex; flex-direction: column; }
.rule__top b { font-size: 9pt; line-height: 1.2; }
.rule__top .ar { font-size: 9pt; color: #5a2f8a; font-weight: 600; text-align: start; direction: rtl; align-self: flex-end; }
.rule__letters { font-size: 12.5pt; color: #1e1530; text-align: right; letter-spacing: 0.04em; line-height: 1.45; }
.rule__letters--dense { font-size: 10.5pt; letter-spacing: 0; word-spacing: -0.05em; line-height: 1.5; }
.rule__letters .muted { font-family: 'Geist', sans-serif; font-size: 8.5pt; direction: ltr; }
.rule p { margin: 0; font-size: 8pt; line-height: 1.35; color: #4a4060; flex: 1; }
.rule__ex { display: flex; align-items: baseline; justify-content: space-between; gap: 1.5mm; border-top: 0.3mm dashed #e4dcef; padding-top: 1mm; font-size: 8pt; }
.rule__ex .q { font-size: 13pt; color: #5a2f8a; }
.tip { margin: 1.4mm 0 0; font-size: 7.8pt; color: #6a6182; }
.tip b { color: #4a4060; }
.tip .q { font-size: 11pt; color: #1e1530; }
.tip .ar { display: block; font-size: 7.8pt; }
.small { font-size: 7.5pt; }
.madd td, .madd th { padding: 0.7mm 2mm; font-size: 8.2pt; line-height: 1.3; }
.madd td .ar { display: block; font-size: 7.8pt; color: #5a2f8a; text-align: start; line-height: 1.25; }
.madd .counts { font-weight: 650; color: #5a2f8a; white-space: nowrap; text-align: center; }
.madd .q { font-size: 12pt; color: #1e1530; line-height: 1.5; }
`;

export default {
  id: 'tajweed-rules-summary',
  file: 'ummah-academy-tajweed-rules-summary.pdf',
  html: () =>
    document({
      title: 'Tajweed Rules Summary',
      titleHtml: 'Tajweed rules <em>at a glance</em>',
      titleAr: 'ملخص أحكام التجويد',
      tag: 'Qur’an · Tajweed',
      pages: [page],
      css,
    }),
};
