import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req as unknown as Request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const stakeholderId = Number(params.id)
    if (!stakeholderId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 100)

    const items = await prisma.stakeholderDocument.findMany({
      where: { stakeholderId },
      orderBy: { id: 'desc' },
      take: limit,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      skip: cursor ? 1 : 0,
      select: { id: true, filename: true, mimeType: true, sizeBytes: true, storagePath: true, uploadedAt: true },
    })
    const nextCursor = items.length === limit ? items[items.length - 1].id : null
    return NextResponse.json({ items, nextCursor })
  } catch (e) {
    console.error('ADMIN stakeholder documents error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

