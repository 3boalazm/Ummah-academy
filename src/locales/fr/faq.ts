/** FaqPage — français. */
import faq from '@/content/faq/fr.json';
import { faqGroups } from '@/data/faq';

export default {
  groups: faqGroups('fr', faq),
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
