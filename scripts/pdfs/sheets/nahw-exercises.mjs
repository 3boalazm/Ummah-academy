import { document } from '../shared.mjs';

/* All sentences fully vowelled. Needs the academic sign-off tracked in Linear ABO-39. */
const EX1 = [
  ['اللَّهُ رَحِيمٌ', 'n'],
  ['ذَهَبَ الطَّالِبُ إِلَى الْمَسْجِدِ', 'v'],
  ['الْكِتَابُ مُفِيدٌ', 'n'],
  ['يَقْرَأُ أَحْمَدُ الْقُرْآنَ', 'v'],
  ['الْمَسْجِدُ كَبِيرٌ', 'n'],
  ['كَتَبَ الْمُعَلِّمُ الدَّرْسَ', 'v'],
  ['السَّمَاءُ صَافِيَةٌ', 'n'],
  ['صَلَّى الْمُسْلِمُونَ الْفَجْرَ', 'v'],
];
const EX2 = [
  ['الْعِلْمُ نُورٌ', 'الْعِلْمُ', 'نُورٌ'],
  ['الْبَيْتُ نَظِيفٌ', 'الْبَيْتُ', 'نَظِيفٌ'],
  ['الصِّدْقُ مَنْجَاةٌ', 'الصِّدْقُ', 'مَنْجَاةٌ'],
  ['الطَّالِبَانِ مُجْتَهِدَانِ', 'الطَّالِبَانِ', 'مُجْتَهِدَانِ'],
  ['الْمُؤْمِنُونَ إِخْوَةٌ', 'الْمُؤْمِنُونَ', 'إِخْوَةٌ'],
];
const EX3 = [
  ['قَرَأَ الْوَلَدُ الْكِتَابَ', 'قَرَأَ', 'الْوَلَدُ', 'الْكِتَابَ'],
  ['فَتَحَ الطَّالِبُ الْبَابَ', 'فَتَحَ', 'الطَّالِبُ', 'الْبَابَ'],
  ['أَكَلَ الطِّفْلُ التُّفَّاحَةَ', 'أَكَلَ', 'الطِّفْلُ', 'التُّفَّاحَةَ'],
  ['رَسَمَتِ الْبِنْتُ الشَّجَرَةَ', 'رَسَمَتِ', 'الْبِنْتُ', 'الشَّجَرَةَ'],
  ['حَفِظَ زَيْدٌ السُّورَةَ', 'حَفِظَ', 'زَيْدٌ', 'السُّورَةَ'],
];
const EX4 = [
  ['ذَهَبْتُ', 'الْمَدْرَسَةِ', 'إِلَى'],
  ['خَرَجْتُ', 'الْبَيْتِ', 'مِنَ'],
  ['الْكِتَابُ', 'الطَّاوِلَةِ', 'عَلَى'],
  ['الْمَاءُ', 'الْكَأْسِ', 'فِي'],
  ['كَتَبْتُ الدَّرْسَ', 'الْقَلَمِ', 'بِـ'],
];
// [before, stem, after, correct vowel, reason]
const EX5 = [
  ['جَاءَ', 'الْمُعَلِّم', '', 'ـُ', 'فاعل مرفوع', 'subject (fā‘il): raf‘'],
  ['رَأَيْتُ', 'الْمُعَلِّم', '', 'ـَ', 'مفعول به منصوب', 'object: nasb'],
  ['سَلَّمْتُ عَلَى', 'الْمُعَلِّم', '', 'ـِ', 'اسم مجرور بحرف الجر', 'after a preposition: jarr'],
  ['', 'الْقُرْآن', 'كِتَابُ اللَّهِ', 'ـُ', 'مبتدأ مرفوع', 'subject (mubtada’): raf‘'],
  ['قَرَأْتُ', 'الْقُرْآن', '', 'ـَ', 'مفعول به منصوب', 'object: nasb'],
  ['اسْتَمَعْتُ إِلَى', 'الْقُرْآن', '', 'ـِ', 'اسم مجرور بحرف الجر', 'after a preposition: jarr'],
];

const head = (n, en, ar, how) => `<div class="ex__head"><span class="ex__n">${n}</span><span class="ex__t"><b>${en}</b><span class="muted">${how}</span></span><span class="ar ex__ar">${ar}</span></div>`;
const blank = '<span class="blank"></span>';

