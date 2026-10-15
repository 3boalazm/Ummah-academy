/** Courses — français. */
import { prices } from '@/data/prices';

const P = prices('fr');

export default {
  C: {
    ldName: 'Les cours d’Ummah Academy',
    jump: 'Aller à un parcours',
    meta: {
      title: 'Cours de Coran en ligne | Tajwid, hifz, arabe & sciences islamiques | Ummah Academy',
      desc: `Quatre parcours — Coran & tajwid, arabe, Ummah Cubs pour les enfants et sciences islamiques — en direct et en tête-à-tête avec des enseignants d’al-Azhar. Dès ${P.from}/mois, 2 séances offertes.`,
    },
    eyebrow: 'Cours',
    title: 'Chaque cours, <span class="accent">un chemin clair.</span>',
    lede: 'Quatre parcours — Coran & tajwid, arabe, Ummah Cubs et sciences islamiques — en direct et en tête-à-tête avec des enseignants d’al-Azhar. Commencez par deux séances gratuites.',
    chooserTitle: 'Quel programme me convient\u00a0?',
    chooserLede: 'Une comparaison rapide — ou faites le test de niveau pour une recommandation personnalisée.',
    cols: ['Programme', 'Idéal pour', 'Accessible aux débutants', 'Objectif principal'],
    rows: [
      ['Récitation du Coran & tajwid', '/quran-recitation-course/', 'Toute personne qui veut réciter correctement', 'Oui', 'Une prononciation correcte et les règles du tajwid'],
      ['Hifz & ijaza', '/quran-memorization-hifz/', 'Mémoriser avec une ijaza documentée', 'Des bases de tajwid aident', 'Une mémorisation durable avec un vrai sanad'],
      ['Langue arabe', '/online-arabic-classes/', 'Lire et comprendre l’arabe coranique', 'Oui', 'Lecture, grammaire et compréhension'],
      ['Ummah Cubs', '/ummah-cubs-kids-islamic-studies/', 'Les enfants de 5 à 14\u00a0ans', 'Oui', 'Le Coran, l’arabe et les valeurs par le jeu'],
      ['Sciences islamiques', '/online-islamic-studies-classes/', 'Les adultes qui veulent étudier la ‘aqida, le fiqh, le tafsir ou la sira', 'Oui', 'Une compréhension plus profonde de la religion'],
    ],
    track: (i: number) => `Parcours ${i} sur 4`,
    details: 'Voir le parcours',
    kidsTest: 'Pas encore sûr\u00a0? Faites le test de niveau gratuit pour enfants',
    ctaTitle: 'Vous ne savez pas par où commencer\u00a0? <span class="accent">On vous aide.</span>',
    ctaLede: 'Faites le test de niveau de 3\u00a0minutes, ou réservez deux séances gratuites\u00a0: votre professeur trouvera votre point de départ.',
    ctaSecondary: 'Test de niveau',
  },
};
