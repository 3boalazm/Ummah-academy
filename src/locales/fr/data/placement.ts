/** Test de niveau — français (textes seulement ; ordre des options et bonnes réponses identiques à l’anglais). */
import type { TestsText } from '@/data/placement';

const tests: TestsText = {
  quran: {
    label: 'Coran & tajwid',
    questions: {
      q1: { skill: 'Aisance en lecture', prompt: 'Comment décririez-vous votre lecture du Coran aujourd’hui\u00a0?', options: ['Je ne sais pas encore lire les lettres arabes', 'Je lis lentement, lettre par lettre', 'Je lis couramment, mais je doute de mon tajwid', 'Je lis couramment et j’applique les règles du tajwid'] },
      q2: { skill: 'Makharij (articulation)', prompt: 'Quelles lettres se prononcent depuis le fond de la gorge (aqsā al-ḥalq)\u00a0?', options: ['ء et هـ (hamza & hā’)', 'ع et ح (ʿayn & ḥā’)', 'غ et خ (ghayn & khā’)', 'ق et ك (qāf & kāf)'] },
      q3: { skill: 'Bases du tajwid', prompt: 'Que signifie littéralement le mot «\u00a0tajwid\u00a0»\u00a0?', options: ['Mémoriser', 'Améliorer / rendre excellent', 'Traduire', 'Réciter vite'] },
      q4: { skill: 'Règles du noun sakina', prompt: 'Quand un noun sakina ou un tanwin est suivi de la lettre ب, quelle règle s’applique\u00a0?', options: ['Iẓhār', 'Idghām', 'Iqlāb', 'Ikhfā’'] },
      q5: { skill: 'Règles du noun sakina', prompt: 'Combien de lettres gutturales entraînent l’iẓhār ḥalqī\u00a0?', options: ['2', '4', '6', '15'] },
      q6: { skill: 'Madd (allongement)', prompt: 'Quelle est la durée de l’allongement naturel (madd ṭabīʿī)\u00a0?', options: ['1 temps', '2 temps', '4 temps', '6 temps'] },
      q7: { skill: 'Qalqala', prompt: 'Quel groupe contient les lettres de la qalqala\u00a0?', options: ['ق ط ب ج د', 'ن م و ي', 'ل ر ن م', 'س ش ص ض'] },
      q8: { skill: 'Mémorisation', prompt: 'Quelle part du Coran avez-vous mémorisée\u00a0?', options: ['Rien pour l’instant', 'Quelques courtes sourates', 'Juz’ Amma ou plus', 'Plusieurs ajza’ ou plus'] },
    },
  },
  arabic: {
    label: 'Langue arabe',
    questions: {
      a1: { skill: 'Lecture de l’écriture', prompt: 'Savez-vous lire l’écriture arabe\u00a0?', options: ['Pas encore', 'Lentement, avec les voyelles', 'Facilement, avec les voyelles', 'Facilement, sans les voyelles'] },
      a2: { skill: 'Vocabulaire', prompt: 'Quel mot signifie «\u00a0livre\u00a0»\u00a0?', options: ['قَلَمٌ', 'كِتَابٌ', 'بَيْتٌ', 'بَابٌ'] },
      a3: { skill: 'Sens', prompt: 'Que signifie «\u00a0أَنَا طَالِبٌ\u00a0»\u00a0?', options: ['Il est enseignant', 'Tu es étudiant', 'Je suis étudiant', 'Nous sommes étudiants'] },
      a4: { skill: 'Particules', prompt: 'Lequel de ces mots est une préposition (ḥarf jarr)\u00a0?', options: ['هُوَ', 'كَتَبَ', 'جَمِيلٌ', 'فِي'] },
      a5: { skill: 'Nahw (syntaxe)', prompt: 'Dans «\u00a0ذَهَبَ الطَّالِبُ\u00a0», qu’est-ce que «\u00a0الطَّالِبُ\u00a0»\u00a0?', options: ['Fāʿil (l’agent)', 'Mafʿūl bihi (le complément d’objet)', 'Mubtada’ (sujet d’une phrase nominale)', 'Ḥarf (particule)'] },
      a6: { skill: 'Iʿrāb (désinences)', prompt: 'Un nom au singulier après une préposition (majrūr) se termine généralement par…', options: ['Fatḥa', 'Kasra', 'Ḍamma', 'Sukūn'] },
      a7: { skill: 'Ṣarf (morphologie)', prompt: 'Quel est le pluriel masculin régulier de «\u00a0مُسْلِمٌ\u00a0» au nominatif\u00a0?', options: ['مُسْلِمُونَ', 'مُسْلِمَاتٌ', 'مُسْلِمَيْنِ', 'مَسَاجِدُ'] },
      a8: { skill: 'Objectif', prompt: 'Quel est votre objectif principal en arabe\u00a0?', options: ['Lire correctement le Coran', 'Comprendre le Coran (grammaire)', 'Parler et suivre des cours', 'Tout cela à la fois'] },
    },
  },
  kids: {
    label: 'Ummah Cubs (enfants)',
    questions: {
      k1: { skill: 'Âge', prompt: 'Quel âge a votre enfant\u00a0?', options: ['5–7\u00a0ans', '8–10\u00a0ans', '11–14\u00a0ans'] },
      k2: { skill: 'Reconnaissance des lettres', prompt: 'Votre enfant reconnaît-il les lettres arabes\u00a0?', options: ['Pas encore', 'Quelques lettres', 'Toutes les lettres', 'Il lit des mots entiers'] },
      k3: { skill: 'Lettres', prompt: 'Demandez à votre enfant\u00a0: quelle lettre est «\u00a0ب\u00a0»\u00a0?', options: ['Tā’', 'Bā’', 'Thā’', 'Nūn'] },
      k4: { skill: 'Lettres', prompt: 'Combien de lettres compte l’alphabet arabe\u00a0?', options: ['24', '26', '28', '30'] },
      k5: { skill: 'Prière', prompt: 'Quelle sourate récitons-nous à chaque rakʿa de la prière\u00a0?', options: ['Al-Ikhlāṣ', 'Al-Fātiḥa', 'An-Nās', 'Al-Kawthar'] },
      k6: { skill: 'Bases de l’islam', prompt: 'Combien y a-t-il de piliers de l’islam\u00a0?', options: ['3', '5', '6', '7'] },
      k7: { skill: 'Bonnes manières', prompt: 'Que dit-on avant de commencer à manger\u00a0?', options: ['Bismillāh', 'Alḥamdulillāh', 'SubḥānAllāh', 'Allāhu Akbar'] },
      k8: { skill: 'Courtes sourates', prompt: 'Quelles courtes sourates votre enfant sait-il réciter\u00a0?', options: ['Aucune pour l’instant', 'Al-Fātiḥa', 'Quelques courtes sourates', 'Beaucoup de courtes sourates'] },
    },
  },
  islamic: {
    label: 'Sciences islamiques',
    questions: {
      i1: { skill: 'Parcours', prompt: 'Comment décririez-vous votre parcours en sciences islamiques\u00a0?', options: ['Je découvre l’étude structurée', 'Je connais les bases', 'J’ai étudié quelques matières', 'J’ai déjà étudié avec un professeur'] },
      i2: { skill: '‘Aqida', prompt: 'Combien y a-t-il de piliers de l’īmān (la foi)\u00a0?', options: ['4', '5', '6', '7'] },
      i3: { skill: '‘Aqida', prompt: 'Lequel est un pilier de l’īmān, et non l’un des cinq piliers de l’islam\u00a0?', options: ['La croyance aux anges', 'La ṣalāh', 'La zakāh', 'Le ḥajj'] },
      i4: { skill: 'Tafsir', prompt: 'À quoi le mot «\u00a0tafsir\u00a0» fait-il référence\u00a0?', options: ['Aux règles de récitation', 'À l’explication du sens du Coran', 'À la biographie du Prophète ﷺ', 'Au droit successoral'] },
      i5: { skill: 'Sira', prompt: 'Dans quelle ville le Prophète ﷺ est-il né\u00a0?', options: ['Médine', 'Ṭā’if', 'La Mecque', 'Jérusalem'] },
      i6: { skill: 'Fiqh', prompt: 'Combien y a-t-il de prières quotidiennes obligatoires\u00a0?', options: ['3', '4', '5', '6'] },
      i7: { skill: 'Fiqh', prompt: 'Lequel de ces actes annule le wuḍū’\u00a0?', options: ['Boire de l’eau', 'Avoir des gaz', 'Lire le Coran', 'Sourire'] },
      i8: { skill: 'Intérêt', prompt: 'Quelle matière vous intéresse le plus\u00a0?', options: ['‘Aqida (credo)', 'Fiqh (adoration & règles)', 'Tafsir (sens du Coran)', 'Sira (biographie du Prophète)'] },
    },
  },
};
export default tests;
