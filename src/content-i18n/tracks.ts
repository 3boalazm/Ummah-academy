/**
 * Copy for the five course landing pages (one template: src/views/TrackPage.astro).
 * v2: the two overlapping FAQ blocks per page were merged; filler blocks removed.
 */
import type { Lang } from '@/i18n';
import type { Plan } from '@/data/pricing';
import pagesDe from '@/locales/de/data/trackPages';
import pagesFr from '@/locales/fr/data/trackPages';
import pagesIt from '@/locales/it/data/trackPages';

export type TrackPageKey = 'recitation' | 'hifz' | 'arabic' | 'kids' | 'islamic';

export interface TrackPageContent {
  path: string;
  meta: { title: string; desc: string };
  crumb: string;
  eyebrow: string;
  title: string;
  lede: string;
  trial: string;
  testTrack: 'quran' | 'arabic' | 'kids' | 'islamic';
  art: 'quran' | 'arabic' | 'kids' | 'islamic' | 'hero';
  courseTrack?: 'quran' | 'arabic' | 'kids' | 'islamic';
  courseFilter?: string[];
  glance: [string, string][];
  learnTitle: string;
  learnLede: string;
  learn?: { title: string; text: string }[];
  methodTitle: string;
  method: { icon: string; title: string; text: string }[];
  teacher?: 'omneya-ali' | 'sara-ahmed' | 'nour-hassan';
  sanad?: boolean;
  testimonial?: number;
  plans: Plan['id'][];
  plansNote: string;
  faq: { q: string; a: string }[];
  related: string[];
  cta: { title: string; lede: string };
  schemaName: string;
  from: number;
}

