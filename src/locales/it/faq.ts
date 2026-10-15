/** FaqPage — italiano. */
import faq from '@/content/faq/it.json';
import { faqGroups } from '@/data/faq';

export default {
  groups: faqGroups('it', faq),
  C: {
    meta: {
      title: 'FAQ sulle lezioni di Corano | Ummah Academy',
      desc: 'Le risposte alle domande più frequenti delle famiglie: prova gratuita, insegnanti, insegnanti donne, fusi orari, bambini dai 5 anni, certificati, prezzi e pagamenti.',
    },
    eyebrow: 'Aiuto',
    title: 'Domande <span class="accent">frequenti</span>',
    lede: 'Tutto quello che devi sapere prima — e dopo — aver iniziato.',
    topics: 'Argomenti delle FAQ',
    ctaTitle: 'Hai ancora una domanda? <span class="accent">Scrivici su WhatsApp.</span>',
    ctaLede: 'Persone vere, risposte rapide — in inglese o in arabo.',
  },
};
