/**
 * Placement test question bank (authored for this rebuild — the live quiz was
 * JS-rendered and not crawlable). Must be reviewed by the academic team.
 *
 * kind:
 *  - 'self'  → self-assessment, options scored 0 → 1 across the list
 *  - 'quiz'  → knowledge check, one correct answer (index `answer`)
 *  - 'info'  → used for the recommendation only (not scored)
 */
export type TrackKey = 'quran' | 'arabic' | 'kids' | 'islamic';

export interface Question {
  id: string;
  kind: 'self' | 'quiz' | 'info';
  skill: string;
  prompt: string;
  promptAr?: string;
  options: string[];
  answer?: number;
}

export interface TrackTest {
  key: TrackKey;
  label: string;
  labelAr: string;
  icon: string;
  questions: Question[];
}

const TESTS_EN: TrackTest[] = [
  {
    key: 'quran',
    label: 'Quran & Tajweed',
    labelAr: 'القرآن والتجويد',
    icon: 'book-open-text',
    questions: [
      { id: 'q1', kind: 'self', skill: 'Reading fluency', prompt: 'How would you describe your Quran reading today?', options: ['I can’t read Arabic letters yet', 'I read slowly, letter by letter', 'I read fluently but I’m unsure about Tajweed', 'I read fluently and apply Tajweed rules'] },
      { id: 'q2', kind: 'quiz', skill: 'Makharij (articulation)', prompt: 'Which letters are pronounced from the deepest part of the throat (aqsā al-ḥalq)?', options: ['ء and هـ (Hamzah & Hā’)', 'ع and ح (ʿAyn & Ḥā’)', 'غ and خ (Ghayn & Khā’)', 'ق and ك (Qāf & Kāf)'], answer: 0 },
      { id: 'q3', kind: 'quiz', skill: 'Tajweed foundations', prompt: 'What does the word “Tajweed” literally mean?', options: ['To memorize', 'To improve / make excellent', 'To translate', 'To recite quickly'], answer: 1 },
      { id: 'q4', kind: 'quiz', skill: 'Noon Sakinah rules', prompt: 'When a Noon Sakinah or Tanween is followed by the letter ب, which rule applies?', options: ['Iẓhār', 'Idghām', 'Iqlāb', 'Ikhfā’'], answer: 2 },
      { id: 'q5', kind: 'quiz', skill: 'Noon Sakinah rules', prompt: 'How many throat letters cause Iẓhār Ḥalqī?', options: ['2', '4', '6', '15'], answer: 2 },
      { id: 'q6', kind: 'quiz', skill: 'Madd (elongation)', prompt: 'How long is the natural elongation (Madd Ṭabīʿī)?', options: ['1 count', '2 counts', '4 counts', '6 counts'], answer: 1 },
      { id: 'q7', kind: 'quiz', skill: 'Qalqalah', prompt: 'Which group contains the letters of Qalqalah?', options: ['ق ط ب ج د', 'ن م و ي', 'ل ر ن م', 'س ش ص ض'], answer: 0 },
      { id: 'q8', kind: 'info', skill: 'Memorization', prompt: 'How much of the Quran have you memorized?', options: ['None yet', 'A few short surahs', 'Juz’ ʿAmma or more', 'Several ajzā’ or more'] },
    ],
  },
  {
    key: 'arabic',
    label: 'Arabic Language',
    labelAr: 'اللغة العربية',
    icon: 'pen-nib',
    questions: [
      { id: 'a1', kind: 'self', skill: 'Reading the script', prompt: 'Can you read Arabic script?', options: ['Not yet', 'Slowly, with vowel marks', 'Comfortably, with vowel marks', 'Comfortably, without vowel marks'] },
      { id: 'a2', kind: 'quiz', skill: 'Vocabulary', prompt: 'Which word means “book”?', options: ['قَلَمٌ', 'كِتَابٌ', 'بَيْتٌ', 'بَابٌ'], answer: 1 },
      { id: 'a3', kind: 'quiz', skill: 'Meaning', prompt: 'What does «أَنَا طَالِبٌ» mean?', options: ['He is a teacher', 'You are a student', 'I am a student', 'We are students'], answer: 2 },
      { id: 'a4', kind: 'quiz', skill: 'Particles', prompt: 'Which of these is a preposition (ḥarf jarr)?', options: ['هُوَ', 'كَتَبَ', 'جَمِيلٌ', 'فِي'], answer: 3 },
      { id: 'a5', kind: 'quiz', skill: 'Nahw (syntax)', prompt: 'In «ذَهَبَ الطَّالِبُ», what is «الطَّالِبُ»?', options: ['Fāʿil (the doer)', 'Mafʿūl bihi (the object)', 'Mubtada’ (subject of a nominal sentence)', 'Ḥarf (particle)'], answer: 0 },
      { id: 'a6', kind: 'quiz', skill: 'Iʿrāb (case endings)', prompt: 'A singular noun after a preposition (majrūr) usually ends with…', options: ['Fatḥah', 'Kasrah', 'Ḍammah', 'Sukūn'], answer: 1 },
      { id: 'a7', kind: 'quiz', skill: 'Ṣarf (morphology)', prompt: 'What is the sound masculine plural of «مُسْلِمٌ» in the nominative case?', options: ['مُسْلِمُونَ', 'مُسْلِمَاتٌ', 'مُسْلِمَيْنِ', 'مَسَاجِدُ'], answer: 0 },
      { id: 'a8', kind: 'info', skill: 'Goal', prompt: 'What is your main goal with Arabic?', options: ['Read the Quran correctly', 'Understand the Quran (grammar)', 'Speak and follow lectures', 'All of the above'] },
    ],
  },
  {
    key: 'kids',
    label: 'Ummah Cubs (Kids)',
    labelAr: 'أشبال الأمة',
    icon: 'star',
    questions: [
      { id: 'k1', kind: 'info', skill: 'Age', prompt: 'How old is your child?', options: ['5–7 years', '8–10 years', '11–14 years'] },
      { id: 'k2', kind: 'self', skill: 'Letter recognition', prompt: 'Can your child recognise the Arabic letters?', options: ['Not yet', 'Some letters', 'All the letters', 'Reads whole words'] },
      { id: 'k3', kind: 'quiz', skill: 'Letters', prompt: 'Ask your child: which letter is «ب»?', options: ['Tā’', 'Bā’', 'Thā’', 'Nūn'], answer: 1 },
      { id: 'k4', kind: 'quiz', skill: 'Letters', prompt: 'How many letters are in the Arabic alphabet?', options: ['24', '26', '28', '30'], answer: 2 },
      { id: 'k5', kind: 'quiz', skill: 'Salah', prompt: 'Which surah do we recite in every rakʿah of salah?', options: ['Al-Ikhlāṣ', 'Al-Fātiḥah', 'An-Nās', 'Al-Kawthar'], answer: 1 },
      { id: 'k6', kind: 'quiz', skill: 'Islamic basics', prompt: 'How many pillars of Islam are there?', options: ['3', '5', '6', '7'], answer: 1 },
      { id: 'k7', kind: 'quiz', skill: 'Daily adab', prompt: 'What do we say before we start eating?', options: ['Bismillāh', 'Alḥamdulillāh', 'SubḥānAllāh', 'Allāhu Akbar'], answer: 0 },
      { id: 'k8', kind: 'self', skill: 'Short surahs', prompt: 'Which short surahs can your child recite?', options: ['None yet', 'Al-Fātiḥah', 'A few short surahs', 'Many short surahs'] },
    ],
  },
  {
    key: 'islamic',
    label: 'Islamic Studies',
    labelAr: 'الدراسات الإسلامية',
    icon: 'mosque',
    questions: [
      { id: 'i1', kind: 'self', skill: 'Background', prompt: 'How would you describe your Islamic studies background?', options: ['New to structured study', 'I know the basics', 'I have studied some subjects', 'I have studied with a teacher before'] },
      { id: 'i2', kind: 'quiz', skill: 'Aqeedah', prompt: 'How many pillars of Īmān (faith) are there?', options: ['4', '5', '6', '7'], answer: 2 },
      { id: 'i3', kind: 'quiz', skill: 'Aqeedah', prompt: 'Which of these is a pillar of Īmān, not one of the five pillars of Islam?', options: ['Belief in the angels', 'Ṣalāh', 'Zakāh', 'Ḥajj'], answer: 0 },
      { id: 'i4', kind: 'quiz', skill: 'Tafseer', prompt: 'What does “Tafseer” refer to?', options: ['Rules of recitation', 'Explanation of the Quran’s meanings', 'The Prophet’s ﷺ biography', 'Inheritance law'], answer: 1 },
      { id: 'i5', kind: 'quiz', skill: 'Seerah', prompt: 'In which city was the Prophet ﷺ born?', options: ['Madinah', 'Ṭā’if', 'Makkah', 'Jerusalem'], answer: 2 },
      { id: 'i6', kind: 'quiz', skill: 'Fiqh', prompt: 'How many obligatory daily prayers are there?', options: ['3', '4', '5', '6'], answer: 2 },
      { id: 'i7', kind: 'quiz', skill: 'Fiqh', prompt: 'Which of these breaks wuḍū’?', options: ['Drinking water', 'Passing wind', 'Reading the Quran', 'Smiling'], answer: 1 },
      { id: 'i8', kind: 'info', skill: 'Interest', prompt: 'Which subject interests you most?', options: ['Aqeedah (creed)', 'Fiqh (worship & rulings)', 'Tafseer (Quran meanings)', 'Seerah (Prophetic biography)'] },
    ],
  },
];

