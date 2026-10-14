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
  testimonials: [
    { quote: 'Avant, mon fils redoutait les cours de Coran. Maintenant, c’est LUI qui me rappelle l’heure de sa séance\u00a0! Ustadha Nour fait de chaque cours une aventure qu’il attend avec impatience.', result: 'Attend désormais chaque cours de Coran', location: 'Londres, Royaume-Uni', program: 'Ummah Cubs' },
    { quote: 'Après des années de difficultés, j’ai récité la sourate Al-Fatiha correctement pour la première fois. Alhamdoulillah — la patience d’Ustadha Omneya a tout changé.', result: 'A récité Al-Fatiha correctement pour la première fois', location: 'Toronto, Canada', program: 'Tajwid' },
    { quote: 'Père de trois enfants, je suis grâce à l’Espace famille l’apprentissage de tous mes enfants au même endroit. Des comptes rendus détaillés après chaque séance — vraiment exceptionnel.', result: 'Suit 3 enfants au même endroit', location: 'Houston, États-Unis', program: 'Formule famille' },
    { quote: 'J’habite en Australie et je m’inquiétais des fuseaux horaires. Ils ont programmé mes séances à 7\u00a0h du matin et envoient même des rappels sur WhatsApp. Une équipe très professionnelle.', result: 'Des séances à 7\u00a0h malgré les fuseaux', location: 'Sydney, Australie', program: 'Mémorisation' },
    { quote: 'Avec Noor Al-Bayan, je suis passée de zéro en arabe à la lecture du Coran en seulement 6\u00a0mois. L’approche Itqan est tout simplement extraordinaire.', result: 'Lit le Coran en 6\u00a0mois', location: 'Paris, France', program: 'Arabe' },
  ],
};
export default people;
