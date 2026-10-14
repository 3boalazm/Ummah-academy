/** Piani — italiano (solo testi; prezzi e id in src/data/pricing.ts). */
import type { PricingText } from '@/data/pricing';

const pricing: PricingText = {
  plans: {
    launch: { name: 'Avvio', bestFor: 'Un inizio dolce per principianti e bambini piccoli.', label: '8 lezioni · 2 a settimana' },
    consistent: { name: 'Costanza', bestFor: 'L’equilibrio ideale per i bambini — qualsiasi materia, compresi gli studi islamici di Ummah Cubs.', label: '16 lezioni · 4 a settimana', badge: 'Il preferito dai bambini' },
    elite: { name: 'Élite', bestFor: 'Un’immersione quotidiana, cinque giorni a settimana.', label: '20 lezioni · 5 a settimana' },
    starter: { name: 'Base', bestFor: 'Una lezione settimanale mirata, al tuo ritmo.', label: '4–5 lezioni · 1 a settimana' },
    gold: { name: 'Oro', bestFor: 'L’equilibrio che la maggior parte degli adulti sceglie per Tajweed e arabo.', label: '8 lezioni · 2 a settimana', badge: 'Il più scelto' },
    diamond: { name: 'Diamante', bestFor: 'Progressi rapidi — ideale per hifz e ijaza.', label: '12 lezioni · 3 a settimana' },
  },
  included: [
    { title: '2 lezioni gratuite', desc: 'Lezioni complete con il tuo insegnante prima di pagare qualsiasi cosa.' },
    { title: 'Resoconti dopo ogni lezione', desc: 'Cosa è stato fatto, i compiti e i prossimi passi.' },
    { title: 'Certificati di livello', desc: 'Un certificato per ogni livello completato.' },
    { title: 'Spostamenti gratuiti', desc: 'Sposta una lezione con 24 ore di preavviso.' },
    { title: 'Pausa quando vuoi', desc: 'Sospendi l’abbonamento senza perdere le lezioni già pagate.' },
    { title: 'Promemoria su WhatsApp', desc: '15 minuti prima di ogni lezione.' },
    { title: 'Area famiglie', desc: 'Un solo account per tutti gli studenti della famiglia.' },
    { title: 'Registrazioni delle lezioni', desc: 'Disponibili su richiesta; l’archivio nell’area arriverà gradualmente.' },
  ],
  payment: ['Visa', 'Mastercard', 'PayPal', 'Bonifico bancario', 'Western Union', 'MoneyGram'],
};
export default pricing;
