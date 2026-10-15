import type { Lang } from '@/i18n';
import { PRICES } from '@/data/prices';
import pricingDe from '@/locales/de/data/pricing';
import pricingFr from '@/locales/fr/data/pricing';
import pricingIt from '@/locales/it/data/pricing';

/**
 * Plans: structure and copy. The prices themselves live in src/data/prices.json (the one
 * place to change them — also editable in the CMS). USD per month.
 * v2 change: "Deen" ($59, 4×30 min) was identical to "Consistent" and is
 * presented as Consistent with any subject (incl. Ummah Cubs Islamic studies).
 */
export interface Plan {
  id: 'launch' | 'consistent' | 'elite' | 'starter' | 'gold' | 'diamond';
  minutes: 30 | 60;
  perWeek: number;
  sessionsPerMonth: number;
  price: number;
  name: string;
  /** canonical English plan name used in lead messages */
  canonical: string;
  bestFor: string;
  sessionsLabel: string;
  badge?: string;
}

const base = [
  { id: 'launch', minutes: 30, perWeek: 2, sessionsPerMonth: 8, price: PRICES.launch, canonical: 'Launch' },
  { id: 'consistent', minutes: 30, perWeek: 4, sessionsPerMonth: 16, price: PRICES.consistent, canonical: 'Consistent' },
  { id: 'elite', minutes: 30, perWeek: 5, sessionsPerMonth: 20, price: PRICES.elite, canonical: 'Elite' },
  { id: 'starter', minutes: 60, perWeek: 1, sessionsPerMonth: 4, price: PRICES.starter, canonical: 'Starter' },
  { id: 'gold', minutes: 60, perWeek: 2, sessionsPerMonth: 8, price: PRICES.gold, canonical: 'Gold' },
  { id: 'diamond', minutes: 60, perWeek: 3, sessionsPerMonth: 12, price: PRICES.diamond, canonical: 'Diamond' },
] as const;

const COPY = {
  en: {
    launch: { name: 'Launch', bestFor: 'A gentle start for beginners and young children.', label: '8 sessions · 2 per week' },
    consistent: { name: 'Consistent', bestFor: 'The sweet spot for kids — any subject, including Ummah Cubs Islamic studies.', label: '16 sessions · 4 per week', badge: 'Kids’ favourite' },
    elite: { name: 'Elite', bestFor: 'Daily immersion, five days a week.', label: '20 sessions · 5 per week' },
    starter: { name: 'Starter', bestFor: 'One focused weekly session at your own pace.', label: '4–5 sessions · 1 per week' },
    gold: { name: 'Gold', bestFor: 'The balance most adults choose for Tajweed and Arabic.', label: '8 sessions · 2 per week', badge: 'Most popular' },
    diamond: { name: 'Diamond', bestFor: 'Rapid progress — ideal for Hifz and Ijazah.', label: '12 sessions · 3 per week' },
  },
  ar: {
    launch: { name: 'الانطلاقة', bestFor: 'بداية هادئة للمبتدئين والأطفال الصغار.', label: '٨ حصص · حصتان أسبوعيًا' },
    consistent: { name: 'المواظبة', bestFor: 'الخيار الأمثل للأطفال — لأي مادة، بما فيها الدراسات الإسلامية لأشبال الأمة.', label: '١٦ حصة · ٤ حصص أسبوعيًا', badge: 'المفضّلة للأطفال' },
    elite: { name: 'النخبة', bestFor: 'انغماس يومي، خمسة أيام في الأسبوع.', label: '٢٠ حصة · ٥ حصص أسبوعيًا' },
    starter: { name: 'البداية', bestFor: 'حصة أسبوعية مركّزة بالسرعة التي تناسبك.', label: '٤–٥ حصص · حصة أسبوعيًا' },
    gold: { name: 'الذهبية', bestFor: 'التوازن الذي يختاره أغلب الكبار للتجويد والعربية.', label: '٨ حصص · حصتان أسبوعيًا', badge: 'الأكثر طلبًا' },
    diamond: { name: 'الماسية', bestFor: 'تقدّم سريع — مثالية للحفظ والإجازة.', label: '١٢ حصة · ٣ حصص أسبوعيًا' },
  },
} as const;

