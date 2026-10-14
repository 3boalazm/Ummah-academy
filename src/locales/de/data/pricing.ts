/** Tarife — Deutsch (nur Texte; Preise und IDs stehen in src/data/pricing.ts). */
import type { PricingText } from '@/data/pricing';

const pricing: PricingText = {
  plans: {
    launch: { name: 'Einstieg', bestFor: 'Ein sanfter Start für Anfänger und kleine Kinder.', label: '8 Einheiten · 2 pro Woche' },
    consistent: { name: 'Beständig', bestFor: 'Der ideale Tarif für Kinder – für jedes Fach, auch die Islamischen Studien von Ummah Cubs.', label: '16 Einheiten · 4 pro Woche', badge: 'Beliebt bei Kindern' },
    elite: { name: 'Elite', bestFor: 'Tägliches Eintauchen, fünf Tage die Woche.', label: '20 Einheiten · 5 pro Woche' },
    starter: { name: 'Basis', bestFor: 'Eine konzentrierte Einheit pro Woche in Ihrem eigenen Tempo.', label: '4–5 Einheiten · 1 pro Woche' },
    gold: { name: 'Gold', bestFor: 'Die Balance, die die meisten Erwachsenen für Tajweed und Arabisch wählen.', label: '8 Einheiten · 2 pro Woche', badge: 'Am beliebtesten' },
    diamond: { name: 'Diamant', bestFor: 'Schneller Fortschritt – ideal für Hifz und Ijaza.', label: '12 Einheiten · 3 pro Woche' },
  },
  included: [
    { title: '2 kostenlose Stunden', desc: 'Vollständige Stunden mit Ihrer Lehrkraft, bevor Sie irgendetwas bezahlen.' },
    { title: 'Berichte nach jeder Einheit', desc: 'Was behandelt wurde, Hausaufgaben und nächste Schritte.' },
    { title: 'Zertifikate pro Stufe', desc: 'Ein Zertifikat für jede abgeschlossene Stufe.' },
    { title: 'Kostenlos verlegen', desc: 'Verlegen Sie eine Einheit mit 24 Stunden Vorlauf.' },
    { title: 'Jederzeit pausieren', desc: 'Frieren Sie Ihr Abo ein, ohne bezahlte Einheiten zu verlieren.' },
    { title: 'WhatsApp-Erinnerungen', desc: '15 Minuten vor jeder Einheit.' },
    { title: 'Familienportal', desc: 'Ein Konto für alle Lernenden der Familie.' },
    { title: 'Aufzeichnungen', desc: 'Auf Anfrage verfügbar; die Bibliothek im Portal folgt schrittweise.' },
  ],
  payment: ['Visa', 'Mastercard', 'PayPal', 'Banküberweisung', 'Western Union', 'MoneyGram'],
};
export default pricing;
