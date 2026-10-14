/**
 * Site-wide progressive enhancement: header state, mega menu, mobile menu,
 * sticky mobile CTA, scroll reveals, first-touch attribution and analytics.
 */
import { track } from './analytics';
import { captureAttribution } from './attribution';

const root = document.documentElement;
captureAttribution();

/* Header: condensed glass once the page scrolls */
const onScroll = () => {
  if (window.scrollY > 12) root.setAttribute('data-scrolled', '');
  else root.removeAttribute('data-scrolled');
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* Mega menu (click/tap + keyboard; hover handled in CSS) */
document.querySelectorAll<HTMLElement>('[data-mega]').forEach((item) => {
  const btn = item.querySelector<HTMLButtonElement>('[data-mega-toggle]');
  if (!btn) return;
  const set = (open: boolean) => {
    item.toggleAttribute('data-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', () => set(!item.hasAttribute('data-open')));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      set(false);
      btn.focus();
    }
  });
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget as Node)) set(false);
  });
  document.addEventListener('click', (e) => {
    if (!item.contains(e.target as Node)) set(false);
  });
});

/* Mobile menu (native <dialog> = focus trap + Esc for free) */
const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
document.querySelectorAll('[data-menu-open]').forEach((b) =>
  b.addEventListener('click', () => {
    menu?.showModal();
    track('menu_open');
  })
);
document.querySelectorAll('[data-menu-close]').forEach((b) => b.addEventListener('click', () => menu?.close()));
menu?.addEventListener('click', (e) => {
  if (e.target === menu) menu.close();
});
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu.close()));

/* Sticky mobile CTA: after the first screen, hidden over the footer and over booking forms */
const sticky = document.querySelector<HTMLElement>('[data-sticky-cta]');
if (sticky) {
  const footer = document.querySelector('.site-footer');
  const forms = document.querySelectorAll('[data-booking], [data-pt]');
  let pastHero = false;
  let blocked = 0;
  const update = () => {
    const show = pastHero && blocked === 0;
    sticky.classList.toggle('is-visible', show);
    sticky.setAttribute('aria-hidden', String(!show));
    sticky.querySelectorAll('a').forEach((a) => (show ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
  };
  const onS = () => {
    const now = window.scrollY > window.innerHeight * 0.7;
    if (now !== pastHero) {
      pastHero = now;
      update();
    }
  };
  window.addEventListener('scroll', onS, { passive: true });
  if ('IntersectionObserver' in window) {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      blocked = seen.size;
      update();
    });
    if (footer) io.observe(footer);
    forms.forEach((f) => io.observe(f));
  }
  onS();
}

/* Scroll reveals */
const revealEls = document.querySelectorAll<HTMLElement>('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* Hero cards: gentle pointer tilt on hover-capable devices */
const tiltRoot = document.querySelector<HTMLElement>('[data-tilt]');
if (tiltRoot && matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
  tiltRoot.addEventListener('pointermove', (e) => {
    const r = tiltRoot.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tiltRoot.style.setProperty('--tx', `${x * 10}px`);
    tiltRoot.style.setProperty('--ty', `${y * 10}px`);
  });
  tiltRoot.addEventListener('pointerleave', () => {
    tiltRoot.style.setProperty('--tx', '0px');
    tiltRoot.style.setProperty('--ty', '0px');
  });
}

/* Analytics: CTA, WhatsApp, router, language (no PII) */
document.addEventListener('click', (e) => {
  const el = e.target as HTMLElement;
  const router = el.closest<HTMLElement>('[data-router]');
  if (router) track('router_select', { audience: router.dataset.router, goal: router.dataset.goal });
  const ls = el.closest<HTMLElement>('[data-lang-switch]');
  if (ls) track('language_switch', { to: ls.dataset.langSwitch });
  const a = el.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  const location = a.dataset.track || window.location.pathname;
  if (href.includes('wa.me/')) track('whatsapp_click', { location });
  else if (/^(\/ar)?\/contact\//.test(href)) track('trial_cta_click', { location });
  else if (/^(\/ar)?\/placement-test\//.test(href)) track('placement_cta_click', { location });
});
