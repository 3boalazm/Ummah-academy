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

function init() {
  const root = document.querySelector<HTMLElement>('[data-install]');
  const pill = root?.querySelector<HTMLButtonElement>('[data-install-open]');
  const card = root?.querySelector<HTMLElement>('[data-install-card]');
  const native = root?.querySelector<HTMLElement>('[data-install-native]');
  const ios = root?.querySelector<HTMLElement>('[data-install-ios]');
  if (!root || !pill || !card || !native || !ios) return; // the pill is a bonus, never fatal

  let deferred: BeforeInstallPromptEvent | null = null;

  const closeCard = () => {
    card.hidden = true;
    pill.setAttribute('aria-expanded', 'false');
  };

  const hide = (persist: boolean) => {
    root.removeAttribute('data-visible');
    pill.setAttribute('tabindex', '-1');
    closeCard();
    if (persist) remember('dismissed');
  };

  const reveal = () => {
    if (root.hasAttribute('data-visible')) return;
    root.setAttribute('data-visible', '');
    pill.removeAttribute('tabindex');
    track('install_shown', { platform: deferred ? 'prompt' : 'ios' });
  };

  pill.addEventListener('click', () => {
    if (!card.hidden) {
      closeCard();
      return;
    }
    card.hidden = false;
    pill.setAttribute('aria-expanded', 'true');
    native.hidden = !deferred;
    ios.hidden = !!deferred;
    track('install_open');
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

  root.querySelector('[data-install-close]')?.addEventListener('click', closeCard);

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target as Node)) closeCard();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !card.hidden) {
      closeCard();
      pill.focus();
    }
  });

  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we ask from our own pill, not the browser's infobar
    deferred = e as BeforeInstallPromptEvent;
    if (!standalone && read() !== 'dismissed') reveal();
  });

  addEventListener('appinstalled', () => {
    remember('installed');
    hide(false);
    track('installed');
  });

  /* iOS has no event to wait for: offer the pill to Safari visitors who are not
     already on the home screen and have not turned it down before. */
  if (!standalone && read() !== 'dismissed' && (isIOS || deferred)) reveal();
}

init();
