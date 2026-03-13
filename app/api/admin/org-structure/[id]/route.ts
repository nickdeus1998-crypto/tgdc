import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
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
    const data: any = {};
    ['levelLabel', 'name', 'role', 'imageUrl'].forEach((key) => {
      if (key in body) data[key] = body[key] === null ? null : String(body[key] ?? '');
    });
    if ('levelOrder' in body) data.levelOrder = Number(body.levelOrder ?? 0);
    if ('columnOrder' in body) data.columnOrder = Number(body.columnOrder ?? 0);
    if ('isActive' in body) data.isActive = Boolean(body.isActive);
    const updated = await prisma.orgLeader.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('ADMIN org-structure update error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    await prisma.orgLeader.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('ADMIN org-structure delete error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
