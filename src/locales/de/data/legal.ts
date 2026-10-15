/**
 * Datenschutzerklärung & Nutzungsbedingungen — deutsche Übersetzung zur besseren Verständlichkeit.
 * Maßgeblich ist die englische Fassung (Hinweis auf der Seite). Rechtliche Prüfung: Linear ABO-44.
 * `{email}` und `{pricing}` werden beim Rendern ersetzt.
 */
import type { LegalContent } from '@/content-i18n/legal';

const EMAIL = '<a href="mailto:{email}">{email}</a>';

const privacy: LegalContent = {
  meta: { title: 'Datenschutzerklärung | Ummah Academy', desc: 'Wie die Ummah Academy Ihre Daten erhebt, nutzt und schützt – einschließlich des Datenschutzes für Kinder, Aufzeichnungen, Zahlungen und Ihrer Rechte.' },
  title: 'Datenschutz\u00aderklärung',
  lede: 'Wie wir Ihre Daten erheben, nutzen und schützen.',
  updated: 'Stand: Juli 2026',
  intro: 'Die Ummah Academy („wir“, „uns“, „unser“) bietet Live-Einzelunterricht online in Koran, arabischer Sprache und Islamischen Studien für Lernende in über 50 Ländern. Diese Datenschutzerklärung erläutert, welche Daten wir erheben, wie wir sie nutzen und welche Wahlmöglichkeiten und Rechte Sie haben.',
  sections: [
    {
      h: '1. Welche Daten wir erheben',
      html: `<p>Wir erheben Daten, die Sie uns direkt mitteilen, darunter:</p><ul>
<li><strong>Anmeldedaten:</strong> Ihr Name, Ihre WhatsApp-Nummer, Ihre E-Mail-Adresse, Ihr Land bzw. Ihre Zeitzone sowie der Kurs oder Bereich, für den Sie sich interessieren.</li>
<li><strong>Daten im Familienportal:</strong> Wenn Sie ein Kind anmelden (z. B. für das Programm Ummah Cubs), erheben wir Name, Alter und Lernfortschritt des Kindes; verwaltet werden diese Daten über das Konto des Elternteils oder der erziehungsberechtigten Person.</li>
<li><strong>Unterrichtsdaten:</strong> Live-Stunden werden aufgezeichnet und gespeichert, damit Lernende und Eltern den Unterricht nachverfolgen können; außerdem erstellen die Lehrkräfte nach jeder Stunde Fortschrittsberichte.</li>
<li><strong>Zahlungsdaten:</strong> Wenn Sie einen kostenpflichtigen Tarif abschließen, wird die Zahlung von unseren Zahlungsdienstleistern abgewickelt (dazu können Kartennetzwerke, PayPal, Banküberweisung, Western Union oder MoneyGram gehören). Ihre vollständigen Kartendaten speichern wir nicht auf unseren eigenen Servern.</li>
<li><strong>Kommunikation:</strong> Nachrichten, die Sie uns per WhatsApp, E-Mail oder über unsere Kontaktwege senden, einschließlich der Erinnerungen an Unterrichtsstunden und Hinweise zu Verlängerungen, die wir Ihnen schicken.</li></ul>`,
    },
    { h: '2. Wie wir Ihre Daten nutzen', html: '<p>Wir nutzen die erhobenen Daten, um Live-Stunden zu planen und durchzuführen; Ihnen eine passende Lehrkraft und Stufe zuzuordnen; Erinnerungen und Fortschrittsberichte per WhatsApp und E-Mail zu senden; Zahlungen abzuwickeln und Abonnements zu verwalten; gegebenenfalls Zertifikate und Ijaza-Nachweise auszustellen; und unsere Kurse und unsere Plattform zu verbessern.</p>' },
    { h: '3. Datenschutz für Kinder', html: '<p>Unser Programm Ummah Cubs richtet sich an Kinder ab 5 Jahren. Kinderkonten werden von einem Elternteil oder einer erziehungsberechtigten Person über das Familienportal angelegt und verwaltet. Eltern können jederzeit Aufzeichnungen und Fortschrittsberichte einsehen und die Abrechnung für ihre Kinder verwalten. Wir erheben wissentlich keine Daten direkt von einem Kind ohne Beteiligung eines Elternteils oder einer erziehungsberechtigten Person.</p>' },
    { h: '4. Weitergabe von Daten', html: '<p>Wir verkaufen Ihre personenbezogenen Daten nicht. Wir geben Daten nur weiter an: Zahlungsdienstleister, um Transaktionen abzuschließen; WhatsApp, um Nachrichten und Erinnerungen zuzustellen, denen Sie zugestimmt haben; und Lehrkräfte, soweit dies für Ihren Unterricht und Ihre Fortschrittsberichte nötig ist. Darüber hinaus können wir Daten offenlegen, wenn das Gesetz es verlangt.</p>' },
    { h: '5. Speicherdauer und Sicherheit', html: '<p>Wir bewahren Konto-, Unterrichts- und Zahlungsdaten auf, solange Ihr Konto aktiv ist, und danach für einen angemessenen Zeitraum zu Dokumentations- und rechtlichen Zwecken. Wir treffen angemessene technische und organisatorische Maßnahmen zum Schutz Ihrer Daten; kein Onlinedienst kann jedoch absolute Sicherheit garantieren.</p>' },
    { h: '6. Ihre Rechte', html: '<p>Je nach Wohnort haben Sie möglicherweise das Recht, Auskunft über Ihre personenbezogenen Daten zu verlangen, sie berichtigen, exportieren oder löschen zu lassen sowie bestimmten Verarbeitungen zu widersprechen oder sie einschränken zu lassen. Um eines dieser Rechte auszuüben, kontaktieren Sie uns über die unten genannten Angaben.</p>' },
    { h: '7. Cookies', html: '<p>Unsere Website verwendet Cookies und ähnliche Technologien, um Sie angemeldet zu halten, Ihre Einstellungen zu speichern und zu verstehen, wie unsere Website genutzt wird. Sie können Cookies über die Einstellungen Ihres Browsers steuern.</p>' },
    { h: '8. Internationale Datenübermittlungen', html: '<p>Da wir Lernende in über 50 Ländern unterrichten, können Ihre Daten in einem anderen Land als Ihrem Wohnsitzland verarbeitet werden. In diesem Fall treffen wir Maßnahmen, damit Ihre Daten weiterhin im Einklang mit dieser Erklärung geschützt sind.</p>' },
    { h: '9. Änderungen dieser Erklärung', html: '<p>Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Änderungen veröffentlichen wir auf dieser Seite mit einem aktualisierten Stand-Datum.</p>' },
    { h: '10. Kontakt', html: `<p>Wenn Sie Fragen zu dieser Datenschutzerklärung oder zum Umgang mit Ihren Daten haben, schreiben Sie uns an ${EMAIL} oder per WhatsApp.</p>` },
  ],
  note: 'Hinweis: Diese Erklärung ist eine allgemeine Vorlage auf Grundlage der auf unserer Website beschriebenen Leistungen. Sie ersetzt keine Rechtsberatung für Ihre konkrete Situation oder Ihr Land.',
};

