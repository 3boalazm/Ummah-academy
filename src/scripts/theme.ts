/**
 * Theme switcher (light ⇄ dark).
 *
 * The effective theme is written on <html data-theme> by the inline script in
 * BaseLayout before the first paint, so this module never has to "apply" a theme
 * on load — it only flips it, remembers the choice and keeps the two toggles
 * (header bar + mobile sheet) and the browser chrome in sync.
 */
import { track } from './analytics';

export const THEME_KEY = 'ua:theme';
export type Theme = 'light' | 'dark';

const root = document.documentElement;

/** Chrome/Android status bar + iOS standalone bar follow this meta. */
const THEME_COLOR: Record<Theme, string> = { light: '#f4f1f8', dark: '#140e20' };

export const theme = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');

export function setTheme(next: Theme) {
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode: the choice still applies to this page */
  }
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) meta.content = THEME_COLOR[next];
  syncToggles(next);
}

/** Label + icon of every toggle describe the action it will perform. */
function syncToggles(current: Theme) {
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((btn) => {
    const label = btn.dataset[current === 'dark' ? 'labelLight' : 'labelDark'];
    if (label) {
      btn.setAttribute('aria-label', label);
      const text = btn.querySelector('[data-theme-toggle-label]');
      if (text) text.textContent = label;
    }
  });
}

document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const next: Theme = theme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    track('theme_switch', { to: next });
  });
});

syncToggles(theme());
