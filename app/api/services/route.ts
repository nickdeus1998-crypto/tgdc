import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const section = await prisma.serviceSection.findFirst({
      include: { services: true },
    });

    if (!section) {
      return NextResponse.json({
        headerOne: '',
        headerTwo: '',
        subheader: '',
        mandate: '',
        mandateTitle: '',
        mandateVisibleOnHomepage: false,
        ctaTitle: '',
        ctaSubtitle: '',
        ctaPrimaryLabel: '',
        ctaPrimaryHref: '',
        ctaSecondaryLabel: '',
        ctaSecondaryHref: '',
        services: []
      });
    }

    return NextResponse.json({
      headerOne: section.headerOne,
      headerTwo: section.headerTwo || '',
      subheader: section.subheader || '',
      mandate: section.mandate || '',
      mandateTitle: section.mandateTitle || '',
      mandateVisibleOnHomepage: section.mandateVisibleOnHomepage,
      ctaTitle: section.ctaTitle || '',
      ctaSubtitle: section.ctaSubtitle || '',
      ctaPrimaryLabel: section.ctaPrimaryLabel || '',
      ctaPrimaryHref: section.ctaPrimaryHref || '',
      ctaSecondaryLabel: section.ctaSecondaryLabel || '',
      ctaSecondaryHref: section.ctaSecondaryHref || '',
      services: section.services.map(s => ({
        ...s,
        features: s.features as string[] || [], // Cast JSON to array
      })),
    });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      headerOne,
      headerTwo,
      subheader,
      mandate,
      mandateTitle,
      mandateVisibleOnHomepage,
      ctaTitle,
      ctaSubtitle,
      ctaPrimaryLabel,
      ctaPrimaryHref,
      ctaSecondaryLabel,
      ctaSecondaryHref,
      services
    } = data;

    if (!headerOne || !Array.isArray(services)) {
      return NextResponse.json({ error: 'A valid section header and services list are required' }, { status: 400 });
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
        mandate: mandate || null,
        mandateTitle: mandateTitle || null,
        mandateVisibleOnHomepage: !!mandateVisibleOnHomepage,
        ctaTitle: ctaTitle || null,
        ctaSubtitle: ctaSubtitle || null,
        ctaPrimaryLabel: ctaPrimaryLabel || null,
        ctaPrimaryHref: ctaPrimaryHref || null,
        ctaSecondaryLabel: ctaSecondaryLabel || null,
        ctaSecondaryHref: ctaSecondaryHref || null,
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
      mandate: updatedSection?.mandate || '',
      mandateTitle: updatedSection?.mandateTitle || '',
      mandateVisibleOnHomepage: updatedSection?.mandateVisibleOnHomepage || false,
      ctaTitle: updatedSection?.ctaTitle || '',
      ctaSubtitle: updatedSection?.ctaSubtitle || '',
      ctaPrimaryLabel: updatedSection?.ctaPrimaryLabel || '',
      ctaPrimaryHref: updatedSection?.ctaPrimaryHref || '',
      ctaSecondaryLabel: updatedSection?.ctaSecondaryLabel || '',
      ctaSecondaryHref: updatedSection?.ctaSecondaryHref || '',
      services: updatedSection?.services.map(s => ({
        ...s,
        features: s.features as string[] || [],
      })) || [],
    });
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
