import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sample = await prisma.sample.findFirst({ where: { slug, isActive: true }, include: { category: true, service: true, images: { orderBy: { sortOrder: 'asc' } } } });
  if (!sample) return NextResponse.json({ error: 'Sample not found' }, { status: 404 });
  return NextResponse.json(sample);
}
