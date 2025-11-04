import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'
import { sendMail } from '@/app/lib/email'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )stakeholder_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.sid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { subject, content } = await request.json()
    if (!subject || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const msg = await prisma.stakeholderMessage.create({
      data: { stakeholderId: Number(payload.sid), subject, content },
    })

    await sendMail({
      to: process.env.COMPANY_EMAIL || '',
      subject: `Stakeholder message: ${subject}`,
      text: content,
    })

    return NextResponse.json({ ok: true, id: msg.id })
  } catch (e) {
    console.error('MESSAGE error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

