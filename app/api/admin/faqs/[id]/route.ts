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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

        const body = await request.json();

        const question = String(body.question || '').trim();
        const answer = String(body.answer || '').trim();
        const order = Number(body.order || 0);

        await prisma.$executeRawUnsafe(
            'UPDATE FAQ SET question = ?, answer = ?, "order" = ?, updatedAt = ? WHERE id = ?',
            question, answer, order, new Date().toISOString(), id
        );

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('ADMIN FAQ update error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const id = Number(params.id);
        if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

        await prisma.$executeRawUnsafe('DELETE FROM FAQ WHERE id = ?', id);

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('ADMIN FAQ delete error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
