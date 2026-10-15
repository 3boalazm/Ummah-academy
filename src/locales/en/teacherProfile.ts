/** TeacherProfile — English (reference locale) copy. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher, first: string) => ({
    teachers: 'Teachers',
    book: `Book a free lesson with ${first}`,
    ask: `Ask about ${first}’s availability`,
    waText: `Assalamu alaikum, I’d like to book a trial with ${t.name}. Which times are available?`,
    verified: t.ijazah ? 'Ijazah verified' : 'Credentials verified',
    creds: 'Credentials',
    bestFor: 'Best for',
    sanadTitle: 'Her chain of transmission',
    sanadText: `${first} holds an Ijazah in Hafs ’an ’Asim — a documented chain of teachers, each taught by the one before, back to the Prophet ﷺ.`,
    sanadNote: 'We check every teacher’s chain directly — never on their word alone.',
    sanadMore: 'What an Ijazah really means',
    sanadHref: '/what-is-an-ijazah-understanding-quran-certification-and-sanad/',
    vetTitle: 'How she earned her place',
    vet: [
      { icon: 'files', title: 'Application review', text: 'Credentials and Al-Azhar affiliation verified before any interview.' },
      {
        icon: 'scroll',
        title: t.ijazah ? 'Ijazah & Sanad verification' : 'Certificate verification',
        text: t.ijazah ? 'Her chain of transmission was checked directly.' : 'Her certificates were checked directly with the issuers.',
      },
      { icon: 'chalkboard-teacher', title: 'Live teaching demonstration', text: 'She taught a real lesson before approval.' },
      { icon: 'chart-line-up', title: 'Ongoing evaluation', text: 'Teaching quality is reviewed continuously — not just at hiring.' },
    ],
    teachesTitle: `What ${first} teaches`,
    storiesTitle: `What families say about ${first}`,
    bookTitle: `Booking with ${first}`,
    steps: [
      { icon: 'cursor-click', title: 'Choose her in the booking form', text: 'Her name is already filled in. Tell us who the lessons are for and your time zone.' },
      { icon: 'whatsapp-logo', title: 'We confirm her times on WhatsApp', text: 'If her schedule is full at your time, we’ll say so honestly and suggest the closest option.' },
      { icon: 'gift', title: 'Two free sessions, then decide', text: 'No card, no commitment. Continue only if it feels right.' },
    ],
    faqTitle: 'Questions about booking',
    faq: [
      {
        q: `Can I choose ${first} specifically?`,
        a: `Yes. Pick her in the booking form (we’ve pre-filled it) and we’ll confirm her availability for your time zone on WhatsApp before your first session.`,
      },
      { q: 'Can I change teacher later?', a: 'Yes. If the fit doesn’t feel right, tell us on WhatsApp and we’ll look for a better match.' },
      { q: 'Which language does she teach in?', a: `${first} teaches in Arabic and English, and chooses the language of explanation to suit the student and their age.` },
    ],
    othersTitle: 'Meet the other department leads',
    ctaTitle: `Start with <span class="accent">${first}</span> this week.`,
    ctaLede: 'Your first 2 sessions are free. We confirm times on WhatsApp within minutes.',
  }),
  meta: (t: Teacher) => ({
    title: `${t.name} — ${t.role} | Ummah Academy`,
    desc: `${t.name}, ${t.role} at Ummah Academy: ${t.specialty}. Her credentials, who she teaches best, and how to book 2 free sessions with her.`,
  }),
};
