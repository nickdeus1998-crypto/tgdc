import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const otherId = Number(searchParams.get('userId'))
    if (!otherId) return NextResponse.json({ messages: [] }, { status: 200 })

    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.uid) return NextResponse.json({ messages: [] }, { status: 200 })
    const uid = Number(payload.uid)

    const rows = await prisma.userMessage.findMany({
      where: {
        OR: [
          { senderId: uid, recipientId: otherId },
          { senderId: otherId, recipientId: uid },
        ],
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ messages: rows })
  } catch (e) {
    return NextResponse.json({ messages: [] }, { status: 200 })
  } finally {
    await prisma.$disconnect()
  }
}

