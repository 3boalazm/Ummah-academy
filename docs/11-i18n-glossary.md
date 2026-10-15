# 11 · Terminology & style glossary (DE · FR · IT)

This is the single reference for translators and native reviewers. Where it disagrees with a translation in `src/locales/*`, the glossary wins and the string should be fixed.

## 1. Voice & register

|  | German (DE) | French (FR) | Italian (IT) |
|---|---|---|---|
| Address the reader | **Sie** (formal) | **vous** | **tu** (modern web norm) |
| Tone | Calm, warm, precise. No hype. | Chaleureux, posé, précis | Caldo, sereno, preciso |
| Quotes | „…“ | « … » (with NBSP inside) | «…» |
| Space before ? ! : ; | none | **NBSP** (U+00A0) | none |
| Numbers | 1.000+ · 95 % · 19:00 Uhr | 1 000+ · 95 % · 19 h 00 / 19:00 | 1.000+ · 95% · 19:00 |
| Prices (USD) | 40 $ · ab 40 $ pro Monat | 40 $ · à partir de 40 $ par mois | 40 $ · da 40 $ al mese |
| Dates | 15. Oktober 2026 (Intl `de-DE`) | 15 octobre 2026 (`fr-FR`) | 15 ottobre 2026 (`it-IT`) |

## 2. Brand & product names (never translated)

