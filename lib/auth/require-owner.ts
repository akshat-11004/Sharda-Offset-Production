import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOwnerId } from './session';

export async function requireOwner() {
  const userId = await getOwnerId();
  if (!userId) redirect('/admin/login');
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } });
  if (!user || user.role !== 'OWNER') redirect('/admin/login');
  return user;
}
