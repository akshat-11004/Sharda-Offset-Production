import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'sharda_owner_session';
const MAX_AGE = 60 * 60 * 8;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters.');
  return value;
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function createSessionToken(userId: string) {
  const payload = `${userId}.${Date.now()}.${randomBytes(8).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string) {
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [userId, issuedAt, nonce, signature] = parts;
  const payload = `${userId}.${issuedAt}.${nonce}`;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE * 1000) return null;
  return userId;
}

export async function setOwnerSession(userId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function clearOwnerSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}

export async function getOwnerId() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifySessionToken(token) : null;
}