const EN: Record<TrackPageKey, TrackPageContent> = {
  recitation: {
    path: '/quran-recitation-course/',
    meta: { title: 'Online Quran Recitation & Tajweed Course | Ummah Academy', desc: 'Learn to recite the Qur’an correctly with Tajweed — live 1-on-1 with Al-Azhar teachers, from the first letters to mastery. Kids and adults. 2 free sessions.' },
    crumb: 'Recitation & Tajweed',
    eyebrow: 'Quran Recitation & Tajweed',
    title: 'Recite the Qur’an <span class="accent">correctly — and beautifully.</span>',
    lede: 'Live 1-on-1 Tajweed lessons with Al-Azhar teachers who hold an Ijazah. Your teacher hears every letter and corrects it in the moment — from your first Makhraj to fluent, confident recitation.',
    trial: 'Quran Recitation',
    testTrack: 'quran',
    art: 'quran',
    glance: [
      ['Format', 'Live, 1-on-1'],
      ['Levels', 'Foundation → Rules → Mastery'],
      ['For', 'Children 7+, teens & adults'],
      ['Curriculum', 'Noor Al-Bayan · Al-Jazariyyah'],
      ['Certificate', 'At the end of every level'],
    ],
    learnTitle: 'Three levels, one clear path',
    learnLede: 'Each level has measurable milestones, so you always know where you stand.',
    learn: [
      { title: 'Foundation', text: 'Makharij and Sifaat — every letter from its correct point, with its correct qualities.' },
      { title: 'Rules', text: 'Noon and Meem Sakinah, Madd, Qalqalah and Waqf — practised inside real verses, not flashcards.' },
      { title: 'Mastery', text: 'Fluent, consistent recitation with Al-Jazariyyah, the classical Tajweed poem, as your reference.' },
    ],
    methodTitle: 'How lessons work',
    method: [
      { icon: 'waveform', title: 'Corrected in the moment', text: 'Your teacher stops you at the exact letter, so a mistake never settles into habit.' },
      { icon: 'books', title: 'Approved curricula', text: 'Noor Al-Bayan for reading and classical texts for the rules — never improvised lesson plans.' },
      { icon: 'path', title: 'A plan built for you', text: 'Your teacher assesses you in the free sessions and paces every level to your goal.' },
    ],
    teacher: 'omneya-ali',
    sanad: true,
    testimonial: 1,
    plans: ['gold', 'starter', 'consistent'],
    plansNote: 'Most adults choose two 60-minute lessons a week; children often start with 30-minute lessons.',
    faq: [
      { q: 'Do I need to know Arabic first?', a: 'No. Tajweed starts with pronunciation and can begin alongside basic reading. If you can’t read yet, we start with Noor Al-Bayan.' },
      { q: 'How long does it take to learn Tajweed?', a: 'Most students build correct habits within the first few months of regular practice. Refining Tajweed continues for life, even for advanced reciters.' },
      { q: 'Are classes one-on-one?', a: 'Always. Every student learns individually with a dedicated teacher.' },
      { q: 'Which curriculum do you use?', a: 'Noor Al-Bayan for early reading, then classical Tajweed texts including Al-Jazariyyah, adapted to your level.' },
      { q: 'Can adults start from zero?', a: 'Yes — many of our adult students start with no Qur’an reading experience at all.' },
      { q: 'How often are classes?', a: 'Typically 2–3 sessions a week, scheduled around your time zone.' },
      { q: 'Do teachers hold a real Ijazah?', a: 'Yes. Each teacher’s Ijazah and Sanad are verified before they teach.' },
      { q: 'What if I miss a class?', a: 'Reschedule free with 24 hours’ notice — just message your teacher on WhatsApp.' },
    ],
    related: ['tajweed-rules-for-beginners-a-simple-introduction-to-reciting-the-quran-correctly', 'why-tajweed-matters-5-real-benefits-of-reciting-the-quran-correctly', 'noon-sakinah-and-tanween-rules-explained-simply'],
    cta: { title: 'Hear the difference <span class="accent">in your first lesson.</span>', lede: 'Two free live Tajweed lessons with a certified teacher. No card, no commitment.' },
    schemaName: 'Online Quran Recitation & Tajweed Course',
    from: 64,
  },
  hifz: {
    path: '/quran-memorization-hifz/',
    meta: { title: 'Online Quran Memorization (Hifz) & Ijazah Program | Ummah Academy', desc: 'Memorise the Qur’an with the Itqan thematic method and work toward a real Ijazah with Sanad — live 1-on-1 with Al-Azhar teachers, at your own pace.' },
    crumb: 'Hifz & Ijazah',
    eyebrow: 'Hifz & Ijazah',
    title: 'Memorise the Qur’an. <span class="accent">Keep it for life.</span>',
    lede: 'The Itqan method groups verses by theme and meaning so they connect in memory — with live Tajweed correction and structured review, toward a formal Ijazah with an unbroken Sanad.',
    trial: 'Quran Memorization (Hifz)',
    testTrack: 'quran',
    art: 'hero',
    glance: [
      ['Format', 'Live, 1-on-1'],
      ['Method', 'Itqan (thematic) + daily Muraja’ah'],
      ['Certification', 'Ijazah with documented Sanad'],
      ['For', 'Committed learners aged 7+'],
      ['Pace', 'Fully personalised'],
    ],
    learnTitle: 'From your first verse to Ijazah',
    learnLede: 'A structured journey your teacher plans around your time and goal.',
    learn: [
      { title: 'Placement & goals', text: 'Your teacher assesses your level and Tajweed foundation and sets a realistic pace.' },
      { title: 'Hifz Jadeed', text: 'New verses in thematically grouped sets, with live Tajweed correction.' },
      { title: 'Muraja’ah', text: 'Structured daily and weekly review keeps every memorised portion strong.' },
      { title: 'Ijazah with Sanad', text: 'On completion, a formal Ijazah documenting an unbroken chain back to the Prophet ﷺ.' },
    ],
    methodTitle: 'Why Itqan memorisation lasts',
    method: [
      { icon: 'squares-four', title: 'Thematic grouping', text: 'Related verses are learned together, so recalling one helps recall the next.' },
      { icon: 'arrows-clockwise', title: 'Review is half the work', text: 'Every session balances new verses, recent review and long-term Muraja’ah.' },
      { icon: 'check-circle', title: 'Correct from day one', text: 'Live correction means a mistake is never memorised alongside the verse.' },
    ],
    teacher: 'omneya-ali',
    sanad: true,
    testimonial: 3,
    plans: ['diamond', 'gold', 'elite'],
    plansNote: 'Hifz rewards frequency: most students take 3–4 sessions a week. Younger memorisers do well with short daily lessons.',
    faq: [
      { q: 'What is the Itqan method?', a: 'Itqan means “perfection”. Instead of memorising verses in isolation, related verses are grouped by theme so meaning and sequence reinforce each other — memorisation that is more durable and easier to recall.' },
      { q: 'What exactly is an Ijazah?', a: 'A formal authorisation that you have memorised and can correctly recite a portion of — or the whole — Qur’an, with a documented Sanad: an unbroken chain of teachers back to the Prophet ﷺ.' },
      { q: 'Do I need Tajweed before starting?', a: 'Confident reading and basic Tajweed help. Your teacher checks this in the free sessions and can build Tajweed alongside memorisation if needed.' },
      { q: 'How long does Hifz take?', a: 'A Juz’ or a set of surahs can take months; full Hifz usually takes several years depending on time, age and consistency. Your teacher sets an honest personal timeline.' },
      { q: 'Can children join?', a: 'Yes, from about age 7, with pacing adjusted to age. For younger children, Ummah Cubs is a gentler start.' },
      { q: 'I’ve already memorised some Qur’an.', a: 'Your teacher assesses what you’ve memorised and continues from there — you never restart from zero.' },
      { q: 'How often are Hifz classes?', a: 'Most students take 2–4 sessions a week, arranged flexibly with their teacher.' },
      { q: 'Are teachers’ Ijazah and Sanad real?', a: 'Yes — every Hifz teacher’s Ijazah and Sanad are verified before they teach, as part of our four-stage vetting.' },
    ],
    related: ['how-long-does-it-take-to-memorize-the-quran-a-realistic-timeline', 'what-is-an-ijazah-understanding-quran-certification-and-sanad', 'the-itqan-method-explained-how-thematic-memorization-makes-hifz-easier'],
    cta: { title: 'Begin your Hifz journey <span class="accent">with two free lessons.</span>', lede: 'Meet a teacher with a real Sanad, feel the Itqan method, then decide.' },
    schemaName: 'Online Quran Memorization (Hifz) & Ijazah Program',
    from: 96,
  },
  arabic: {
    path: '/online-arabic-classes/',
    meta: { title: 'Online Arabic Classes for Muslims | Noor Al-Bayan to Grammar | Ummah Academy', desc: 'Learn Qur’anic Arabic 1-on-1: Noor Al-Bayan reading from zero, Al-Ajrumiyyah grammar and conversation with bilingual Al-Azhar teachers. From $40/month.' },
    crumb: 'Arabic Language',
    eyebrow: 'Arabic Language',
    title: 'Read it. Understand it. <span class="accent">Speak it.</span>',
    lede: 'Arabic taught for Muslims: reading the Mushaf first, then the classical grammar that unlocks meaning, then conversation — 1-on-1 with bilingual Al-Azhar teachers.',
    trial: 'Noor Al-Bayan',
    testTrack: 'arabic',
    art: 'arabic',
    courseTrack: 'arabic',
    glance: [
      ['Format', 'Live, 1-on-1'],
      ['Stages', 'Reading → Grammar → Conversation'],
      ['For', 'Age 5+ · zero Arabic welcome'],
      ['Curriculum', 'Noor Al-Bayan · Al-Ajrumiyyah'],
      ['Teachers', 'Bilingual Arabic & English'],
    ],
    learnTitle: 'Three stages, one track',
    learnLede: 'Your teacher places you at the right stage in your first free session.',
    methodTitle: 'Built for Muslims learning Arabic',
    method: [
      { icon: 'book-open-text', title: 'Built around the Qur’an', text: 'Every stage connects back to reading and understanding scripture — not tourist Arabic.' },
      { icon: 'path', title: 'A clear three-stage path', text: 'Noor Al-Bayan, then grammar, then conversation — each building on the last.' },
      { icon: 'user-focus', title: 'Fully 1-on-1', text: 'Your pace, your questions — never waiting for a group to catch up.' },
    ],
    teacher: 'sara-ahmed',
    testimonial: 4,
    plans: ['launch', 'consistent', 'gold'],
    plansNote: 'Children and beginners often start with 30-minute lessons; grammar students usually prefer 60.',
    faq: [
      { q: 'I don’t know a single Arabic letter — can I join?', a: 'Yes. Noor Al-Bayan is designed exactly for this, and every teacher is bilingual, so instructions are never a barrier.' },
      { q: 'Is this Qur’anic Arabic or Modern Standard Arabic?', a: 'Both, by stage: Noor Al-Bayan and grammar focus on the Arabic of the Qur’an and classical texts; conversation uses Modern Standard Arabic.' },
      { q: 'Can my 5-year-old join?', a: 'Yes. Noor Al-Bayan works from age 5 — or consider Ummah Cubs, which blends reading with Islamic studies through games.' },
      { q: 'How long until I read the Qur’an fluently?', a: 'Most consistent beginners reach confident, independent reading within several months. Comprehension takes longer — usually a year or more.' },
      { q: 'Do you teach grammar as well as reading?', a: 'Yes — after reading fluency, students move into Nahw and Sarf with Al-Ajrumiyyah, then conversation.' },
      { q: 'Are classes one-on-one?', a: 'Yes, always — every student learns with their own teacher.' },
      { q: 'How often are classes?', a: 'Typically 2–3 sessions a week, scheduled around your time zone.' },
      { q: 'How much does it cost?', a: 'From $40 a month for 30-minute lessons; grammar and conversation from $64. Every plan starts with 2 free sessions.' },
    ],
    related: ['how-to-learn-arabic-as-a-muslim-a-complete-beginners-guide', 'arabic-grammar-for-quran-nahw-and-sarf-explained-for-beginners', 'how-long-does-it-take-to-learn-quranic-arabic-a-realistic-timeline'],
    cta: { title: 'Your first two Arabic lessons <span class="accent">are on us.</span>', lede: 'Find your stage, meet your teacher, then decide. No card needed.' },
    schemaName: 'Online Qur’anic Arabic Classes',
    from: 40,
  },
  kids: {
    path: '/ummah-cubs-kids-islamic-studies/',
    meta: { title: 'Online Quran & Islamic Studies for Kids (5–14) | Ummah Cubs | Ummah Academy', desc: 'Ummah Cubs: playful 30-minute 1-on-1 lessons in Qur’an reading, Arabic and Islamic values for children aged 5–14, with patient Al-Azhar teachers. From $40/month.' },
    crumb: 'Ummah Cubs',
    eyebrow: 'Ummah Cubs · ages 5–14',
    title: 'Lessons your child will <span class="accent">actually look forward to.</span>',
    lede: 'Qur’an reading, Arabic and Islamic values through games and stories — short, focused 30-minute lessons with child-trained Al-Azhar teachers, and progress you can see.',
    trial: 'Ummah Cubs (Kids)',
    testTrack: 'kids',
    art: 'kids',
    courseTrack: 'kids',
    glance: [
      ['Format', 'Live, 1-on-1'],
      ['Session', '30 minutes'],
      ['Ages', '5–7 · 8–10 · 11–14'],
      ['Teachers', 'Child-trained · female available'],
      ['Progress', 'Reports + monthly badges'],
    ],
    learnTitle: 'Paced by age',
    learnLede: 'Content and pacing grow with your child — they never feel babied, or rushed.',
    methodTitle: 'Built around how children learn',
    method: [
      { icon: 'puzzle-piece', title: 'Games & stories', text: 'Prophet stories, quizzes and rewards — real learning that doesn’t feel like a lecture.' },
      { icon: 'timer', title: 'Short and focused', text: '30 minutes matched to a child’s natural focus span, ending on a high note.' },
      { icon: 'users-three', title: 'Parents in the loop', text: 'A report after every lesson, monthly badges and one Family Portal account for all your children.' },
    ],
    teacher: 'nour-hassan',
    testimonial: 0,
    plans: ['consistent', 'launch', 'elite'],
    plansNote: 'Four short lessons a week is the sweet spot for most children.',
    faq: [
      { q: 'What age is Ummah Cubs for?', a: 'Ages 5 to 14, in three tiers — Little Explorers (5–7), Growing Learners (8–10) and Junior Scholars (11–14).' },
      { q: 'How long is each lesson?', a: '30 minutes — matched to a child’s natural focus span.' },
      { q: 'Is it games or a classroom?', a: 'Games, stories and visuals, while still teaching real Qur’an reading and Islamic studies.' },
      { q: 'My child knows no Arabic or Qur’an yet.', a: 'Perfect — Little Explorers starts from the very first letters.' },
      { q: 'Are the teachers trained for children?', a: 'Yes. Our programme lead holds certification in Early Islamic Education, and Cubs teachers specialise in ages 5–14.' },
      { q: 'Can I request a female teacher for my daughter?', a: 'Yes — female teachers are available, in a fully private, faith-conscious setting.' },
      { q: 'How will I know my child is progressing?', a: 'A short report after each lesson, monthly achievement badges, and everything in one Family Portal account.' },
      { q: 'How much does it cost?', a: 'From $40 a month, with 2 free sessions first. Not sure of the level? Take the free kids placement test.' },
    ],
    related: ['5-signs-your-child-is-ready-for-online-quran-classes', 'online-quran-classes-for-kids-a-complete-guide-for-parents', 'how-to-choose-the-right-quran-teacher-for-your-child'],
    cta: { title: 'Let your child meet their teacher — <span class="accent">free.</span>', lede: 'Two free lessons, no card. See how your child responds before deciding anything.' },
    schemaName: 'Ummah Cubs — Online Qur’an & Islamic Studies for Kids',
    from: 40,
  },
  islamic: {
    path: '/online-islamic-studies-classes/',
    meta: { title: 'Online Islamic Studies for Adults | Aqeedah, Fiqh, Tafseer, Seerah | Ummah Academy', desc: 'A real curriculum in Aqeedah, Fiqh, Tafseer and Seerah, taught live 1-on-1 by Al-Azhar scholars who answer your actual questions. 2 free sessions.' },
    crumb: 'Islamic Studies',
    eyebrow: 'Islamic Studies',
    title: 'Understand your deen — <span class="accent">with a scholar, not a playlist.</span>',
    lede: 'A structured path through Aqeedah, Fiqh, Tafseer and Seerah, taught 1-on-1 by Al-Azhar graduates who explain the sources — and welcome your “but why?”.',
    trial: 'Islamic Studies',
    testTrack: 'islamic',
    art: 'islamic',
    courseTrack: 'islamic',
    glance: [
      ['Format', 'Live, 1-on-1'],
      ['Subjects', 'Aqeedah · Fiqh · Tafseer · Seerah'],
      ['Style', 'Structured or discussion-led'],
      ['For', 'Adults, any background'],
      ['Scholarship', 'Al-Azhar, mainstream Sunni'],
    ],
    learnTitle: 'Four subjects — start anywhere',
    learnLede: 'Study one subject in depth or rotate through all four. Your teacher helps you choose.',
    methodTitle: 'Depth, not just definitions',
    method: [
      { icon: 'books', title: 'A real curriculum', text: 'A coherent path across the four sciences — not a random mix of topics.' },
      { icon: 'graduation-cap', title: 'Scholars who explain sources', text: 'Al-Azhar graduates who show the evidence, not just the conclusion.' },
      { icon: 'chat-centered-dots', title: 'Your actual questions', text: 'Live lessons mean you can ask “but why?” and get a real answer.' },
    ],
    plans: ['gold', 'starter', 'diamond'],
    plansNote: 'Most adults choose one or two 60-minute lessons a week.',
    faq: [
      { q: 'Do I have to study all four subjects?', a: 'No — focus on one, or take a rotating overview. Your teacher helps you decide in the free sessions.' },
      { q: 'I’m new to structured study — is this too advanced?', a: 'Not at all. Your teacher paces the material to your starting point.' },
      { q: 'Lecture-style, or can I ask questions?', a: 'You choose: a structured curriculum, discussion built around your questions, or a mix.' },
      { q: 'Which school of thought do teachers follow?', a: 'Teachers are Al-Azhar trained and teach mainstream Sunni scholarship; specific preferences can be discussed with your teacher.' },
      { q: 'Can I focus only on Fiqh?', a: 'Yes — a single subject or any combination, based on your goals.' },
      { q: 'How long is a course?', a: 'Flexible — set with your teacher around the topic and your availability.' },
      { q: 'How often are classes?', a: 'Typically 2–3 sessions a week.' },
      { q: 'What if I miss a class?', a: 'Reschedule free with 24 hours’ notice on WhatsApp.' },
    ],
    related: ['how-to-learn-quran-online-a-complete-beginners-guide-2026', 'what-is-an-ijazah-understanding-quran-certification-and-sanad', 'online-quran-classes-across-time-zones-how-scheduling-actually-works'],
    cta: { title: 'Bring your questions <span class="accent">to your first free lesson.</span>', lede: 'Two free live lessons with an Al-Azhar scholar. No card, no commitment.' },
    schemaName: 'Online Islamic Studies for Adults',
    from: 64,
  },
};

