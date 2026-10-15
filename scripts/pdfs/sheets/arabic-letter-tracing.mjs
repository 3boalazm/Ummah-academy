import { document } from '../shared.mjs';

// [letter, Arabic name, English name, sound hint, example word, gloss, joins-to-next]
const LETTERS = [
  ['ا', 'أَلِف', 'Alif', 'a long “aa”', 'أَسَد', 'lion', false],
  ['ب', 'بَاء', 'Baa', 'b as in “book”', 'بَيْت', 'house', true],
  ['ت', 'تَاء', 'Taa', 't as in “tree”', 'تُفَّاحَة', 'apple', true],
  ['ث', 'ثَاء', 'Thaa', 'th as in “think”', 'ثَعْلَب', 'fox', true],
  ['ج', 'جِيم', 'Jeem', 'j as in “jam”', 'جَمَل', 'camel', true],
  ['ح', 'حَاء', 'Haa', 'a breathy h from the throat', 'حِصَان', 'horse', true],
  ['خ', 'خَاء', 'Khaa', 'like “ch” in “loch”', 'خَرُوف', 'sheep', true],
  ['د', 'دَال', 'Daal', 'd as in “door”', 'دُبّ', 'bear', false],
  ['ذ', 'ذَال', 'Dhaal', 'th as in “this”', 'ذُرَة', 'corn', false],
  ['ر', 'رَاء', 'Raa', 'a rolled r', 'رُمَّان', 'pomegranate', false],
  ['ز', 'زَاي', 'Zaay', 'z as in “zoo”', 'زَرَافَة', 'giraffe', false],
  ['س', 'سِين', 'Seen', 's as in “sun”', 'سَمَكَة', 'fish', true],
  ['ش', 'شِين', 'Sheen', 'sh as in “ship”', 'شَمْس', 'sun', true],
  ['ص', 'صَاد', 'Saad', 'a heavy s', 'صَقْر', 'falcon', true],
  ['ض', 'ضَاد', 'Daad', 'a heavy d', 'ضِفْدَع', 'frog', true],
  ['ط', 'طَاء', 'Taa', 'a heavy t', 'طَائِرَة', 'aeroplane', true],
  ['ظ', 'ظَاء', 'Dhaa', 'a heavy “th” as in “this”', 'ظَرْف', 'envelope', true],
  ['ع', 'عَيْن', '‘Ayn', 'from the middle of the throat', 'عِنَب', 'grapes', true],
  ['غ', 'غَيْن', 'Ghayn', 'like a French r', 'غَيْمَة', 'cloud', true],
  ['ف', 'فَاء', 'Faa', 'f as in “fish”', 'فِيل', 'elephant', true],
  ['ق', 'قَاف', 'Qaaf', 'a deep k from the back of the tongue', 'قَمَر', 'moon', true],
  ['ك', 'كَاف', 'Kaaf', 'k as in “kite”', 'كِتَاب', 'book', true],
  ['ل', 'لَام', 'Laam', 'l as in “lamp”', 'لَيْمُون', 'lemon', true],
  ['م', 'مِيم', 'Meem', 'm as in “moon”', 'مَسْجِد', 'mosque', true],
  ['ن', 'نُون', 'Noon', 'n as in “nest”', 'نَجْمَة', 'star', true],
  ['ه', 'هَاء', 'Haa', 'h as in “hat”', 'هِلَال', 'crescent moon', true],
  ['و', 'وَاو', 'Waaw', 'w as in “water”, or a long “oo”', 'وَرْدَة', 'rose', false],
  ['ي', 'يَاء', 'Yaa', 'y as in “yes”, or a long “ee”', 'يَد', 'hand', true],
];

const T = 'ـ'; // tatweel shows the joining stroke
const forms = (l, joins) => (joins ? [l, l + T, T + l + T, T + l] : [l, l, T + l, T + l]);

/** dotted outline glyph to trace over (viewBox is tall enough for descenders) */
const dotted = (ch, faint = false) =>
  `<svg viewBox="0 0 100 130" class="dot${faint ? ' dot--faint' : ''}" aria-hidden="true"><line x1="2" x2="98" y1="84" y2="84" class="base"/><text x="50" y="84" text-anchor="middle" font-size="90" class="trace">${ch}</text></svg>`;

