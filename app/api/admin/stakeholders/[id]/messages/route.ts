import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'
import { sendMail } from '@/app/lib/email'
function getAdminPayload(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
  const token = m ? decodeURIComponent(m[1]) : null
  const payload = token ? verifyJwt(token, getJwtSecret()) : null
  return payload?.role === 'admin' ? payload : null
}

function isAdmin(request: Request) {
  return Boolean(getAdminPayload(request))
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(req as unknown as Request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const stakeholderId = Number(params.id)
    if (!stakeholderId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get('cursor')
    const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 100)

    const items = await prisma.stakeholderMessage.findMany({
      where: { stakeholderId },
      orderBy: { id: 'desc' },
      take: limit,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      skip: cursor ? 1 : 0,
      select: { id: true, subject: true, content: true, sentAt: true, senderRole: true },
    })

    const nextCursor = items.length === limit ? items[items.length - 1].id : null
    return NextResponse.json({ items, nextCursor })
  } catch (e) {
    console.error('ADMIN stakeholder messages error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getAdminPayload(req as unknown as Request)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const stakeholderId = Number(params.id)
    if (!stakeholderId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const { subject, content } = await req.json().catch(() => ({ subject: null, content: null }))
    if (!subject || !content) return NextResponse.json({ error: 'Missing subject or content' }, { status: 400 })

    const stakeholder = await prisma.stakeholder.findUnique({ where: { id: stakeholderId } })
    if (!stakeholder) return NextResponse.json({ error: 'Stakeholder not found' }, { status: 404 })

    const message = await prisma.stakeholderMessage.create({
      data: {
        stakeholderId,
        subject,
        content,
        senderRole: 'admin',
      },
    })

    if (stakeholder.email) {
      await sendMail({
        to: stakeholder.email,
        subject: `TGDC response: ${subject}`,
        text: `Hello ${stakeholder.name || 'there'},\n\n${content}\n\n— TGDC Admin Team`,
      })
    }

    return NextResponse.json({ ok: true, id: message.id })
  } catch (e) {
    console.error('ADMIN stakeholder reply error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
