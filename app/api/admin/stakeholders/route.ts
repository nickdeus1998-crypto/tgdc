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

    const list = await prisma.stakeholder.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        phone: true,
        createdAt: true,
        _count: { select: { messages: true, documents: true } },
      },
    })

    return NextResponse.json({ items: list })
  } catch (e) {
    console.error('ADMIN STAKEHOLDERS list error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

