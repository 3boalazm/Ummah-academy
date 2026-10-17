#!/usr/bin/env node
/**
 * Creates the FIRST production state file: one admin, the real course and plan catalogue,
 * and nothing else. No demo people, no demo password, `meta.demo = false`.
 * This is the explicit, operator-run bootstrap that PORTAL_ENV=production requires.
 *
 *   node portal/scripts/provision.mjs --out portal/data/store.json \
 *        --email admin@ummahacademy.net --name "Academy Owner" --nameAr "مالك الأكاديمية" \
 *        --credentials portal/.provision/credentials.txt
 *
 * The admin password comes from PORTAL_ADMIN_PASSWORD, or is generated. It is never printed:
 * it goes to --credentials (mode 0600 where the OS supports it). Change it at first sign-in
 * from "My profile". The script refuses to overwrite an existing state file.
 */
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from '../src/domain/auth.mjs';
import { passwordProblem } from '../src/domain/profiles.mjs';
import { buildSeed } from '../src/domain/seed.mjs';

const KEEP = new Set(['courses', 'plans']);

export function generatePassword() {
  // 24 characters from an unambiguous alphabet: ~120 bits of entropy.
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(24);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function buildProductionState({ email, name, nameAr, password, now = new Date() }) {
  const problem = passwordProblem(password, { email });
  if (problem) throw new Error(`Admin password rejected: ${problem.message}`);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('A valid admin email is required.');
  const seed = buildSeed(now);
  const state = {};
  for (const [key, value] of Object.entries(seed)) {
    if (key === 'meta') continue;
    state[key] = Array.isArray(value) ? (KEEP.has(key) ? structuredClone(value) : []) : structuredClone(value);
  }
  state.meta = {
    version: 1,
    demo: false,
    provisionedAt: now.toISOString(),
    note: 'Production state. Created by portal/scripts/provision.mjs. No demo records.',
  };
  state.users = [
    {
      id: 'usr_owner',
      role: 'admin',
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      name,
      nameAr,
      timezone: 'Africa/Cairo',
      locale: 'ar',
      status: 'active',
      teacherId: null,
      studentId: null,
      guardianId: null,
      familyId: null,
      pwv: 0,
    },
  ];
  return state;
}

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

function main() {
  const out = path.resolve(arg('out', 'portal/data/store.json'));
  const credentials = path.resolve(arg('credentials', 'portal/.provision/credentials.txt'));
  const email = arg('email', 'admin@ummahacademy.net');
  const name = arg('name', 'Academy Owner');
  const nameAr = arg('nameAr', 'مالك الأكاديمية');
  if (fs.existsSync(out)) {
    console.error(`Refusing to overwrite ${out}. Move it away first if you really mean to start over.`);
    process.exit(1);
  }
  const supplied = process.env.PORTAL_ADMIN_PASSWORD || '';
  const password = supplied || generatePassword();
  const state = buildProductionState({ email, name, nameAr, password });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(state), { mode: 0o600 });
  if (!supplied) {
    const secret = randomBytes(32).toString('hex');
    fs.mkdirSync(path.dirname(credentials), { recursive: true });
    fs.writeFileSync(
      credentials,
      [
        'Ummah Academy portal — first-run credentials. Keep this file private and delete it after the first sign-in.',
        `Admin sign-in: ${email}`,
        `Admin password: ${password}`,
        `PORTAL_SECRET (set as an environment variable on the host): ${secret}`,
        '',
      ].join('\n'),
      { mode: 0o600 },
    );
    console.log(`State written to ${out}`);
    console.log(`Credentials written to ${credentials} (not printed). Change the password from "My profile" after signing in.`);
  } else {
    console.log(`State written to ${out} using PORTAL_ADMIN_PASSWORD.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
