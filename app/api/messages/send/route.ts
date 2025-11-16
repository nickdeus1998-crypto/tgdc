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

    const body = await request.json().catch(() => null)
    const toUserId = Number(body?.toUserId)
    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    const rawAttachments = Array.isArray(body?.attachments) ? body.attachments : []
    if (!toUserId || (!content && rawAttachments.length === 0)) {
      return NextResponse.json({ error: 'Message text or attachments required' }, { status: 400 })
    }

    const attachments = rawAttachments
      .map(att => ({
        name: String(att?.name || '').trim(),
        url: String(att?.url || '').trim(),
        mimeType: String(att?.mimeType || '').trim(),
        sizeBytes: Number(att?.sizeBytes || 0),
      }))
      .filter(att => att.name && att.url && att.sizeBytes >= 0)
      .slice(0, 5)

    const created = await prisma.userMessage.create({
      data: {
        senderId: uid,
        recipientId: toUserId,
        content,
        attachments: attachments.length ? attachments : undefined,
      },
    })
    return NextResponse.json({ message: created }, { status: 201 })
  } catch (e) {
    console.error('USER MESSAGE send error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
