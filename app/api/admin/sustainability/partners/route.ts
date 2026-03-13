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
    const items = await prisma.sustainabilityPartner.findMany({ orderBy: { id: 'desc' } })
    return NextResponse.json(items)
  } catch (e) {
    console.error('ADMIN sustainability partners list error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const created = await prisma.sustainabilityPartner.create({ data: {
      name: body.name,
      url: body.url,
      initial: body.initial,
      category: body.category,
      badgeColor: body.badgeColor,
      badgeTextColor: body.badgeTextColor,
      badgeBorderColor: body.badgeBorderColor,
    }})
    return NextResponse.json(created)
  } catch (e) {
    console.error('ADMIN sustainability partner create error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

