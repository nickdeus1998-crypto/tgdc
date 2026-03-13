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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await request.json()

    const patch: any = {}
    if (typeof body.slug === 'string') patch.slug = body.slug
    if (typeof body.title === 'string') patch.title = body.title
    if (typeof body.summary === 'string') patch.summary = body.summary
    if (body.details != null) {
      patch.details = Array.isArray(body.details) ? body.details : String(body.details).split(/\r?\n/).filter(Boolean)
    }
    if (typeof body.tag === 'string' || body.tag === null) patch.tag = body.tag
    if (typeof body.zone === 'string') patch.zone = body.zone
    if (body.lat != null) {
      const lat = Number(body.lat)
      if (Number.isNaN(lat) || lat < -90 || lat > 90) return NextResponse.json({ error: 'Invalid lat' }, { status: 400 })
      patch.lat = lat
    }
    if (body.lng != null) {
      const lng = Number(body.lng)
      if (Number.isNaN(lng) || lng < -180 || lng > 180) return NextResponse.json({ error: 'Invalid lng' }, { status: 400 })
      patch.lng = lng
    }

    const updated = await prisma.geothermalSite.update({ where: { id }, data: patch })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('ADMIN geosites update error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.geothermalSite.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('ADMIN geosites delete error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

