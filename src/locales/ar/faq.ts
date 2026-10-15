/** FaqPage — Arabic copy. */
import faq from '@/content/faq/ar.json';
import { faqGroups } from '@/data/faq';

export default {
  groups: faqGroups('ar', faq),
  C: {
    meta: { title: 'الأسئلة الشائعة | أكاديمية الأمة', desc: 'إجابات عن أكثر ما تسأل عنه الأسر: التجربة المجانية، والمعلمون، والمعلمات، والمواعيد، والأطفال من سن الخامسة، والشهادات، والأسعار.' },
    eyebrow: 'المساعدة',
    title: 'الأسئلة <span class="accent">الشائعة</span>',
    lede: 'كل ما تحتاج معرفته قبل البدء — وبعده.',
    topics: 'موضوعات الأسئلة',
    ctaTitle: 'لديك سؤال آخر؟ <span class="accent">اسألنا عبر واتساب.</span>',
    ctaLede: 'أشخاص حقيقيون وردود سريعة — بالعربية أو الإنجليزية.',
  },
};
