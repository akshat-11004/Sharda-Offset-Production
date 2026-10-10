import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { setOwnerSession } from '@/lib/auth/session';

function clean(v: unknown) { return typeof v === 'string' ? v.trim() : ''; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = clean(body.email).toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) return NextResponse.json({ ok: false, error: 'Email and password are required.' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true, role: true } });
    if (!user || user.role !== 'OWNER' || !user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ ok: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    await setOwnerSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Owner login failed:', error);
    return NextResponse.json({ ok: false, error: 'Unable to sign in right now.' }, { status: 500 });
  }
}
