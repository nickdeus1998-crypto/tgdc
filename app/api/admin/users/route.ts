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

export async function GET(request: Request) {
  try {
    const payload = getAdminPayload(request);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
    });

    return NextResponse.json({
      items: users,
      currentUserId: typeof payload.uid === 'number' ? payload.uid : Number(payload.uid) || null,
    });
  } catch (e) {
    console.error('ADMIN users list error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const payload = getAdminPayload(request);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    const email = body?.email?.trim();
    const name = body?.name?.trim() || null;
    const password = body?.password;
    const role = body?.role?.trim() || 'admin';
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Email and password (min 6 chars) are required' }, { status: 400 });
    }

    const hashed = await hashPassword(password);
    const created = await prisma.user.create({
      data: { email, name, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, user: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    console.error('ADMIN users create error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
