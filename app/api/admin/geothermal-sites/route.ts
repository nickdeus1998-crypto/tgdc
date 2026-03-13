import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'
function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
  const token = m ? decodeURIComponent(m[1]) : null
  const payload = token ? verifyJwt(token, getJwtSecret()) : null
  return payload?.role === 'admin'
}

export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const items = await prisma.geothermalSite.findMany({ orderBy: { id: 'desc' } })
    return NextResponse.json(items)
  } catch (e) {
    console.error('ADMIN geosites list error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    // Basic validation
    const lat = Number(body.lat)
    const lng = Number(body.lng)
    if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }
    const details = Array.isArray(body.details)
      ? body.details
      : (typeof body.details === 'string' ? body.details.split(/\r?\n/).filter(Boolean) : [])
    const created = await prisma.geothermalSite.create({ data: {
      slug: String(body.slug),
      title: String(body.title),
      summary: String(body.summary),
      details,
      tag: body.tag ? String(body.tag) : null,
      zone: String(body.zone),
      lat,
      lng,
    } })
    return NextResponse.json(created)
  } catch (e) {
    console.error('ADMIN geosites create error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

