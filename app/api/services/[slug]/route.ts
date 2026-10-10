import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findFirst({
    where: { slug, isActive: true },
    include: { samples: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
  });
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  return NextResponse.json(service);
}