const block = ([l, arName, en, hint, word, gloss, joins], i) => {
  const [iso, ini, med, fin] = forms(l, joins);
  return `
<div class="letter">
  <div class="letter__hero">
    <span class="letter__no">${i + 1}</span>
    ${dotted(l)}
    <span class="letter__names"><b class="ar">${arName}</b><span>${en}</span></span>
    <span class="letter__hint">${hint}</span>
    <span class="word"><span class="q">${word}</span><span class="muted">${gloss}</span></span>
  </div>
  <div class="letter__work">
    <div class="forms" dir="rtl">
      ${[
        ['منفصل', 'alone', iso],
        ['أول', 'start', ini],
        ['وسط', 'middle', med],
        ['آخر', 'end', fin],
      ]
        .map(([a, e, f]) => `<span class="form"><span class="q">${f}</span><small><span class="ar">${a}</span> · ${e}</small></span>`)
        .join('')}
    </div>
    <div class="trace-row" dir="rtl">${Array.from({ length: 6 }, (_, k) => dotted(l, k >= 3)).join('')}</div>
    <div class="write-row"></div>
  </div>
</div>`;
};

const pages = [];
for (let p = 0; p < 7; p++) {
  pages.push(`<div class="letters">${LETTERS.slice(p * 4, p * 4 + 4).map((L, k) => block(L, p * 4 + k)).join('')}</div>`);
}

const css = `
.letters { flex: 1; display: grid; grid-template-rows: repeat(4, 1fr); gap: 2.4mm; padding-bottom: 2.6mm; min-height: 0; }
.letter { display: grid; grid-template-columns: 1fr 44mm; gap: 3mm; border: 0.3mm solid #e4dcef; border-radius: 3mm; padding: 2.2mm 2.6mm; background: #fff; min-height: 0; }
.letter__hero { order: 2; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4mm; border-radius: 2.4mm; background: linear-gradient(160deg, #f6f1fc, #eef4fb); padding: 1mm 1.5mm; text-align: center; }
.letter__no { position: absolute; top: 1.2mm; left: 2mm; font-size: 7pt; font-weight: 650; color: #9d93b5; }
.letter__hero .dot { width: 26mm; height: 33.8mm; margin: -1.5mm 0 -1.5mm; overflow: visible; }
.letter__names { display: flex; align-items: baseline; gap: 2mm; font-size: 8.5pt; color: #4a4060; }
.letter__names b { font-size: 11pt; color: #5a2f8a; }
.letter__hint { font-size: 6.8pt; line-height: 1.25; color: #6a6182; }
.word { display: flex; align-items: baseline; gap: 1.6mm; font-size: 7.5pt; }
.word .q { font-size: 13pt; line-height: 1.3; color: #1e1530; }
.letter__work { order: 1; display: grid; grid-template-rows: auto 1fr auto; gap: 1.2mm; min-width: 0; min-height: 0; }
.forms { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm; }
.form { display: flex; flex-direction: column; align-items: center; border: 0.3mm solid #efe9f6; border-radius: 1.8mm; padding: 0.2mm 0 0.6mm; background: #fcfbfe; }
.form .q { font-size: 15pt; line-height: 1.65; color: #6a5a8e; }
.form small { font-size: 6.4pt; color: #8a80a3; direction: ltr; }
.form small .ar { font-size: 6.6pt; }
.trace-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1.5mm; justify-items: center; align-items: center; min-height: 0; }
.trace-row .dot { width: 100%; height: 100%; max-height: 27mm; overflow: visible; }
.write-row { height: 11mm; border-bottom: 0.4mm solid #9d93b5; position: relative; }
.write-row::before { content: ''; position: absolute; inset: 40% 0 auto; border-top: 0.3mm dashed #d9d1e8; }
.dot .base { stroke: #e7e0f1; stroke-width: 0.8; }
.dot .trace { font-family: 'Amiri', serif; fill: none; stroke: #8f84ab; stroke-width: 0.9; stroke-dasharray: 2 2; stroke-linecap: round; }
.dot--faint .trace { stroke: #cfc7de; stroke-width: 0.75; stroke-dasharray: none; }
`;

export default {
  id: 'arabic-letter-tracing',
  file: 'ummah-academy-arabic-letter-tracing.pdf',
  html: () =>
    document({
      title: 'Arabic Letter Tracing',
      titleHtml: 'Arabic letters <em>tracing</em>',
      titleAr: 'تتبّع الحروف العربية',
      tag: 'Arabic · Ages 5+',
      lede: 'Trace the dotted letters, then the faint ones, then write the letter on your own on the line. Say its name out loud every time.',
      pages,
      css,
    }),
};
