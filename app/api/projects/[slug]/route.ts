import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


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
    resources: Array.isArray(project.resources) ? project.resources : [],
    imageUrl: project.imageUrl || null,
});

export async function GET(
    req: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM ProjectHighlight WHERE slug = ? LIMIT 1', slug);
        const project = rows && rows.length > 0 ? rows[0] : null;

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Parse JSON fields for SQLite compatibility if needed
        const parsedProject = {
            ...project,
            keyFeatures: typeof project.keyFeatures === 'string' ? JSON.parse(project.keyFeatures) : project.keyFeatures,
            timeline: typeof project.timeline === 'string' ? JSON.parse(project.timeline) : project.timeline,
            impact: typeof project.impact === 'string' ? JSON.parse(project.impact) : project.impact,
            resources: typeof project.resources === 'string' ? JSON.parse(project.resources) : project.resources,
        };

        return NextResponse.json(mapProject(parsedProject));
    } catch (error) {
        console.error('GET /api/projects/[slug] error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } finally {
    }
}
