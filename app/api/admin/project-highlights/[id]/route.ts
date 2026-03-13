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

    // Fetch existing record to compare slug (avoids unique constraint violation when slug is unchanged)
    const existing = await prisma.projectHighlight.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const assignIfString = (key: string) => {
      if (key in body) data[key] = String(body[key] ?? '').trim();
    };

    // Only include slug if it actually changed to avoid P2002 unique constraint error
    if ('slug' in body && String(body.slug).trim() !== existing.slug) {
      data.slug = String(body.slug).trim();
    }

    ['title', 'location', 'category', 'status', 'capacity', 'investment', 'description', 'imageUrl'].forEach(
      assignIfString
    );

    if ('progress' in body) {
      const value = Number(body.progress);
      data.progress = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    }
    if ('keyFeatures' in body) data.keyFeatures = normalizeFeatures(body.keyFeatures);
    if ('timeline' in body) data.timeline = normalizeTimeline(body.timeline);
    if ('impact' in body) data.impact = normalizeImpact(body.impact);
    if ('resources' in body) {
      data.resources = Array.isArray(body.resources)
        ? body.resources.map((r: any) => ({
          type: r.type || 'image',
          url: String(r.url || '').trim(),
          title: String(r.title || '').trim(),
          description: String(r.description || '').trim(),
        }))
        : [];
    }

    const updated = await prisma.projectHighlight.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('ADMIN project highlights update error', error);
    const message = error?.code === 'P2002' ? 'Slug already exists on another project' : (error?.message || 'Server error');
    return NextResponse.json({ error: message }, { status: 400 });
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
  }
}
