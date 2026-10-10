import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  const category = searchParams.get('category')?.trim();
  const featured = searchParams.get('featured') === 'true';
  const requestedLimit = Number(searchParams.get('limit') || 50);
  const take = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
  const samples = await prisma.sample.findMany({
    where: { isActive: true, ...(featured ? { isFeatured: true } : {}), ...(category ? { category: { slug: category } } : {}), ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { tags: { has: q.toLowerCase() } }] } : {}) },
    include: { category: true, service: true, images: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { createdAt: 'desc' },
    take,
  });
  return NextResponse.json(samples);
}
