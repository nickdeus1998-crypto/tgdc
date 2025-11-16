import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )stakeholder_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.sid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const cursor = url.searchParams.get('cursor')
    const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 20), 1), 100)

    const items = await prisma.stakeholderMessage.findMany({
      where: { stakeholderId: Number(payload.sid) },
      orderBy: { id: 'desc' },
      take: limit,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      skip: cursor ? 1 : 0,
      select: { id: true, subject: true, content: true, sentAt: true, senderRole: true },
    })

    const nextCursor = items.length === limit ? items[items.length - 1].id : null
    return NextResponse.json({ items, nextCursor })
  } catch (e) {
    console.error('LIST MESSAGES error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
