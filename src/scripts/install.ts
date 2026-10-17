/**
 * "Install as an app" (PWA).
 *
 * The button is always on the page (the dock pill and the row in the mobile menu) and only
 * goes away inside the installed app. What its card says depends on the browser:
 *   - Chrome/Edge/Android hand us a `beforeinstallprompt` we replay from our own "Install" button;
 *   - iOS Safari has no such event, so it gets the Share → Add to Home Screen steps;
 *   - anything else (desktop Firefox/Safari, Chrome before it has fired the event…) gets a
 *     one-line pointer to its own menu.
 * "Not now" only closes the card — the button stays.
 */
import { track } from './analytics';

const KEY = 'ua:install';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const remember = (v: string | null) => {
  try {
    if (v === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, v);
  } catch {
    /* private mode: the choice lasts for this page only */
  }
};

/** Already running as an installed app (Android/Chrome) or from the home screen (iOS). */
const standalone =
  matchMedia('(display-mode: standalone)').matches ||
  matchMedia('(display-mode: minimal-ui)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIOS =
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+ reports as Mac

/**
 * Wires every `[data-install]` on the page — there are two: the pill in the bottom-left dock and
 * the row inside the mobile menu sheet. The deferred install event is shared, so both offers
 * replay the same browser prompt.
 */
function init() {
  const roots = [...document.querySelectorAll<HTMLElement>('[data-install]')];
  if (!roots.length) return; // the offer is a bonus, never fatal

  let deferred: BeforeInstallPromptEvent | null = null;
  const wired = roots
    .map((root) => {
      const pill = root.querySelector<HTMLButtonElement>('[data-install-open]');
      const card = root.querySelector<HTMLElement>('[data-install-card]');
      const native = root.querySelector<HTMLElement>('[data-install-native]');
      const ios = root.querySelector<HTMLElement>('[data-install-ios]');
      const manual = root.querySelector<HTMLElement>('[data-install-manual]');
      if (!pill || !card || !native || !ios || !manual) return null;
      return { root, pill, card, native, ios, manual };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  if (!wired.length) return;

  const closeCard = (self: (typeof wired)[number]) => {
    self.card.hidden = true;
    self.pill.setAttribute('aria-expanded', 'false');
  };

  const closeAll = (except?: (typeof wired)[number]) => {
    for (const self of wired) if (self !== except) closeCard(self);
  };

  /** Installed (or running as the app): no offer anywhere. */
  const hide = () => {
    for (const self of wired) {
      self.root.setAttribute('data-installed', '');
      closeCard(self);
    }
  };

  const show = () => {
    for (const self of wired) self.root.removeAttribute('data-installed');
  };

  for (const self of wired) {
    const { root, pill, card, native, ios, manual } = self;

    pill.addEventListener('click', () => {
      if (!card.hidden) {
        closeCard(self);
        return;
      }
      closeAll(self);
      card.hidden = false;
      pill.setAttribute('aria-expanded', 'true');
      native.hidden = !deferred;
      ios.hidden = !!deferred || !isIOS;
      manual.hidden = !!deferred || isIOS;
      track('install_open', { variant: root.dataset.installVariant ?? 'pill', mode: deferred ? 'prompt' : isIOS ? 'ios' : 'manual' });
    });

    root.querySelector('[data-install-confirm]')?.addEventListener('click', async () => {
      if (!deferred) return;
      const ev = deferred;
      deferred = null;
      await ev.prompt();
      const { outcome } = await ev.userChoice;
      track('install_choice', { outcome });
      // accepted → the browser fires `appinstalled` next; dismissed → the button simply stays
      for (const other of wired) closeCard(other);
    });

    for (const later of root.querySelectorAll('[data-install-dismiss]')) {
      later.addEventListener('click', () => {
        track('install_dismissed');
        closeCard(self);
        pill.focus();
      });
    }

    root.querySelector('[data-install-close]')?.addEventListener('click', () => {
      closeCard(self);
      pill.focus();
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target as Node)) closeCard(self);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !card.hidden) {
        closeCard(self);
        pill.focus();
      }
    });
  }

  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we ask from our own button, not the browser's infobar
    deferred = e as BeforeInstallPromptEvent;
    // the browser only offers an install when the app is NOT installed: forget an old "installed"
    if (read() === 'installed') remember(null);
    if (!standalone) show();
  });

  addEventListener('appinstalled', () => {
    remember('installed');
    hide();
    track('installed');
  });

  // inside the installed app, or on a browser we last saw install it: nothing to offer
  if (standalone || read() === 'installed') hide();
}

init();