These stay as written:
- Ummah Academy
- **Ummah Cubs** (kids' programme; a localised descriptor may follow)
- Noor Al-Bayan
- Al-Ajrumiyyah
- WhatsApp, Zoom, Google Meet
- Teacher names, with their honorific **Ustadha / Ustadh**
- ﷺ
- The Arabic of Qur'an quotes

## 3. Islamic & course terms

| EN (site) | DE | FR | IT |
|---|---|---|---|
| Qur'an | Koran | Coran | Corano |
| Tajweed | Tajweed | tajwid | Tajweed |
| Hifz (memorisation) | Hifz (Auswendiglernen des Korans) | hifz (mémorisation du Coran) | hifz (memorizzazione del Corano) |
| Ijazah | Ijaza (pl. Ijazas) | ijaza (pl. ijazas) | ijaza (invariable) |
| Sanad / chain of transmission | Sanad / Überlieferungskette | sanad / chaîne de transmission | sanad / catena di trasmissione |
| Qira'at | Qira’at (Lesarten) | qira’at (lectures) | qira’at (letture) |
| Hafs 'an 'Asim | Hafs ’an ’Asim | Hafs ’an ’Asim | Hafs ’an ’Asim |
| Aqeedah · Fiqh · Tafseer · Seerah | Aqida · Fiqh · Tafsir · Sira | ‘aqida · fiqh · tafsir · sira | aqida · fiqh · tafsir · sira |
| Islamic studies | Islamische Studien | sciences islamiques | studi islamici |
| Nahw & Sarf | Nahw & Sarf (Grammatik & Morphologie) | nahw & sarf (grammaire & morphologie) | nahw & sarf (grammatica & morfologia) |
| Juz 'Amma | Juz’ Amma | Juz’ Amma | Juz’ Amma |
| Mushaf | Mushaf | mushaf | mushaf |
| Itqan method | Itqan-Methode | méthode Itqan | metodo Itqan |
| Al-Azhar | Al-Azhar (Al-Azhar-Universität) | al-Azhar (l’université al-Azhar) | al-Azhar (l’Università al-Azhar) |

Transliteration note: Geist has no ʿ / ʾ glyphs. Use the typographic apostrophe ’.

## 4. Product & UI terms

| EN | DE | FR | IT |
|---|---|---|---|
| Free trial · 2 free sessions | kostenlose Probestunde · 2 kostenlose Probestunden | séance d’essai gratuite · 2 séances d’essai gratuites | lezione di prova gratuita · 2 lezioni di prova gratuite |
| Session (as a duration unit) | Einheit (30-Minuten-Einheit) | séance (séance de 30 min) | lezione (lezione da 30 min) |
| Live 1-on-1 | live im Einzelunterricht | en direct, en tête-à-tête | dal vivo, individuale |
| Teacher(s) · female teacher | Lehrkraft / Lehrkräfte · Lehrerin | enseignant(e)s · enseignante | insegnante / insegnanti · insegnante donna |
| Placement test | Einstufungstest | test de niveau | test di livello |
| Family Portal | Familienportal | Espace famille | Area famiglie |
| Plan · per month | Tarif · pro Monat | formule · par mois | piano · al mese |
| Book (CTA) | buchen | réserver | prenota |
| Sign in | Anmelden | Se connecter | Accedi |
| Pricing · About · FAQ · Contact | Preise · Über uns · FAQ · Kontakt | Tarifs · À propos · FAQ · Contact | Prezzi · Chi siamo · FAQ · Contatti |
| Blog · Free library | Blog · Kostenlose Bibliothek | Blog · Bibliothèque gratuite | Blog · Biblioteca gratuita |
| Privacy Policy · Terms of Service | Datenschutzerklärung · Nutzungsbedingungen | Politique de confidentialité · Conditions d’utilisation | Informativa sulla privacy · Termini di servizio |
| Cancel anytime | jederzeit kündbar | résiliable à tout moment | disdici quando vuoi |
| No card needed | Keine Kreditkarte nötig | Sans carte bancaire | Nessuna carta richiesta |

## 5. Honesty rules (all languages)

1. **Teaching language.** Lessons are taught in **Arabic and English** (`SITE.teachingLanguages`). Never imply German, French or Italian lessons.
2. **Testimonials** are shown in translation with a visible "translated from English" note, as with Arabic.
3. **Legal pages** carry a note that the English version prevails.
4. **Religious quotations** translate the *meaning* of the vetted English and keep the reference. They are never paraphrased into new claims, and no quotations are added.
5. **Numbers and claims** follow the English page exactly. Nothing new is invented in translation.

## 6. Article slug map (EN → DE · FR · IT)

Translated articles live at `src/content/blog-tr/<lang>/<slug>.md` and are served at `/<lang>/blog/<slug>/`.
Cross-links inside a translated article point at the same-language twin listed here. Pages use the mirrored path, e.g. `/de/pricing/`.

| # | English slug (`translationOf`) | DE | FR | IT |
|---|---|---|---|---|
| 1 | 5-signs-your-child-is-ready-for-online-quran-classes | 5-anzeichen-dass-ihr-kind-bereit-fuer-online-koranunterricht-ist | 5-signes-que-votre-enfant-est-pret-pour-des-cours-de-coran-en-ligne | 5-segnali-che-tuo-figlio-e-pronto-per-le-lezioni-di-corano-online |
| 2 | 7-signs-youve-found-the-right-online-quran-teacher | 7-anzeichen-dass-sie-die-richtige-koranlehrkraft-gefunden-haben | 7-signes-que-vous-avez-trouve-le-bon-professeur-de-coran-en-ligne | 7-segnali-che-hai-trovato-il-giusto-insegnante-di-corano-online |
| 3 | arabic-grammar-for-quran-nahw-and-sarf-explained-for-beginners | arabische-grammatik-fuer-den-koran-nahw-und-sarf-fuer-anfaenger | grammaire-arabe-pour-le-coran-nahw-et-sarf-pour-debutants | grammatica-araba-per-il-corano-nahw-e-sarf-per-principianti |
| 4 | how-long-does-it-take-to-learn-quranic-arabic-a-realistic-timeline | wie-lange-dauert-es-koranisches-arabisch-zu-lernen | combien-de-temps-pour-apprendre-l-arabe-coranique | quanto-tempo-serve-per-imparare-l-arabo-coranico |
| 5 | how-long-does-it-take-to-memorize-the-quran-a-realistic-timeline | wie-lange-dauert-es-den-koran-auswendig-zu-lernen | combien-de-temps-pour-memoriser-le-coran | quanto-tempo-serve-per-memorizzare-il-corano |
| 6 | how-old-should-a-child-be-to-start-learning-quran | ab-welchem-alter-sollten-kinder-koran-lernen | a-quel-age-un-enfant-peut-il-commencer-a-apprendre-le-coran | a-che-eta-un-bambino-puo-iniziare-a-imparare-il-corano |
| 7 | how-to-choose-the-right-quran-teacher-for-your-child | die-richtige-koranlehrkraft-fuer-ihr-kind-finden | comment-choisir-le-bon-professeur-de-coran-pour-votre-enfant | come-scegliere-il-giusto-insegnante-di-corano-per-tuo-figlio |
| 8 | how-to-keep-children-motivated-while-learning-quran | wie-kinder-beim-koranlernen-motiviert-bleiben | comment-garder-les-enfants-motives-dans-l-apprentissage-du-coran | come-mantenere-i-bambini-motivati-nello-studio-del-corano |
| 9 | how-to-learn-arabic-as-a-muslim-a-complete-beginners-guide | arabisch-lernen-als-muslim-leitfaden-fuer-anfaenger | apprendre-l-arabe-en-tant-que-musulman-guide-du-debutant | imparare-l-arabo-da-musulmano-guida-per-principianti |
| 10 | how-to-learn-quran-online-a-complete-beginners-guide-2026 | koran-online-lernen-leitfaden-fuer-anfaenger-2026 | apprendre-le-coran-en-ligne-guide-complet-du-debutant-2026 | imparare-il-corano-online-guida-completa-per-principianti-2026 |
| 11 | noon-sakinah-and-tanween-rules-explained-simply | nun-sakina-und-tanwin-regeln-einfach-erklaert | les-regles-du-noun-sakina-et-du-tanwin-expliquees-simplement | le-regole-del-nun-sakina-e-del-tanwin-spiegate-semplicemente |
| 12 | online-quran-classes-across-time-zones-how-scheduling-actually-works | koranunterricht-online-ueber-zeitzonen-hinweg-so-funktioniert-die-planung | cours-de-coran-en-ligne-et-fuseaux-horaires-comment-fonctionne-le-planning | lezioni-di-corano-online-e-fusi-orari-come-funziona-la-pianificazione |
| 13 | online-quran-classes-for-kids-a-complete-guide-for-parents | online-koranunterricht-fuer-kinder-ratgeber-fuer-eltern | cours-de-coran-en-ligne-pour-enfants-guide-complet-pour-les-parents | lezioni-di-corano-online-per-bambini-guida-completa-per-genitori |
| 14 | quran-memorization-for-kids-a-practical-guide-for-parents | koran-auswendiglernen-fuer-kinder-praxisratgeber-fuer-eltern | memorisation-du-coran-pour-les-enfants-guide-pratique-pour-les-parents | memorizzazione-del-corano-per-bambini-guida-pratica-per-genitori |
| 15 | tajweed-rules-for-beginners-a-simple-introduction-to-reciting-the-quran-correctly | tajweed-regeln-fuer-anfaenger-einfuehrung-in-die-korrekte-koranrezitation | regles-de-tajwid-pour-debutants-introduction-a-la-recitation-correcte-du-coran | regole-del-tajweed-per-principianti-introduzione-alla-recitazione-corretta |
| 16 | the-complete-guide-to-quran-memorization-hifz-how-the-program-actually-works | hifz-der-komplette-leitfaden-zum-koran-auswendiglernen | guide-complet-du-hifz-comment-fonctionne-le-programme-de-memorisation | guida-completa-allo-hifz-come-funziona-il-programma-di-memorizzazione |
| 17 | the-itqan-method-explained-how-thematic-memorization-makes-hifz-easier | die-itqan-methode-erklaert-thematisches-auswendiglernen | la-methode-itqan-expliquee-la-memorisation-thematique | il-metodo-itqan-spiegato-la-memorizzazione-tematica |
| 18 | what-is-an-ijazah-understanding-quran-certification-and-sanad | was-ist-eine-ijaza-koran-zertifizierung-und-sanad | qu-est-ce-qu-une-ijaza-certification-coranique-et-sanad | che-cos-e-un-ijaza-certificazione-coranica-e-sanad |
| 19 | why-tajweed-matters-5-real-benefits-of-reciting-the-quran-correctly | warum-tajweed-wichtig-ist-5-echte-vorteile | pourquoi-le-tajwid-compte-5-bienfaits-concrets | perche-il-tajweed-e-importante-5-benefici-concreti |

Article authors: DE „Redaktion der Ummah Academy“ · FR « Rédaction d’Ummah Academy » · IT «Redazione di Ummah Academy».
