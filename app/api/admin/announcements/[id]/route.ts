import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtSecret, verifyJwt } from '@/app/lib/auth';


function getInternalPayload(request: Request) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    return payload;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const payload = getInternalPayload(request);
        const role = (payload?.role || '').toLowerCase();
        if (!payload || (role !== 'admin' && role !== 'hr')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const body = await request.json().catch(() => null);
        const { title, content, type, priority, scheduledDate, isActive, isPublic } = body || {};

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const updated = await prisma.announcement.update({
            where: { id },
            data: {
                title,
                content,
                type: type || 'Office Update',
                priority: priority || 'Normal',
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                isActive: isActive !== undefined ? isActive : true,
                isPublic: isPublic === true,
            },
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error('ADMIN announcements update error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const payload = getInternalPayload(request);
        const role = (payload?.role || '').toLowerCase();
        if (!payload || (role !== 'admin' && role !== 'hr')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        await prisma.announcement.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('ADMIN announcements delete error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
