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

const mapMember = (member: any) => ({
  id: member.id,
  levelLabel: member.levelLabel,
  levelOrder: member.levelOrder,
  columnOrder: member.columnOrder,
  name: member.name,
  role: member.role,
  imageUrl: member.imageUrl,
  isActive: member.isActive,
});

export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const members = await prisma.boardCommittee.findMany({ orderBy: [{ levelOrder: 'asc' }, { columnOrder: 'asc' }] });
    return NextResponse.json({ items: members.map(mapMember) });
  } catch (error) {
    console.error('ADMIN board-committee list error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const created = await prisma.boardCommittee.create({
      data: {
        levelLabel: String(body.levelLabel || 'Board Tier'),
        levelOrder: Number(body.levelOrder ?? 0),
        columnOrder: Number(body.columnOrder ?? 0),
        name: String(body.name || '').trim(),
        role: String(body.role || '').trim(),
        imageUrl: body.imageUrl ? String(body.imageUrl).trim() : null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });
    return NextResponse.json(mapMember(created));
  } catch (error) {
    console.error('ADMIN board-committee create error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
