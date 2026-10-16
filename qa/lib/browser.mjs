/**
 * Chrome for the QA suites. puppeteer-core never downloads a browser: we use the
 * one on the machine (CI runners and most laptops have Chrome) or CHROME_PATH.
 */
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const CANDIDATES = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

export const chromePath = () => CANDIDATES.find((p) => p && fs.existsSync(p));

export async function launch() {
  const executablePath = chromePath();
  if (!executablePath) {
    throw new Error('No Chrome/Chromium found. Install Chrome or set CHROME_PATH=/path/to/chrome');
  }
  return puppeteer.launch({
    executablePath,
    headless: true,
    protocolTimeout: 240_000,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--font-render-hinting=none', '--hide-scrollbars', '--mute-audio', '--no-first-run'],
  });
}

/**
 * A page with QA defaults:
 *  - the language hint is suppressed (it appears after 900 ms and would cover content),
 *    unless `hint` is set;
 *  - reduced motion, so reveals and transitions settle instantly.
 */
export async function newPage(browser, { width = 1280, height = 900, dpr = 1, mobile = false, touch = false, hint = false, languages, userAgent, isolated = false } = {}) {
  // isolated: a fresh browser context, so localStorage from earlier pages (e.g. the hint
  // suppression flag) does not leak in; the context closes with the page.
  const context = isolated ? await browser.createBrowserContext() : null;
  const page = await (context ?? browser).newPage();
  if (context) page.once('close', () => context.close().catch(() => {}));
  await page.setViewport({ width, height, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: touch });
  if (userAgent) await page.setUserAgent(userAgent);
  if (!hint) {
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('ua:lang', 'qa');
      } catch {
        /* storage disabled */
      }
    });
  }
  if (languages) {
    await page.evaluateOnNewDocument((langs) => {
      Object.defineProperty(navigator, 'languages', { get: () => langs });
      Object.defineProperty(navigator, 'language', { get: () => langs[0] });
    }, languages);
  }
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.setDefaultTimeout(30_000);
  return page;
}

/** Load a URL and wait until web fonts are ready, so measurements are final. */
export async function open(page, url) {
  const res = await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return res;
}

/** Freeze motion and show every reveal-on-scroll element (needed before axe contrast checks). */
export async function settle(page) {
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
  await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')));
}
