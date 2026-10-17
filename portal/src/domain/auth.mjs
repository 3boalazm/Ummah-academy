import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 32, SCRYPT).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.startsWith('scrypt$')) return false;
  const [, salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const got = scryptSync(String(password), salt, 32, SCRYPT);
  const exp = Buffer.from(hash, 'hex');
  if (got.length !== exp.length) return false;
  return timingSafeEqual(got, exp);
}

export function sign(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function unsign(token, secret) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const i = token.lastIndexOf('.');
  const body = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expect = createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export function issueSession(userId, secret, ttlSec, now = Date.now(), pv = 0) {
  return sign({ sub: userId, exp: now + ttlSec * 1000, kind: 'session', pv }, secret);
}

export function readSession(token, secret, now = Date.now()) {
  const payload = unsign(token, secret);
  if (!payload || payload.kind !== 'session' || typeof payload.exp !== 'number' || payload.exp < now) return null;
  return payload;
}

export function issueAssetToken(userId, assetId, secret, ttlSec, now = Date.now()) {
  const exp = now + ttlSec * 1000;
  return {
    token: sign({ sub: userId, assetId, exp, kind: 'asset' }, secret),
    expiresAt: new Date(exp).toISOString(),
  };
}

export function readAssetToken(token, secret, now = Date.now()) {
  const payload = unsign(token, secret);
  if (!payload || payload.kind !== 'asset' || typeof payload.exp !== 'number' || payload.exp < now) return null;
  return payload;
}
