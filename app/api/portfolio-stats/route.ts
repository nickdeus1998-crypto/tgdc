import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJwt, getJwtSecret } from '@/app/lib/auth';


const isAdmin = (request: Request) => {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    return payload?.role === 'admin';
};

// Public GET — no auth needed
export async function GET() {
    try {
        const stats = await prisma.projectPortfolioStat.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json(stats);
    } catch (error) {
        console.error('GET /api/portfolio-stats error', error);
        return NextResponse.json([], { status: 500 });
    } finally {
    }
}

// Admin POST — replace all stats
export async function POST(request: NextRequest) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const body = await request.json();
        const stats: { title: string; value: string; colorFrom: string; colorTo: string }[] = body;

        await prisma.projectPortfolioStat.deleteMany();

        if (stats.length > 0) {
            await prisma.projectPortfolioStat.createMany({
                data: stats.map((s, i) => ({
                    title: s.title,
                    value: s.value,
                    colorFrom: s.colorFrom || '#326101',
                    colorTo: s.colorTo || '#639427',
                    sortOrder: i,
                })),
            });
        }

        const updated = await prisma.projectPortfolioStat.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('POST /api/portfolio-stats error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
