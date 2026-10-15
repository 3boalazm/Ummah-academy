/** FaqPage — français. */
import { lp } from '@/i18n';

export default {
  groups: [
    {
      id: 'start',
      title: 'Bien commencer',
      items: [
        { q: 'En combien de temps répondez-vous\u00a0?', a: 'Sur WhatsApp, en général en quelques minutes — toujours sous 2\u00a0heures, quel que soit votre fuseau horaire.' },
        { q: 'Les 2 séances d’essai sont-elles vraiment gratuites\u00a0?', a: 'Oui — entièrement gratuites, sans carte et sans engagement.' },
        { q: 'Que se passe-t-il après l’essai\u00a0?', a: 'Si vous souhaitez continuer, vous choisissez une formule mensuelle. Sinon, il n’y a rien à résilier.' },
        { q: 'Puis-je demander un professeur en particulier\u00a0?', a: 'Oui — indiquez son nom lors de la réservation et nous ferons de notre mieux.' },
      ],
    },
    {
      id: 'method',
      title: 'Cours & méthode',
      items: [
        { q: 'Et si je ne parle pas arabe\u00a0?', a: 'Chaque enseignant est parfaitement bilingue arabe-anglais\u00a0; nous ne proposons pas encore de cours en français. Beaucoup d’élèves partent de zéro.' },
        {
          q: 'Qu’est-ce qui rend votre approche différente\u00a0?',
          a: 'La méthode Itqan\u00a0: la maîtrise et la réflexion (tadabbur), pas seulement la récitation — des versets regroupés par thème et une correction en temps réel plutôt que la répétition mécanique.',
        },
        {
          q: 'Est-ce que j’obtiens un certificat ou une ijaza\u00a0?',
          a: 'Chaque élève reçoit un certificat par niveau. Les élèves en récitation et en hifz peuvent viser une ijaza formelle, avec une chaîne documentée qui remonte au Prophète ﷺ.',
        },
      ],
    },
    {
      id: 'teachers',
      title: 'Enseignants',
      items: [
        { q: 'Qui sont vos enseignants\u00a0?', a: 'Des diplômés de l’université al-Azhar titulaires d’ijazas, habitués à enseigner aussi bien aux arabophones qu’aux non-arabophones.' },
        { q: 'Puis-je demander une enseignante pour ma fille ou mon épouse\u00a0?', a: 'Oui — des enseignantes dédiées aux femmes et aux enfants, dans un cadre privé et respectueux de la foi.' },
      ],
    },
    {
      id: 'schedule',
      title: 'Horaires & technique',
      items: [
        { q: 'Sur quelle plateforme se déroulent les séances\u00a0?', a: 'Sur Zoom ou Google Meet, avec un tableau blanc interactif pour annoter le tajwid.' },
        { q: 'Et si je manque une séance\u00a0?', a: 'Reportez-la gratuitement en prévenant 24\u00a0heures à l’avance\u00a0: une séance manquée n’est pas une séance perdue.' },
        { q: 'Couvrez-vous mon fuseau horaire\u00a0?', a: 'Oui — les cours ont lieu à toute heure, vous réservez donc le créneau qui vous convient vraiment.' },
      ],
    },
    {
      id: 'family',
      title: 'Famille & enfants',
      items: [
        { q: 'Mon enfant a 5\u00a0ans — est-ce trop tôt\u00a0?', a: 'Pas du tout — Ummah Cubs accueille les enfants dès 5\u00a0ans, avec des séances courtes et ludiques de 30\u00a0minutes.' },
        {
          q: 'Puis-je suivre les progrès de mon enfant\u00a0?',
          a: 'Un compte rendu après chaque cours et des badges mensuels, avec un seul compte Espace famille pour tous vos enfants\u00a0; le tableau de bord en direct et la bibliothèque d’enregistrements arrivent progressivement.',
        },
      ],
    },
    {
      id: 'pricing',
      title: 'Tarifs & paiement',
      items: [
        {
          q: 'Combien cela coûte-t-il\u00a0?',
          a: `De 40\u00a0$ à 128\u00a0$ par mois selon la durée et la fréquence des séances — chaque formule commence par 2 séances gratuites. Voir les <a href="${lp('fr', '/pricing/')}">tarifs</a>.`,
        },
        { q: 'Puis-je résilier ou faire une pause\u00a0?', a: 'Oui — résiliation à tout moment (effective à la fin du mois de facturation) ou suspension temporaire de l’abonnement.' },
        { q: 'Quels moyens de paiement acceptez-vous\u00a0?', a: 'Visa, Mastercard, PayPal, virement bancaire, Western Union et MoneyGram.' },
      ],
    },
  ],
  C: {
    meta: {
      title: 'FAQ des cours de Coran | Ummah Academy',
      desc: 'Les réponses aux questions les plus fréquentes des familles\u00a0: essai gratuit, enseignants, enseignantes, fuseaux horaires, enfants dès 5\u00a0ans, certificats, tarifs et paiement.',
    },
    eyebrow: 'Aide',
    title: 'Questions <span class="accent">fréquentes</span>',
    lede: 'Tout ce qu’il faut savoir avant — et après — avoir commencé.',
    topics: 'Thèmes de la FAQ',
    ctaTitle: 'Encore une question\u00a0? <span class="accent">Écrivez-nous sur WhatsApp.</span>',
    ctaLede: 'De vraies personnes, des réponses rapides — en anglais ou en arabe.',
  },
};
