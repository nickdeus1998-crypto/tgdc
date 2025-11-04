import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const section = await prisma.serviceSection.findFirst({
      include: { services: true },
    });
    if (!section) {
      return NextResponse.json({ headerOne: '', headerTwo: '', subheader: '', services: [] });
    }
    return NextResponse.json({
      headerOne: section.headerOne,
      headerTwo: section.headerTwo,
      subheader: section.subheader || '',
      services: section.services.map(s => ({
        ...s,
        features: s.features as string[] || [], // Cast JSON to array
      })),
    });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { headerOne, headerTwo, subheader, services } = data;

    if (!headerOne || !headerTwo || !Array.isArray(services)) {
      return NextResponse.json({ error: 'Valid section headers and at least one service are required' }, { status: 400 });
    }

    // Clear existing records
    await prisma.service.deleteMany();
    await prisma.serviceSection.deleteMany();

    // Create new section
    const newSection = await prisma.serviceSection.create({
      data: {
        headerOne,
        headerTwo,
        subheader: subheader || null,
      },
    });

    // Insert services with features as JSON
    if (services.length > 0) {
      await prisma.service.createMany({
        data: services.map((s: { icon: string; title: string; content: string; features: string[] }) => ({
          icon: s.icon,
          title: s.title,
          content: s.content,
          features: s.features || [],
          sectionId: newSection.id,
        })),
      });
    }

    // Return updated
    const updatedSection = await prisma.serviceSection.findFirst({
      where: { id: newSection.id },
      include: { services: true },
    });
    return NextResponse.json({
      headerOne: updatedSection?.headerOne || '',
      headerTwo: updatedSection?.headerTwo || '',
      subheader: updatedSection?.subheader || '',
      services: updatedSection?.services.map(s => ({
        ...s,
        features: s.features as string[] || [],
      })) || [],
    });
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}