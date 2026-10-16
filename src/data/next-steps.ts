import type { Lang } from '@/i18n';

// Shared, translated navigation for readers finishing a guide, resource or FAQ.
// These are choices, not a required sequence or a second booking funnel.
interface NextStepsCopy {
  eyebrow: string;
  title: string;
  lede: string;
  cards: readonly [readonly [string, string, string], readonly [string, string, string], readonly [string, string, string]];
}
export const NEXT_STEPS: Record<Lang, NextStepsCopy> = {
  en: {
    eyebrow: 'Your next step',
    title: 'A little clearer? Choose where to go next.',
    lede: 'Explore a programme, check your starting point, or meet a teacher. You do not need to decide everything today.',
    cards: [
      ['Find a programme', 'Quran, Arabic and Islamic studies for children and adults.', 'Explore courses'],
      ['Find your starting point', 'Try a short placement quiz before choosing your lessons.', 'Check your level'],
      ['Try learning together', 'Book two free one-to-one lessons and discuss your goals.', 'Book free sessions'],
    ],
  },
  ar: {
    eyebrow: 'خطوتك التالية',
    title: 'الصورة أوضح؟ اختر ما يناسبك.',
    lede: 'تعرّف على البرامج، أو ابدأ بتحديد مستواك، أو جرّب التعلم مع معلم. لا تحتاج إلى حسم كل شيء الآن.',
    cards: [
      ['اختر برنامجك', 'القرآن والعربية والدراسات الإسلامية للأطفال والكبار.', 'استكشف الدورات'],
      ['اعرف نقطة البداية', 'اختبار قصير يساعدك على اختيار الدروس المناسبة لمستواك.', 'حدّد مستواك'],
      ['جرّب الحصة بنفسك', 'حصتان فرديتان مجانيتان للتعرّف على المعلم ومناقشة هدفك.', 'احجز حصتين مجانيتين'],
    ],
  },
  de: {
    eyebrow: 'Dein nächster Schritt',
    title: 'Wie möchtest du weitermachen?',
    lede: 'Entdecke die Kurse, schätze dein Niveau ein oder lerne eine Lehrkraft kennen. Du musst dich nicht sofort entscheiden.',
    cards: [
      ['Den passenden Kurs finden', 'Koran, Arabisch und Islamunterricht für Kinder und Erwachsene.', 'Kurse entdecken'],
      ['Den Einstieg finden', 'Ein kurzer Einstufungstest hilft dir bei der Kurswahl.', 'Niveau einschätzen'],
      ['Gemeinsam lernen', 'Zwei kostenlose Einzelstunden, um deine Lernziele zu besprechen.', 'Probestunden buchen'],
    ],
  },
  fr: {
    eyebrow: 'La prochaine étape',
    title: 'Comment souhaitez-vous continuer ?',
    lede: 'Découvrez les programmes, évaluez votre niveau ou rencontrez un enseignant. Inutile de tout décider aujourd’hui.',
    cards: [
      ['Trouver un programme', 'Coran, arabe et études islamiques pour enfants et adultes.', 'Découvrir les cours'],
      ['Trouver votre point de départ', 'Un court test de niveau pour vous orienter dans votre choix.', 'Évaluer mon niveau'],
      ['Essayer ensemble', 'Deux séances individuelles gratuites pour discuter de vos objectifs.', 'Réserver mes séances'],
    ],
  },
  it: {
    eyebrow: 'Il prossimo passo',
    title: 'Come vuoi continuare?',
    lede: 'Scopri i programmi, valuta il tuo livello o conosci un insegnante. Non devi decidere tutto oggi.',
    cards: [
      ['Trova il programma giusto', 'Corano, arabo e studi islamici per bambini e adulti.', 'Scopri i corsi'],
      ['Trova il punto di partenza', 'Un breve test di livello per orientarti nella scelta delle lezioni.', 'Valuta il tuo livello'],
      ['Prova a imparare insieme', 'Due lezioni individuali gratuite per parlare dei tuoi obiettivi.', 'Prenota le lezioni gratuite'],
    ],
  },
};
