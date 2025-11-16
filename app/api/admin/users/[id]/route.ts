import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getJwtSecret, hashPassword, verifyJwt } from '@/app/lib/auth';

const prisma = new PrismaClient();

function getAdminPayload(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|; )user_token=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  const payload = token ? verifyJwt(token, getJwtSecret()) : null;
  return payload?.role === 'admin' ? payload : null;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = getAdminPayload(request);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const data: { name?: string | null; email?: string; role?: string; password?: string } = {};
    if ('name' in body) data.name = body.name?.trim() || null;
    if ('email' in body) data.email = body.email?.trim();
    if ('role' in body) data.role = body.role?.trim() || 'admin';
    if (body.password) data.password = await hashPassword(body.password);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('ADMIN user update error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const payload = getAdminPayload(request);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    const currentId = typeof payload.uid === 'number' ? payload.uid : Number(payload.uid);
    if (currentId === id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e?.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.error('ADMIN user delete error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
