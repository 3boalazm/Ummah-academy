/** Countries offered in the booking form (mirrors the live form) with dial codes and timezone hints. */
import type { Lang } from '@/i18n';

export interface Country {
  /** ISO 3166-1 alpha-2 ('ZZ' = other) — names in DE/FR/IT come from Intl.DisplayNames */
  code: string;
  /** canonical English name: the value sent to the team */
  en: string;
  ar: string;
  dial: string;
  tz: string[];
}

export const COUNTRIES: Country[] = [
  { code: 'GB', en: 'United Kingdom', ar: 'المملكة المتحدة', dial: '+44', tz: ['Europe/London'] },
  { code: 'US', en: 'United States', ar: 'الولايات المتحدة', dial: '+1', tz: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Detroit', 'America/Anchorage', 'Pacific/Honolulu', 'America/Indiana/Indianapolis', 'America/Boise'] },
  { code: 'CA', en: 'Canada', ar: 'كندا', dial: '+1', tz: ['America/Toronto', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg', 'America/Halifax', 'America/Regina', 'America/St_Johns', 'America/Montreal'] },
  { code: 'AU', en: 'Australia', ar: 'أستراليا', dial: '+61', tz: ['Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Perth', 'Australia/Adelaide', 'Australia/Hobart', 'Australia/Darwin'] },
  { code: 'NZ', en: 'New Zealand', ar: 'نيوزيلندا', dial: '+64', tz: ['Pacific/Auckland'] },
  { code: 'IE', en: 'Ireland', ar: 'أيرلندا', dial: '+353', tz: ['Europe/Dublin'] },
  { code: 'DE', en: 'Germany', ar: 'ألمانيا', dial: '+49', tz: ['Europe/Berlin'] },
  { code: 'AT', en: 'Austria', ar: 'النمسا', dial: '+43', tz: ['Europe/Vienna'] },
  { code: 'CH', en: 'Switzerland', ar: 'سويسرا', dial: '+41', tz: ['Europe/Zurich'] },
  { code: 'FR', en: 'France', ar: 'فرنسا', dial: '+33', tz: ['Europe/Paris'] },
  { code: 'NL', en: 'Netherlands', ar: 'هولندا', dial: '+31', tz: ['Europe/Amsterdam'] },
  { code: 'BE', en: 'Belgium', ar: 'بلجيكا', dial: '+32', tz: ['Europe/Brussels'] },
  { code: 'LU', en: 'Luxembourg', ar: 'لوكسمبورغ', dial: '+352', tz: ['Europe/Luxembourg'] },
  { code: 'SE', en: 'Sweden', ar: 'السويد', dial: '+46', tz: ['Europe/Stockholm'] },
  { code: 'NO', en: 'Norway', ar: 'النرويج', dial: '+47', tz: ['Europe/Oslo'] },
  { code: 'DK', en: 'Denmark', ar: 'الدنمارك', dial: '+45', tz: ['Europe/Copenhagen'] },
  { code: 'ES', en: 'Spain', ar: 'إسبانيا', dial: '+34', tz: ['Europe/Madrid'] },
  { code: 'IT', en: 'Italy', ar: 'إيطاليا', dial: '+39', tz: ['Europe/Rome'] },
  { code: 'SA', en: 'Saudi Arabia', ar: 'السعودية', dial: '+966', tz: ['Asia/Riyadh'] },
  { code: 'AE', en: 'United Arab Emirates', ar: 'الإمارات', dial: '+971', tz: ['Asia/Dubai'] },
  { code: 'QA', en: 'Qatar', ar: 'قطر', dial: '+974', tz: ['Asia/Qatar'] },
  { code: 'KW', en: 'Kuwait', ar: 'الكويت', dial: '+965', tz: ['Asia/Kuwait'] },
  { code: 'BH', en: 'Bahrain', ar: 'البحرين', dial: '+973', tz: ['Asia/Bahrain'] },
  { code: 'OM', en: 'Oman', ar: 'عُمان', dial: '+968', tz: ['Asia/Muscat'] },
  { code: 'EG', en: 'Egypt', ar: 'مصر', dial: '+20', tz: ['Africa/Cairo'] },
  { code: 'JO', en: 'Jordan', ar: 'الأردن', dial: '+962', tz: ['Asia/Amman'] },
  { code: 'MA', en: 'Morocco', ar: 'المغرب', dial: '+212', tz: ['Africa/Casablanca'] },
  { code: 'DZ', en: 'Algeria', ar: 'الجزائر', dial: '+213', tz: ['Africa/Algiers'] },
  { code: 'TN', en: 'Tunisia', ar: 'تونس', dial: '+216', tz: ['Africa/Tunis'] },
  { code: 'TR', en: 'Turkey', ar: 'تركيا', dial: '+90', tz: ['Europe/Istanbul'] },
  { code: 'PK', en: 'Pakistan', ar: 'باكستان', dial: '+92', tz: ['Asia/Karachi'] },
  { code: 'IN', en: 'India', ar: 'الهند', dial: '+91', tz: ['Asia/Kolkata', 'Asia/Calcutta'] },
  { code: 'BD', en: 'Bangladesh', ar: 'بنغلاديش', dial: '+880', tz: ['Asia/Dhaka'] },
  { code: 'MY', en: 'Malaysia', ar: 'ماليزيا', dial: '+60', tz: ['Asia/Kuala_Lumpur'] },
  { code: 'ID', en: 'Indonesia', ar: 'إندونيسيا', dial: '+62', tz: ['Asia/Jakarta'] },
  { code: 'SG', en: 'Singapore', ar: 'سنغافورة', dial: '+65', tz: ['Asia/Singapore'] },
  { code: 'ZA', en: 'South Africa', ar: 'جنوب أفريقيا', dial: '+27', tz: ['Africa/Johannesburg'] },
  { code: 'NG', en: 'Nigeria', ar: 'نيجيريا', dial: '+234', tz: ['Africa/Lagos'] },
  { code: 'KE', en: 'Kenya', ar: 'كينيا', dial: '+254', tz: ['Africa/Nairobi'] },
  { code: 'ZZ', en: 'Other', ar: 'دولة أخرى', dial: '+', tz: [] },
];

const regionNames = new Map<string, Intl.DisplayNames>();
/** Country name for the booking form, in the page's language. */
export function countryName(c: Country, lang: Lang, other: string): string {
  if (c.code === 'ZZ') return other;
  if (lang === 'en') return c.en;
  if (lang === 'ar') return c.ar;
  const intl = { de: 'de-DE', fr: 'fr-FR', it: 'it-IT' }[lang];
  if (!regionNames.has(intl)) regionNames.set(intl, new Intl.DisplayNames([intl], { type: 'region' }));
  return regionNames.get(intl)!.of(c.code) ?? c.en;
}
