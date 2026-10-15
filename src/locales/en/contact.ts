/** Contact — English (reference locale) copy. */
import { prices } from '@/data/prices';

const P = prices('en');

export default {
  C: {
    allFaq: 'All frequently asked questions',
    meta: {
      title: 'Book 2 Free Trial Sessions | Contact Ummah Academy',
      desc: 'Book two free live 1-on-1 trial sessions with an Al-Azhar teacher in under a minute. We confirm your teacher and time on WhatsApp.',
    },
    eyebrow: 'Free trial',
    title: 'Book your <span class="accent">two free sessions</span>',
    lede: 'For your child or yourself: tell us your goal and preferred times. We will confirm your teacher and schedule on WhatsApp. No payment card needed.',
    gets: [
      ['video-camera', 'Two live 1-on-1 lessons', 'Dedicated time to read, ask questions and practise with your teacher.'],
      ['user-circle-check', 'A teacher matched to you', 'Chosen for your goal, age and schedule — female teachers on request.'],
      ['hand-coins', 'No payment, no commitment', 'Try the lessons first, then decide whether to subscribe.'],
    ],
    direct: 'Prefer to reach us directly?',
    next: 'What happens next?',
    steps: [
      ['We message you on WhatsApp', 'We discuss your goal and arrange a teacher and time from the available schedule.'],
      ['You get your lesson link', 'Zoom or Google Meet, plus a reminder 15 minutes before.'],
      ['You attend two free lessons', 'Your teacher finds your level and suggests a plan — then you decide, no pressure.'],
    ],
    faqTitle: 'Questions about the trial',
    faq: [
      { q: 'Are the two sessions truly free?', a: 'Completely. No card and no commitment — just your name and WhatsApp number.' },
      { q: 'Can I request a specific teacher?', a: 'Yes — add their name in the notes, or use “Book with…” on the Teachers page. We’ll do our best to match you.' },
      { q: 'What platform are lessons on?', a: 'Zoom or Google Meet, with an interactive whiteboard for marking up recitation and writing.' },
      { q: 'My child is 5 — too young?', a: 'Not at all. Ummah Cubs welcomes children from age 5 with playful 30-minute lessons.' },
      { q: 'What happens after the two sessions?', a: `If you’d like to continue, you choose a monthly plan (from ${P.from}). You can cancel or pause anytime.` },
    ],
  },
};
