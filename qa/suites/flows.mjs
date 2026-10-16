/**
 * flows — the two conversion journeys, end to end, in every language.
 *  1. Booking wizard: 3 steps with validation → thank-you page → WhatsApp hand-off whose
 *     message is in the visitor's language and ends with the bilingual language line.
 *  2. Placement test: every track, answered to the end → result with a level, a
 *     recommendation, a prefilled booking link and a WhatsApp share.
 *  3. Illustrated next-step choices preserve the visitor language and reach real pages.
 */
import { newPage, open } from '../lib/browser.mjs';
import { PREFIX } from '../lib/pages.mjs';

// The team reads English and Arabic; other languages end with a bilingual line (src/locales/<lang>/booking.ts).
const LANG_LINE = {
  en: null,
  ar: null,
  de: 'Sprache / Language: Deutsch (de)',
  fr: 'Langue / Language\u00a0: français (fr)',
  it: 'Lingua / Language: italiano (it)',
};

async function booking(browser, base, lang) {
  const problems = [];
  const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
  try {
    await open(page, `${base}${PREFIX[lang]}/contact/#book`);
    await page.waitForSelector('[data-booking]');
    // step 1 — submitting empty must show the validation state, not advance
    await page.click('[data-bstep].is-active [data-next]');
    const blocked = await page.evaluate(() => document.querySelector('[data-bstep].is-active')?.hasAttribute('data-invalid-learner'));
    if (!blocked) problems.push('step 1 advanced without a learner');
    await page.evaluate(() => {
      document.querySelector('input[name="learner"]').click();
      document.querySelector('input[name="course"]').click();
    });
    await page.click('[data-bstep].is-active [data-next]');
    // step 2 — defaults are preselected
    await page.click('[data-bstep].is-active [data-next]');
    // step 3 — contact details
    const step = await page.evaluate(() => [...document.querySelectorAll('[data-bstep]')].findIndex((s) => s.classList.contains('is-active')));
    if (step !== 2) problems.push(`expected step 3, on step ${step + 1}`);
    await page.type('#bk-first', 'Test');
    await page.evaluate(() => {
      const c = document.querySelector('#bk-country');
      c.value = [...c.options].find((o) => o.value)?.value ?? '';
      c.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.type('#bk-wa', '+44 7700 900123');
    await Promise.all([page.waitForNavigation({ waitUntil: 'load' }), page.click('button[type=submit]')]);
    const ty = await page.evaluate(() => ({
      path: location.pathname,
      wa: document.querySelector('[data-ty-wa]')?.getAttribute('href') ?? '',
    }));
    if (!ty.path.endsWith('/thank-you/')) problems.push(`landed on ${ty.path}, expected …/thank-you/`);
    const text = decodeURIComponent(ty.wa.split('text=')[1] || '');
    if (!ty.wa.startsWith('https://wa.me/971502760242')) problems.push(`WhatsApp link goes to ${ty.wa.slice(0, 40)}`);
    if (!text.includes('Test')) problems.push('WhatsApp message lacks the first name');
    const line = LANG_LINE[lang];
    if (line && !text.includes(line)) problems.push(`WhatsApp message lacks the language line "${line}"`);
  } catch (e) {
    problems.push(`error: ${e.message}`);
  } finally {
    await page.close();
  }
  return problems;
}

async function placement(browser, base, lang) {
  const problems = [];
  const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
  try {
    await open(page, `${base}${PREFIX[lang]}/placement-test/`);
    const tracks = await page.$$eval('input[name="pt-track"]', (els) => els.map((e) => e.value));
    if (tracks.length < 4) problems.push(`${tracks.length} tracks, expected 4`);
    for (const t of tracks) {
      await page.evaluate((v) => {
        document.querySelector('[data-restart]')?.click();
        document.querySelector(`input[name="pt-track"][value="${v}"]`).click();
      }, t);
      for (let guard = 0; guard < 30; guard++) {
        const done = await page.evaluate(() => !document.querySelector('[data-step="result"]').hidden);
        if (done) break;
        await page.evaluate(() => document.querySelector('[data-q-options] input')?.click());
        await new Promise((r) => setTimeout(r, 320));
      }
      const r = await page.evaluate(() => ({
        shown: !document.querySelector('[data-step="result"]').hidden,
        level: document.querySelector('[data-r-level]')?.textContent?.trim(),
        course: document.querySelector('[data-r-course]')?.textContent?.trim(),
        book: document.querySelector('[data-r-book]')?.getAttribute('href') ?? '',
        wa: document.querySelector('[data-r-wa]')?.getAttribute('href') ?? '',
      }));
      if (!r.shown) problems.push(`${t}: never reached the result`);
      else {
        if (!r.level || !r.course) problems.push(`${t}: empty level or recommendation`);
        if (!r.book.includes('/contact/?course=')) problems.push(`${t}: booking link not prefilled (${r.book})`);
        if (!r.wa.startsWith('https://wa.me/')) problems.push(`${t}: WhatsApp share missing`);
      }
    }
  } catch (e) {
    problems.push(`error: ${e.message}`);
  } finally {
    await page.close();
  }
  return problems;
}

async function nextSteps(browser, base, lang) {
  const problems = [];
  const page = await newPage(browser, { width: 390, height: 844, mobile: true, touch: true });
  const routes = ['/courses/', '/placement-test/', '/contact/#book'];
  try {
    for (let i = 0; i < routes.length; i++) {
      await open(page, `${base}${PREFIX[lang]}/resources/`);
      const count = await page.$$eval('.next-step a', (els) => els.length);
      if (count !== 3) { problems.push(`expected 3 next-step choices, got ${count}`); break; }
      const expected = `${PREFIX[lang]}${routes[i]}`;
      const href = await page.$eval(`.next-step:nth-child(${i + 1}) a`, (el) => el.getAttribute('href'));
      if (href !== expected) problems.push(`choice ${i + 1}: expected ${expected}, got ${href}`);
      await page.locator(`.next-step:nth-child(${i + 1}) a`).scroll();
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        page.locator(`.next-step:nth-child(${i + 1}) a`).click(),
      ]);
      const destination = new URL(page.url());
      if (`${destination.pathname}${destination.hash}` !== expected) problems.push(`choice ${i + 1} landed on ${destination.pathname}${destination.hash}`);
      if (await page.$$eval('h1', (els) => els.length) !== 1) problems.push(`choice ${i + 1}: missing destination heading`);
    }
  } catch (e) {
    problems.push(`error: ${e.message}`);
  } finally {
    await page.close();
  }
  return problems;
}

export default async function flows({ browser, base, opts }) {
  const failures = [];
  let checked = 0;
  for (const lang of opts.langs) {
    for (const [name, fn] of [
      ['booking', booking],
      ['placement', placement],
      ['next steps', nextSteps],
    ]) {
      const problems = await fn(browser, base, lang);
      checked++;
      problems.forEach((p) => failures.push({ page: `${PREFIX[lang]}/ ${name}`, detail: p }));
    }
  }
  return { checked, unit: 'flow', failures };
}
