import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getJwtSecret, verifyJwt } from '@/app/lib/auth';


function getInternalPayload(request: Request) {
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;
    const payload = token ? verifyJwt(token, getJwtSecret()) : null;
    return payload; // Any valid internal user (admin, editor, viewer)
}

export async function GET(request: Request) {
    try {
        const payload = getInternalPayload(request);
        if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const items = await prisma.repositoryItem.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const role = (payload.role || '').toLowerCase();
        return NextResponse.json({
            items,
            canManage: role === 'admin' || role === 'hr',
        });
    } catch (e) {
        console.error('ADMIN repository list error', e);
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
        const { title, category, url, description, fileType, fileSize } = body || {};

        if (!title || !category || !url) {
            return NextResponse.json({ error: 'Title, category and URL are required' }, { status: 400 });
        }

        const created = await prisma.repositoryItem.create({
            data: {
                title,
                category,
                url,
                description: description || null,
                fileType: fileType || null,
                fileSize: fileSize || null,
                uploadedBy: payload.name || payload.email || 'Admin',
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error('ADMIN repository create error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
