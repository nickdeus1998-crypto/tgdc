import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseJSON<T>(value: any, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value as T;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe('SELECT * FROM Footer ORDER BY id ASC LIMIT 1');
    if (!rows || rows.length === 0) {
      return NextResponse.json({
        id: 1,
        aboutText: 'TGDC advances sustainable geothermal energy in Tanzania.',
        address: '',
        email: '',
        phone: '',
        quickLinks: [
          { label: 'About', url: '/about-us' },
          { label: 'Projects', url: '/projects' },
          { label: 'Contact', url: '/contact' },
        ],
        socialLinks: [
          { name: 'Twitter', url: '#', icon: '<path d="M8 19c11 0 17-9 17-17..." />' },
        ],
        copyright: `\u00A9 ${new Date().getFullYear()} TGDC. All rights reserved.`,
      });
    }
    const r = rows[0];
    const result = {
      id: r.id,
      aboutText: r.aboutText ?? '',
      address: r.address ?? '',
      email: r.email ?? '',
      phone: r.phone ?? '',
      quickLinks: parseJSON(r.quickLinks, [] as any[]),
      socialLinks: parseJSON(r.socialLinks, [] as any[]),
      copyright: r.copyright ?? '',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/footer error:', error);
    return NextResponse.json({ error: 'Failed to fetch footer settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      aboutText = '',
      address = '',
      email = '',
      phone = '',
      quickLinks = [],
      socialLinks = [],
      copyright = `\u00A9 ${new Date().getFullYear()} TGDC. All rights reserved.`,
    } = body || {};

    const now = new Date().toISOString();
    await prisma.$executeRawUnsafe(
      `INSERT INTO Footer (id, aboutText, address, email, phone, quickLinks, socialLinks, copyright, createdAt, updatedAt)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         aboutText = excluded.aboutText,
         address = excluded.address,
         email = excluded.email,
         phone = excluded.phone,
         quickLinks = excluded.quickLinks,
         socialLinks = excluded.socialLinks,
         copyright = excluded.copyright,
         updatedAt = excluded.updatedAt`,
      aboutText,
      address,
      email,
      phone,
      JSON.stringify(quickLinks),
      JSON.stringify(socialLinks),
      copyright,
      now,
      now,
    );

    const updated: any[] = await prisma.$queryRawUnsafe('SELECT * FROM Footer WHERE id = 1');
    const r = updated[0] || {};
    return NextResponse.json({
      id: r.id ?? 1,
      aboutText: r.aboutText ?? aboutText,
      address: r.address ?? address,
      email: r.email ?? email,
      phone: r.phone ?? phone,
      quickLinks: parseJSON(r.quickLinks, quickLinks),
      socialLinks: parseJSON(r.socialLinks, socialLinks),
      copyright: r.copyright ?? copyright,
      createdAt: r.createdAt ?? now,
      updatedAt: r.updatedAt ?? now,
    });
  } catch (error) {
    console.error('POST /api/footer error:', error);
    return NextResponse.json({ error: 'Failed to save footer settings' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

