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
        const faqs: any[] = await prisma.$queryRawUnsafe('SELECT * FROM FAQ ORDER BY "order" ASC');
        return NextResponse.json({ items: faqs });
    } catch (error) {
        console.error('ADMIN FAQ list error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function POST(request: Request) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const body = await request.json();

        if (!body.question || !body.answer) {
            return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
        }

        const question = String(body.question).trim();
        const answer = String(body.answer).trim();
        const order = Number(body.order || 0);

        await prisma.$executeRawUnsafe(
            'INSERT INTO FAQ (question, answer, "order", updatedAt) VALUES (?, ?, ?, ?)',
            question, answer, order, new Date().toISOString()
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('ADMIN FAQ create error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
