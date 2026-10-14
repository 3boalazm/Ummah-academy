/** Einstufungstest — Deutsch (nur Texte; Reihenfolge der Optionen und richtige Antworten wie im Englischen). */
import type { TestsText } from '@/data/placement';

const tests: TestsText = {
  quran: {
    label: 'Koran & Tajweed',
    questions: {
      q1: { skill: 'Lesefluss', prompt: 'Wie würden Sie Ihr Koranlesen heute beschreiben?', options: ['Ich kann die arabischen Buchstaben noch nicht lesen', 'Ich lese langsam, Buchstabe für Buchstabe', 'Ich lese flüssig, bin aber beim Tajweed unsicher', 'Ich lese flüssig und wende die Tajweed-Regeln an'] },
      q2: { skill: 'Makharij (Artikulation)', prompt: 'Welche Buchstaben werden aus dem tiefsten Teil der Kehle (aqsā al-ḥalq) gesprochen?', options: ['ء und هـ (Hamza & Hā’)', 'ع und ح (ʿAyn & Ḥā’)', 'غ und خ (Ghayn & Khā’)', 'ق und ك (Qāf & Kāf)'] },
      q3: { skill: 'Tajweed-Grundlagen', prompt: 'Was bedeutet das Wort „Tajweed“ wörtlich?', options: ['Auswendig lernen', 'Verbessern / vortrefflich machen', 'Übersetzen', 'Schnell rezitieren'] },
      q4: { skill: 'Regeln zu Nun Sakina', prompt: 'Welche Regel gilt, wenn auf ein Nun Sakina oder Tanwin der Buchstabe ب folgt?', options: ['Iẓhār', 'Idghām', 'Iqlāb', 'Ikhfā’'] },
      q5: { skill: 'Regeln zu Nun Sakina', prompt: 'Wie viele Kehllaute bewirken Iẓhār Ḥalqī?', options: ['2', '4', '6', '15'] },
      q6: { skill: 'Madd (Dehnung)', prompt: 'Wie lang ist die natürliche Dehnung (Madd Ṭabīʿī)?', options: ['1 Zählzeit', '2 Zählzeiten', '4 Zählzeiten', '6 Zählzeiten'] },
      q7: { skill: 'Qalqala', prompt: 'Welche Gruppe enthält die Buchstaben der Qalqala?', options: ['ق ط ب ج د', 'ن م و ي', 'ل ر ن م', 'س ش ص ض'] },
      q8: { skill: 'Auswendiglernen', prompt: 'Wie viel vom Koran haben Sie auswendig gelernt?', options: ['Noch nichts', 'Einige kurze Suren', 'Juz’ Amma oder mehr', 'Mehrere Ajza’ oder mehr'] },
    },
  },
  arabic: {
    label: 'Arabisch',
    questions: {
      a1: { skill: 'Schrift lesen', prompt: 'Können Sie die arabische Schrift lesen?', options: ['Noch nicht', 'Langsam, mit Vokalzeichen', 'Sicher, mit Vokalzeichen', 'Sicher, ohne Vokalzeichen'] },
      a2: { skill: 'Wortschatz', prompt: 'Welches Wort bedeutet „Buch“?', options: ['قَلَمٌ', 'كِتَابٌ', 'بَيْتٌ', 'بَابٌ'] },
      a3: { skill: 'Bedeutung', prompt: 'Was bedeutet «أَنَا طَالِبٌ»?', options: ['Er ist Lehrer', 'Du bist Schüler', 'Ich bin Schüler', 'Wir sind Schüler'] },
      a4: { skill: 'Partikeln', prompt: 'Welches davon ist eine Präposition (ḥarf jarr)?', options: ['هُوَ', 'كَتَبَ', 'جَمِيلٌ', 'فِي'] },
      a5: { skill: 'Nahw (Syntax)', prompt: 'Was ist «الطَّالِبُ» in «ذَهَبَ الطَّالِبُ»?', options: ['Fāʿil (der Handelnde)', 'Mafʿūl bihi (das Objekt)', 'Mubtada’ (Subjekt eines Nominalsatzes)', 'Ḥarf (Partikel)'] },
      a6: { skill: 'Iʿrāb (Kasusendungen)', prompt: 'Ein Nomen im Singular nach einer Präposition (majrūr) endet normalerweise auf …', options: ['Fatḥa', 'Kasra', 'Ḍamma', 'Sukūn'] },
      a7: { skill: 'Ṣarf (Morphologie)', prompt: 'Wie lautet der gesunde maskuline Plural von «مُسْلِمٌ» im Nominativ?', options: ['مُسْلِمُونَ', 'مُسْلِمَاتٌ', 'مُسْلِمَيْنِ', 'مَسَاجِدُ'] },
      a8: { skill: 'Ziel', prompt: 'Was ist Ihr Hauptziel beim Arabischlernen?', options: ['Den Koran korrekt lesen', 'Den Koran verstehen (Grammatik)', 'Sprechen und Vorträgen folgen', 'Alles davon'] },
    },
  },
  kids: {
    label: 'Ummah Cubs (Kinder)',
    questions: {
      k1: { skill: 'Alter', prompt: 'Wie alt ist Ihr Kind?', options: ['5–7 Jahre', '8–10 Jahre', '11–14 Jahre'] },
      k2: { skill: 'Buchstaben erkennen', prompt: 'Erkennt Ihr Kind die arabischen Buchstaben?', options: ['Noch nicht', 'Einige Buchstaben', 'Alle Buchstaben', 'Liest ganze Wörter'] },
      k3: { skill: 'Buchstaben', prompt: 'Fragen Sie Ihr Kind: Welcher Buchstabe ist «ب»?', options: ['Tā’', 'Bā’', 'Thā’', 'Nūn'] },
      k4: { skill: 'Buchstaben', prompt: 'Wie viele Buchstaben hat das arabische Alphabet?', options: ['24', '26', '28', '30'] },
      k5: { skill: 'Gebet', prompt: 'Welche Sura rezitieren wir in jeder Rakʿa des Gebets?', options: ['Al-Ikhlāṣ', 'Al-Fātiḥa', 'An-Nās', 'Al-Kawthar'] },
      k6: { skill: 'Islamische Grundlagen', prompt: 'Wie viele Säulen des Islam gibt es?', options: ['3', '5', '6', '7'] },
      k7: { skill: 'Tägliche Umgangsformen', prompt: 'Was sagen wir, bevor wir anfangen zu essen?', options: ['Bismillāh', 'Alḥamdulillāh', 'SubḥānAllāh', 'Allāhu Akbar'] },
      k8: { skill: 'Kurze Suren', prompt: 'Welche kurzen Suren kann Ihr Kind rezitieren?', options: ['Noch keine', 'Al-Fātiḥa', 'Einige kurze Suren', 'Viele kurze Suren'] },
    },
  },
  islamic: {
    label: 'Islamische Studien',
    questions: {
      i1: { skill: 'Vorkenntnisse', prompt: 'Wie würden Sie Ihre Vorkenntnisse in Islamischen Studien beschreiben?', options: ['Neu im strukturierten Lernen', 'Ich kenne die Grundlagen', 'Ich habe einige Fächer studiert', 'Ich habe schon bei einer Lehrkraft gelernt'] },
      i2: { skill: 'Aqida', prompt: 'Wie viele Säulen des Īmān (Glaubens) gibt es?', options: ['4', '5', '6', '7'] },
      i3: { skill: 'Aqida', prompt: 'Welches davon ist eine Säule des Īmān und keine der fünf Säulen des Islam?', options: ['Der Glaube an die Engel', 'Ṣalāh', 'Zakāh', 'Ḥajj'] },
      i4: { skill: 'Tafsir', prompt: 'Was bezeichnet „Tafsir“?', options: ['Regeln der Rezitation', 'Die Erklärung der Bedeutungen des Korans', 'Die Biografie des Propheten ﷺ', 'Das Erbrecht'] },
      i5: { skill: 'Sira', prompt: 'In welcher Stadt wurde der Prophet ﷺ geboren?', options: ['Medina', 'Ṭā’if', 'Mekka', 'Jerusalem'] },
      i6: { skill: 'Fiqh', prompt: 'Wie viele tägliche Pflichtgebete gibt es?', options: ['3', '4', '5', '6'] },
      i7: { skill: 'Fiqh', prompt: 'Was davon macht den Wuḍū’ ungültig?', options: ['Wasser trinken', 'Darmwinde', 'Den Koran lesen', 'Lächeln'] },
      i8: { skill: 'Interesse', prompt: 'Welches Fach interessiert Sie am meisten?', options: ['Aqida (Glaubenslehre)', 'Fiqh (Gottesdienst & Regeln)', 'Tafsir (Bedeutungen des Korans)', 'Sira (Prophetenbiografie)'] },
    },
  },
};
export default tests;
