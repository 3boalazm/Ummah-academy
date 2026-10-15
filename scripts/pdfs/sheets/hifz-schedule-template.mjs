import { document, icon } from '../shared.mjs';

const PARTS = [
  { icon: 'plus-circle', en: 'New lesson', alt: 'Sabaq', ar: 'الحفظ الجديد', text: 'Today’s new passage — small enough to recite with no mistakes in letters or vowels.', ar2: 'مقطع اليوم: صغير بما يكفي ليُتقن دون خطأ.' },
  { icon: 'arrow-counter-clockwise', en: 'Recent revision', alt: 'Sabqi', ar: 'المراجعة القريبة', text: 'Everything memorised in the last 7 days, recited every day.', ar2: 'ما حُفظ في الأيام السبعة الأخيرة، كل يوم.' },
  { icon: 'books', en: 'Long-term revision', alt: 'Manzil', ar: 'المراجعة البعيدة', text: 'Older surahs, rotated across the week so all of them come back.', ar2: 'السور القديمة، موزعة على أيام الأسبوع.' },
];
const DAYS = [
  ['Monday', 'الاثنين'],
  ['Tuesday', 'الثلاثاء'],
  ['Wednesday', 'الأربعاء'],
  ['Thursday', 'الخميس'],
  ['Friday', 'الجمعة'],
  ['Saturday', 'السبت'],
  ['Sunday', 'الأحد'],
];
// Juz ʿAmma in memorisation order (An-Nas first), plus Al-Fatihah. Ayah counts: Hafs (Kufan count).
const SURAHS = [
  [1, 'Al-Fatihah', 'الفاتحة', 7],
  [114, 'An-Nas', 'الناس', 6],
  [113, 'Al-Falaq', 'الفلق', 5],
  [112, 'Al-Ikhlas', 'الإخلاص', 4],
  [111, 'Al-Masad', 'المسد', 5],
  [110, 'An-Nasr', 'النصر', 3],
  [109, 'Al-Kafirun', 'الكافرون', 6],
  [108, 'Al-Kawthar', 'الكوثر', 3],
  [107, 'Al-Ma’un', 'الماعون', 7],
  [106, 'Quraysh', 'قريش', 4],
  [105, 'Al-Fil', 'الفيل', 5],
  [104, 'Al-Humazah', 'الهمزة', 9],
  [103, 'Al-‘Asr', 'العصر', 3],
  [102, 'At-Takathur', 'التكاثر', 8],
  [101, 'Al-Qari‘ah', 'القارعة', 11],
  [100, 'Al-‘Adiyat', 'العاديات', 11],
  [99, 'Az-Zalzalah', 'الزلزلة', 8],
  [98, 'Al-Bayyinah', 'البينة', 8],
  [97, 'Al-Qadr', 'القدر', 5],
  [96, 'Al-‘Alaq', 'العلق', 19],
  [95, 'At-Tin', 'التين', 8],
  [94, 'Ash-Sharh', 'الشرح', 8],
  [93, 'Ad-Duha', 'الضحى', 11],
  [92, 'Al-Layl', 'الليل', 21],
  [91, 'Ash-Shams', 'الشمس', 15],
  [90, 'Al-Balad', 'البلد', 20],
  [89, 'Al-Fajr', 'الفجر', 30],
  [88, 'Al-Ghashiyah', 'الغاشية', 26],
  [87, 'Al-A‘la', 'الأعلى', 19],
  [86, 'At-Tariq', 'الطارق', 17],
  [85, 'Al-Buruj', 'البروج', 22],
  [84, 'Al-Inshiqaq', 'الانشقاق', 25],
  [83, 'Al-Mutaffifin', 'المطففين', 36],
  [82, 'Al-Infitar', 'الانفطار', 19],
  [81, 'At-Takwir', 'التكوير', 29],
  [80, '‘Abasa', 'عبس', 42],
  [79, 'An-Nazi‘at', 'النازعات', 46],
  [78, 'An-Naba’', 'النبأ', 40],
];

