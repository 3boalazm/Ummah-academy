/** TeacherProfile — Deutsch. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher, first: string) => ({
    teachers: 'Lehrkräfte',
    book: `Kostenlose Stunde bei ${first} buchen`,
    ask: `Nach ${first}s freien Zeiten fragen`,
    waText: `Assalamu alaikum, ich möchte eine Probestunde bei ${t.name} buchen. Welche Zeiten sind frei?`,
    verified: t.ijazah ? 'Ijaza verifiziert' : 'Qualifikationen verifiziert',
    creds: 'Qualifikationen',
    bestFor: 'Ideal für',
    sanadTitle: 'Ihre Überlieferungskette',
    sanadText: `${first} besitzt eine Ijaza in Hafs ’an ’Asim – eine dokumentierte Kette von Lehrern, von denen jeder beim vorherigen gelernt hat, bis zurück zum Propheten ﷺ.`,
    sanadNote: 'Wir prüfen die Kette jeder Lehrkraft direkt – nie nur auf ihr Wort hin.',
    sanadMore: 'Was eine Ijaza wirklich bedeutet',
    sanadHref: '/de/blog/was-ist-eine-ijaza-koran-zertifizierung-und-sanad/',
    vetTitle: 'Wie sie ihren Platz bei uns verdient hat',
    vet: [
      { icon: 'files', title: 'Prüfung der Bewerbung', text: 'Qualifikationen und Al-Azhar-Zugehörigkeit wurden vor jedem Gespräch überprüft.' },
      {
        icon: 'scroll',
        title: t.ijazah ? 'Prüfung von Ijaza & Sanad' : 'Prüfung der Zeugnisse',
        text: t.ijazah ? 'Ihre Überlieferungskette wurde direkt geprüft.' : 'Ihre Zeugnisse wurden direkt bei den ausstellenden Stellen geprüft.',
      },
      { icon: 'chalkboard-teacher', title: 'Live-Lehrprobe', text: 'Vor ihrer Zulassung hat sie eine echte Stunde unterrichtet.' },
      { icon: 'chart-line-up', title: 'Laufende Bewertung', text: 'Die Unterrichtsqualität wird fortlaufend geprüft – nicht nur bei der Einstellung.' },
    ],
    teachesTitle: `Was ${first} unterrichtet`,
    storiesTitle: `Was Familien über ${first} sagen`,
    bookTitle: `So buchen Sie bei ${first}`,
    steps: [
      { icon: 'cursor-click', title: 'Wählen Sie sie im Buchungsformular', text: 'Ihr Name ist bereits eingetragen. Sagen Sie uns, für wen der Unterricht ist und in welcher Zeitzone Sie leben.' },
      { icon: 'whatsapp-logo', title: 'Wir bestätigen ihre Zeiten per WhatsApp', text: 'Ist ihr Kalender zu Ihrer Zeit voll, sagen wir es ehrlich und schlagen die nächstbeste Option vor.' },
      { icon: 'gift', title: 'Zwei kostenlose Stunden, dann entscheiden', text: 'Keine Kreditkarte, keine Verpflichtung. Machen Sie nur weiter, wenn es sich richtig anfühlt.' },
    ],
    faqTitle: 'Fragen zur Buchung',
    faq: [
      {
        q: `Kann ich gezielt ${first} wählen?`,
        a: 'Ja. Wählen Sie sie im Buchungsformular (wir haben es bereits ausgefüllt), und wir bestätigen ihre Verfügbarkeit für Ihre Zeitzone per WhatsApp vor der ersten Stunde.',
      },
      { q: 'Kann ich die Lehrkraft später wechseln?', a: 'Ja. Wenn es nicht passt, sagen Sie es uns per WhatsApp, und wir suchen eine bessere Lösung.' },
      { q: 'In welcher Sprache unterrichtet sie?', a: `${first} unterrichtet auf Arabisch und Englisch und wählt die Erklärsprache passend zu den Lernenden und ihrem Alter. Unterricht auf Deutsch bieten wir derzeit nicht an.` },
    ],
    othersTitle: 'Die weiteren Fachbereichsleiterinnen',
    ctaTitle: `Beginnen Sie diese Woche mit <span class="accent">${first}</span>.`,
    ctaLede: 'Ihre ersten 2 Stunden sind kostenlos. Termine bestätigen wir per WhatsApp innerhalb von Minuten.',
  }),
  meta: (t: Teacher) => ({
    title: `${t.name} – ${t.role} | Ummah Academy`,
    desc: `${t.name}, ${t.role} an der Ummah Academy: ${t.specialty}. Ihre Qualifikationen, für wen sie besonders geeignet ist und wie Sie 2 kostenlose Stunden bei ihr buchen.`,
  }),
};
