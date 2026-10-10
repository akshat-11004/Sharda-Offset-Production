import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { samples: true } } },
  });
  return NextResponse.json(services);
}
