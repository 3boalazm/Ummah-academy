/** FaqPage — English (reference locale) copy. Questions and answers: src/content/faq/en.json (CMS-editable). */
import faq from '@/content/faq/en.json';
import { faqGroups } from '@/data/faq';

export default {
  groups: faqGroups('en', faq),
  C: {
    meta: {
      title: 'Quran Classes FAQ | Ummah Academy',
      desc: 'Answers to what families ask most: the free trial, teachers, female tutors, time zones, kids from age 5, certificates, pricing and payment.',
    },
    eyebrow: 'Help',
    title: 'Frequently asked <span class="accent">questions</span>',
    lede: 'Everything you need to know before — and after — you start.',
    topics: 'FAQ topics',
    ctaTitle: 'Still have a question? <span class="accent">Ask us on WhatsApp.</span>',
    ctaLede: 'Real people, fast replies — in English or Arabic.',
  },
};
