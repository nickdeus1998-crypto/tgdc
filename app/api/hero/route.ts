// app/api/hero/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
export async function POST(request: Request) {
  try {
    const { title, subheading, highlight, imageUrl } = await request.json();
    if (!title || !subheading) {
      return NextResponse.json({ error: 'Title and subheading are required' }, { status: 400 });
    }
    const hero = await prisma.hero.create({
      data: { title, subheading, highlight, imageUrl: imageUrl || null },
    });
    return NextResponse.json(hero, { status: 201 });
  } catch (error) {
    console.error('Error saving hero data:', error);
    return NextResponse.json({ error: 'Failed to save hero data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const heroes = await prisma.hero.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    return NextResponse.json(heroes[0] || {}, { status: 200 });
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return NextResponse.json({ error: 'Failed to fetch hero data' }, { status: 500 });
  }
}