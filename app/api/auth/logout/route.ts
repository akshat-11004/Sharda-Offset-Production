import { NextResponse } from 'next/server';
import { clearOwnerSession } from '@/lib/auth/session';

export async function POST() {
  await clearOwnerSession();
  return NextResponse.json({ ok: true });
}
