import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'

const prisma = new PrismaClient()

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
    const items = await prisma.sustainabilityProject.findMany({ orderBy: { id: 'desc' } })
    return NextResponse.json(items)
  } catch (e) {
    console.error('ADMIN sustainability projects list error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const created = await prisma.sustainabilityProject.create({ data: {
      name: body.name,
      status: body.status,
      location: body.location,
      description: body.description,
      badgeColor: body.badgeColor,
      badgeTextColor: body.badgeTextColor,
      badgeBorderColor: body.badgeBorderColor,
      isOpen: !!body.isOpen,
    }})
    return NextResponse.json(created)
  } catch (e) {
    console.error('ADMIN sustainability project create error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

