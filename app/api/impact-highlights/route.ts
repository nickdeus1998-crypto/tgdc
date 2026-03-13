import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
export async function GET() {
  try {
    const items = await prisma.impactHighlight.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        catchy: item.catchy,
        text: item.description,
        image: item.imageUrl,
        primaryHref: item.primaryHref,
        secondaryHref: item.secondaryHref,
        tag: item.tag || undefined,
      })),
    });
  } catch (error) {
    console.error('GET /api/impact-highlights error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