const box = '<span class="box"></span>';
const page1 = `
<div class="parts">
  ${PARTS.map((p) => `<div class="part"><span class="part__icon">${icon(p.icon, 'bold', 15)}</span><b>${p.en} <span class="muted">(${p.alt})</span></b><span class="ar part__ar">${p.ar}</span><p>${p.text}</p><p class="ar">${p.ar2}</p></div>`).join('')}
</div>
<div class="fields">
  <label>Student <span class="ar">الطالب</span><i></i></label>
  <label>Week of <span class="ar">أسبوع</span><i></i></label>
  <label>Teacher <span class="ar">المعلم</span><i></i></label>
</div>
<table class="week">
  <thead><tr><th class="d">Day<span class="ar">اليوم</span></th><th>New lesson (surah · ayat)<span class="ar">الحفظ الجديد (السورة · الآيات)</span></th><th>Recent revision<span class="ar">المراجعة القريبة</span></th><th>Long-term revision<span class="ar">المراجعة البعيدة</span></th><th class="ok">Done<span class="ar">تم</span></th></tr></thead>
  <tbody>${DAYS.map(([en, ar]) => `<tr><td class="d"><b>${en}</b><span class="ar">${ar}</span></td><td></td><td></td><td></td><td class="ok">${box}</td></tr>`).join('')}</tbody>
</table>
<div class="rules">
  <p><b>Short on time?</b> Skip the new lesson for a day — never skip revision. <span class="ar">إذا ضاق الوقت فاحذف الجديد يومًا، ولا تحذف المراجعة.</span></p>
  <p><b>Ten minutes daily</b> beats two hours at the weekend. Tie it to a fixed time, like after Maghrib. <span class="ar">عشر دقائق يوميًا أنفع من ساعتين في نهاية الأسبوع.</span></p>
</div>
<div class="notes"><b>Notes for the teacher</b><span class="ar">ملاحظات للمعلم</span></div>
`;
const page2 = `
<p class="intro">Tick a box each time the surah is revised from memory without help. <span class="ar">ضع علامة في كل مرة تُسمِّع فيها السورة غيبًا دون مساعدة.</span></p>
<table class="juz">
  <thead><tr><th class="n">#</th><th>Surah<span class="ar">السورة</span></th><th class="n">Ayat<span class="ar">آياتها</span></th><th>Memorised on<span class="ar">تاريخ الحفظ</span></th><th class="rev">Revised<span class="ar">المراجعة</span></th></tr></thead>
  <tbody>${SURAHS.map(([n, en, ar, ay]) => `<tr><td class="n">${n}</td><td><b>${en}</b> <span class="ar inline">${ar}</span></td><td class="n">${ay}</td><td></td><td class="rev">${box.repeat(6)}</td></tr>`).join('')}</tbody>
</table>
`;

const css = `
.parts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm; margin-bottom: 3.5mm; }
.part { position: relative; border: 0.3mm solid #e4dcef; border-radius: 3mm; padding: 3mm 3.5mm; background: #fcfbfe; display: flex; flex-direction: column; gap: 0.8mm; }
.part__icon { display: inline-grid; place-items: center; width: 7mm; height: 7mm; border-radius: 2mm; background: #f1eaf9; color: #5a2f8a; margin-bottom: 1mm; }
.part b { font-size: 9.5pt; }
.part__ar { font-size: 9.5pt; font-weight: 600; color: #5a2f8a; }
.part p { margin: 0; font-size: 8.2pt; color: #4a4060; line-height: 1.35; }
.part p.ar { font-size: 8pt; color: #6a6182; }
.fields { display: grid; grid-template-columns: 1.3fr 1fr 1.2fr; gap: 5mm; margin-bottom: 3mm; }
.fields label { display: flex; align-items: flex-end; gap: 1.5mm; font-size: 8.5pt; font-weight: 600; color: #4a4060; white-space: nowrap; }
.fields .ar { font-size: 8pt; font-weight: 500; color: #6a6182; }
.fields i { flex: 1; border-bottom: 0.3mm solid #9d93b5; height: 5mm; }
.week td { height: 17mm; }
.week .d { width: 25mm; }
.week td.d b { display: block; font-size: 9pt; }
.week td.d .ar { display: block; font-size: 8.5pt; color: #6a6182; }
.week .ok { width: 14mm; text-align: center; }
.week th.ok .ar { text-align: center; }
.rules { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 3mm; }
.rules p { margin: 0; font-size: 8.2pt; color: #4a4060; border-inline-start: 1mm solid #c9b3e6; padding-inline-start: 2.5mm; }
.rules .ar { display: block; font-size: 8pt; color: #6a6182; }
.notes { margin-top: 3mm; flex: 1; min-height: 14mm; border: 0.3mm solid #e4dcef; border-radius: 2.5mm; padding: 2mm 3mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #4a4060; margin-bottom: 3mm; }
.notes .ar { font-size: 8.5pt; color: #6a6182; }
.intro { margin: 0 0 2.5mm; font-size: 8.5pt; color: #4a4060; }
.intro .ar { font-size: 8.5pt; color: #6a6182; margin-inline-start: 2mm; }
.juz th { padding: 1.2mm 2mm; line-height: 1.2; }
.juz td { height: 5.55mm; padding: 0 2mm; font-size: 8.3pt; }
.juz tbody tr:first-child td { background: #f8f4fc; }
.juz .n { width: 11mm; text-align: center; color: #5a2f8a; font-weight: 600; }
.juz th.n .ar { text-align: center; }
.juz .ar.inline { display: inline; font-size: 9pt; color: #5a2f8a; margin-inline-start: 1.5mm; }
.juz .rev { width: 46mm; white-space: nowrap; }
.juz td.rev .box { width: 3.6mm; height: 3.6mm; margin-inline-end: 1.6mm; }
`;

export default {
  id: 'hifz-schedule-template',
  file: 'ummah-academy-hifz-schedule-template.pdf',
  html: () =>
    document({
      title: 'Hifz Schedule Template',
      titleHtml: 'Hifz <em>schedule</em>',
      titleAr: 'قالب جدول الحفظ',
      tag: 'Qur’an · Hifz',
      lede: 'Every session has three parts. Plan the week on page 1; track Juz ʿAmma surah by surah on page 2.'.replace('ʿ', '‘'),
      pages: [page1, page2],
      css,
    }),
};
