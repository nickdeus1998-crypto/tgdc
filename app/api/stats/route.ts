import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const stats = await prisma.stat.findMany(); // Use the Stat model for all records
    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const stats = await request.json(); // Expect array: [{ title: string, value: number }]
    if (!Array.isArray(stats) || stats.length === 0) {
      return NextResponse.json({ error: 'At least one stat is required' }, { status: 400 });
    }

    // Clear existing records for synchronization
    await prisma.stat.deleteMany();

    // Insert new records
    await prisma.stat.createMany({
      data: stats.map((s: { title: string; value: number }) => ({
        title: s.title,
        value: s.value,
      })),
    });

    // Return updated records
    const updatedStats = await prisma.stat.findMany();
    return NextResponse.json(updatedStats);
  } catch (error) {
    console.error('POST /api/stats error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}