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

        const employees = await prisma.employee.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            items: employees,
            canManage: ['admin', 'hr'].includes((payload.role || '').toLowerCase()),
        });
    } catch (e) {
        console.error('ADMIN employees list error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}

export async function POST(request: Request) {
    try {
        const payload = getInternalPayload(request);
        if (!payload || !['admin', 'hr'].includes((payload.role || '').toLowerCase())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const { name, designation, position, department, email, phone, location, bio, imageUrl } = body || {};

        if (!name || !designation || !position) {
            return NextResponse.json({ error: 'Name, designation and position are required' }, { status: 400 });
        }

        const created = await prisma.employee.create({
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

        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        console.error('ADMIN employees create error', e);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    } finally {
    }
}