const terms: LegalContent = {
  meta: { title: 'Nutzungsbedingungen | Ummah Academy', desc: 'Die Bedingungen für die Website und den Live-Onlineunterricht der Ummah Academy: Probestunden, Abonnements, Kündigung, Verlegung, Aufzeichnungen und Verhaltensregeln.' },
  title: 'Nutzungs\u00adbedingungen',
  lede: 'Die Bedingungen, die für Ihre Nutzung der Ummah Academy gelten.',
  updated: 'Stand: Juli 2026',
  intro: 'Diese Nutzungsbedingungen („Bedingungen“) regeln Ihre Nutzung der Website und der Live-Bildungsangebote der Ummah Academy. Mit der Anmeldung zu einer kostenlosen Probestunde oder einem kostenpflichtigen Tarif stimmen Sie diesen Bedingungen zu.',
  sections: [
    { h: '1. Unser Angebot', html: '<p>Die Ummah Academy bietet Live-Einzelunterricht online in Koranrezitation und Tajweed, arabischer Sprache, Islamischen Studien sowie das Programm Ummah Cubs für Kinder – erteilt von Al-Azhar-zertifizierten Lehrkräften.</p>' },
    { h: '2. Kostenlose Probestunden', html: '<p>Neue Lernende können sich für zwei kostenlose Live-Probestunden anmelden, ohne Zahlungskarte. Die Probestunden sind auf einmal pro Lernendem bzw. Familie begrenzt und sollen Ihnen ermöglichen, unseren Unterricht zu beurteilen, bevor Sie einen kostenpflichtigen Tarif abschließen.</p>' },
    { h: '3. Konten und Anmeldung', html: '<p>Sie müssen zutreffende Anmeldedaten angeben (mindestens Name und WhatsApp-Nummer). Für Kinder im Programm Ummah Cubs muss das Konto von einem Elternteil oder einer erziehungsberechtigten Person über das Familienportal angelegt und verwaltet werden; diese Person bleibt für das Konto und seine Nutzung verantwortlich.</p>' },
    { h: '4. Abonnements, Gebühren und Zahlung', html: '<p>Kostenpflichtige Tarife werden monatlich gemäß dem gewählten Tarif abgerechnet. Akzeptierte Zahlungsmethoden sind Visa, Mastercard, PayPal, Banküberweisung, Western Union und MoneyGram. Sie ermächtigen uns (oder unseren Zahlungsdienstleister), die für Ihren Tarif anfallenden Gebühren zu belasten. Es gelten die zum Zeitpunkt des Kaufs auf unserer <a href="{pricing}">Preisseite</a> angezeigten Preise; für künftige Abrechnungszeiträume können sie sich nach vorheriger Mitteilung ändern.</p>' },
    { h: '5. Kündigung', html: '<p>Sie können Ihr Abonnement jederzeit kündigen; die Kündigung wird zum Ende des laufenden Abrechnungszeitraums wirksam. Eine anteilige Erstattung für angebrochene Monate erfolgt nicht, sofern das anwendbare Recht nichts anderes vorschreibt.</p>' },
    { h: '6. Verlegung von Stunden', html: '<p>Stunden können mit mindestens 24 Stunden Vorlauf verlegt werden. Kurzfristiger abgesagte oder versäumte Stunden können nach unserem Ermessen verfallen, außer in echten Notfällen.</p>' },
    { h: '7. Aufzeichnungen und geistiges Eigentum', html: '<p>Live-Stunden werden für Ihre Unterlagen aufgezeichnet und in Ihrem Lernenden- oder Familienportal-Konto gespeichert. Die Aufzeichnungen sind ausschließlich für Ihre persönliche Bildungsnutzung bestimmt und dürfen ohne unsere schriftliche Genehmigung weder weitergegeben noch verkauft oder veröffentlicht werden. Unsere Kursmaterialien, Lehrpläne, Marken und Website-Inhalte bleiben geistiges Eigentum der Ummah Academy.</p>' },
    { h: '8. Verhaltensregeln', html: '<p>Wir bitten alle Lernenden, Eltern und Erziehungsberechtigten, Lehrkräfte und Mitarbeitende mit Respekt zu behandeln. Wir behalten uns vor, Konten zu sperren oder zu kündigen, bei denen beleidigendes Verhalten, Belästigung oder eine Nutzung unserer Dienste zu rechtswidrigen Zwecken vorliegt.</p>' },
    { h: '9. Qualifikation der Lehrkräfte und Lernergebnisse', html: '<p>Unsere Lehrkräfte sind Absolventinnen und Absolventen der Al-Azhar-Universität. Auch wenn wir uns zu hochwertigem Unterricht verpflichten, hängen individuelle Lernergebnisse von vielen Faktoren ab – etwa vom Einsatz, der Anwesenheit und dem Ausgangsniveau der Lernenden. Bestimmte Ergebnisse oder Zeiträume (z. B. für das Auswendiglernen oder den Abschluss einer Ijaza) können wir nicht garantieren.</p>' },
    { h: '10. Haftungsbeschränkung', html: '<p>Soweit gesetzlich zulässig, haftet die Ummah Academy nicht für indirekte, zufällige oder Folgeschäden, die aus Ihrer Nutzung unserer Dienste entstehen. Unsere Gesamthaftung für Ansprüche im Zusammenhang mit unseren Diensten ist auf den Betrag begrenzt, den Sie uns in den drei Monaten vor dem Anspruch gezahlt haben.</p>' },
    { h: '11. Beendigung', html: '<p>Wir können den Zugang zu unseren Diensten für Konten sperren oder beenden, die gegen diese Bedingungen verstoßen. Sie können die Nutzung unserer Dienste jederzeit einstellen und Ihr Abonnement wie oben beschrieben kündigen.</p>' },
    { h: '12. Anwendbares Recht', html: '<p>Diese Bedingungen unterliegen dem am Sitz der Ummah Academy geltenden Recht unter Ausschluss der Kollisionsnormen, sofern nicht das Verbraucherschutzrecht Ihres Landes für Lernende dort etwas anderes vorsieht.</p>' },
    { h: '13. Änderungen dieser Bedingungen', html: '<p>Wir können diese Bedingungen von Zeit zu Zeit aktualisieren. Wenn Sie unsere Dienste nach Inkrafttreten der Änderungen weiter nutzen, gilt dies als Zustimmung zu den aktualisierten Bedingungen.</p>' },
    { h: '14. Kontakt', html: `<p>Fragen zu diesen Bedingungen können Sie an ${EMAIL} oder per WhatsApp senden.</p>` },
  ],
  note: 'Hinweis: Dies ist eine allgemeine Vorlage auf Grundlage der auf unserer Website beschriebenen Leistungen. Sie ersetzt keine Rechtsberatung für Ihr Land.',
};

export default { privacy, terms };
