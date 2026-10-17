/** Enseignantes & témoignages — français (textes seulement ; les témoignages sont signalés comme traduits). */
import type { PeopleText } from '@/data/people';

const people: PeopleText = {
  teachers: {
    'omneya-ali': {
      role: 'Responsable du tajwid',
      specialty: 'Tajwid & qira’at',
      bio: 'Diplômée de la faculté de charia et de droit de l’université al-Azhar, Omneya a mémorisé l’intégralité du Coran à 12\u00a0ans et détient une ijaza en Hafs ’an ’Asim avec une chaîne de transmission remontant au Prophète ﷺ. Elle est spécialisée dans l’enseignement aux femmes et aux enfants dès sept ans, avec Noor Al-Bayan, Al-Qa’ida An-Nuraniyya et l’Ajrumiyya.',
      bestFor: ['Tajwid & qira’at', 'Femmes', 'Enfants dès 7\u00a0ans'],
      credentials: ['Ijaza — Hafs ’an ’Asim', 'Plus de 10\u00a0ans d’enseignement', 'Arabe & anglais'],
    },
    'sara-ahmed': {
      role: 'Responsable des bases de l’arabe',
      specialty: 'Arabe & Noor Al-Bayan',
      bio: 'Diplômée de la faculté de langue arabe d’al-Azhar et certifiée en Noor Al-Bayan, Sara est spécialisée dans les grands débutants et les enfants — de la liaison des lettres et des voyelles brèves jusqu’à une lecture autonome et assurée.',
      bestFor: ['Débutants en arabe', 'Enfants', 'Noor Al-Bayan'],
      credentials: ['Certifiée — Noor Al-Bayan', '8\u00a0ans en ligne', 'Arabe & anglais'],
    },
    'nour-hassan': {
      role: 'Responsable d’Ummah Cubs',
      specialty: 'Enfants & sciences islamiques',
      bio: 'Certifiée par al-Azhar en éducation islamique de la petite enfance, Nour dirige le programme Ummah Cubs — un apprentissage ludique du Coran pour les enfants de 5 à 14\u00a0ans, qui rend les premiers pas avec le Coran joyeux et encourageants.',
      bestFor: ['De 5 à 14\u00a0ans', 'Premiers pas avec le Coran', 'Apprentissage par le jeu'],
      credentials: ['Certifiée — éducation islamique de la petite enfance', '7\u00a0ans avec les 5–14\u00a0ans', 'Arabe & anglais'],
    },
  },
};
export default people;
