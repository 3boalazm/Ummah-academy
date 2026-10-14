/**
 * Site-wide progressive enhancement: header state, mega menu, mobile menu,
 * scroll reveals and lightweight analytics hooks. ~2 KB gzipped.
 */
import { track } from './analytics';

const root = document.documentElement;

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

/* Analytics: CTA + WhatsApp + outbound clicks (no PII) */
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  if (href.includes('wa.me/')) track('whatsapp_click', { location: a.dataset.track || location.pathname });
  else if (href.startsWith('/contact/')) track('trial_cta_click', { location: a.dataset.track || location.pathname });
  else if (href.startsWith('/placement-test/')) track('placement_cta_click', { location: a.dataset.track || location.pathname });
});
