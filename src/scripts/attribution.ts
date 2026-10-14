/**
 * First-touch attribution, stored locally and attached to the lead webhook
 * payload (never to WhatsApp text). No cookies, no third parties.
 */
export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  click_id?: 'gclid' | 'fbclid' | 'msclkid' | 'ttclid';
  referrer?: string;
  landing?: string;
  first_seen?: string;
}

const KEY = 'ua:attr';

export function captureAttribution(): void {
  try {
    if (localStorage.getItem(KEY)) return;
    const p = new URLSearchParams(location.search);
    const a: Attribution = {};
    (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const).forEach((k) => {
      const v = p.get(k);
      if (v) a[k] = v.slice(0, 120);
    });
    const click = (['gclid', 'fbclid', 'msclkid', 'ttclid'] as const).find((k) => p.has(k));
    if (click) a.click_id = click;
    if (document.referrer && !document.referrer.startsWith(location.origin)) a.referrer = new URL(document.referrer).hostname;
    a.landing = location.pathname;
    a.first_seen = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(a));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getAttribution(): Attribution {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
