import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


// Helpers to parse JSON columns safely
function parseJSON<T>(value: any, fallback: T): T {
    if (value == null) return fallback;
    if (typeof value !== 'string') return value as T;
    try { return JSON.parse(value) as T; } catch { return fallback; }
}

export async function GET() {
    try {
        const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM DirectUsePage WHERE id = 1 LIMIT 1');
        if (!rows || rows.length === 0) {
            return NextResponse.json({
                id: 1,
                heroTitle: 'Direct Use Projects',
                heroSubtitle: 'Sustainable Geothermal Heat Applications',
                introTitle: 'Projects',
                introContent: 'In order to maximize geothermal resource utilization...',
                strategicProjects: [],
                roadmap: [],
                showUtilization: true,
            });
        }
        const r = rows[0];
        const result = {
            id: r.id,
            heroTitle: r.heroTitle ?? '',
            heroSubtitle: r.heroSubtitle ?? '',
            introTitle: r.introTitle ?? '',
            introContent: r.introContent ?? '',
            strategicProjects: parseJSON(r.strategicProjects, [] as any[]),
            roadmap: parseJSON(r.roadmap, [] as any[]),
            showUtilization: r.showUtilization === 1 || r.showUtilization === true || r.showUtilization === 'true',
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        };
        return NextResponse.json(result);
    } catch (error) {
        console.error('GET /api/projects-page error:', error);
        return NextResponse.json({ error: 'Failed to fetch Projects Page data' }, { status: 500 });
    } finally {
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            heroTitle = '',
            heroSubtitle = '',
            introTitle = '',
            introContent = '',
            strategicProjects = [],
            roadmap = [],
            showUtilization = true,
        } = body || {};

        const now = new Date().toISOString();
        // Upsert using SQLite ON CONFLICT
        await prisma.$executeRawUnsafe(
            `INSERT INTO DirectUsePage (id, heroTitle, heroSubtitle, introTitle, introContent, strategicProjects, roadmap, showUtilization, createdAt, updatedAt)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         heroTitle=excluded.heroTitle,
         heroSubtitle=excluded.heroSubtitle,
         introTitle=excluded.introTitle,
         introContent=excluded.introContent,
         strategicProjects=excluded.strategicProjects,
         roadmap=excluded.roadmap,
         showUtilization=excluded.showUtilization,
         updatedAt=excluded.updatedAt`,
            heroTitle,
            heroSubtitle,
            introTitle,
            introContent,
            JSON.stringify(strategicProjects),
            JSON.stringify(roadmap),
            showUtilization ? 1 : 0,
            now,
            now,
        );

        // Return updated row
        const updated: any[] = await prisma.$queryRawUnsafe('SELECT * FROM DirectUsePage WHERE id = 1');
        const r = updated[0] || {};
        const result = {
            id: r.id ?? 1,
            heroTitle: r.heroTitle ?? heroTitle,
            heroSubtitle: r.heroSubtitle ?? heroSubtitle,
            introTitle: r.introTitle ?? introTitle,
            introContent: r.introContent ?? introContent,
            strategicProjects: parseJSON(r.strategicProjects, strategicProjects),
            roadmap: parseJSON(r.roadmap, roadmap),
            showUtilization: r.showUtilization === 1 || r.showUtilization === true || r.showUtilization === 'true',
            createdAt: r.createdAt ?? now,
            updatedAt: r.updatedAt ?? now,
        };
        return NextResponse.json(result);
    } catch (error) {
        console.error('POST /api/projects-page error:', error);
        return NextResponse.json({ error: 'Failed to save Projects Page data' }, { status: 500 });
    } finally {
    }
}