const page1 = `
<section class="ex">
  ${head(1, 'Nominal or verbal?', 'اسمية أم فعلية؟', 'A sentence that starts with a noun is nominal (ismiyyah); one that starts with a verb is verbal (fi‘liyyah). Write N or V.')}
  <ol class="sents sents--2" dir="rtl">${EX1.map(([s]) => `<li><span class="q">${s}</span><span class="answer-box"></span></li>`).join('')}</ol>
</section>
<section class="ex">
  ${head(2, 'Find the mubtada’ and the khabar', 'حدّد المبتدأ والخبر', 'The mubtada’ is what we talk about; the khabar is what we say about it.')}
  <table class="grid-t" dir="rtl"><thead><tr><th>الجملة<span class="en">Sentence</span></th><th>المبتدأ<span class="en">Mubtada’</span></th><th>الخبر<span class="en">Khabar</span></th></tr></thead>
  <tbody>${EX2.map(([s]) => `<tr><td class="q">${s}</td><td></td><td></td></tr>`).join('')}</tbody></table>
</section>
<section class="ex">
  ${head(3, 'Verb, doer and object', 'الفعل والفاعل والمفعول به', 'Split each sentence into its verb (fi‘l), doer (fā‘il) and object (maf‘ūl bihi).')}
  <table class="grid-t" dir="rtl"><thead><tr><th>الجملة<span class="en">Sentence</span></th><th>الفعل<span class="en">Verb</span></th><th>الفاعل<span class="en">Doer</span></th><th>المفعول به<span class="en">Object</span></th></tr></thead>
  <tbody>${EX3.map(([s]) => `<tr><td class="q">${s}</td><td></td><td></td><td></td></tr>`).join('')}</tbody></table>
</section>
`;
const page2 = `
<section class="ex">
  ${head(4, 'Choose the preposition', 'اختر حرف الجر المناسب', 'Use each word from the bank once. Notice the noun after it ends in a kasrah.')}
  <p class="bank" dir="rtl"><span class="muted">بنك الكلمات:</span> ${['مِنْ', 'إِلَى', 'عَلَى', 'فِي', 'بِـ'].map((w) => `<span class="q chip">${w}</span>`).join(' ')}</p>
  <ol class="sents" dir="rtl">${EX4.map(([a, b]) => `<li><span class="q">${a} ${blank} ${b}.</span></li>`).join('')}</ol>
</section>
<section class="ex">
  ${head(5, 'Add the right ending', 'ضع الحركة المناسبة على آخر الكلمة', 'Write the right vowel on the last letter of the underlined word: damma <span class="q mark">بُ</span> (raf‘), fatha <span class="q mark">بَ</span> (nasb) or kasra <span class="q mark">بِ</span> (jarr).')}
  <ol class="sents sents--2" dir="rtl">${EX5.map(([a, stem, c]) => `<li><span class="q">${a} <u>${stem}</u><span class="vbox"></span> ${c}</span></li>`).join('')}</ol>
</section>
<section class="ex">
  ${head(6, 'Parse the sentence (i‘rab)', 'أعرب الجملة الآتية', 'Say what each word is, its case, and the sign of its case.')}
  <p class="q big" dir="rtl">الصَّبْرُ جَمِيلٌ.</p>
  <div class="lines" dir="rtl"><span>الصَّبْرُ:</span><i></i><span>جَمِيلٌ:</span><i></i></div>
</section>
<section class="ex ex--grow">
  ${head(7, 'Your turn', 'دورك', 'Write one nominal and one verbal sentence of your own, about your family or your day. Answers will vary — ask your teacher to check them.')}
  <div class="lines" dir="rtl"><span class="ar lbl">جملة اسمية:</span><i></i><span class="ar lbl">جملة فعلية:</span><i></i></div>
</section>
`;
const page3 = `
<p class="key-note">Answer key — for parents and teachers. <span class="ar">نموذج الإجابة — لأولياء الأمور والمعلمين.</span></p>
<div class="key">
  <div class="key__col">
    <h3>1 <span class="ar">اسمية أم فعلية؟</span></h3>
    <ol dir="rtl">${EX1.map(([s, t]) => `<li><span class="q">${s}</span> <b class="ar">${t === 'n' ? 'اسمية (N)' : 'فعلية (V)'}</b></li>`).join('')}</ol>
    <h3>2 <span class="ar">المبتدأ والخبر</span></h3>
    <ol dir="rtl">${EX2.map(([, m, k]) => `<li><span class="ar">المبتدأ:</span> <span class="q">${m}</span> · <span class="ar">الخبر:</span> <span class="q">${k}</span></li>`).join('')}</ol>
    <h3>3 <span class="ar">الفعل والفاعل والمفعول به</span></h3>
    <ol dir="rtl">${EX3.map(([, f, fa, m]) => `<li><span class="q">${f}</span> · <span class="q">${fa}</span> · <span class="q">${m}</span></li>`).join('')}</ol>
  </div>
  <div class="key__col">
    <h3>4 <span class="ar">حروف الجر</span></h3>
    <ol dir="rtl">${EX4.map(([a, b, p]) => `<li><span class="q">${a} ${p === 'بِـ' ? `<b>بِ</b>${b}` : `<b>${p}</b> ${b}`}.</span></li>`).join('')}</ol>
    <p class="muted small">Note: مِنْ becomes مِنَ before الْ to avoid two sukoons — <span class="q">مِنَ الْبَيْتِ</span>. With بِـ the word joins on: <span class="q">بِالْقَلَمِ</span>.</p>
    <h3>5 <span class="ar">الحركات</span></h3>
    <ol dir="rtl">${EX5.map(([, stem, , v, why, en]) => `<li><span class="q">${stem}${v.replace('ـ', '')}</span> <span class="ar">— ${why}</span> <span class="muted small" dir="ltr">(${en})</span></li>`).join('')}</ol>
    <h3>6 <span class="ar">الإعراب</span></h3>
    <p dir="rtl" class="ar parse"><b class="q">الصَّبْرُ:</b> مبتدأ مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.</p>
    <p dir="rtl" class="ar parse"><b class="q">جَمِيلٌ:</b> خبر مرفوع، وعلامة رفعه الضمة الظاهرة على آخره.</p>
  </div>
</div>
`;

