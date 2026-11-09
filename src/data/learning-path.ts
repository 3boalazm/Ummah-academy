import type { Lang } from '@/i18n';

// Editorial explanation of the learner journey, not a live progress indicator.
export const LEARNING_PATH: Record<Lang, { eyebrow: string; title: string; intro: string; steps: readonly [string, string, string][]; level: string; book: string }> = {
  en: {
    eyebrow: 'Your learning path', title: 'Start with your goal. Grow at your pace.',
    intro: 'Not sure which programme fits? You can check your starting point before booking, or talk through your goals in a trial lesson.',
    steps: [['01', 'Find your starting point', 'Explore the programmes or take the short placement quiz.'], ['02', 'Learn with a teacher', 'Try two free one-to-one lessons and discuss a plan that fits your goal.'], ['03', 'Keep moving forward', 'After each lesson, a report helps you see what to practise next.']],
    level: 'Check your level', book: 'Book free sessions',
  },
  ar: {
    eyebrow: 'رحلتك في التعلم', title: 'ابدأ بهدفك، وتقدّم بالوتيرة المناسبة لك.',
    intro: 'لست متأكدًا من البرنامج الأنسب؟ يمكنك تحديد نقطة بدايتك قبل الحجز، أو مناقشة هدفك في الحصة التجريبية.',
    steps: [['١', 'اعرف نقطة البداية', 'تعرّف على البرامج أو جرّب اختبار المستوى القصير.'], ['٢', 'تعلّم مع معلم', 'جرّب حصتين فرديتين مجانيتين وناقش خطة تناسب هدفك.'], ['٣', 'تابع تقدّمك', 'بعد كل حصة، يساعدك التقرير على معرفة ما تتدرّب عليه لاحقًا.']],
    level: 'حدّد مستواك', book: 'احجز حصتين مجانيتين',
  },
  de: {
    eyebrow: 'Dein Lernweg', title: 'Starte mit deinem Ziel. Lerne in deinem Tempo.',
    intro: 'Noch unsicher, welcher Kurs passt? Finde vor der Buchung deinen Einstieg oder besprich deine Ziele in einer Probestunde.',
    steps: [['01', 'Finde deinen Einstieg', 'Entdecke die Kurse oder mache den kurzen Einstufungstest.'], ['02', 'Lerne mit einer Lehrkraft', 'Probiere zwei kostenlose Einzelstunden und besprich einen passenden Plan.'], ['03', 'Bleib dran', 'Nach jeder Stunde zeigt dir ein Bericht, was du als Nächstes üben kannst.']],
    level: 'Niveau einschätzen', book: 'Probestunden buchen',
  },
  fr: {
    eyebrow: 'Votre parcours', title: 'Partez de votre objectif. Avancez à votre rythme.',
    intro: 'Vous hésitez entre les programmes ? Évaluez votre point de départ avant de réserver ou parlez de vos objectifs pendant une séance d’essai.',
    steps: [['01', 'Trouvez votre point de départ', 'Explorez les programmes ou faites le court test de niveau.'], ['02', 'Apprenez avec un enseignant', 'Essayez deux séances individuelles gratuites et discutez d’un parcours adapté.'], ['03', 'Poursuivez vos progrès', 'Après chaque séance, un compte rendu vous aide à savoir quoi travailler ensuite.']],
    level: 'Évaluer mon niveau', book: 'Réserver mes séances',
  },
  it: {
    eyebrow: 'Il tuo percorso', title: 'Parti dal tuo obiettivo. Procedi al tuo ritmo.',
    intro: 'Non sai quale programma scegliere? Valuta il tuo punto di partenza prima di prenotare o parla dei tuoi obiettivi durante una lezione di prova.',
    steps: [['01', 'Trova il punto di partenza', 'Scopri i programmi o fai il breve test di livello.'], ['02', 'Impara con un insegnante', 'Prova due lezioni individuali gratuite e parla di un piano adatto a te.'], ['03', 'Continua a progredire', 'Dopo ogni lezione, un resoconto ti aiuta a capire cosa esercitare.']],
    level: 'Valuta il tuo livello', book: 'Prenota le lezioni gratuite',
  },
};
