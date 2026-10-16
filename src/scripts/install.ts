/**
 * "Install as an app" (PWA).
 *
 * Chrome/Edge/Android hand us a `beforeinstallprompt` we can replay from our own
 * button; iOS Safari has no such event, so there we show the Share → Add to Home
 * Screen steps instead. The pill itself stays hidden until one of the two is
 * true, and a visitor who taps "Not now" is never asked again on this device.
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
const remember = (v: string) => {
  try {
    localStorage.setItem(KEY, v);
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
 * Wires every `[data-install]` on the page — there are two: the floating pill on desktop and
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
      if (!pill || !card || !native || !ios) return null;
      return { root, pill, card, native, ios };
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

  const hide = (persist: boolean) => {
    for (const self of wired) {
      self.root.removeAttribute('data-visible');
      self.pill.setAttribute('tabindex', '-1');
      closeCard(self);
    }
    if (persist) remember('dismissed');
  };

  const reveal = () => {
    if (wired.some((self) => self.root.hasAttribute('data-visible'))) return;
    for (const self of wired) {
      self.root.setAttribute('data-visible', '');
      self.pill.removeAttribute('tabindex');
    }
    track('install_shown', { platform: deferred ? 'prompt' : 'ios' });
  };

  for (const self of wired) {
    const { root, pill, card, native, ios } = self;

    pill.addEventListener('click', () => {
      if (!card.hidden) {
        closeCard(self);
        return;
      }
      closeAll(self);
      card.hidden = false;
      pill.setAttribute('aria-expanded', 'true');
      native.hidden = !deferred;
      ios.hidden = !!deferred;
      track('install_open', { variant: root.dataset.installVariant ?? 'pill' });
    });

    root.querySelector('[data-install-confirm]')?.addEventListener('click', async () => {
      if (!deferred) return;
      const ev = deferred;
      deferred = null;
      await ev.prompt();
      const { outcome } = await ev.userChoice;
      track('install_choice', { outcome });
      hide(outcome === 'dismissed');
    });

    root.querySelector('[data-install-dismiss]')?.addEventListener('click', () => {
      track('install_dismissed');
      hide(true);
    });

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
    if (!standalone && read() !== 'dismissed') reveal();
  });

  addEventListener('appinstalled', () => {
    remember('installed');
    hide(false);
    track('installed');
  });

  /* iOS has no event to wait for: offer it to Safari visitors who are not
     already on the home screen and have not turned it down before. */
  if (!standalone && read() !== 'dismissed' && (isIOS || deferred)) reveal();
}

init();
