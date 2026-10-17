/**
 * keyboard — the site driven with nothing but a keyboard, which is also how screen-reader
 * and switch-access visitors move. Every check here is invisible to the other suites:
 *
 *  A. Structure, on every page: exactly one h1, no skipped heading levels, no positive tabindex
 *     (it breaks document order).
 *  B. Journeys, on real pages:
 *     1. the skip link is the first thing Tab reaches, is visible when focused, and Enter
 *        lands inside <main>
 *     2. a 40-step Tab walk: every focused element shows a visible indicator, nothing traps
 *        focus, and the walk never stalls on one element
 *     3. the mega menu opens with Enter, its links are reachable with Tab, Escape closes it
 *        and returns focus to the button
 *     4. the language menu (native <details>) behaves the same way
 *     5. the mobile <dialog> trap: focus goes in, Tab x12 never leaves it, Escape closes and
 *        restores focus to the menu button
 *     6. the booking wizard is completable with the keyboard alone, and an empty submit
 *        marks the field aria-invalid, points at the error text and moves focus to it
 */
import { newPage, open, settle } from '../lib/browser.mjs';
import { PREFIX, pool } from '../lib/pages.mjs';

/** Structure of the whole document, read once (runs in the page). */
export function structure() {
  const problems = [];
  const visible = (el) => !el.closest('.sr-only, [hidden], dialog:not([open]), template');
  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visible);
  const h1s = headings.filter((h) => h.tagName === 'H1');
  if (h1s.length !== 1) problems.push(`${h1s.length} × h1 (expected exactly 1): ${h1s.map((h) => (h.textContent || '').trim().slice(0, 40)).join(' / ')}`);
  for (let i = 1; i < headings.length; i++) {
    const prev = Number(headings[i - 1].tagName[1]);
    const next = Number(headings[i].tagName[1]);
    if (next - prev > 1) problems.push(`heading level jumps ${headings[i - 1].tagName} → ${headings[i].tagName} at "${(headings[i].textContent || '').trim().slice(0, 60)}"`);
  }
  const positive = [...document.querySelectorAll('[tabindex]')].filter((el) => Number(el.getAttribute('tabindex')) > 0);
  if (positive.length) problems.push(`positive tabindex (breaks document order): ${positive.slice(0, 3).map((el) => el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]).join(', ')}`);
  return problems.slice(0, 4);
}

/**
 * The focused element, whether it shows a visible focus indicator, and a stable name for it
 * (runs in the page). The indicator is usually on the element itself, but cards draw the ring
 * on an ancestor (`.track-card:has(h3 a:focus-visible)`) — those only exist while focused, so
 * the ancestor chain is compared with and without focus.
 */
export function focused() {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { tag: 'body' };
  const paint = (n) => {
    const s = getComputedStyle(n);
    return `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}|${s.boxShadow}`;
  };
  const ring = (n) => {
    const s = getComputedStyle(n);
    return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 1) || (s.boxShadow && s.boxShadow !== 'none');
  };
  const chain = [];
  for (let n = el, i = 0; n && i < 5; n = n.parentElement, i++) chain.push(n);
  let indicator = chain.some(ring);
  let restored = true;
  if (!indicator && !el.closest('[data-mega],[data-langmenu],[data-menu]') && el instanceof HTMLElement) {
    // a ring that appears only while focus is inside is still a visible indicator
    const before = chain.map(paint);
    el.blur();
    indicator = before.some((v, i) => v !== chain.map(paint)[i]);
    el.focus({ preventScroll: true });
    restored = document.activeElement === el;
  }
  const label = (el.getAttribute('aria-label') || (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30) || '').trim();
  return {
    tag: el.tagName.toLowerCase(),
    name: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').filter(Boolean)[0] : ''}`,
    key: `${el.tagName}|${el.id}|${el.getAttribute('href') || ''}|${label}`,
    label,
    indicator,
    restored,
  };
}

const pressTab = async (page, times = 1) => {
  for (let i = 0; i < times; i++) await page.keyboard.press('Tab');
  return page.evaluate(focused);
};

