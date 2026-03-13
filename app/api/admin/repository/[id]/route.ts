import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtSecret, verifyJwt } from '@/app/lib/auth';


function getAdminPayload(request: Request) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    const role = (payload?.role || '').toLowerCase();
    return (role === 'admin' || role === 'hr') ? payload : null;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const payload = getAdminPayload(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = Number(params.id);
        const body = await request.json().catch(() => null);
        const { title, category, url, description, fileType, fileSize } = body || {};

        if (!title || !category || !url) {
            return NextResponse.json({ error: 'Title, category and URL are required' }, { status: 400 });
        }

        const updated = await prisma.repositoryItem.update({
            where: { id },
            data: {
                title,
                category,
                url,
                description: description || null,
                fileType: fileType || null,
                fileSize: fileSize || null,
            },
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error('ADMIN repository update error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const payload = getAdminPayload(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const id = Number(params.id);
        await prisma.repositoryItem.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('ADMIN repository delete error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
