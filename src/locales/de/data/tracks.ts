/** Bereiche & Kurse — Deutsch (nur Texte; IDs, Preise und Links stehen in src/data/tracks.ts). */
import type { TracksText } from '@/data/tracks';

const tracks: TracksText = {
  quran: {
    title: 'Koran & Tajweed',
    subtitle: 'Rezitation · Tajweed · Hifz · Ijaza',
    intro: 'Rezitieren Sie den Koran so, wie er offenbart wurde – mit Tajweed, Auswendiglernen nach der Itqan-Methode und einem Weg zur Ijaza.',
    points: ['Korrekte Rezitation, wie sie vom Propheten ﷺ überliefert wurde', 'Tajweed in 3 aufbauenden Stufen', 'Auswendiglernen mit der Itqan-Methode', 'Ijaza-Programm mit dokumentiertem Sanad'],
    ctaLabel: 'Kostenlose Koran-Probestunde buchen',
    courses: {
      recitation: { title: 'Koranrezitation', badge: 'Vom Anfänger bis zum Fortgeschrittenen', tags: ['Alle Altersstufen', 'Live & einzeln'], desc: 'Korrekte Rezitation – von den ersten Buchstaben bis zur vollen Flüssigkeit.' },
      tajweed: { title: 'Tajweed-Regeln', badge: 'Programm in 3 Stufen', tags: ['Grundlagen', 'Regeln', 'Meisterschaft'], desc: 'Makharij, Sifat, Nun Sakina und Madd-Regeln anhand der Jazariyya.' },
      hifz: { title: 'Hifz & Ijaza', badge: 'Ijaza möglich', tags: ['Itqan-Methode', 'Ijaza-Weg'], desc: 'Auswendig lernen mit thematischen Versgruppen – und eine förmliche Ijaza mit Sanad erwerben.' },
    },
  },
  arabic: {
    title: 'Arabisch',
    subtitle: 'Noor Al-Bayan · Grammatik · Konversation',
    intro: 'Vom korrekten Lesen des Mushaf bis zum Verstehen – Lesegrundlagen, klassische Grammatik und Sprechfertigkeit.',
    points: ['Grundlagen mit Noor Al-Bayan & Nuraniyya', 'Klassische Grammatik mit der Ajrumiyya (Nahw & Sarf)', 'Gesprochenes Arabisch für Alltag und Vorträge'],
    ctaLabel: 'Kostenlose Arabisch-Probestunde buchen',
    courses: {
      'noor-al-bayan': { title: 'Noor Al-Bayan', badge: 'Anfänger & Kinder', tags: ['Ab 5 Jahren', 'Ohne Vorkenntnisse'], desc: 'Die bewährteste Methode, um Arabisch und den Koran von Grund auf lesen zu lernen.' },
      grammar: { title: 'Grammatik: Nahw & Sarf', badge: 'Ajrumiyya', tags: ['Mittelstufe', 'Klassisch'], desc: 'Klassische arabische Grammatik anhand des Ajrumiyya-Textes.' },
      conversation: { title: 'Arabische Konversation', badge: 'Hocharabisch', tags: ['Alle Niveaus', 'Sprechfertigkeit'], desc: 'Praktisches Sprechen für den Alltag und islamische Vorträge.' },
    },
  },
  kids: {
    title: 'Ummah Cubs',
    subtitle: 'Für Kinder von 5 bis 14 Jahren',
    intro: 'Koran, Arabisch und islamische Werte mit Spielen und Geschichten – 30-Minuten-Einheiten, auf die sich Kinder wirklich freuen.',
    points: ['Koranlesen mit Noor Al-Bayan', 'Islamische Studien mit Geschichten und Spielen', '30-Minuten-Einheiten, passend zur Konzentrationsspanne', 'Monatliche Abzeichen für Erfolge'],
    ctaLabel: 'Kostenlose Probestunde für mein Kind buchen',
    courses: {
      'little-explorers': { title: 'Kleine Entdecker', badge: '5–7 Jahre', tags: ['Grundlagen', 'Spiele & Geschichten'], desc: 'Erste arabische Buchstaben, islamische Geschichten und kurze Suren – spielerische 30-Minuten-Einheiten.' },
      'growing-learners': { title: 'Junge Lernende', badge: '8–10 Jahre', tags: ['Noor Al-Bayan', 'Kurze Suren'], desc: 'Echte Lesesicherheit, Auswendiglernen kurzer Suren und Werte durch Geschichten.' },
      'junior-scholars': { title: 'Junge Gelehrte', badge: '11–14 Jahre', tags: ['Strukturierter Weg', 'Monatliche Abzeichen'], desc: 'Strukturiertes Auswendiglernen und vertiefte Islamische Studien – als Vorbereitung auf die Kurse für Jugendliche und Erwachsene.' },
    },
  },
  islamic: {
    title: 'Islamische Studien',
    subtitle: 'Aqida · Fiqh · Tafsir · Sira',
    intro: 'Ein echter Lehrplan, um Ihre Religion zu verstehen – unterrichtet von Gelehrten, die auf Ihre tatsächlichen Fragen eingehen.',
    points: ['Aqida – die 6 Glaubensgrundsätze mit Belegen aus dem Koran', 'Fiqh – praktische Regeln des Gottesdienstes', 'Tafsir – Bedeutungen und Lehren für das Leben', 'Sira – das Leben und die Rechtleitung des Propheten ﷺ'],
    ctaLabel: 'Kostenlose Probestunde Islamische Studien buchen',
    courses: {
      aqeedah: { title: 'Aqida', badge: 'Grundlagen des Glaubens', tags: ['6 Glaubensgrundsätze', 'Belege aus dem Koran'], desc: 'Ein unerschütterlicher Glaube durch die 6 Säulen des Iman, gestützt auf authentische Belege.' },
      fiqh: { title: 'Fiqh', badge: 'Gottesdienst im Alltag', tags: ['Praktische Regeln', 'Häufige Fehler'], desc: 'Gebet, rituelle Reinheit und Regeln des Alltags – sicher und mit Belegen.' },
      tafseer: { title: 'Tafsir', badge: 'Der Koran erklärt', tags: ['Vers für Vers', 'Lehren fürs Leben'], desc: 'Über die Übersetzung hinaus zu den tieferen Bedeutungen und Lehren jedes Verses.' },
      seerah: { title: 'Sira', badge: 'Prophetenbiografie', tags: ['Leben des Propheten ﷺ', 'Charakter'], desc: 'Das Leben des Propheten ﷺ – sein Charakter, seine Prüfungen und seine zeitlose Rechtleitung.' },
    },
  },
};
export default tracks;
