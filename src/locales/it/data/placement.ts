/** Test di livello — italiano (solo testi; ordine delle opzioni e risposte corrette come in inglese). */
import type { TestsText } from '@/data/placement';

const tests: TestsText = {
  quran: {
    label: 'Corano e Tajweed',
    questions: {
      q1: { skill: 'Scioltezza nella lettura', prompt: 'Come descriveresti oggi la tua lettura del Corano?', options: ['Non so ancora leggere le lettere arabe', 'Leggo lentamente, lettera per lettera', 'Leggo con scioltezza, ma non sono sicuro del Tajweed', 'Leggo con scioltezza e applico le regole del Tajweed'] },
      q2: { skill: 'Makharij (articolazione)', prompt: 'Quali lettere si pronunciano dalla parte più profonda della gola (aqsā al-ḥalq)?', options: ['ء e هـ (hamza e hā’)', 'ع e ح (ʿayn e ḥā’)', 'غ e خ (ghayn e khā’)', 'ق e ك (qāf e kāf)'] },
      q3: { skill: 'Basi del Tajweed', prompt: 'Cosa significa letteralmente la parola «Tajweed»?', options: ['Memorizzare', 'Migliorare / rendere eccellente', 'Tradurre', 'Recitare velocemente'] },
      q4: { skill: 'Regole del nun sakina', prompt: 'Quando un nun sakina o un tanwin è seguito dalla lettera ب, quale regola si applica?', options: ['Iẓhār', 'Idghām', 'Iqlāb', 'Ikhfā’'] },
      q5: { skill: 'Regole del nun sakina', prompt: 'Quante lettere gutturali provocano l’iẓhār ḥalqī?', options: ['2', '4', '6', '15'] },
      q6: { skill: 'Madd (allungamento)', prompt: 'Quanto dura l’allungamento naturale (madd ṭabīʿī)?', options: ['1 tempo', '2 tempi', '4 tempi', '6 tempi'] },
      q7: { skill: 'Qalqala', prompt: 'Quale gruppo contiene le lettere della qalqala?', options: ['ق ط ب ج د', 'ن م و ي', 'ل ر ن م', 'س ش ص ض'] },
      q8: { skill: 'Memorizzazione', prompt: 'Quanta parte del Corano hai memorizzato?', options: ['Ancora niente', 'Alcune brevi sure', 'Juz’ Amma o più', 'Diversi ajza’ o più'] },
    },
  },
  arabic: {
    label: 'Lingua araba',
    questions: {
      a1: { skill: 'Lettura della scrittura', prompt: 'Sai leggere la scrittura araba?', options: ['Non ancora', 'Lentamente, con le vocali', 'Con facilità, con le vocali', 'Con facilità, senza vocali'] },
      a2: { skill: 'Lessico', prompt: 'Quale parola significa «libro»?', options: ['قَلَمٌ', 'كِتَابٌ', 'بَيْتٌ', 'بَابٌ'] },
      a3: { skill: 'Significato', prompt: 'Cosa significa «أَنَا طَالِبٌ»?', options: ['Lui è un insegnante', 'Tu sei uno studente', 'Io sono uno studente', 'Noi siamo studenti'] },
      a4: { skill: 'Particelle', prompt: 'Quale di queste è una preposizione (ḥarf jarr)?', options: ['هُوَ', 'كَتَبَ', 'جَمِيلٌ', 'فِي'] },
      a5: { skill: 'Nahw (sintassi)', prompt: 'In «ذَهَبَ الطَّالِبُ», che cos’è «الطَّالِبُ»?', options: ['Fāʿil (chi compie l’azione)', 'Mafʿūl bihi (il complemento oggetto)', 'Mubtada’ (soggetto di una frase nominale)', 'Ḥarf (particella)'] },
      a6: { skill: 'Iʿrāb (desinenze dei casi)', prompt: 'Un nome singolare dopo una preposizione (majrūr) di solito termina con…', options: ['Fatḥa', 'Kasra', 'Ḍamma', 'Sukūn'] },
      a7: { skill: 'Ṣarf (morfologia)', prompt: 'Qual è il plurale maschile regolare di «مُسْلِمٌ» al nominativo?', options: ['مُسْلِمُونَ', 'مُسْلِمَاتٌ', 'مُسْلِمَيْنِ', 'مَسَاجِدُ'] },
      a8: { skill: 'Obiettivo', prompt: 'Qual è il tuo obiettivo principale con l’arabo?', options: ['Leggere correttamente il Corano', 'Capire il Corano (grammatica)', 'Parlare e seguire le lezioni', 'Tutte queste cose'] },
    },
  },
  kids: {
    label: 'Ummah Cubs (bambini)',
    questions: {
      k1: { skill: 'Età', prompt: 'Quanti anni ha tuo figlio?', options: ['5–7 anni', '8–10 anni', '11–14 anni'] },
      k2: { skill: 'Riconoscere le lettere', prompt: 'Tuo figlio riconosce le lettere arabe?', options: ['Non ancora', 'Alcune lettere', 'Tutte le lettere', 'Legge parole intere'] },
      k3: { skill: 'Lettere', prompt: 'Chiedi a tuo figlio: quale lettera è «ب»?', options: ['Tā’', 'Bā’', 'Thā’', 'Nūn'] },
      k4: { skill: 'Lettere', prompt: 'Quante lettere ha l’alfabeto arabo?', options: ['24', '26', '28', '30'] },
      k5: { skill: 'Preghiera', prompt: 'Quale sura recitiamo in ogni rakʿa della preghiera?', options: ['Al-Ikhlāṣ', 'Al-Fātiḥa', 'An-Nās', 'Al-Kawthar'] },
      k6: { skill: 'Basi dell’islam', prompt: 'Quanti sono i pilastri dell’islam?', options: ['3', '5', '6', '7'] },
      k7: { skill: 'Buone maniere quotidiane', prompt: 'Cosa diciamo prima di iniziare a mangiare?', options: ['Bismillāh', 'Alḥamdulillāh', 'SubḥānAllāh', 'Allāhu Akbar'] },
      k8: { skill: 'Brevi sure', prompt: 'Quali brevi sure sa recitare tuo figlio?', options: ['Ancora nessuna', 'Al-Fātiḥa', 'Alcune brevi sure', 'Molte brevi sure'] },
    },
  },
  islamic: {
    label: 'Studi islamici',
    questions: {
      i1: { skill: 'Preparazione', prompt: 'Come descriveresti la tua preparazione negli studi islamici?', options: ['Sono nuovo allo studio strutturato', 'Conosco le basi', 'Ho studiato alcune materie', 'Ho già studiato con un insegnante'] },
      i2: { skill: 'Aqida', prompt: 'Quanti sono i pilastri dell’īmān (la fede)?', options: ['4', '5', '6', '7'] },
      i3: { skill: 'Aqida', prompt: 'Quale di questi è un pilastro dell’īmān e non uno dei cinque pilastri dell’islam?', options: ['La fede negli angeli', 'La ṣalāh', 'La zakāh', 'Lo ḥajj'] },
      i4: { skill: 'Tafsir', prompt: 'A cosa si riferisce la parola «tafsir»?', options: ['Alle regole della recitazione', 'Alla spiegazione dei significati del Corano', 'Alla biografia del Profeta ﷺ', 'Al diritto ereditario'] },
      i5: { skill: 'Sira', prompt: 'In quale città è nato il Profeta ﷺ?', options: ['Medina', 'Ṭā’if', 'La Mecca', 'Gerusalemme'] },
      i6: { skill: 'Fiqh', prompt: 'Quante sono le preghiere quotidiane obbligatorie?', options: ['3', '4', '5', '6'] },
      i7: { skill: 'Fiqh', prompt: 'Quale di questi annulla il wuḍū’?', options: ['Bere acqua', 'Emettere aria intestinale', 'Leggere il Corano', 'Sorridere'] },
      i8: { skill: 'Interesse', prompt: 'Quale materia ti interessa di più?', options: ['Aqida (credo)', 'Fiqh (adorazione e regole)', 'Tafsir (significati del Corano)', 'Sira (biografia del Profeta)'] },
    },
  },
};
export default tests;
