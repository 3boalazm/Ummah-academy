import { document } from '../shared.mjs';

const rows = Array.from({ length: 30 }, (_, i) => i + 1);
const page = `
<div class="fields">
  <label>Name <span class="ar">الاسم</span><i></i></label>
  <label>Month <span class="ar">الشهر</span><i></i></label>
  <label>Daily goal <span class="ar">الهدف اليومي</span><i></i></label>
</div>
<table class="wird">
  <thead>
    <tr>
      <th class="day">Day<span class="ar">اليوم</span></th>
      <th>Recitation (pages)<span class="ar">التلاوة (صفحات)</span></th>
      <th>New memorisation<span class="ar">الحفظ الجديد</span></th>
      <th>Revision<span class="ar">المراجعة</span></th>
      <th class="mid">Adhkar<span class="ar">الأذكار</span></th>
      <th class="sign">Parent check<span class="ar">ولي الأمر</span></th>
    </tr>
  </thead>
  <tbody>
    ${rows.map((d) => `<tr><td class="day">${d}</td><td></td><td></td><td></td><td class="mid"><span class="box"></span></td><td class="sign"></td></tr>`).join('')}
  </tbody>
</table>
<div class="reflect">
  <div><b>This month I’m proud of…</b><span class="ar">أفخر هذا الشهر بأنني…</span></div>
  <div><b>Next month I will…</b><span class="ar">في الشهر القادم سوف…</span></div>
</div>
`;

const css = `
.fields { display: grid; grid-template-columns: 1.4fr 1fr 1.2fr; gap: 5mm; margin-bottom: 3mm; }
.fields label { display: flex; align-items: flex-end; gap: 1.5mm; font-size: 8.5pt; font-weight: 600; color: #4a4060; white-space: nowrap; }
.fields .ar { font-size: 8pt; font-weight: 500; color: #6a6182; }
.fields i { flex: 1; border-bottom: 0.3mm solid #9d93b5; height: 5mm; }
.wird th { padding: 1.3mm 2mm; line-height: 1.25; }
.wird td { height: 5.95mm; padding: 0 2mm; font-size: 8.5pt; }
.wird tbody tr:nth-child(7n) td { border-bottom: 0.55mm solid #cfc3e3; }
.wird .day { width: 13mm; text-align: center; font-weight: 600; color: #5a2f8a; }
.wird .mid { width: 22mm; text-align: center; }
.wird .sign { width: 26mm; text-align: center; }
.wird th.mid .ar, .wird th.day .ar, .wird th.sign .ar { text-align: center; }
.reflect { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin-top: 3mm; }
.reflect div { border: 0.3mm solid #e4dcef; border-radius: 2.5mm; height: 17mm; padding: 2mm 3mm; display: flex; justify-content: space-between; font-size: 8.5pt; color: #4a4060; }
.reflect .ar { font-size: 8.5pt; color: #6a6182; }
`;

export default {
  id: 'daily-wird-tracker',
  file: 'ummah-academy-daily-wird-tracker.pdf',
  html: () =>
    document({
      title: 'Daily Wird Tracker',
      titleHtml: 'Daily wird <em>tracker</em>',
      titleAr: 'متابعة الورد اليومي',
      tag: 'Qur’an · 30 days',
      lede: 'A little every day beats a lot once a week. Fill in what you read, memorised and revised; a parent or teacher initials the last column. Every thick line is one week.',
      pages: [page],
      css,
    }),
};