/**
 * Tab until the focused element matches the selector (or give up). A radio group only ever
 * takes one Tab stop, so a group that already has focus counts as a match.
 */
async function tabTo(page, selector, limit = 80) {
  for (let i = 0; i <= limit; i++) {
    if (await page.evaluate((sel) => document.activeElement?.matches?.(sel) ?? false, selector)) return true;
    await page.keyboard.press('Tab');
  }
  return false;
}

export default async function keyboard({ browser, base, pages, opts }) {
  const failures = [];
  let checked = 0;

  /* A · structure, every page in every language */
  await pool(pages, opts.concurrency, async (pg) => {
    const page = await newPage(browser, { width: 1280, height: 900 });
    try {
      await open(page, base + pg.url);
      await settle(page);
      checked += 1;
      for (const d of await page.evaluate(structure)) failures.push({ page: pg.url, detail: d });
    } catch (e) {
      failures.push({ page: pg.url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  });

  /* B · journeys */
  for (const lang of opts.langs) {
    const url = PREFIX[lang] + '/';
    const page = await newPage(browser, { width: 1280, height: 900 });
    try {
      await open(page, base + url);
      await settle(page);

      /* 1 · skip link */
      const first = await pressTab(page);
      checked += 1;
      if (!first.name?.includes('skip-link')) failures.push({ page: url, detail: `the first Tab lands on ${first.name ?? first.tag}, not the skip link` });
      else if (!first.indicator) failures.push({ page: url, detail: 'the focused skip link has no visible indicator' });
      await page.keyboard.press('Enter');
      const inMain = await page.evaluate(() => !!document.activeElement?.closest('#main') || location.hash === '#main');
      if (!inMain) failures.push({ page: url, detail: 'activating the skip link does not move to <main>' });

      /* 2 · a 40-step walk: visible indicator, no trap */
      await open(page, base + url);
      await settle(page);
      const seen = [];
      for (let i = 0; i < 40; i++) {
        const f = await pressTab(page);
        if (f.tag === 'body') {
          failures.push({ page: url, detail: `Tab #${i + 1} left the document (focus fell back to <body>)` });
          break;
        }
        if (!f.restored) failures.push({ page: url, detail: `focus could not be restored to ${f.name} while probing (Tab #${i + 1})` });
        if (!f.indicator) failures.push({ page: url, detail: `no visible focus indicator on ${f.name}${f.label ? ` (“${f.label}”)` : ''} (Tab #${i + 1})` });
        seen.push(f.key);
      }
      checked += 1;
      const stalled = seen.filter((n, i) => i >= 2 && n === seen[i - 1] && n === seen[i - 2]);
      if (stalled.length) failures.push({ page: url, detail: `focus stalls on ${stalled[0].split('|')[0]} (three Tabs in a row) — keyboard users are stuck` });
      if (new Set(seen).size < 10) failures.push({ page: url, detail: `only ${new Set(seen).size} distinct stops in 40 Tabs — content is unreachable by keyboard` });
    } catch (e) {
      failures.push({ page: url, detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 3 + 4 · the two menus, by keyboard, in one language (behaviour, not translation) */
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    try {
      await open(page, base + '/');
      await settle(page);

      checked += 1;
      if (!(await tabTo(page, '[data-mega-toggle]', 30))) failures.push({ page: '/', detail: 'the Courses button is not reachable with Tab' });
      await page.keyboard.press('Enter');
      const openState = await page.evaluate(() => ({
        expanded: document.querySelector('[data-mega-toggle]')?.getAttribute('aria-expanded'),
        open: document.querySelector('[data-mega]')?.hasAttribute('data-open'),
      }));
      if (openState.expanded !== 'true' || !openState.open) failures.push({ page: '/', detail: `Enter on the Courses button did not open the mega menu: ${JSON.stringify(openState)}` });
      const intoPanel = await tabTo(page, '.mega__panel a, .mega__panel button', 12);
      if (!intoPanel) failures.push({ page: '/', detail: 'Tab does not move into the open mega menu' });
      await page.keyboard.press('Escape');
      const afterEsc = await page.evaluate(() => ({
        open: document.querySelector('[data-mega]')?.hasAttribute('data-open'),
        back: document.activeElement?.hasAttribute?.('data-mega-toggle') ?? false,
      }));
      if (afterEsc.open) failures.push({ page: '/', detail: 'Escape does not close the mega menu' });
      if (!afterEsc.back) failures.push({ page: '/', detail: 'Escape does not return focus to the Courses button' });

      checked += 1;
      if (!(await tabTo(page, '[data-langmenu] > summary', 400))) failures.push({ page: '/', detail: 'the language menu is not reachable with Tab' });
      await page.keyboard.press('Enter');
      if (!(await page.evaluate(() => document.querySelector('[data-langmenu]')?.open))) failures.push({ page: '/', detail: 'Enter does not open the language menu' });
      await page.keyboard.press('Escape');
      const langAfter = await page.evaluate(() => ({ open: document.querySelector('[data-langmenu]')?.open, back: document.activeElement?.tagName === 'SUMMARY' }));
      if (langAfter.open) failures.push({ page: '/', detail: 'Escape does not close the language menu' });
      if (!langAfter.back) failures.push({ page: '/', detail: 'Escape does not return focus to the language menu button' });
    } catch (e) {
      failures.push({ page: '/', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 5 · the mobile dialog trap */
  {
    const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
    try {
      await open(page, base + '/');
      await settle(page);
      checked += 1;
      if (!(await tabTo(page, '[data-menu-open]', 20))) failures.push({ page: '/ (phone)', detail: 'the menu button is not reachable with Tab' });
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-menu][open]', { timeout: 3000 });
      const inside = await page.evaluate(() => !!document.activeElement?.closest('[data-menu]'));
      if (!inside) failures.push({ page: '/ (phone)', detail: 'opening the mobile menu does not move focus into the sheet' });
      let escaped = false;
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        const ok = await page.evaluate(() => !!document.activeElement?.closest('[data-menu]'));
        if (!ok) {
          escaped = true;
          break;
        }
      }
      if (escaped) failures.push({ page: '/ (phone)', detail: 'Tab leaves the open mobile menu — focus escapes to the page behind it' });
      await page.keyboard.press('Escape');
      await new Promise((r) => setTimeout(r, 200));
      const closed = await page.evaluate(() => ({ open: document.querySelector('[data-menu]')?.hasAttribute('open'), back: document.activeElement?.hasAttribute?.('data-menu-open') ?? false }));
      if (closed.open) failures.push({ page: '/ (phone)', detail: 'Escape does not close the mobile menu' });
      if (!closed.back) failures.push({ page: '/ (phone)', detail: 'closing the mobile menu does not return focus to the button that opened it' });
    } catch (e) {
      failures.push({ page: '/ (phone)', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  /* 6 · the booking wizard, keyboard only */
  {
    const page = await newPage(browser, { width: 1280, height: 900 });
    const nextBtn = '[data-bstep].is-active [data-next], [data-bstep].is-active button[type=submit]';
    try {
      await open(page, base + '/contact/#book');
      await settle(page);
      checked += 1;

      // Entering step 1 with a step already filled in and the radios untouched: an empty submit
      // must reveal the error text, mark the group invalid and put focus on the first option.
      if (!(await tabTo(page, nextBtn, 120))) {
        failures.push({ page: '/contact/', detail: 'the wizard’s next button is not reachable with Tab' });
      } else {
        await page.keyboard.press('Enter');
        const bad = await page.evaluate(() => {
          const step = document.querySelector('[data-bstep].is-active');
          const group = step?.querySelector('.booking__learners');
          const describedBy = group?.getAttribute('aria-describedby') ?? '';
          const err = describedBy ? document.getElementById(describedBy.split(' ')[0]) : null;
          const visible = err ? getComputedStyle(err).display !== 'none' && getComputedStyle(err).visibility !== 'hidden' && !!err.offsetHeight : false;
          return {
            inGroup: !!document.activeElement?.closest('.booking__learners'),
            marked: group?.getAttribute('aria-invalid') === 'true',
            linked: !!err && err.matches('[data-err="learner"]'),
            visible,
            who: document.activeElement?.tagName.toLowerCase(),
          };
        });
        if (!bad.inGroup) failures.push({ page: '/contact/', detail: `an empty submit leaves focus on <${bad.who}> instead of the invalid group` });
        if (!bad.visible) failures.push({ page: '/contact/', detail: 'the error text stays hidden while the group is invalid' });
        if (!bad.marked) failures.push({ page: '/contact/', detail: 'the invalid radio group carries no aria-invalid — a screen reader cannot tell the group is the problem' });
        if (!bad.linked) failures.push({ page: '/contact/', detail: 'the invalid radio group is not linked to its error text (aria-describedby)' });
      }

      // Now complete all three steps without ever touching the mouse.
      const choose = async (name) => {
        if (await page.evaluate((n) => document.activeElement?.matches?.(`input[name="${n}"]`) ?? false, name)) {
          await page.keyboard.press('Space');
        } else if (!(await tabTo(page, `input[name="${name}"]`, 25))) {
          return false;
        } else {
          await page.keyboard.press('Space');
        }
        return page.evaluate((n) => !!document.querySelector(`input[name="${n}"]:checked`), name);
      };
      if (!(await choose('learner'))) failures.push({ page: '/contact/', detail: 'a learner option cannot be chosen with the keyboard' });
      if (!(await choose('course'))) failures.push({ page: '/contact/', detail: 'a course option cannot be chosen with the keyboard' });

      for (const want of [2, 3]) {
        if (!(await tabTo(page, nextBtn, 60))) failures.push({ page: '/contact/', detail: `step ${want - 1}’s next button cannot be reached` });
        await page.keyboard.press('Enter');
        await new Promise((r) => setTimeout(r, 250));
        const stepNow = await page.evaluate(() => [...document.querySelectorAll('[data-bstep]')].findIndex((s) => s.classList.contains('is-active')) + 1);
        if (stepNow !== want) {
          failures.push({ page: '/contact/', detail: `keyboard-only navigation stopped on step ${stepNow}, expected step ${want}` });
          break;
        }
      }

      if (!(await tabTo(page, '#bk-first', 40))) failures.push({ page: '/contact/', detail: 'the first-name field cannot be reached with Tab' });
      else await page.keyboard.type('Keyboard');
      if (!(await tabTo(page, '#bk-country', 12))) failures.push({ page: '/contact/', detail: 'the country list cannot be reached with Tab' });
      else {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
      if (!(await tabTo(page, '#bk-wa', 12))) failures.push({ page: '/contact/', detail: 'the WhatsApp field cannot be reached with Tab' });
      else await page.keyboard.type('+447700900123');

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }).catch(() => null),
        (async () => {
          if (await tabTo(page, 'form[data-booking] button[type=submit]', 30)) await page.keyboard.press('Enter');
          else failures.push({ page: '/contact/', detail: 'the final submit button cannot be reached with Tab' });
        })(),
      ]);
      const landed = await page.evaluate(() => ({ path: location.pathname, filled: document.querySelector('[data-ty-wa]')?.getAttribute('href') ?? '' }));
      checked += 1;
      if (!landed.path.endsWith('/thank-you/')) failures.push({ page: '/contact/', detail: `keyboard-only booking ended on ${landed.path}, expected the thank-you page` });
      else if (!decodeURIComponent(landed.filled).includes('Keyboard')) failures.push({ page: '/contact/', detail: 'the keyboard-only booking lost the name on the way to WhatsApp' });
    } catch (e) {
      failures.push({ page: '/contact/', detail: `error: ${e.message}` });
    } finally {
      await page.close();
    }
  }

  return { checked, unit: 'keyboard check', failures };
}
