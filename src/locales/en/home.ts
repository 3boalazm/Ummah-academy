/** Home — English (reference locale) copy. */
import { prices } from '@/data/prices';

const P = prices('en');

export default {
  C: {
    meta: {
      title: 'Quran & Arabic Classes Online with Al-Azhar Teachers | 2 Free Sessions | Ummah Academy',
      desc: 'Live 1-on-1 Qur’an, Tajweed, Arabic and Islamic studies with Al-Azhar teachers who hold a verified Ijazah. Kids and adults, any time zone — your first 2 sessions are free.',
    },
    eyebrow: 'Live 1-on-1 · Al-Azhar scholars',
    title: 'Learn the Qur’an with confidence. <span class="accent">One step at a time.</span>',
    lede: 'For your child or yourself: one-to-one Quran, Tajweed, Arabic and Islamic studies with Al-Azhar teachers. Start at your level, with lesson times that fit your day.',
    test: '3-minute test',
    reassure: ['No card needed', 'Female teachers available', 'Cancel or pause anytime'],
    card1: ['Tajweed · Level 2', 'Lesson 12 of 18', 'Progress'],
    card2: ['Next live session', 'Noon Sakinah rules', 'Ustadha Omneya · 7:00 PM GMT', 'Starts in 2h 14m'],
    verified: 'Ijazah verified',
    stats: [
      ['50+', 'countries'],
      ['1,000+', 'students'],
      ['12+', 'Ijazahs granted'],
      ['95%', 'continue after month one'],
    ],
    router: {
      title: 'Who’s learning?',
      lede: 'Choose who is learning, then explore the path that fits your goal.',
      childKicker: 'For my child',
      childTitle: 'Ummah Cubs · ages 5–14',
      childText: 'Quran, Arabic and Islamic values in short lessons with patient teachers. Stories and activities help your child take part and enjoy learning.',
      childChips: ['30-min sessions', 'Games & stories', 'Monthly badges'],
      childCta: 'Explore Ummah Cubs',
      selfKicker: 'For myself',
      selfTitle: 'What’s your goal?',
      goals: [
        ['Read the Qur’an from zero', '/online-arabic-classes/', 'read'],
        ['Perfect my Tajweed', '/quran-recitation-course/', 'tajweed'],
        ['Memorise & work towards an Ijazah', '/quran-memorization-hifz/', 'hifz'],
        ['Understand Qur’anic Arabic', '/online-arabic-classes/', 'arabic'],
        ['Study Aqeedah, Fiqh, Tafseer or Seerah', '/online-islamic-studies-classes/', 'islamic'],
      ],
      unsure: 'Not sure? Take the 3-minute placement test',
    },
    why: {
      eyebrow: 'Why Ummah Academy',
      title: 'Scholarship you can <span class="accent">trace.</span> Lessons that fit your life.',
      sanadKicker: 'Verified Sanad',
      sanadTitle: 'A chain of teachers back to the Prophet ﷺ',
      sanadText: 'Every teacher holds an Ijazah — a documented chain of transmission — and passes a four-stage check: credentials, Sanad verification, a live teaching demo and ongoing review.',
      sanadLink: 'How we vet teachers',
      itqan: ['The Itqan method', 'Verses grouped by theme and meaning, corrected live — memorisation that lasts, not recitation for show.', 'How it works'],
      safe: ['Safe for every family', 'Private 1-on-1 lessons, female teachers for women and girls, and a report after every session.'],
      time: ['Built around your clock', 'Morning in Sydney or evening in Toronto — book any time, with a WhatsApp reminder 15 minutes before.'],
      price: [`From ${P.from} a month`, 'Transparent plans. Two free sessions first.', 'See pricing'],
    },
    how: {
      eyebrow: 'How it works',
      title: 'What happens <span class="accent">after you book</span>',
      lede: 'Tell us your goal and try two lessons with a teacher. Then decide whether you would like to continue.',
      steps: [
        ['Tell us about you', 'Choose the learner, your preferred programme and the times that suit you.'],
        ['We match your teacher', 'We contact you on WhatsApp to confirm a teacher and available lesson times.'],
        ['Two free live lessons', 'Your teacher assesses your level and builds a plan around your goal.'],
        ['Learn and see progress', 'A report after every session and a certificate for every level.'],
      ],
    },
    tracks: { eyebrow: 'Courses', title: 'Four ways in. <span class="accent">Start where you are.</span>', lede: 'Build reading skills, improve recitation, memorise, or explore Arabic and Islamic studies. Start with your goal.' },
    stories: { eyebrow: 'Stories', title: 'Learning together, <span class="accent">in families’ own words.</span>', note: '' },
    pricing: {
      eyebrow: 'Pricing',
      title: 'Simple pricing. <span class="accent">Two free sessions first.</span>',
      text: 'Compare 30- and 60-minute lessons and choose a schedule that works for you. You can discuss your plan with your teacher during the free trial.',
      tabs: ['30 minutes', '60 minutes'],
      perSession: 'per session',
      all: 'All plans & details',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'Before you <span class="accent">book</span>',
      more: 'All questions',
      items: [
        {
          q: 'Are the two trial sessions really free?',
          a: 'Yes. Two full live lessons with your matched teacher — no card, no obligation. If you continue, you choose a monthly plan; if not, that’s it.',
        },
        {
          q: 'How much does it cost, and can I cancel?',
          a: `Plans run from ${P.from} to ${P.to} a month depending on session length and frequency. Cancel anytime (effective at the end of your billing month), pause with a subscription freeze, and reschedule with 24 hours’ notice.`,
        },
        { q: 'Can I choose a female teacher?', a: 'Yes. Female teachers are available for women and girls — just choose “Female teacher” when you book.' },
        { q: 'Is my child too young?', a: 'Ummah Cubs welcomes children from age 5, with short, game-based 30-minute lessons designed for young attention spans.' },
        { q: 'I don’t speak Arabic. Will I understand?', a: 'Yes. Every teacher is fully bilingual in Arabic and English, and many of our students start from zero.' },
        {
          q: 'Are lessons live? Are they recorded?',
          a: 'Every lesson is live and 1-on-1 on Zoom or Google Meet. Teachers send a report after each session; recordings are available on request while the Family Portal library rolls out.',
        },
      ],
    },
    cta: {
      eyebrow: 'Begin today',
      title: 'Begin with <span class="accent">two free lessons.</span>',
      lede: 'Meet your teacher, feel the difference of live 1-on-1 learning, then decide. No card, no commitment.',
    },
  },
};
