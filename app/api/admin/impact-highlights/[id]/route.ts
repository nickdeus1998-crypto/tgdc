import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJwt, getJwtSecret } from '@/app/lib/auth';

const prisma = new PrismaClient();

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
    const patch: any = {};
    ['title', 'catchy', 'description', 'imageUrl', 'primaryHref', 'secondaryHref', 'tag'].forEach((key) => {
      if (key in body) patch[key] = body[key] === null ? null : String(body[key] ?? '').trim();
    });
    if ('isActive' in body) patch.isActive = Boolean(body.isActive);
    const updated = await prisma.impactHighlight.update({ where: { id }, data: patch });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('ADMIN impact highlights update error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await prisma.impactHighlight.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('ADMIN impact highlights delete error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
