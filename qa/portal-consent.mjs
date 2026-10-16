#!/usr/bin/env node
/**
 * Authenticated guardian UI journey for WhatsApp consent.
 * Uses a temporary synthetic portal store and a test-only secret; never touches
 * the production store or sends messages.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { launch, newPage } from './lib/browser.mjs';

const port = 18000 + (process.pid % 10000);
const base = `http://127.0.0.1:${port}`;
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ummah-portal-consent-'));
const dataFile = path.join(tempDir, 'store.json');
const child = spawn(process.execPath, ['portal/src/server.mjs'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORTAL_PORT: String(port),
    PORTAL_DATA: dataFile,
    PORTAL_SECRET: 'test-only-guardian-consent-secret',
    PORTAL_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
child.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
child.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });
let browser;

async function waitForServer() {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Portal exited early.\n${serverOutput}`);
    try {
      const response = await fetch(`${base}/api/health`);
      if (response.ok) return;
    } catch { /* server is starting */ }
    await delay(250);
  }
  throw new Error(`Portal did not become healthy.\n${serverOutput}`);
}

try {
  await waitForServer();
  browser = await launch();
  const page = await newPage(browser, { width: 1280, height: 900 });
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.locator('form[data-action="login"] input[name="email"]').fill('fatima.rahman@example.com');
  await page.locator('form[data-action="login"] input[name="password"]').fill('Sakinah-Family-2026');
  await page.locator('form[data-action="login"] button[type="submit"]').click();
  await page.waitForFunction(() => location.pathname === '/app', { timeout: 10_000 });

  await page.goto(`${base}/app/families/fam_rahman`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('form[data-action="whatsapp-consent"] input[name="status"][value="opted_in"]');

  const readConsent = () => page.evaluate(async () => {
    const response = await fetch('/api/families/fam_rahman', { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Family API returned ${response.status}`);
    const dto = await response.json();
    return dto.myGuardian?.whatsappConsent;
  });

  if (await readConsent() !== 'unknown') throw new Error('Synthetic guardian should start with unknown consent.');

  await page.evaluate(() => {
    const form = [...document.querySelectorAll('form[data-action="whatsapp-consent"]')]
      .find((item) => item.querySelector('input[name="status"]')?.value === 'opted_in');
    if (!form) throw new Error('Opt-in control is missing.');
    form.requestSubmit();
  });
  await page.waitForFunction(async () => {
    const response = await fetch('/api/families/fam_rahman', { credentials: 'same-origin' });
    const dto = await response.json();
    return dto.myGuardian?.whatsappConsent === 'opted_in';
  }, { timeout: 10_000 });

  await page.evaluate(() => {
    const form = [...document.querySelectorAll('form[data-action="whatsapp-consent"]')]
      .find((item) => item.querySelector('input[name="status"]')?.value === 'opted_out');
    if (!form) throw new Error('Opt-out control is missing.');
    form.requestSubmit();
  });
  await page.waitForFunction(async () => {
    const response = await fetch('/api/families/fam_rahman', { credentials: 'same-origin' });
    const dto = await response.json();
    return dto.myGuardian?.whatsappConsent === 'opted_out';
  }, { timeout: 10_000 });

  if (pageErrors.length) throw new Error(`Browser errors: ${pageErrors.join('; ')}`);
  console.log('✓ Portal guardian consent journey passed: login → unknown → opt-in → opt-out.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    delay(3_000),
  ]);
  for (const file of [dataFile, `${dataFile}.tmp`]) {
    try { fs.rmSync(file, { force: true }); } catch { /* cleanup is best-effort */ }
  }
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { /* cleanup is best-effort */ }
}
