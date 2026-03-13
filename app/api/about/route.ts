import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'
// Helpers to parse JSON columns safely
function parseJSON<T>(value: any, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value as T;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export async function GET() {
  try {
    // Use raw SQL to avoid relying on regenerated model typings
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM About WHERE id = 1 LIMIT 1');
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        id: 1,
        heroTitle: '',
        heroSubtitle: '',
        timeline: [],
        background: [],
        missionVision: [],
        coreValues: [],
        stats: [],
      });
    }
    const r = rows[0];
    const result = {
      id: r.id,
      heroTitle: r.heroTitle ?? '',
      heroSubtitle: r.heroSubtitle ?? '',
      timeline: parseJSON(r.timeline, [] as any[]),
      background: parseJSON(r.background, [] as any[]),
      missionVision: parseJSON(r.missionVision, [] as any[]),
      coreValues: parseJSON(r.coreValues, [] as any[]),
      stats: parseJSON(r.stats, [] as any[]),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/about error:', error);
    return NextResponse.json({ error: 'Failed to fetch About data' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      heroTitle = '',
      heroSubtitle = '',
      timeline = [],
      background = [],
      missionVision = [],
      coreValues = [],
      stats = [],
    } = body || {};

    const now = new Date().toISOString();
    // Upsert using SQLite ON CONFLICT
    await prisma.$executeRawUnsafe(
      `INSERT INTO About (id, heroTitle, heroSubtitle, timeline, background, missionVision, coreValues, stats, createdAt, updatedAt)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         heroTitle=excluded.heroTitle,
         heroSubtitle=excluded.heroSubtitle,
         timeline=excluded.timeline,
         background=excluded.background,
         missionVision=excluded.missionVision,
         coreValues=excluded.coreValues,
         stats=excluded.stats,
         updatedAt=excluded.updatedAt`,
      heroTitle,
      heroSubtitle,
      JSON.stringify(timeline),
      JSON.stringify(background),
      JSON.stringify(missionVision),
      JSON.stringify(coreValues),
      JSON.stringify(stats),
      now,
      now,
    );

    // Return updated row
    const updated: any[] = await prisma.$queryRawUnsafe('SELECT * FROM About WHERE id = 1');
    const r = updated[0] || {};
    const result = {
      id: r.id ?? 1,
      heroTitle: r.heroTitle ?? heroTitle,
      heroSubtitle: r.heroSubtitle ?? heroSubtitle,
      timeline: parseJSON(r.timeline, timeline),
      background: parseJSON(r.background, background),
      missionVision: parseJSON(r.missionVision, missionVision),
      coreValues: parseJSON(r.coreValues, coreValues),
      stats: parseJSON(r.stats, stats),
      createdAt: r.createdAt ?? now,
      updatedAt: r.updatedAt ?? now,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/about error:', error);
    return NextResponse.json({ error: 'Failed to save About data' }, { status: 500 }); }
}
