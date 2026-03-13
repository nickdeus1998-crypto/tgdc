import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyJwt, getJwtSecret } from '@/app/lib/auth';


const isAdmin = (request: Request) => {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    return payload?.role === 'admin';
};

export async function GET(request: Request) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        let settings = await prisma.impactHighlightSettings.findFirst();
        if (!settings) {
            settings = await prisma.impactHighlightSettings.create({ data: {} });
        }
        return NextResponse.json({ sectionTitle: settings.sectionTitle });
    } catch (error) {
        console.error('ADMIN impact-highlights settings GET error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function PUT(request: Request) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const body = await request.json();
        const sectionTitle = String(body.sectionTitle || '').trim() || 'Project Impact Highlights';
        let settings = await prisma.impactHighlightSettings.findFirst();
        if (settings) {
            settings = await prisma.impactHighlightSettings.update({
                where: { id: settings.id },
                data: { sectionTitle },
            });
        } else {
            settings = await prisma.impactHighlightSettings.create({ data: { sectionTitle } });
        }
        return NextResponse.json({ sectionTitle: settings.sectionTitle });
    } catch (error) {
        console.error('ADMIN impact-highlights settings PUT error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
