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

export async function GET(request: Request) {
    try {
        const payload = getInternalPayload(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const announcements = await prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: [
                { scheduledDate: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        const role = (payload.role || '').toLowerCase();
        return NextResponse.json({
            items: announcements,
            canManage: role === 'admin' || role === 'hr',
        });
    } catch (e) {
        console.error('ADMIN announcements list error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function POST(request: Request) {
    try {
        const payload = getInternalPayload(request);
        const role = (payload?.role || '').toLowerCase();
        if (!payload || (role !== 'admin' && role !== 'hr')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const { title, content, type, priority, scheduledDate, isPublic } = body || {};

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        const created = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'Office Update',
                priority: priority || 'Normal',
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                isActive: true,
                isPublic: isPublic === true,
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error('ADMIN announcements create error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
