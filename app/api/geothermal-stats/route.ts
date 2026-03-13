import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, getJwtSecret } from '@/app/lib/auth';


function isAdmin(req: NextRequest) {
    const cookie = req.headers.get('cookie') || '';
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = m ? decodeURIComponent(m[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    return payload?.role === 'admin';
}

export async function GET() {
    try {
        const stats = await prisma.geothermalStat.findMany({ orderBy: { sortOrder: 'asc' } });
        return NextResponse.json(stats);
    } catch (error) {
        console.error('GET /api/geothermal-stats error', error);
        return NextResponse.json([], { status: 500 });
    } finally {
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const body: { label: string; value: string }[] = await request.json();

        await prisma.geothermalStat.deleteMany();

        if (body.length > 0) {
            await prisma.geothermalStat.createMany({
                data: body.map((s, i) => ({ label: s.label, value: s.value, sortOrder: i })),
            });
        }

        const updated = await prisma.geothermalStat.findMany({ orderBy: { sortOrder: 'asc' } });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('POST /api/geothermal-stats error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
