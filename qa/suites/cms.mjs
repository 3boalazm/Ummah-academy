/**
 * cms — the content editor at /admin/ boots against our config.yml: Sveltia CMS validates
 * the configuration at runtime and shows any error on its sign-in screen. We expect the
 * token sign-in button and no configuration error.
 * In CI the pinned bundle loads from unpkg, so the browser also enforces the SRI hash.
 * Offline (sandbox), set SVELTIA_BUNDLE=/path/to/sveltia-cms.js to serve a local copy.
 */
import fs from 'node:fs';
import { newPage } from '../lib/browser.mjs';

export default async function cms({ browser, base }) {
  const failures = [];
  const page = await newPage(browser, { width: 1280, height: 900 });
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && /config/i.test(m.text()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(`page error: ${e.message}`));
  const local = process.env.SVELTIA_BUNDLE;
  if (local) {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      if (/^https:\/\/unpkg\.com\/@sveltia\/cms@[\d.]+\/dist\/sveltia-cms\.js/.test(u)) {
        req.respond({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: fs.readFileSync(local) });
      } else if (u.startsWith(base) || u.startsWith('data:')) req.continue();
      else req.abort();
    });
  }
  try {
    await page.goto(`${base}/admin/`, { waitUntil: 'load' });
    const state = await page
      .waitForFunction(
        () => {
          const t = document.body.innerText;
          if (/error in the CMS configuration/i.test(t)) return 'config-error';
          if (/Sign In Using Access Token/i.test(t)) return 'ready';
          return false;
        },
        { timeout: 30_000 }
      )
      .then((h) => h.jsonValue())
      .catch(() => 'timeout');
    const text = await page.evaluate(() => document.body.innerText.slice(0, 600));
    if (state === 'config-error') failures.push({ page: '/admin/', detail: `configuration error: ${text.replace(/\s+/g, ' ')}` });
    if (state === 'timeout') failures.push({ page: '/admin/', detail: `the CMS did not reach its sign-in screen (SRI mismatch, CDN down or script error?): ${text.replace(/\s+/g, ' ').slice(0, 200)}` });
    errors.forEach((e) => failures.push({ page: '/admin/', detail: e }));
  } finally {
    await page.close();
  }
  return { checked: 1, unit: 'CMS boot', failures };
}
