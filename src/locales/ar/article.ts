/** Article — Arabic copy. */
import { num } from '@/i18n';

export default {
  wpm: 170,
  readTime: (m: number) => `${num('ar', m)} ${m === 2 ? 'دقيقتان' : m <= 10 ? 'دقائق' : 'دقيقة'} قراءة`,
  L: {
    blog: 'المدونة',
    cta: 'تعلّم هذا مع معلم حقيقي — أول حصتين مجانًا.',
    book: 'احجز تجربة مجانية',
    about: 'عن الدورة',
    prev: 'السابق',
    next: 'التالي',
    more: 'مقالات أخرى',
    start: 'ابدأ التعلّم',
    keep: 'تابع القراءة',
    alsoIn: 'متاح أيضًا باللغات',
  },
};
