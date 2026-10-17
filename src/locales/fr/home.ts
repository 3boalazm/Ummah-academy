/** Home — français. */
import { prices } from '@/data/prices';

const P = prices('fr');

export default {
  C: {
    meta: {
      title: 'Cours de Coran et d’arabe en ligne avec des enseignants d’al-Azhar | 2 séances offertes | Ummah Academy',
      desc: 'Cours de Coran, tajwid, arabe et sciences islamiques en direct et en tête-à-tête, avec des enseignants d’al-Azhar titulaires d’une ijaza vérifiée. Enfants et adultes, tous fuseaux horaires\u00a0: vos 2 premières séances sont offertes.',
    },
    eyebrow: 'En direct, en tête-à-tête · Savants d’al-Azhar',
    title: 'Le Coran, enseigné <span class="accent">tel qu’il a été transmis.</span>',
    lede: 'Des cours en direct et en tête-à-tête de Coran, de tajwid, d’arabe et de sciences islamiques, avec des enseignants d’al-Azhar titulaires d’une ijaza vérifiée — pour les enfants et les adultes, à l’heure qui vous convient.',
    test: 'Test de 3\u00a0minutes',
    reassure: ['Sans carte bancaire', 'Enseignantes disponibles', 'Pause ou résiliation à tout moment'],
    card1: ['Tajwid · Niveau 2', 'Leçon 12 sur 18', 'Progression'],
    card2: ['Prochaine séance en direct', 'Règles du noun sakina', 'Ustadha Omneya · 19\u00a0h (GMT)', 'Commence dans 2\u00a0h\u00a014'],
    verified: 'Ijaza vérifiée',
    stats: [
      ['50+', 'pays'],
      ['1\u00a0000+', 'élèves'],
      ['12+', 'ijazas délivrées'],
      ['95\u00a0%', 'continuent après le premier mois'],
    ],
    router: {
      title: 'Qui va apprendre\u00a0?',
      lede: 'Dites-le-nous\u00a0: nous vous orientons au bon endroit en un clic.',
      childKicker: 'Pour mon enfant',
      childTitle: 'Ummah Cubs · de 5 à 14\u00a0ans',
      childText: 'Des séances ludiques de 30\u00a0minutes avec des enseignants patients, formés pour les enfants — enseignantes disponibles, et des progrès visibles chaque mois.',
      childChips: ['Séances de 30\u00a0min', 'Jeux & histoires', 'Badges mensuels'],
      childCta: 'Découvrir Ummah Cubs',
      selfKicker: 'Pour moi',
      selfTitle: 'Quel est votre objectif\u00a0?',
      goals: [
        ['Lire le Coran en partant de zéro', '/online-arabic-classes/', 'read'],
        ['Perfectionner mon tajwid', '/quran-recitation-course/', 'tajweed'],
        ['Mémoriser et obtenir une ijaza', '/quran-memorization-hifz/', 'hifz'],
        ['Comprendre l’arabe du Coran', '/online-arabic-classes/', 'arabic'],
        ['Étudier la ‘aqida, le fiqh, le tafsir ou la sira', '/online-islamic-studies-classes/', 'islamic'],
      ],
      unsure: 'Pas sûr\u00a0? Faites le test de niveau de 3\u00a0minutes',
    },
    why: {
      eyebrow: 'Pourquoi Ummah Academy',
      title: 'Un savoir dont vous connaissez <span class="accent">la source.</span> Des cours qui s’adaptent à votre vie.',
      sanadKicker: 'Sanad vérifié',
      sanadTitle: 'Une chaîne de maîtres qui remonte au Prophète ﷺ',
      sanadText: 'Chaque enseignant est titulaire d’une ijaza — une chaîne de transmission documentée — et passe une vérification en quatre étapes\u00a0: diplômes, vérification du sanad, cours d’essai en direct et évaluation continue.',
      sanadLink: 'Comment nous sélectionnons nos enseignants',
      itqan: ['La méthode Itqan', 'Des versets regroupés par thème et par sens, corrigés en direct — une mémorisation qui dure, pas une récitation de façade.', 'Comment ça marche'],
      safe: ['Sûr pour chaque famille', 'Des cours privés en tête-à-tête, des enseignantes pour les femmes et les filles, et un compte rendu après chaque séance.'],
      time: ['Calé sur votre horloge', 'Le matin à Paris ou le soir à Montréal — réservez à toute heure, avec un rappel WhatsApp 15\u00a0minutes avant.'],
      price: [`Dès ${P.from} par mois`, 'Des formules transparentes. D’abord deux séances gratuites.', 'Voir les tarifs'],
    },
    how: {
      eyebrow: 'Comment ça marche',
      title: 'Ce qui se passe <span class="accent">après la réservation</span>',
      lede: 'Pas d’inscription interminable\u00a0: un vrai professeur, deux vrais cours, puis vous décidez.',
      steps: [
        ['Parlez-nous de vous', 'Trois questions rapides\u00a0: qui apprend, quoi et quand. Environ une minute.'],
        ['Nous trouvons votre professeur', 'Nous confirmons le professeur et les horaires sur WhatsApp — en général en quelques minutes, toujours sous 2\u00a0heures.'],
        ['Deux séances gratuites en direct', 'Votre professeur évalue votre niveau et construit un plan autour de votre objectif.'],
        ['Apprenez et suivez vos progrès', 'Un compte rendu après chaque séance et un certificat pour chaque niveau.'],
      ],
    },
    tracks: { eyebrow: 'Cours', title: 'Quatre portes d’entrée. <span class="accent">Partez de là où vous êtes.</span>', lede: 'De votre première lettre arabe jusqu’à une ijaza complète.' },
    stories: { eyebrow: 'Témoignages', title: 'Des familles dans plus de 50 pays, <span class="accent">une classe à la fois.</span>', note: 'Témoignages traduits de l’anglais.', all: 'Lire tous les témoignages' },
    pricing: {
      eyebrow: 'Tarifs',
      title: 'Des tarifs simples. <span class="accent">D’abord deux séances gratuites.</span>',
      text: 'Choisissez des séances de 30\u00a0minutes pour les enfants et la pratique ciblée, ou de 60\u00a0minutes pour les adultes, le tajwid et le hifz.',
      tabs: ['30 minutes', '60 minutes'],
      perSession: 'par séance',
      all: 'Toutes les formules et les détails',
    },
    faq: {
      eyebrow: 'Questions',
      title: 'Avant de <span class="accent">réserver</span>',
      more: 'Toutes les questions',
      items: [
        {
          q: 'Les deux séances d’essai sont-elles vraiment gratuites\u00a0?',
          a: 'Oui. Deux cours complets en direct avec votre professeur — sans carte, sans obligation. Si vous continuez, vous choisissez une formule mensuelle\u00a0; sinon, c’est tout.',
        },
        {
          q: 'Combien cela coûte-t-il, et puis-je résilier\u00a0?',
          a: `Les formules vont de ${P.from} à ${P.to} par mois selon la durée et la fréquence des séances. Résiliation à tout moment (effective à la fin du mois de facturation), suspension possible, et report des séances en prévenant 24\u00a0heures à l’avance.`,
        },
        { q: 'Puis-je choisir une enseignante\u00a0?', a: 'Oui. Des enseignantes sont disponibles pour les femmes et les filles — choisissez simplement «\u00a0Enseignante\u00a0» lors de la réservation.' },
        { q: 'Mon enfant est-il trop jeune\u00a0?', a: 'Ummah Cubs accueille les enfants dès 5\u00a0ans, avec des séances courtes et ludiques de 30\u00a0minutes, pensées pour la concentration des plus petits.' },
        {
          q: 'Je ne parle pas arabe. Vais-je comprendre\u00a0?',
          a: 'Oui. Chaque enseignant est parfaitement bilingue arabe-anglais\u00a0; les cours ne se donnent pas en français pour le moment. Beaucoup de nos élèves partent de zéro.',
        },
        {
          q: 'Les cours sont-ils en direct\u00a0? Sont-ils enregistrés\u00a0?',
          a: 'Chaque cours a lieu en direct et en tête-à-tête sur Zoom ou Google Meet. Le professeur envoie un compte rendu après chaque séance\u00a0; les enregistrements sont disponibles sur demande, en attendant la bibliothèque de l’Espace famille.',
        },
      ],
    },
    cta: {
      eyebrow: 'Commencez aujourd’hui',
      title: 'Commencez par <span class="accent">deux séances gratuites.</span>',
      lede: 'Rencontrez votre professeur, ressentez la différence d’un cours en direct en tête-à-tête, puis décidez. Sans carte, sans engagement.',
    },
  },
};
