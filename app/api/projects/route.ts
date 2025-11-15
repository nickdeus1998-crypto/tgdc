import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mapProject = (project: any) => ({
  id: project.slug,
  title: project.title,
  location: project.location,
  category: project.category,
  status: project.status,
  capacity: project.capacity,
  investment: project.investment,
  progress: project.progress,
  description: project.description,
  keyFeatures: Array.isArray(project.keyFeatures) ? project.keyFeatures : [],
  timeline: Array.isArray(project.timeline) ? project.timeline : [],
  impact: project.impact ?? {},
  imageUrl: project.imageUrl || null,
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get('limit');
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : undefined;
    const take =
      typeof parsedLimit === 'number' && !Number.isNaN(parsedLimit) && parsedLimit > 0 ? parsedLimit : undefined;

    const projects = await prisma.projectHighlight.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json({ items: projects.map(mapProject) });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
