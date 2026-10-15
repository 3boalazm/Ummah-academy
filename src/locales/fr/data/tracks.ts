/** Parcours & cours — français (textes seulement ; ids, prix et liens dans src/data/tracks.ts). */
import type { TracksText } from '@/data/tracks';

const tracks: TracksText = {
  quran: {
    title: 'Coran & tajwid',
    subtitle: 'Récitation · Tajwid · Hifz · Ijaza',
    intro: 'Récitez le Coran tel qu’il a été révélé — avec le tajwid, la mémorisation selon la méthode Itqan et un chemin vers l’ijaza.',
    points: ['Une récitation correcte, telle que transmise depuis le Prophète ﷺ', 'Le tajwid en 3 niveaux progressifs', 'La mémorisation avec la méthode Itqan', 'Un programme d’ijaza avec sanad documenté'],
    ctaLabel: 'Réserver un essai gratuit en Coran',
    courses: {
      recitation: { title: 'Récitation du Coran', badge: 'Du débutant à l’avancé', tags: ['Tous âges', 'En direct, en tête-à-tête'], desc: 'Une récitation correcte, des premières lettres jusqu’à l’aisance complète.' },
      tajweed: { title: 'Règles de tajwid', badge: 'Programme en 3 niveaux', tags: ['Bases', 'Règles', 'Maîtrise'], desc: 'Makharij, sifat, noun sakina et règles du madd à travers la Jazariyya.' },
      hifz: { title: 'Hifz & ijaza', badge: 'Ijaza possible', tags: ['Méthode Itqan', 'Parcours ijaza'], desc: 'Mémorisez grâce au regroupement thématique et obtenez une ijaza formelle avec sanad.' },
    },
  },
  arabic: {
    title: 'Langue arabe',
    subtitle: 'Noor Al-Bayan · Grammaire · Conversation',
    intro: 'De la lecture correcte du mushaf à sa compréhension — bases de lecture, grammaire classique et aisance à l’oral.',
    points: ['Bases avec Noor Al-Bayan & la Nuraniyya', 'Grammaire classique avec l’Ajrumiyya (nahw & sarf)', 'Arabe parlé pour la vie quotidienne et les cours'],
    ctaLabel: 'Réserver un essai gratuit en arabe',
    courses: {
      'noor-al-bayan': { title: 'Noor Al-Bayan', badge: 'Débutants & enfants', tags: ['Dès 5\u00a0ans', 'Zéro arabe'], desc: 'La méthode la plus reconnue pour apprendre à lire l’arabe et le Coran en partant de zéro.' },
      grammar: { title: 'Grammaire\u00a0: nahw & sarf', badge: 'Ajrumiyya', tags: ['Intermédiaire', 'Classique'], desc: 'La grammaire arabe classique à travers le texte de l’Ajrumiyya.' },
      conversation: { title: 'Conversation en arabe', badge: 'Arabe standard moderne', tags: ['Tous niveaux', 'Aisance'], desc: 'Une pratique orale concrète pour la vie quotidienne et les cours islamiques.' },
    },
  },
  kids: {
    title: 'Ummah Cubs',
    subtitle: 'Pour les enfants de 5 à 14\u00a0ans',
    intro: 'Le Coran, l’arabe et les valeurs islamiques par le jeu et les histoires — des séances de 30\u00a0minutes que les enfants attendent avec impatience.',
    points: ['Lecture du Coran avec Noor Al-Bayan', 'Sciences islamiques par les histoires et les jeux', 'Des séances de 30\u00a0minutes adaptées à la concentration', 'Des badges de réussite chaque mois'],
    ctaLabel: 'Réserver un essai gratuit pour mon enfant',
    courses: {
      'little-explorers': { title: 'Petits explorateurs', badge: '5–7\u00a0ans', tags: ['Bases', 'Jeux & histoires'], desc: 'Premières lettres arabes, histoires islamiques et courtes sourates — des séances ludiques de 30\u00a0minutes.' },
      'growing-learners': { title: 'Jeunes apprenants', badge: '8–10\u00a0ans', tags: ['Noor Al-Bayan', 'Courtes sourates'], desc: 'Une vraie aisance en lecture, la mémorisation de courtes sourates et des valeurs à travers les histoires.' },
      'junior-scholars': { title: 'Jeunes savants', badge: '11–14\u00a0ans', tags: ['Parcours structuré', 'Badges mensuels'], desc: 'Une mémorisation structurée et des sciences islamiques plus approfondies, en préparation des parcours ados et adultes.' },
    },
  },
  islamic: {
    title: 'Sciences islamiques',
    subtitle: '‘Aqida · Fiqh · Tafsir · Sira',
    intro: 'Un vrai programme pour comprendre votre religion — enseigné par des savants qui répondent à vos vraies questions.',
    points: ['‘Aqida — les 6 piliers de la foi avec leurs preuves coraniques', 'Fiqh — les règles pratiques de l’adoration', 'Tafsir — le sens des versets et leurs leçons pour la vie', 'Sira — la vie et la guidance du Prophète ﷺ'],
    ctaLabel: 'Réserver un essai gratuit en sciences islamiques',
    courses: {
      aqeedah: { title: '‘Aqida', badge: 'Les fondements de la foi', tags: ['6 piliers', 'Preuves coraniques'], desc: 'Une foi inébranlable à travers les 6 piliers de l’iman, fondée sur des preuves authentiques.' },
      fiqh: { title: 'Fiqh', badge: 'L’adoration au quotidien', tags: ['Règles pratiques', 'Erreurs fréquentes'], desc: 'La prière, la purification et les règles du quotidien — avec assurance et preuves à l’appui.' },
      tafseer: { title: 'Tafsir', badge: 'Le Coran expliqué', tags: ['Verset par verset', 'Leçons de vie'], desc: 'Aller au-delà de la traduction, vers le sens profond et les leçons de chaque verset.' },
      seerah: { title: 'Sira', badge: 'Biographie prophétique', tags: ['Vie du Prophète ﷺ', 'Caractère'], desc: 'La vie du Prophète ﷺ — son caractère, ses épreuves et sa guidance intemporelle.' },
    },
  },
};
export default tracks;