const AR: Record<TrackPageKey, TrackPageContent> = {
  recitation: {
    ...EN.recitation,
    meta: { title: 'دورة تلاوة القرآن والتجويد أونلاين | أكاديمية الأمة', desc: 'تعلّم تلاوة القرآن بالتجويد الصحيح في حصص مباشرة فردية مع معلمين من الأزهر، من الحروف الأولى حتى الإتقان. للأطفال والكبار — حصتان مجانًا.' },
    crumb: 'التلاوة والتجويد',
    eyebrow: 'تلاوة القرآن والتجويد',
    title: 'اقرأ القرآن <span class="accent">صحيحًا وجميلًا.</span>',
    lede: 'حصص تجويد مباشرة فردية مع معلمين من الأزهر يحملون إجازة. يسمع معلمك كل حرف ويصححه في لحظته — من أول مخرج حتى التلاوة الواثقة المتقنة.',
    glance: [
      ['الأسلوب', 'مباشر وفردي'],
      ['المستويات', 'تأسيس ← أحكام ← إتقان'],
      ['لمن', 'الأطفال من ٧ سنوات والشباب والكبار'],
      ['المنهج', 'نور البيان · متن الجزرية'],
      ['الشهادة', 'في نهاية كل مستوى'],
    ],
    learnTitle: 'ثلاثة مستويات، ومسار واضح',
    learnLede: 'لكل مستوى معالم يمكن قياسها، فتعرف دائمًا أين وصلت.',
    learn: [
      { title: 'التأسيس', text: 'المخارج والصفات — كل حرف من مخرجه الصحيح بصفاته الصحيحة.' },
      { title: 'الأحكام', text: 'أحكام النون والميم الساكنتين والمدود والقلقلة والوقف — تطبيقًا داخل الآيات لا حفظًا مجردًا.' },
      { title: 'الإتقان', text: 'تلاوة متقنة ثابتة مع متن الجزرية مرجعًا.' },
    ],
    methodTitle: 'كيف تسير الحصص',
    method: [
      { icon: 'waveform', title: 'تصحيح في اللحظة', text: 'يوقفك معلمك عند الحرف نفسه، فلا يتحوّل الخطأ إلى عادة.' },
      { icon: 'books', title: 'مناهج معتمدة', text: 'نور البيان للقراءة، والمتون التراثية للأحكام — لا خطط مرتجلة.' },
      { icon: 'path', title: 'خطة على مقاسك', text: 'يقيّمك معلمك في الحصتين المجانيتين ويرتّب كل مستوى حسب هدفك.' },
    ],
    plansNote: 'يختار أغلب الكبار حصتين أسبوعيًا مدة كل منهما ٦٠ دقيقة، ويبدأ الأطفال غالبًا بحصص ٣٠ دقيقة.',
    faq: [
      { q: 'هل أحتاج إلى معرفة العربية أولًا؟', a: 'لا. يبدأ التجويد بالنطق، ويمكن أن يسير مع تعلّم القراءة. وإن كنت لا تقرأ بعد نبدأ بنور البيان.' },
      { q: 'كم يستغرق تعلّم التجويد؟', a: 'يكتسب أغلب الطلاب عادات صحيحة خلال الأشهر الأولى من الممارسة المنتظمة، ويستمر صقل التجويد مدى الحياة.' },
      { q: 'هل الحصص فردية؟', a: 'دائمًا. كل طالب يتعلّم منفردًا مع معلمه.' },
      { q: 'ما المنهج المستخدم؟', a: 'نور البيان للقراءة الأولى، ثم متون التجويد التراثية ومنها الجزرية، بما يناسب مستواك.' },
      { q: 'هل يمكن للكبار البدء من الصفر؟', a: 'نعم، كثير من طلابنا الكبار بدؤوا دون أي خبرة سابقة في قراءة القرآن.' },
      { q: 'كم حصة في الأسبوع؟', a: 'غالبًا من حصتين إلى ثلاث، في مواعيد تناسب توقيتك.' },
      { q: 'هل يحمل المعلمون إجازة حقيقية؟', a: 'نعم، نتحقق من إجازة كل معلم وسنده قبل أن يبدأ التدريس.' },
      { q: 'ماذا لو فاتتني حصة؟', a: 'غيّر موعدها مجانًا بإشعار قبلها بـ ٢٤ ساعة عبر واتساب.' },
    ],
    cta: { title: 'اسمع الفرق <span class="accent">من أول حصة.</span>', lede: 'حصتا تجويد مجانيتان مع معلم معتمد. بدون بطاقة دفع وبدون التزام.' },
  },
  hifz: {
    ...EN.hifz,
    meta: { title: 'برنامج تحفيظ القرآن والإجازة أونلاين | أكاديمية الأمة', desc: 'احفظ القرآن بمنهج الإتقان الموضوعي واسعَ نحو إجازة حقيقية بسند متصل — حصص مباشرة فردية مع معلمين من الأزهر، بالسرعة التي تناسبك.' },
    crumb: 'الحفظ والإجازة',
    eyebrow: 'الحفظ والإجازة',
    title: 'احفظ القرآن. <span class="accent">واحفظه مدى الحياة.</span>',
    lede: 'يجمع منهج الإتقان الآيات حسب الموضوع والمعنى لتترابط في الذاكرة — مع تصحيح مباشر للتجويد ومراجعة منظمة، وصولًا إلى إجازة رسمية بسند متصل.',
    glance: [
      ['الأسلوب', 'مباشر وفردي'],
      ['المنهج', 'الإتقان (موضوعي) + مراجعة يومية'],
      ['الشهادة', 'إجازة بسند موثَّق'],
      ['لمن', 'الجادّون من سن ٧ سنوات'],
      ['السرعة', 'مخصّصة بالكامل'],
    ],
    learnTitle: 'من أول آية حتى الإجازة',
    learnLede: 'رحلة منظمة يخططها معلمك حول وقتك وهدفك.',
    learn: [
      { title: 'تحديد المستوى والهدف', text: 'يقيّم معلمك مستواك وأساسك في التجويد ويحدد سرعة واقعية.' },
      { title: 'الحفظ الجديد', text: 'آيات جديدة في مجموعات موضوعية، مع تصحيح مباشر للتجويد.' },
      { title: 'المراجعة', text: 'مراجعة يومية وأسبوعية منظمة تحفظ كل ما حفظته قويًا.' },
      { title: 'الإجازة بالسند', text: 'عند الإتمام، إجازة رسمية توثّق سندًا متصلًا إلى النبي ﷺ.' },
    ],
    methodTitle: 'لماذا يدوم حفظ الإتقان؟',
    method: [
      { icon: 'squares-four', title: 'التجميع الموضوعي', text: 'تُحفظ الآيات المترابطة معًا، فيستدعي بعضها بعضًا.' },
      { icon: 'arrows-clockwise', title: 'المراجعة نصف العمل', text: 'كل حصة توازن بين الحفظ الجديد والمراجعة القريبة والبعيدة.' },
      { icon: 'check-circle', title: 'صحيح من اليوم الأول', text: 'التصحيح المباشر يعني أن الخطأ لا يُحفظ مع الآية أبدًا.' },
    ],
    plansNote: 'الحفظ يحتاج إلى انتظام: يختار أغلب الطلاب ٣–٤ حصص أسبوعيًا، والصغار ينجحون مع حصص قصيرة يومية.',
    faq: [
      { q: 'ما منهج الإتقان؟', a: 'الإتقان يعني الإحكام. بدل حفظ الآيات منفصلة، تُجمع الآيات المترابطة حسب الموضوع فيقوّي المعنى والتسلسل بعضهما — حفظ أرسخ وأسهل استدعاءً.' },
      { q: 'ما الإجازة بالضبط؟', a: 'إذن رسمي يشهد بأنك حفظت جزءًا من القرآن أو كله وتتلوه تلاوة صحيحة، مع سند موثّق: سلسلة متصلة من المعلمين إلى النبي ﷺ.' },
      { q: 'هل أحتاج إلى التجويد قبل البدء؟', a: 'تساعد القراءة الواثقة وأساسيات التجويد. يتحقق معلمك من ذلك في الحصتين المجانيتين، ويمكنه بناء التجويد مع الحفظ عند الحاجة.' },
      { q: 'كم يستغرق الحفظ؟', a: 'قد يستغرق جزء أو مجموعة سور أشهرًا، أما الحفظ الكامل فيأخذ عادة عدة سنوات حسب الوقت والعمر والانتظام. يضع معلمك جدولًا صادقًا لك.' },
      { q: 'هل يمكن للأطفال الالتحاق؟', a: 'نعم، من نحو سن السابعة مع سرعة تناسب العمر. وللأصغر سنًا، برنامج أشبال الأمة بداية ألطف.' },
      { q: 'حفظت بعض القرآن من قبل.', a: 'يقيّم معلمك ما حفظته ويكمل من هناك — لن تبدأ من الصفر.' },
      { q: 'كم حصة في الأسبوع؟', a: 'يأخذ أغلب الطلاب من حصتين إلى أربع أسبوعيًا، بمرونة مع معلمهم.' },
      { q: 'هل إجازات المعلمين وأسانيدهم حقيقية؟', a: 'نعم، نتحقق من إجازة كل معلم وسنده قبل أن يدرّس، ضمن مراحل التحقق الأربع.' },
    ],
    cta: { title: 'ابدأ رحلة الحفظ <span class="accent">بحصتين مجانيتين.</span>', lede: 'تعرّف على معلم يحمل سندًا حقيقيًا، وجرّب منهج الإتقان، ثم قرّر.' },
  },
  arabic: {
    ...EN.arabic,
    meta: { title: 'دروس اللغة العربية أونلاين | من نور البيان إلى النحو | أكاديمية الأمة', desc: 'تعلّم عربية القرآن في حصص فردية: نور البيان للقراءة من الصفر، والنحو والصرف بالآجرومية، والمحادثة مع معلمين من الأزهر. تبدأ من ٤٠ دولارًا شهريًا.' },
    crumb: 'اللغة العربية',
    eyebrow: 'اللغة العربية',
    title: 'اقرأها. افهمها. <span class="accent">تحدّث بها.</span>',
    lede: 'عربية للمسلمين: قراءة المصحف أولًا، ثم القواعد التراثية التي تفتح المعاني، ثم المحادثة — في حصص فردية مع معلمين من الأزهر يتقنون العربية والإنجليزية.',
    glance: [
      ['الأسلوب', 'مباشر وفردي'],
      ['المراحل', 'القراءة ← النحو ← المحادثة'],
      ['لمن', 'من سن ٥ سنوات · بلا معرفة سابقة'],
      ['المنهج', 'نور البيان · الآجرومية'],
      ['المعلمون', 'يتقنون العربية والإنجليزية'],
    ],
    learnTitle: 'ثلاث مراحل في مسار واحد',
    learnLede: 'يضعك معلمك في المرحلة المناسبة من أول حصة مجانية.',
    methodTitle: 'مصمَّمة لمن يتعلم العربية لأجل دينه',
    method: [
      { icon: 'book-open-text', title: 'محورها القرآن', text: 'كل مرحلة ترتبط بقراءة النص الكريم وفهمه — لا عربية السائحين.' },
      { icon: 'path', title: 'مسار واضح من ثلاث مراحل', text: 'نور البيان، ثم النحو، ثم المحادثة — كل مرحلة تبني على ما قبلها.' },
      { icon: 'user-focus', title: 'فردية بالكامل', text: 'بسرعتك وأسئلتك — دون انتظار مجموعة.' },
    ],
    plansNote: 'يبدأ الأطفال والمبتدئون غالبًا بحصص ٣٠ دقيقة، ويفضّل دارسو النحو حصص ٦٠ دقيقة.',
    faq: [
      { q: 'لا أعرف حرفًا واحدًا، هل يمكنني البدء؟', a: 'نعم. صُمّم نور البيان لهذا تمامًا، والمعلمون يتقنون العربية والإنجليزية فلا يكون الشرح عائقًا.' },
      { q: 'هل هي عربية القرآن أم الفصحى المعاصرة؟', a: 'كلاهما حسب المرحلة: نور البيان والنحو يركزان على عربية القرآن والمتون، والمحادثة بالفصحى المعاصرة.' },
      { q: 'هل يمكن لطفلي ذي الخمس سنوات الالتحاق؟', a: 'نعم. نور البيان يناسب الأطفال من سن الخامسة، أو برنامج أشبال الأمة الذي يجمع القراءة مع الدراسات الإسلامية باللعب.' },
      { q: 'متى أقرأ القرآن بطلاقة؟', a: 'يصل أغلب المبتدئين المنتظمين إلى القراءة المستقلة الواثقة خلال أشهر، أما الفهم فيحتاج وقتًا أطول — غالبًا عامًا أو أكثر.' },
      { q: 'هل تدرّسون النحو أيضًا؟', a: 'نعم، بعد الطلاقة في القراءة ينتقل الطلاب إلى النحو والصرف بالآجرومية ثم المحادثة.' },
      { q: 'هل الحصص فردية؟', a: 'نعم دائمًا — لكل طالب معلمه.' },
      { q: 'كم حصة في الأسبوع؟', a: 'غالبًا من حصتين إلى ثلاث، في مواعيد تناسب توقيتك.' },
      { q: 'كم التكلفة؟', a: 'تبدأ من ٤٠ دولارًا شهريًا لحصص ٣٠ دقيقة، والنحو والمحادثة من ٦٤ دولارًا. وكل خطة تبدأ بحصتين مجانيتين.' },
    ],
    cta: { title: 'أول حصتين في العربية <span class="accent">علينا.</span>', lede: 'اعرف مرحلتك، وتعرّف على معلمك، ثم قرّر. بدون بطاقة دفع.' },
  },
  kids: {
    ...EN.kids,
    meta: { title: 'القرآن والدراسات الإسلامية للأطفال (٥–١٤) أونلاين | أشبال الأمة', desc: 'أشبال الأمة: حصص فردية مرحة مدتها ٣٠ دقيقة في قراءة القرآن والعربية والقيم الإسلامية للأطفال من ٥ إلى ١٤ عامًا مع معلمين صبورين من الأزهر.' },
    crumb: 'أشبال الأمة',
    eyebrow: 'أشبال الأمة · من ٥ إلى ١٤ عامًا',
    title: 'حصص <span class="accent">ينتظرها طفلك بشوق.</span>',
    lede: 'قراءة القرآن والعربية والقيم الإسلامية بالألعاب والقصص — حصص قصيرة مركّزة مدتها ٣٠ دقيقة مع معلمين من الأزهر مدرَّبين على تعليم الأطفال، وتقدّم تراه بعينيك.',
    glance: [
      ['الأسلوب', 'مباشر وفردي'],
      ['مدة الحصة', '٣٠ دقيقة'],
      ['الأعمار', '٥–٧ · ٨–١٠ · ١١–١٤'],
      ['المعلمون', 'مدرَّبون للأطفال · معلمات متاحات'],
      ['المتابعة', 'تقارير + أوسمة شهرية'],
    ],
    learnTitle: 'حسب العمر',
    learnLede: 'يتطور المحتوى والسرعة مع طفلك — فلا يشعر بأنه أكبر من الدرس أو أصغر منه.',
    methodTitle: 'مبنية على طريقة تعلّم الأطفال',
    method: [
      { icon: 'puzzle-piece', title: 'ألعاب وقصص', text: 'قصص الأنبياء والمسابقات والمكافآت — تعلّم حقيقي لا يشبه المحاضرة.' },
      { icon: 'timer', title: 'قصيرة ومركّزة', text: '٣٠ دقيقة تناسب تركيز الطفل، وتنتهي وهو متحمس.' },
      { icon: 'users-three', title: 'الوالدان في الصورة', text: 'تقرير بعد كل حصة، وأوسمة شهرية، وحساب واحد في بوابة الأسرة لكل أطفالك.' },
    ],
    plansNote: 'أربع حصص قصيرة في الأسبوع هي الخيار الأمثل لأغلب الأطفال.',
    faq: [
      { q: 'لأي عمر برنامج أشبال الأمة؟', a: 'من ٥ إلى ١٤ عامًا في ثلاث مراحل: المستكشفون الصغار (٥–٧)، والمتعلمون الناشئون (٨–١٠)، والعلماء الصغار (١١–١٤).' },
      { q: 'كم مدة الحصة؟', a: '٣٠ دقيقة — تناسب مدى تركيز الطفل الطبيعي.' },
      { q: 'هل هي ألعاب أم فصل دراسي؟', a: 'ألعاب وقصص ووسائل بصرية، مع تعليم حقيقي لقراءة القرآن والدراسات الإسلامية.' },
      { q: 'طفلي لا يعرف العربية ولا القرآن بعد.', a: 'ممتاز — تبدأ مرحلة المستكشفين الصغار من أول الحروف.' },
      { q: 'هل المعلمون مدرَّبون على تعليم الأطفال؟', a: 'نعم. تحمل مسؤولة البرنامج شهادة في التربية الإسلامية المبكرة، ومعلمو الأشبال متخصصون في سن ٥–١٤.' },
      { q: 'هل يمكنني طلب معلمة لابنتي؟', a: 'نعم، تتوفر معلمات في بيئة خاصة آمنة تراعي القيم.' },
      { q: 'كيف أعرف أن طفلي يتقدّم؟', a: 'تقرير قصير بعد كل حصة، وأوسمة إنجاز شهرية، وكل شيء في حساب واحد ببوابة الأسرة.' },
      { q: 'كم التكلفة؟', a: 'تبدأ من ٤٠ دولارًا شهريًا، مع حصتين مجانيتين أولًا. لست متأكدًا من المستوى؟ جرّب اختبار الأطفال المجاني.' },
    ],
    cta: { title: 'دع طفلك يتعرّف على معلمه — <span class="accent">مجانًا.</span>', lede: 'حصتان مجانيتان بدون بطاقة دفع. شاهد تفاعل طفلك قبل أن تقرر أي شيء.' },
  },
  islamic: {
    ...EN.islamic,
    meta: { title: 'الدراسات الإسلامية للكبار أونلاين | عقيدة وفقه وتفسير وسيرة | أكاديمية الأمة', desc: 'منهج حقيقي في العقيدة والفقه والتفسير والسيرة، في حصص مباشرة فردية مع علماء من الأزهر يجيبون عن أسئلتك. حصتان مجانًا.' },
    crumb: 'الدراسات الإسلامية',
    eyebrow: 'الدراسات الإسلامية',
    title: 'افهم دينك — <span class="accent">مع عالِم، لا مع قائمة تشغيل.</span>',
    lede: 'مسار منظم في العقيدة والفقه والتفسير والسيرة، في حصص فردية مع خريجي الأزهر الذين يشرحون الأدلة — ويرحّبون بسؤالك «لماذا؟».',
    glance: [
      ['الأسلوب', 'مباشر وفردي'],
      ['المواد', 'عقيدة · فقه · تفسير · سيرة'],
      ['الطريقة', 'منهج منظم أو نقاش حر'],
      ['لمن', 'الكبار بأي خلفية'],
      ['المرجعية', 'الأزهر، على منهج أهل السنة'],
    ],
    learnTitle: 'أربع مواد — ابدأ من أيها شئت',
    learnLede: 'تعمّق في مادة واحدة أو تنقّل بين الأربع، ويساعدك معلمك على الاختيار.',
    methodTitle: 'عمق لا مجرد تعريفات',
    method: [
      { icon: 'books', title: 'منهج حقيقي', text: 'مسار متماسك بين العلوم الأربعة — لا موضوعات متفرقة.' },
      { icon: 'graduation-cap', title: 'علماء يشرحون الأدلة', text: 'خريجو الأزهر الذين يعرضون الدليل لا النتيجة فقط.' },
      { icon: 'chat-centered-dots', title: 'أسئلتك أنت', text: 'في الحصة المباشرة تسأل «لماذا؟» وتجد جوابًا حقيقيًا.' },
    ],
    plansNote: 'يختار أغلب الكبار حصة أو حصتين أسبوعيًا مدة كل منهما ٦٠ دقيقة.',
    faq: [
      { q: 'هل يجب أن أدرس المواد الأربع؟', a: 'لا، ركّز على مادة واحدة أو خذ نظرة دورية على الأربع، ويساعدك معلمك في الاختيار خلال الحصتين المجانيتين.' },
      { q: 'أنا جديد على الدراسة المنهجية، هل الأمر متقدم عليّ؟', a: 'أبدًا، يرتّب معلمك المادة حسب نقطة بدايتك.' },
      { q: 'هل هي محاضرات أم يمكنني السؤال؟', a: 'أنت تختار: منهج منظم، أو نقاش حول أسئلتك، أو مزيج منهما.' },
      { q: 'على أي مذهب يدرّس المعلمون؟', a: 'المعلمون أزهريون يدرّسون على منهج أهل السنة والجماعة، ويمكن مناقشة التفضيلات الخاصة مع المعلم.' },
      { q: 'هل يمكنني دراسة الفقه فقط؟', a: 'نعم، مادة واحدة أو أي مجموعة حسب أهدافك.' },
      { q: 'كم مدة الدورة؟', a: 'مرنة — تُحدد مع معلمك حسب الموضوع ووقتك.' },
      { q: 'كم حصة في الأسبوع؟', a: 'غالبًا من حصتين إلى ثلاث.' },
      { q: 'ماذا لو فاتتني حصة؟', a: 'غيّر موعدها مجانًا بإشعار قبلها بـ ٢٤ ساعة عبر واتساب.' },
    ],
    cta: { title: 'أحضِر أسئلتك <span class="accent">إلى أول حصة مجانية.</span>', lede: 'حصتان مباشرتان مجانيتان مع عالم من الأزهر. بدون بطاقة دفع وبدون التزام.' },
  },
};