/** Text-only overlay for German, French and Italian (prices and ids stay above). */
export interface PricingText {
  plans: Record<Plan['id'], { name: string; bestFor: string; label: string; badge?: string }>;
  included: { title: string; desc: string }[];
  payment: string[];
}
const OVERLAY: Partial<Record<Lang, PricingText>> = { de: pricingDe, fr: pricingFr, it: pricingIt };

export const getPlans = (lang: Lang = 'en'): Plan[] =>
  base.map((b) => {
    const table = OVERLAY[lang]?.plans ?? ((COPY as Record<string, (typeof COPY)['en']>)[lang] ?? COPY.en);
    const c = table[b.id] as { name: string; bestFor: string; label: string; badge?: string };
    return { ...b, name: c.name, bestFor: c.bestFor, sessionsLabel: c.label, badge: c.badge } as Plan;
  });

export const perSession = (p: Plan) => Math.round((p.price / p.sessionsPerMonth) * 100) / 100;

const INCLUDED = {
  en: [
    { icon: 'gift', title: '2 free sessions', desc: 'Full lessons with your matched teacher before you pay anything.' },
    { icon: 'clipboard-text', title: 'Post-session reports', desc: 'What you covered, homework and next steps.' },
    { icon: 'certificate', title: 'Level certificates', desc: 'A certificate for every level you complete.' },
    { icon: 'calendar-check', title: 'Free rescheduling', desc: 'Move a session with 24 hours’ notice.' },
    { icon: 'snowflake', title: 'Pause anytime', desc: 'Freeze your subscription without losing paid sessions.' },
    { icon: 'bell-ringing', title: 'WhatsApp reminders', desc: '15 minutes before every session.' },
    { icon: 'users-three', title: 'Family Portal', desc: 'One account for every learner in the family.' },
    { icon: 'video-camera', title: 'Session recordings', desc: 'Available on request; library rolling out in the portal.' },
  ],
  ar: [
    { icon: 'gift', title: 'حصتان مجانيتان', desc: 'حصتان كاملتان مع معلمك قبل أن تدفع أي شيء.' },
    { icon: 'clipboard-text', title: 'تقرير بعد كل حصة', desc: 'ما تم إنجازه، والواجب، والخطوة التالية.' },
    { icon: 'certificate', title: 'شهادة لكل مستوى', desc: 'شهادة إتمام عند إنهاء كل مستوى.' },
    { icon: 'calendar-check', title: 'تغيير الموعد مجانًا', desc: 'غيّر موعد الحصة بإشعار قبلها بـ ٢٤ ساعة.' },
    { icon: 'snowflake', title: 'إيقاف مؤقت', desc: 'جمّد اشتراكك دون أن تخسر حصصك المدفوعة.' },
    { icon: 'bell-ringing', title: 'تذكير عبر واتساب', desc: 'قبل كل حصة بـ ١٥ دقيقة.' },
    { icon: 'users-three', title: 'بوابة الأسرة', desc: 'حساب واحد لكل المتعلمين في الأسرة.' },
    { icon: 'video-camera', title: 'تسجيلات الحصص', desc: 'متاحة عند الطلب، والمكتبة تُطلق تدريجيًا في البوابة.' },
  ],
};
export const getIncluded = (lang: Lang = 'en') => {
  const x = OVERLAY[lang]?.included;
  if (x) return INCLUDED.en.map((item, i) => ({ ...item, ...x[i] }));
  return (INCLUDED as Record<string, (typeof INCLUDED)['en']>)[lang] ?? INCLUDED.en;
};

export const PAYMENT_METHODS = ['Visa', 'Mastercard', 'PayPal', 'Bank transfer', 'Western Union', 'MoneyGram'];
export const PAYMENT_METHODS_AR = ['فيزا', 'ماستركارد', 'باي بال', 'تحويل بنكي', 'ويسترن يونيون', 'موني جرام'];
const PAYMENT: Partial<Record<Lang, string[]>> = { en: PAYMENT_METHODS, ar: PAYMENT_METHODS_AR };
export const paymentMethods = (lang: Lang) => OVERLAY[lang]?.payment ?? PAYMENT[lang] ?? PAYMENT_METHODS;