const css = `
.ex { margin-bottom: 4mm; }
.ex--grow { flex: 1; display: flex; flex-direction: column; }
.ex__head { display: grid; grid-template-columns: 8mm 1fr auto; align-items: start; gap: 3mm; margin-bottom: 2mm; }
.ex__n { display: grid; place-items: center; width: 7mm; height: 7mm; border-radius: 50%; background: #f1eaf9; color: #5a2f8a; font-weight: 700; font-size: 9.5pt; }
.ex__t b { display: block; font-size: 10.5pt; }
.ex__t .muted { display: block; font-size: 8.2pt; line-height: 1.35; }
.ex__ar { font-size: 11pt; font-weight: 700; color: #5a2f8a; }
.sents { margin: 0; padding: 0 6mm 0 0; display: grid; gap: 1.2mm 8mm; }
.sents--2 { grid-template-columns: 1fr 1fr; }
.sents li { font-size: 9pt; color: #6a6182; padding: 0.6mm 0; }
.sents li::marker { font-family: 'Plex Arabic', sans-serif; }
.sents .q { font-size: 15pt; color: #1e1530; }
.answer-box { display: inline-block; width: 9mm; height: 7mm; border: 0.35mm solid #9d93b5; border-radius: 1.4mm; vertical-align: middle; margin-inline-start: 4mm; }
.grid-t th { text-align: center; font-family: 'Plex Arabic', sans-serif; font-size: 9pt; }
.grid-t th .en { display: block; direction: ltr; unicode-bidi: isolate; font-family: 'Geist', sans-serif; font-size: 7.5pt; font-weight: 500; color: #6a6182; }
.ex__t .mark { font-size: 12pt; color: #5a2f8a; line-height: 1.2; }
.lines .lbl { font-size: 10pt; color: #5a2f8a; font-weight: 600; align-self: end; }
.grid-t td { height: 10mm; }
.grid-t td.q { font-size: 14pt; width: 42%; }
.bank { margin: 0 0 2mm; display: flex; align-items: center; gap: 2mm; font-family: 'Plex Arabic', sans-serif; font-size: 9pt; }
.bank .chip { font-family: 'Amiri', serif; font-size: 13pt; font-weight: 400; padding: 0 3mm; }
.blank { display: inline-block; width: 22mm; border-bottom: 0.35mm solid #9d93b5; height: 6mm; vertical-align: baseline; }
.vbox { display: inline-block; width: 6mm; height: 7mm; border: 0.35mm dashed #9d93b5; border-radius: 1.2mm; vertical-align: middle; margin: 0 0.6mm; }
.big { font-size: 22pt; margin: 2mm 0; text-align: center; }
.lines { flex: 1; display: grid; grid-template-columns: auto 1fr; gap: 6mm 3mm; align-content: start; font-family: 'Amiri', serif; font-size: 14pt; }
.lines i { border-bottom: 0.35mm solid #9d93b5; height: 10mm; }
.key-note { margin: 0 0 3mm; font-weight: 600; color: #5a2f8a; display: flex; justify-content: space-between; }
.key { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.key h3 { margin: 2.5mm 0 1.2mm; font-size: 10pt; display: flex; gap: 2mm; align-items: baseline; color: #5a2f8a; }
.key h3 .ar { font-size: 10pt; }
.key ol { margin: 0; padding: 0 5mm 0 0; font-size: 8.5pt; }
.key li { margin-bottom: 0.4mm; color: #4a4060; }
.key .q { font-size: 12.5pt; color: #1e1530; }
.key b.ar { font-size: 8.5pt; color: #5a2f8a; }
.small { font-size: 7.6pt; }
.small .q { font-size: 11pt; }
.parse { margin: 0 0 1mm; font-size: 9pt; color: #4a4060; }
`;

export default {
  id: 'nahw-exercises',
  file: 'ummah-academy-nahw-exercises.pdf',
  html: () =>
    document({
      title: 'Nahw Exercises',
      titleHtml: 'Nahw <em>exercises</em>',
      titleAr: 'تمارين في النحو',
      tag: 'Arabic · Grammar',
      lede: 'Six short drills for beginners in Arabic grammar: sentence types, mubtada’ and khabar, verb–doer–object, prepositions and case endings. Answer key on page 3.',
      pages: [page1, page2, page3],
      css,
    }),
};
