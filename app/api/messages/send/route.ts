import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const uid = Number(payload.uid)

    const { toUserId, content } = await request.json()
    if (!toUserId || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const created = await prisma.userMessage.create({
      data: { senderId: uid, recipientId: Number(toUserId), content },
    })
    return NextResponse.json({ message: created }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