/** Text-only overlay for German, French and Italian; structure (paths, plans, teacher, icons) comes from EN. */
export interface TrackPageText {
  meta: { title: string; desc: string };
  crumb: string;
  eyebrow: string;
  title: string;
  lede: string;
  glance: [string, string][];
  learnTitle: string;
  learnLede: string;
  learn?: { title: string; text: string }[];
  methodTitle: string;
  method: { title: string; text: string }[];
  plansNote: string;
  faq: { q: string; a: string }[];
  cta: { title: string; lede: string };
  schemaName: string;
}
const OVERLAY: Partial<Record<Lang, Record<TrackPageKey, TrackPageText>>> = { de: pagesDe, fr: pagesFr, it: pagesIt };

export const getTrackPage = (key: TrackPageKey, lang: Lang = 'en'): TrackPageContent => {
  if (lang === 'en') return EN[key];
  if (lang === 'ar') return AR[key];
  const x = OVERLAY[lang]?.[key];
  if (!x) return EN[key];
  const base = EN[key];
  if (x.method.length !== base.method.length || (base.learn?.length ?? 0) !== (x.learn?.length ?? 0)) throw new Error(`[trackPages] ${lang}/${key}: list lengths differ from English`);
  return { ...base, ...x, method: base.method.map((m, i) => ({ ...m, ...x.method[i] })) };
};
