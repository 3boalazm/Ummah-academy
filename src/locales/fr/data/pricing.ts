/** Formules — français (textes seulement ; prix et ids dans src/data/pricing.ts). */
import type { PricingText } from '@/data/pricing';

const pricing: PricingText = {
  plans: {
    launch: { name: 'Lancement', bestFor: 'Un départ en douceur pour les débutants et les jeunes enfants.', label: '8 séances · 2 par semaine' },
    consistent: { name: 'Régularité', bestFor: 'L’équilibre idéal pour les enfants — toute matière, y compris les sciences islamiques d’Ummah Cubs.', label: '16 séances · 4 par semaine', badge: 'Préférée des enfants' },
    elite: { name: 'Élite', bestFor: 'Une immersion quotidienne, cinq jours par semaine.', label: '20 séances · 5 par semaine' },
    starter: { name: 'Essentiel', bestFor: 'Une séance hebdomadaire ciblée, à votre rythme.', label: '4–5 séances · 1 par semaine' },
    gold: { name: 'Or', bestFor: 'L’équilibre que choisissent la plupart des adultes pour le tajwid et l’arabe.', label: '8 séances · 2 par semaine', badge: 'La plus choisie' },
    diamond: { name: 'Diamant', bestFor: 'Des progrès rapides — idéal pour le hifz et l’ijaza.', label: '12 séances · 3 par semaine' },
  },
  included: [
    { title: '2 séances gratuites', desc: 'Des cours complets avec votre professeur avant de payer quoi que ce soit.' },
    { title: 'Comptes rendus après chaque séance', desc: 'Ce qui a été vu, les devoirs et les prochaines étapes.' },
    { title: 'Certificats de niveau', desc: 'Un certificat pour chaque niveau terminé.' },
    { title: 'Report gratuit', desc: 'Déplacez une séance en prévenant 24\u00a0heures à l’avance.' },
    { title: 'Pause à tout moment', desc: 'Suspendez votre abonnement sans perdre les séances payées.' },
    { title: 'Rappels WhatsApp', desc: '15\u00a0minutes avant chaque séance.' },
    { title: 'Espace famille', desc: 'Un seul compte pour tous les élèves de la famille.' },
    { title: 'Enregistrements des séances', desc: 'Disponibles sur demande\u00a0; la bibliothèque arrive progressivement dans l’espace.' },
  ],
  payment: ['Visa', 'Mastercard', 'PayPal', 'Virement bancaire', 'Western Union', 'MoneyGram'],
};
export default pricing;
