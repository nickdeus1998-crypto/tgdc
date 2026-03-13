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

const mapHighlight = (highlight: any) => ({
  id: highlight.id,
  title: highlight.title,
  catchy: highlight.catchy,
  description: highlight.description,
  imageUrl: highlight.imageUrl,
  primaryHref: highlight.primaryHref,
  secondaryHref: highlight.secondaryHref,
  tag: highlight.tag,
  isActive: highlight.isActive,
});

export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const items = await prisma.impactHighlight.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ items: items.map(mapHighlight) });
  } catch (error) {
    console.error('ADMIN impact highlights list error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const created = await prisma.impactHighlight.create({
      data: {
        title: String(body.title || '').trim(),
        catchy: String(body.catchy || '').trim(),
        description: String(body.description || '').trim(),
        imageUrl: String(body.imageUrl || '').trim() || '/geothermal.jpg',
        primaryHref: String(body.primaryHref || '#').trim(),
        secondaryHref: String(body.secondaryHref || '#').trim(),
        tag: body.tag ? String(body.tag).trim() : null,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });
    return NextResponse.json(mapHighlight(created));
  } catch (error) {
    console.error('ADMIN impact highlights create error', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 }); }
}
