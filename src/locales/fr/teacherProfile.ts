/** TeacherProfile — français. */
import type { Teacher } from '@/data/people';

export default {
  L: (t: Teacher, first: string) => ({
    teachers: 'Enseignants',
    book: `Réserver un cours gratuit avec ${first}`,
    ask: `Demander les disponibilités de ${first}`,
    waText: `Assalamou alaykoum, je souhaite réserver un essai avec ${t.name}. Quels créneaux sont disponibles\u00a0?`,
    verified: t.ijazah ? 'Ijaza vérifiée' : 'Diplômes vérifiés',
    creds: 'Diplômes',
    bestFor: 'Idéal pour',
    sanadTitle: 'Sa chaîne de transmission',
    sanadText: `${first} est titulaire d’une ijaza en Hafs ’an ’Asim — une chaîne documentée de maîtres, chacun formé par le précédent, qui remonte jusqu’au Prophète ﷺ.`,
    sanadNote: 'Nous vérifions directement la chaîne de chaque enseignant — jamais sur simple parole.',
    sanadMore: 'Ce que signifie vraiment une ijaza',
    sanadHref: '/fr/blog/qu-est-ce-qu-une-ijaza-certification-coranique-et-sanad/',
    vetTitle: 'Comment elle a gagné sa place',
    vet: [
      { icon: 'files', title: 'Examen de la candidature', text: 'Diplômes et rattachement à al-Azhar vérifiés avant tout entretien.' },
      {
        icon: 'scroll',
        title: t.ijazah ? 'Vérification de l’ijaza et du sanad' : 'Vérification des diplômes',
        text: t.ijazah ? 'Sa chaîne de transmission a été vérifiée directement.' : 'Ses diplômes ont été vérifiés directement auprès des établissements.',
      },
      { icon: 'chalkboard-teacher', title: 'Cours d’essai en direct', text: 'Elle a donné un vrai cours avant d’être retenue.' },
      { icon: 'chart-line-up', title: 'Évaluation continue', text: 'La qualité de l’enseignement est suivie en permanence — pas seulement à l’embauche.' },
    ],
    teachesTitle: `Ce qu’enseigne ${first}`,
    storiesTitle: `Ce que les familles disent de ${first}`,
    bookTitle: `Réserver avec ${first}`,
    steps: [
      { icon: 'cursor-click', title: 'Choisissez-la dans le formulaire', text: 'Son nom est déjà renseigné. Dites-nous pour qui sont les cours et votre fuseau horaire.' },
      { icon: 'whatsapp-logo', title: 'Nous confirmons ses horaires sur WhatsApp', text: 'Si son planning est complet à votre horaire, nous vous le disons franchement et proposons l’option la plus proche.' },
      { icon: 'gift', title: 'Deux séances gratuites, puis vous décidez', text: 'Sans carte, sans engagement. Vous continuez seulement si cela vous convient.' },
    ],
    faqTitle: 'Questions sur la réservation',
    faq: [
      {
        q: `Puis-je choisir ${first} en particulier\u00a0?`,
        a: 'Oui. Choisissez-la dans le formulaire (nous l’avons prérempli) et nous confirmerons sa disponibilité pour votre fuseau horaire sur WhatsApp avant votre première séance.',
      },
      { q: 'Puis-je changer de professeur plus tard\u00a0?', a: 'Oui. Si le courant ne passe pas, dites-le-nous sur WhatsApp et nous chercherons un meilleur choix.' },
      { q: 'Dans quelle langue enseigne-t-elle\u00a0?', a: `${first} enseigne en arabe et en anglais, et choisit la langue des explications selon l’élève et son âge. Nous ne proposons pas encore de cours en français.` },
    ],
    othersTitle: 'Les autres responsables pédagogiques',
    ctaTitle: `Commencez avec <span class="accent">${first}</span> cette semaine.`,
    ctaLede: 'Vos 2 premières séances sont gratuites. Nous confirmons les horaires sur WhatsApp en quelques minutes.',
  }),
  meta: (t: Teacher) => ({
    title: `${t.name} — ${t.role} | Ummah Academy`,
    desc: `${t.name}, ${t.role} chez Ummah Academy\u00a0: ${t.specialty}. Ses diplômes, les élèves à qui elle convient le mieux, et comment réserver 2 séances gratuites avec elle.`,
  }),
};
