import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'
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
    const formatted = rows.map(row => ({
      ...row,
      attachments: Array.isArray(row.attachments) ? row.attachments : [],
    }))
    return NextResponse.json({ messages: formatted })
  } catch (e) {
    return NextResponse.json({ messages: [] }, { status: 200 }) }
}
