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
        if (!payload || !['admin', 'hr'].includes((payload.role || '').toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        const body = await request.json().catch(() => null);
        const { name, designation, position, department, email, phone, location, bio, imageUrl } = body || {};

        if (!name || !designation || !position) {
            return NextResponse.json({ error: 'Name, designation and position are required' }, { status: 400 });
        }

        const updated = await prisma.employee.update({
            where: { id },
            data: {
                name,
                designation,
                position,
                department: department || null,
                email: email || null,
                phone: phone || null,
                location: location || null,
                bio: bio || null,
                imageUrl: imageUrl || null,
            },
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error('ADMIN employees update error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const payload = getInternalPayload(request);
        if (!payload || !['admin', 'hr'].includes((payload.role || '').toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

        await prisma.employee.delete({
            where: { id },
        });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('ADMIN employees delete error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
