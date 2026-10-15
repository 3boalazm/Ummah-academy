/** FaqPage — Deutsch. */
import faq from '@/content/faq/de.json';
import { faqGroups } from '@/data/faq';

export default {
  groups: faqGroups('de', faq),
  C: {
    meta: {
      title: 'FAQ zum Koranunterricht | Ummah Academy',
      desc: 'Antworten auf die häufigsten Fragen von Familien: Probestunde, Lehrkräfte, Lehrerinnen, Zeitzonen, Kinder ab 5 Jahren, Zertifikate, Preise und Zahlung.',
    },
    eyebrow: 'Hilfe',
    title: 'Häufig gestellte <span class="accent">Fragen</span>',
    lede: 'Alles, was Sie vor – und nach – dem Start wissen müssen.',
    topics: 'FAQ-Themen',
    ctaTitle: 'Noch eine Frage? <span class="accent">Schreiben Sie uns per WhatsApp.</span>',
    ctaLede: 'Echte Menschen, schnelle Antworten – auf Englisch oder Arabisch.',
  },
};
