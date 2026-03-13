import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


// GET /api/static-pages?slug=privacy-policy  →  single page
// GET /api/static-pages                      →  all pages
export async function GET(request: NextRequest) {
    try {
        const slug = request.nextUrl.searchParams.get('slug');

        if (slug) {
            const rows: any[] = await prisma.$queryRawUnsafe(
                'SELECT * FROM StaticPage WHERE slug = ? LIMIT 1',
                slug,
            );
            if (!rows.length) {
                return NextResponse.json({ slug, title: '', content: '' });
            }
            return NextResponse.json(rows[0]);
        }

        const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM StaticPage ORDER BY slug ASC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('GET /api/static-pages error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    } finally {
    }
}

// POST /api/static-pages  { slug, title, content }
export async function POST(request: NextRequest) {
    try {
        const { slug, title, content } = await request.json();
        if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });

        const now = new Date().toISOString();

        // Upsert by slug
        const existing: any[] = await prisma.$queryRawUnsafe(
            'SELECT id FROM StaticPage WHERE slug = ? LIMIT 1',
            slug,
        );

        if (existing.length) {
            await prisma.$executeRawUnsafe(
                'UPDATE StaticPage SET title = ?, content = ?, updatedAt = ? WHERE slug = ?',
                title || '',
                content || '',
                now,
                slug,
            );
        } else {
            await prisma.$executeRawUnsafe(
                'INSERT INTO StaticPage (slug, title, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
                slug,
                title || '',
                content || '',
                now,
                now,
            );
        }

        const updated: any[] = await prisma.$queryRawUnsafe(
            'SELECT * FROM StaticPage WHERE slug = ? LIMIT 1',
            slug,
        );
        return NextResponse.json(updated[0] || { slug, title, content });
    } catch (error) {
        console.error('POST /api/static-pages error:', error);
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    } finally {
    }
}