const TESTS_AR: TrackTest[] = [
  {
    key: 'quran',
    label: 'القرآن والتجويد',
    labelAr: 'القرآن والتجويد',
    icon: 'book-open-text',
    questions: [
      { id: 'q1', kind: 'self', skill: 'الطلاقة في القراءة', prompt: 'كيف تصف قراءتك للقرآن اليوم؟', options: ['لا أستطيع قراءة الحروف العربية بعد', 'أقرأ ببطء حرفًا حرفًا', 'أقرأ بطلاقة لكني لست متأكدًا من التجويد', 'أقرأ بطلاقة وأطبّق أحكام التجويد'] },
      { id: 'q2', kind: 'quiz', skill: 'المخارج', prompt: 'ما الحرفان اللذان يخرجان من أقصى الحلق؟', options: ['الهمزة والهاء', 'العين والحاء', 'الغين والخاء', 'القاف والكاف'], answer: 0 },
      { id: 'q3', kind: 'quiz', skill: 'أساسيات التجويد', prompt: 'ما معنى كلمة «التجويد» لغةً؟', options: ['الحفظ', 'التحسين والإتقان', 'الترجمة', 'القراءة السريعة'], answer: 1 },
      { id: 'q4', kind: 'quiz', skill: 'أحكام النون الساكنة', prompt: 'إذا جاء بعد النون الساكنة أو التنوين حرف الباء، فما الحكم؟', options: ['الإظهار', 'الإدغام', 'الإقلاب', 'الإخفاء'], answer: 2 },
      { id: 'q5', kind: 'quiz', skill: 'أحكام النون الساكنة', prompt: 'كم عدد حروف الإظهار الحلقي؟', options: ['٢', '٤', '٦', '١٥'], answer: 2 },
      { id: 'q6', kind: 'quiz', skill: 'المدود', prompt: 'كم مقدار المد الطبيعي؟', options: ['حركة واحدة', 'حركتان', 'أربع حركات', 'ست حركات'], answer: 1 },
      { id: 'q7', kind: 'quiz', skill: 'القلقلة', prompt: 'أيّ مجموعة تضم حروف القلقلة؟', options: ['ق ط ب ج د', 'ن م و ي', 'ل ر ن م', 'س ش ص ض'], answer: 0 },
      { id: 'q8', kind: 'info', skill: 'الحفظ', prompt: 'كم تحفظ من القرآن؟', options: ['لا شيء بعد', 'بعض السور القصيرة', 'جزء عمّ أو أكثر', 'عدة أجزاء أو أكثر'] },
    ],
  },
  {
    key: 'arabic',
    label: 'اللغة العربية',
    labelAr: 'اللغة العربية',
    icon: 'pen-nib',
    questions: [
      { id: 'a1', kind: 'self', skill: 'قراءة الخط', prompt: 'هل تستطيع قراءة الخط العربي؟', options: ['ليس بعد', 'ببطء مع التشكيل', 'بسهولة مع التشكيل', 'بسهولة دون تشكيل'] },
      { id: 'a2', kind: 'quiz', skill: 'أقسام الكلام', prompt: 'ما نوع كلمة «كَتَبَ»؟', options: ['اسم', 'فعل', 'حرف', 'ضمير'], answer: 1 },
      { id: 'a3', kind: 'quiz', skill: 'الجملة الاسمية', prompt: 'في جملة «العِلْمُ نورٌ»، ما إعراب «العلمُ»؟', options: ['مبتدأ مرفوع', 'فاعل مرفوع', 'مفعول به منصوب', 'خبر مرفوع'], answer: 0 },
      { id: 'a4', kind: 'quiz', skill: 'حروف الجر', prompt: 'أيّ هذه الكلمات حرف جر؟', options: ['هُوَ', 'كَتَبَ', 'جَمِيلٌ', 'فِي'], answer: 3 },
      { id: 'a5', kind: 'quiz', skill: 'النحو', prompt: 'في «ذَهَبَ الطالبُ»، ما إعراب «الطالبُ»؟', options: ['فاعل مرفوع', 'مفعول به منصوب', 'مبتدأ مرفوع', 'حرف'], answer: 0 },
      { id: 'a6', kind: 'quiz', skill: 'الإعراب', prompt: 'ما علامة جرّ الاسم المفرد غالبًا؟', options: ['الفتحة', 'الكسرة', 'الضمة', 'السكون'], answer: 1 },
      { id: 'a7', kind: 'quiz', skill: 'الصرف', prompt: 'ما جمع المذكر السالم من «مُسْلِم» في حالة الرفع؟', options: ['مُسْلِمُونَ', 'مُسْلِمَاتٌ', 'مُسْلِمَيْنِ', 'مَسَاجِدُ'], answer: 0 },
      { id: 'a8', kind: 'info', skill: 'الهدف', prompt: 'ما هدفك الأساسي من دراسة العربية؟', options: ['قراءة القرآن قراءة صحيحة', 'فهم القرآن (النحو)', 'التحدث ومتابعة الدروس', 'كل ما سبق'] },
    ],
  },
  {
    key: 'kids',
    label: 'أشبال الأمة (الأطفال)',
    labelAr: 'أشبال الأمة',
    icon: 'star',
    questions: [
      { id: 'k1', kind: 'info', skill: 'العمر', prompt: 'كم عمر طفلك؟', options: ['٥–٧ سنوات', '٨–١٠ سنوات', '١١–١٤ سنة'] },
      { id: 'k2', kind: 'self', skill: 'التعرّف على الحروف', prompt: 'هل يتعرّف طفلك على الحروف العربية؟', options: ['ليس بعد', 'بعض الحروف', 'كل الحروف', 'يقرأ كلمات كاملة'] },
      { id: 'k3', kind: 'quiz', skill: 'الحروف', prompt: 'اسأل طفلك: ما اسم هذا الحرف «ب»؟', options: ['تاء', 'باء', 'ثاء', 'نون'], answer: 1 },
      { id: 'k4', kind: 'quiz', skill: 'الحروف', prompt: 'كم عدد حروف الهجاء العربية؟', options: ['٢٤', '٢٦', '٢٨', '٣٠'], answer: 2 },
      { id: 'k5', kind: 'quiz', skill: 'الصلاة', prompt: 'ما السورة التي نقرؤها في كل ركعة؟', options: ['الإخلاص', 'الفاتحة', 'الناس', 'الكوثر'], answer: 1 },
      { id: 'k6', kind: 'quiz', skill: 'أساسيات الإسلام', prompt: 'كم عدد أركان الإسلام؟', options: ['٣', '٥', '٦', '٧'], answer: 1 },
      { id: 'k7', kind: 'quiz', skill: 'الآداب اليومية', prompt: 'ماذا نقول قبل أن نبدأ الطعام؟', options: ['بسم الله', 'الحمد لله', 'سبحان الله', 'الله أكبر'], answer: 0 },
      { id: 'k8', kind: 'self', skill: 'السور القصيرة', prompt: 'ما السور القصيرة التي يحفظها طفلك؟', options: ['لا شيء بعد', 'الفاتحة', 'بعض السور القصيرة', 'سور قصيرة كثيرة'] },
    ],
  },
  {
    key: 'islamic',
    label: 'الدراسات الإسلامية',
    labelAr: 'الدراسات الإسلامية',
    icon: 'mosque',
    questions: [
      { id: 'i1', kind: 'self', skill: 'الخلفية العلمية', prompt: 'كيف تصف خلفيتك في الدراسات الإسلامية؟', options: ['جديد على الدراسة المنهجية', 'أعرف الأساسيات', 'درست بعض المواد', 'درست مع معلم من قبل'] },
      { id: 'i2', kind: 'quiz', skill: 'العقيدة', prompt: 'كم عدد أركان الإيمان؟', options: ['٤', '٥', '٦', '٧'], answer: 2 },
      { id: 'i3', kind: 'quiz', skill: 'العقيدة', prompt: 'أيّ مما يلي من أركان الإيمان وليس من أركان الإسلام الخمسة؟', options: ['الإيمان بالملائكة', 'الصلاة', 'الزكاة', 'الحج'], answer: 0 },
      { id: 'i4', kind: 'quiz', skill: 'التفسير', prompt: 'ماذا يعني «التفسير»؟', options: ['أحكام التلاوة', 'بيان معاني القرآن', 'سيرة النبي ﷺ', 'أحكام المواريث'], answer: 1 },
      { id: 'i5', kind: 'quiz', skill: 'السيرة', prompt: 'في أي مدينة وُلد النبي ﷺ؟', options: ['المدينة المنورة', 'الطائف', 'مكة المكرمة', 'القدس'], answer: 2 },
      { id: 'i6', kind: 'quiz', skill: 'الفقه', prompt: 'كم عدد الصلوات المفروضة في اليوم؟', options: ['٣', '٤', '٥', '٦'], answer: 2 },
      { id: 'i7', kind: 'quiz', skill: 'الفقه', prompt: 'أيّ مما يلي ينقض الوضوء؟', options: ['شرب الماء', 'خروج الريح', 'قراءة القرآن', 'الابتسام'], answer: 1 },
      { id: 'i8', kind: 'info', skill: 'الاهتمام', prompt: 'أيّ مادة تهمّك أكثر؟', options: ['العقيدة', 'الفقه', 'التفسير', 'السيرة'] },
    ],
  },
];

export const getTests = (lang: 'en' | 'ar' = 'en'): TrackTest[] => (lang === 'ar' ? TESTS_AR : TESTS_EN);
export const TESTS = TESTS_EN;
