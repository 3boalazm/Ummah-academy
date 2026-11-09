import type { Lang } from '@/i18n';

// Only labels for the new home-page presentation controls; course and teaching copy
// continues to come from the existing translated content files.
export const HOME_UI: Record<Lang, { previous: string; next: string; journey: string }> = {
  en: { previous: 'Previous programmes', next: 'Next programmes', journey: 'Your learning journey' },
  ar: { previous: 'البرامج السابقة', next: 'البرامج التالية', journey: 'رحلتك في التعلم' },
  de: { previous: 'Vorherige Kurse', next: 'Weitere Kurse', journey: 'Dein Lernweg' },
  fr: { previous: 'Programmes précédents', next: 'Programmes suivants', journey: 'Votre parcours' },
  it: { previous: 'Programmi precedenti', next: 'Programmi successivi', journey: 'Il tuo percorso' },
};
