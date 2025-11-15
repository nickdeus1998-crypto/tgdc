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

const normalizeFeatures = (value: any) => {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeTimeline = (value: any) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => ({
      phase: String(entry?.phase || '').trim(),
      status: String(entry?.status || '').trim(),
      date: String(entry?.date || '').trim(),
    }))
    .filter((entry) => entry.phase || entry.status || entry.date);
};

const normalizeImpact = (value: any) => ({
  jobs: String(value?.jobs || '').trim(),
  co2: String(value?.co2 || '').trim(),
  homes: String(value?.homes || '').trim(),
  investment: String(value?.investment || '').trim(),
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    const body = await request.json();
    const data: any = {};

    const assignIfString = (key: string) => {
      if (key in body) data[key] = String(body[key] ?? '').trim();
    };
    ['slug', 'title', 'location', 'category', 'status', 'capacity', 'investment', 'description', 'imageUrl'].forEach(
      assignIfString
    );

    if ('progress' in body) {
      const value = Number(body.progress);
      data.progress = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    }
    if ('keyFeatures' in body) data.keyFeatures = normalizeFeatures(body.keyFeatures);
    if ('timeline' in body) data.timeline = normalizeTimeline(body.timeline);
    if ('impact' in body) data.impact = normalizeImpact(body.impact);

    const updated = await prisma.projectHighlight.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('ADMIN project highlights update error', error);
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
    await prisma.projectHighlight.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('ADMIN project highlights delete error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
