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

interface TimelineEntry {
  phase: string;
  status: string;
  date: string;
}

const normalizeTimeline = (value: any): TimelineEntry[] => {
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

const parsePayload = (body: any) => {
  const data: any = {};
  const required = ['slug', 'title', 'location', 'category', 'status'];
  for (const key of required) {
    if (!body?.[key]) throw new Error(`Missing ${key}`);
    data[key] = String(body[key]).trim();
  }
  data.capacity = String(body?.capacity || '').trim();
  data.investment = String(body?.investment || '').trim();
  data.description = String(body?.description || '').trim();
  const progress = Number(body?.progress ?? 0);
  data.progress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  data.keyFeatures = normalizeFeatures(body?.keyFeatures);
  data.timeline = normalizeTimeline(body?.timeline);
  data.impact = normalizeImpact(body?.impact || {});
  data.imageUrl = body?.imageUrl ? String(body.imageUrl).trim() : null;
  data.resources = Array.isArray(body?.resources)
    ? body.resources.map((r: any) => ({
      type: r.type || 'image',
      url: String(r.url || '').trim(),
      title: String(r.title || '').trim(),
      description: String(r.description || '').trim(),
    }))
    : [];
  return data;
};

const mapAdminProject = (project: any) => ({
  id: project.id,
  slug: project.slug,
  title: project.title,
  location: project.location,
  category: project.category,
  status: project.status,
  capacity: project.capacity,
  investment: project.investment,
  progress: project.progress,
  description: project.description,
  keyFeatures: Array.isArray(project.keyFeatures) ? project.keyFeatures : [],
  timeline: Array.isArray(project.timeline) ? project.timeline : [],
  impact: project.impact ?? { jobs: '', co2: '', homes: '', investment: '' },
  resources: Array.isArray(project.resources) ? project.resources : [],
  imageUrl: project.imageUrl,
});

export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const projects = await prisma.projectHighlight.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ items: projects.map(mapAdminProject) });
  } catch (error) {
    console.error('ADMIN project highlights list error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const data = parsePayload(body);
    const created = await prisma.projectHighlight.create({ data });
    return NextResponse.json(mapAdminProject(created));
  } catch (error: any) {
    console.error('ADMIN project highlights create error', error);
    const message = error?.message?.startsWith('Missing') ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
