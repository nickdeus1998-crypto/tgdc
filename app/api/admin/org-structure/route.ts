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

const mapLeader = (leader: any) => ({
  id: leader.id,
  levelLabel: leader.levelLabel,
  levelOrder: leader.levelOrder,
  columnOrder: leader.columnOrder,
  name: leader.name,
  role: leader.role,
  imageUrl: leader.imageUrl,
  isActive: leader.isActive,
});

export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const leaders = await prisma.orgLeader.findMany({ orderBy: [{ levelOrder: 'asc' }, { columnOrder: 'asc' }] });
    return NextResponse.json({ items: leaders.map(mapLeader) });
  } catch (error) {
    console.error('ADMIN org-structure list error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const created = await prisma.orgLeader.create({
      data: {
        levelLabel: String(body.levelLabel || 'Leadership Tier'),
        levelOrder: Number(body.levelOrder ?? 0),
        columnOrder: Number(body.columnOrder ?? 0),
        name: String(body.name || '').trim(),
        role: String(body.role || '').trim(),
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });
    return NextResponse.json(mapLeader(created));
  } catch (error) {
    console.error('ADMIN org-structure create error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
