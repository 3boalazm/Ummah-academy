/** Pricing exactly as published on ummahacademy.net/pricing/ (USD / month). */

export interface Plan {
  id: string;
  name: string;
  track: 'A' | 'B';
  minutes: 30 | 60;
  price: number;
  perWeek: number;
  sessionsLabel: string;
  sessionsPerMonth: number;
  blurb: string;
  features: string[];
  badge?: string;
}

export const PLANS: Plan[] = [
  {
    id: 'diamond',
    name: 'Diamond',
    track: 'A',
    minutes: 60,
    price: 128,
    perWeek: 3,
    sessionsPerMonth: 12,
    sessionsLabel: '12 sessions/month · 3/week · 60 min',
    blurb: '3 sessions/week for rapid mastery.',
    features: ['2 Free Trials', 'Al-Azhar Scholar 1-on-1', 'Post-session Reports', 'Session Recordings', 'Certificates'],
  },
  {
    id: 'gold',
    name: 'Gold',
    track: 'A',
    minutes: 60,
    price: 96,
    perWeek: 2,
    sessionsPerMonth: 8,
    sessionsLabel: '8 sessions/month · 2/week · 60 min',
    blurb: 'The perfect balance — 2 sessions/week.',
    features: ['2 Free Trials', 'Al-Azhar Scholar 1-on-1', 'Post-session Reports', 'Session Recordings', 'Family Portal Access'],
    badge: 'Most Popular',
  },
  {
    id: 'starter',
    name: 'Starter',
    track: 'A',
    minutes: 60,
    price: 64,
    perWeek: 1,
    sessionsPerMonth: 4,
    sessionsLabel: '4–5 sessions/month · 1/week · 60 min',
    blurb: 'One focused session per week at your pace.',
    features: ['2 Free Trials', 'Al-Azhar Scholar 1-on-1', 'Post-session Reports', 'Session Recordings', 'Certificates'],
  },
  {
    id: 'elite',
    name: 'Elite',
    track: 'B',
    minutes: 30,
    price: 74,
    perWeek: 5,
    sessionsPerMonth: 20,
    sessionsLabel: '20 sessions · 5/week',
    blurb: 'Daily 5/week immersion.',
    features: ['2 Free Trials', '1-on-1 Certified'],
  },
  {
    id: 'consistent',
    name: 'Consistent',
    track: 'B',
    minutes: 30,
    price: 59,
    perWeek: 4,
    sessionsPerMonth: 16,
    sessionsLabel: '16 sessions · 4/week',
    blurb: '4/week — sweet spot for kids.',
    features: ['2 Free Trials', 'Gamified Sessions'],
    badge: 'Kids Fav',
  },
  {
    id: 'deen',
    name: 'Deen',
    track: 'B',
    minutes: 30,
    price: 59,
    perWeek: 4,
    sessionsPerMonth: 16,
    sessionsLabel: '16 sessions · 4/week',
    blurb: 'Ummah Cubs Aqeedah & morals.',
    features: ['Kids Specialist', 'Achievement Rewards'],
  },
  {
    id: 'launch',
    name: 'Launch',
    track: 'B',
    minutes: 30,
    price: 40,
    perWeek: 2,
    sessionsPerMonth: 8,
    sessionsLabel: '8 sessions · 2/week',
    blurb: 'Gentle 2/week for beginners.',
    features: ['2 Free Trials', 'Recordings Saved'],
  },
];

export const INCLUDED = [
  { icon: 'gift', title: '2 Free Trials', desc: 'Test quality before paying.' },
  { icon: 'clipboard-text', title: 'Session Reports', desc: 'Detailed feedback after every class.' },
  { icon: 'video-camera', title: 'Recordings', desc: 'Sessions auto-saved for review.' },
  { icon: 'certificate', title: 'Certificates', desc: 'Official certificate per level.' },
  { icon: 'calendar-check', title: 'Rescheduling', desc: '24h advance notice — no penalties.' },
  { icon: 'users-three', title: 'Family Portal', desc: 'Monitor all children from one dashboard.' },
  { icon: 'chat-circle-dots', title: 'WhatsApp Alerts', desc: '15-min session reminders.' },
  { icon: 'snowflake', title: 'Subscription Freeze', desc: 'Pause without losing balance.' },
];

export const PAYMENT_METHODS = [
  { icon: 'credit-card', title: 'Visa Card', desc: 'Credit & Debit · Secure' },
  { icon: 'credit-card', title: 'Mastercard', desc: 'Credit & Debit · Global' },
  { icon: 'paypal-logo', title: 'PayPal', desc: 'Buyer protection · Fast' },
  { icon: 'bank', title: 'Bank Transfer', desc: 'Direct · Secure' },
  { icon: 'globe-hemisphere-west', title: 'Western Union', desc: '200+ countries' },
  { icon: 'money', title: 'MoneyGram', desc: 'Fast · Worldwide' },
];
