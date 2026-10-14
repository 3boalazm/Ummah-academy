/** Percorsi e corsi — italiano (solo testi; id, prezzi e link in src/data/tracks.ts). */
import type { TracksText } from '@/data/tracks';

const tracks: TracksText = {
  quran: {
    title: 'Corano e Tajweed',
    subtitle: 'Recitazione · Tajweed · Hifz · Ijaza',
    intro: 'Recita il Corano così come è stato rivelato — con il Tajweed, la memorizzazione con il metodo Itqan e un percorso verso l’ijaza.',
    points: ['Una recitazione corretta, così come è stata trasmessa dal Profeta ﷺ', 'Il Tajweed in 3 livelli progressivi', 'La memorizzazione con il metodo Itqan', 'Un programma di ijaza con sanad documentato'],
    ctaLabel: 'Prenota una prova gratuita di Corano',
    courses: {
      recitation: { title: 'Recitazione del Corano', badge: 'Da principiante ad avanzato', tags: ['Tutte le età', 'Dal vivo e individuale'], desc: 'Una recitazione corretta, dalle prime lettere fino alla piena scioltezza.' },
      tajweed: { title: 'Regole del Tajweed', badge: 'Programma in 3 livelli', tags: ['Basi', 'Regole', 'Padronanza'], desc: 'Makharij, sifat, nun sakina e regole del madd attraverso la Jazariyya.' },
      hifz: { title: 'Hifz e ijaza', badge: 'Ijaza disponibile', tags: ['Metodo Itqan', 'Percorso ijaza'], desc: 'Memorizza con il raggruppamento tematico e ottieni un’ijaza formale con sanad.' },
    },
  },
  arabic: {
    title: 'Lingua araba',
    subtitle: 'Noor Al-Bayan · Grammatica · Conversazione',
    intro: 'Dal leggere correttamente il mushaf al capirlo — basi della lettura, grammatica classica e scioltezza nel parlato.',
    points: ['Basi con Noor Al-Bayan e la Nuraniyya', 'Grammatica classica con l’Ajrumiyya (nahw e sarf)', 'Arabo parlato per la vita quotidiana e le lezioni'],
    ctaLabel: 'Prenota una prova gratuita di arabo',
    courses: {
      'noor-al-bayan': { title: 'Noor Al-Bayan', badge: 'Principianti e bambini', tags: ['Dai 5 anni', 'Zero arabo'], desc: 'Il metodo più apprezzato per imparare a leggere l’arabo e il Corano partendo da zero.' },
      grammar: { title: 'Grammatica: nahw e sarf', badge: 'Ajrumiyya', tags: ['Intermedio', 'Classico'], desc: 'La grammatica araba classica attraverso il testo dell’Ajrumiyya.' },
      conversation: { title: 'Conversazione in arabo', badge: 'Arabo standard moderno', tags: ['Tutti i livelli', 'Scioltezza'], desc: 'Pratica del parlato per la vita quotidiana e le lezioni islamiche.' },
    },
  },
  kids: {
    title: 'Ummah Cubs',
    subtitle: 'Per bambini dai 5 ai 14 anni',
    intro: 'Corano, arabo e valori islamici con giochi e storie — lezioni da 30 minuti che i bambini aspettano davvero.',
    points: ['Lettura del Corano con Noor Al-Bayan', 'Studi islamici con storie e giochi', 'Lezioni da 30 minuti adatte alla loro concentrazione', 'Badge mensili per i traguardi raggiunti'],
    ctaLabel: 'Prenota una prova gratuita per mio figlio',
    courses: {
      'little-explorers': { title: 'Piccoli esploratori', badge: '5–7 anni', tags: ['Basi', 'Giochi e storie'], desc: 'Prime lettere arabe, storie islamiche e brevi sure — lezioni giocose da 30 minuti.' },
      'growing-learners': { title: 'Giovani lettori', badge: '8–10 anni', tags: ['Noor Al-Bayan', 'Brevi sure'], desc: 'Una vera scioltezza nella lettura, la memorizzazione di brevi sure e valori attraverso le storie.' },
      'junior-scholars': { title: 'Giovani studiosi', badge: '11–14 anni', tags: ['Percorso strutturato', 'Badge mensili'], desc: 'Memorizzazione strutturata e studi islamici più approfonditi, in preparazione ai percorsi per ragazzi e adulti.' },
    },
  },
  islamic: {
    title: 'Studi islamici',
    subtitle: 'Aqida · Fiqh · Tafsir · Sira',
    intro: 'Un vero programma per capire la tua religione — tenuto da studiosi che rispondono alle tue domande reali.',
    points: ['Aqida — i 6 pilastri della fede con le prove coraniche', 'Fiqh — le regole pratiche dell’adorazione', 'Tafsir — significati e lezioni per la vita', 'Sira — la vita e la guida del Profeta ﷺ'],
    ctaLabel: 'Prenota una prova gratuita di studi islamici',
    courses: {
      aqeedah: { title: 'Aqida', badge: 'I fondamenti della fede', tags: ['6 pilastri', 'Prove coraniche'], desc: 'Una fede salda attraverso i 6 pilastri dell’iman, fondata su prove autentiche.' },
      fiqh: { title: 'Fiqh', badge: 'L’adorazione quotidiana', tags: ['Regole pratiche', 'Errori comuni'], desc: 'Preghiera, purificazione e regole quotidiane — con sicurezza e con le prove.' },
      tafseer: { title: 'Tafsir', badge: 'Il Corano spiegato', tags: ['Versetto per versetto', 'Lezioni di vita'], desc: 'Andare oltre la traduzione, verso i significati profondi e le lezioni di ogni versetto.' },
      seerah: { title: 'Sira', badge: 'Biografia profetica', tags: ['Vita del Profeta ﷺ', 'Carattere'], desc: 'La vita del Profeta ﷺ — il suo carattere, le sue prove e la sua guida senza tempo.' },
    },
  },
};
export default tracks;
