/** ThankYou — français. */
export default {
  C: {
    meta: 'Presque terminé — confirmez votre essai gratuit | Ummah Academy',
    title: 'Votre demande est prête — envoyez-la sur WhatsApp pour confirmer',
    lede: 'Appuyez sur le bouton pour envoyer vos informations à notre équipe d’inscription. Votre essai est réservé dès que nous avons confirmé avec vous le professeur et l’horaire sur WhatsApp.',
    send: 'Envoyer sur WhatsApp',
    preview: 'Aperçu du message',
    copy: 'Copier le message',
    copied: 'Copié',
    steps: [
      'Nous confirmons votre professeur et un horaire adapté à votre fuseau.',
      'Vous recevez un lien de cours (Zoom ou Google Meet) et un rappel 15\u00a0minutes avant.',
      'Vous suivez deux séances gratuites — puis vous décidez, sans engagement.',
    ],
    alt: 'Pas de WhatsApp\u00a0? Écrivez-nous à',
    wait: 'Faites le test de niveau en attendant',
    titleReceived: (n: string) => `Merci, ${n} — nous avons bien reçu votre demande`,
    ledeReceived: 'Notre équipe d’inscription vous écrira très vite sur WhatsApp pour confirmer le professeur et l’horaire. Encore plus rapide\u00a0: envoyez le récapitulatif ci-dessous sur WhatsApp.',
    titlePending: (n: string) => `Presque terminé, ${n} — envoyez votre demande sur WhatsApp`,
  },
};
