/** Home — Deutsch. */
import { prices } from '@/data/prices';

const P = prices('de');

export default {
  C: {
    meta: {
      title: 'Koran & Arabisch online lernen mit Al-Azhar-Lehrkräften | 2 Stunden gratis | Ummah Academy',
      desc: 'Koran, Tajweed, Arabisch und Islamische Studien live im Einzelunterricht – mit Al-Azhar-Lehrkräften mit verifizierter Ijaza. Für Kinder und Erwachsene, in jeder Zeitzone. Die ersten 2 Stunden sind kostenlos.',
    },
    eyebrow: 'Live im Einzelunterricht · Al-Azhar-Gelehrte',
    title: 'Der Koran, gelehrt <span class="accent">so, wie er überliefert wurde.</span>',
    lede: 'Live-Einzelunterricht in Koran, Tajweed, Arabisch und Islamischen Studien – mit Al-Azhar-Lehrkräften, die eine verifizierte Ijaza besitzen. Für Kinder und Erwachsene, in Ihrer Zeitzone.',
    test: '3-Minuten-Test',
    reassure: ['Keine Kreditkarte nötig', 'Lehrerinnen verfügbar', 'Jederzeit pausieren oder kündigen'],
    card1: ['Tajweed · Stufe 2', 'Lektion 12 von 18', 'Fortschritt'],
    card2: ['Nächste Live-Stunde', 'Regeln zu Nun Sakina', 'Ustadha Omneya · 19:00 Uhr GMT', 'Beginnt in 2 Std. 14 Min.'],
    verified: 'Ijaza verifiziert',
    stats: [
      ['50+', 'Länder'],
      ['1.000+', 'Lernende'],
      ['12+', 'verliehene Ijazas'],
      ['95 %', 'bleiben nach dem ersten Monat'],
    ],
    router: {
      title: 'Wer möchte lernen?',
      lede: 'Sagen Sie es uns – wir zeigen Ihnen mit einem Klick den passenden Weg.',
      childKicker: 'Für mein Kind',
      childTitle: 'Ummah Cubs · 5 bis 14 Jahre',
      childText: 'Spielerische 30-Minuten-Einheiten mit geduldigen, kindererfahrenen Lehrkräften – Lehrerinnen verfügbar, und Fortschritte, die Sie jeden Monat sehen.',
      childChips: ['30-Minuten-Einheiten', 'Spiele & Geschichten', 'Monatliche Abzeichen'],
      childCta: 'Ummah Cubs entdecken',
      selfKicker: 'Für mich',
      selfTitle: 'Was ist Ihr Ziel?',
      goals: [
        ['Den Koran von Grund auf lesen', '/online-arabic-classes/', 'read'],
        ['Mein Tajweed perfektionieren', '/quran-recitation-course/', 'tajweed'],
        ['Auswendig lernen & eine Ijaza erwerben', '/quran-memorization-hifz/', 'hifz'],
        ['Koranisches Arabisch verstehen', '/online-arabic-classes/', 'arabic'],
        ['Aqida, Fiqh, Tafsir oder Sira studieren', '/online-islamic-studies-classes/', 'islamic'],
      ],
      unsure: 'Unsicher? Machen Sie den 3-Minuten-Einstufungstest',
    },
    why: {
      eyebrow: 'Warum Ummah Academy',
      title: 'Wissen, das Sie <span class="accent">zurückverfolgen können.</span> Unterricht, der in Ihr Leben passt.',
      sanadKicker: 'Verifizierter Sanad',
      sanadTitle: 'Eine Kette von Lehrern bis zum Propheten ﷺ',
      sanadText: 'Jede Lehrkraft besitzt eine Ijaza – eine dokumentierte Überlieferungskette – und durchläuft eine vierstufige Prüfung: Qualifikationen, Sanad-Prüfung, Live-Lehrprobe und laufende Bewertung.',
      sanadLink: 'So prüfen wir unsere Lehrkräfte',
      itqan: ['Die Itqan-Methode', 'Verse nach Thema und Bedeutung gruppiert, live korrigiert – Auswendiglernen, das bleibt, statt Rezitation fürs Schaufenster.', 'So funktioniert es'],
      safe: ['Sicher für jede Familie', 'Privater Einzelunterricht, Lehrerinnen für Frauen und Mädchen und ein Bericht nach jeder Einheit.'],
      time: ['Nach Ihrer Uhr geplant', 'Morgens in Berlin oder abends in Toronto – buchen Sie jederzeit, mit WhatsApp-Erinnerung 15 Minuten vorher.'],
      price: [`Ab ${P.from} im Monat`, 'Transparente Tarife. Zuerst zwei kostenlose Stunden.', 'Preise ansehen'],
    },
    how: {
      eyebrow: 'So funktioniert es',
      title: 'Was <span class="accent">nach der Buchung</span> passiert',
      lede: 'Kein Anmelde-Labyrinth – eine echte Lehrkraft und zwei echte Stunden, dann entscheiden Sie.',
      steps: [
        ['Erzählen Sie uns von sich', 'Drei kurze Fragen: wer lernt, was und wann. Etwa eine Minute.'],
        ['Wir finden Ihre Lehrkraft', 'Lehrkraft und Termine bestätigen wir per WhatsApp – meist innerhalb von Minuten, spätestens nach 2 Stunden.'],
        ['Zwei kostenlose Live-Stunden', 'Ihre Lehrkraft ermittelt Ihr Niveau und erstellt einen Plan rund um Ihr Ziel.'],
        ['Lernen und Fortschritt sehen', 'Ein Bericht nach jeder Einheit und ein Zertifikat für jede Stufe.'],
      ],
    },
    tracks: { eyebrow: 'Kurse', title: 'Vier Wege hinein. <span class="accent">Beginnen Sie dort, wo Sie stehen.</span>', lede: 'Vom ersten arabischen Buchstaben bis zur vollständigen Ijaza.' },
    stories: { eyebrow: 'Erfahrungen', title: 'Familien in über 50 Ländern, <span class="accent">ein Klassenzimmer nach dem anderen.</span>', note: 'Erfahrungsberichte, aus dem Englischen übersetzt.', all: 'Alle Erfahrungen lesen' },
    pricing: {
      eyebrow: 'Preise',
      title: 'Einfache Preise. <span class="accent">Zuerst zwei kostenlose Stunden.</span>',
      text: 'Wählen Sie 30-Minuten-Einheiten für Kinder und gezieltes Üben – oder 60 Minuten für Erwachsene, Tajweed und Hifz.',
      tabs: ['30 Minuten', '60 Minuten'],
      perSession: 'pro Einheit',
      all: 'Alle Tarife & Details',
    },
    faq: {
      eyebrow: 'Fragen',
      title: 'Bevor Sie <span class="accent">buchen</span>',
      more: 'Alle Fragen',
      items: [
        {
          q: 'Sind die zwei Probestunden wirklich kostenlos?',
          a: 'Ja. Zwei vollständige Live-Stunden mit Ihrer Lehrkraft – ohne Kreditkarte, ohne Verpflichtung. Wenn Sie weitermachen, wählen Sie einen Monatstarif; wenn nicht, ist damit alles erledigt.',
        },
        {
          q: 'Was kostet es, und kann ich kündigen?',
          a: `Die Tarife liegen je nach Dauer und Häufigkeit der Einheiten zwischen ${P.from} und ${P.to} im Monat. Sie können jederzeit kündigen (wirksam zum Ende des Abrechnungsmonats), Ihr Abo pausieren und Einheiten mit 24 Stunden Vorlauf verlegen.`,
        },
        { q: 'Kann ich eine Lehrerin wählen?', a: 'Ja. Für Frauen und Mädchen stehen Lehrerinnen zur Verfügung – wählen Sie bei der Buchung einfach „Lehrerin“.' },
        { q: 'Ist mein Kind zu jung?', a: 'Ummah Cubs nimmt Kinder ab 5 Jahren auf – mit kurzen, spielbasierten 30-Minuten-Einheiten, die auf die Aufmerksamkeitsspanne kleiner Kinder zugeschnitten sind.' },
        {
          q: 'Ich spreche kein Arabisch. Werde ich etwas verstehen?',
          a: 'Ja. Jede Lehrkraft unterrichtet zweisprachig auf Arabisch und Englisch; auf Deutsch findet der Unterricht derzeit nicht statt. Viele unserer Lernenden beginnen bei null.',
        },
        {
          q: 'Ist der Unterricht live? Wird er aufgezeichnet?',
          a: 'Jede Stunde findet live und im Einzelunterricht über Zoom oder Google Meet statt. Die Lehrkraft schickt nach jeder Einheit einen Bericht; Aufzeichnungen gibt es auf Anfrage, bis die Bibliothek im Familienportal verfügbar ist.',
        },
      ],
    },
    cta: {
      eyebrow: 'Heute beginnen',
      title: 'Beginnen Sie mit <span class="accent">zwei kostenlosen Stunden.</span>',
      lede: 'Lernen Sie Ihre Lehrkraft kennen, erleben Sie den Unterschied von Live-Einzelunterricht – und entscheiden Sie dann. Keine Kreditkarte, keine Verpflichtung.',
    },
  },
};
