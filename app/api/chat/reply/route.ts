import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'


function getPayload(request: Request) {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    return token ? verifyJwt(token, getJwtSecret()) : null
}

// POST: admin replies to a chat session
export async function POST(request: Request) {
    try {
        const payload = getPayload(request)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => null)
        const { sessionId, message } = body || {}
        if (!sessionId || !message) {
            return NextResponse.json({ error: 'sessionId and message required' }, { status: 400 })
        }

        const session = await prisma.supportChat.findUnique({ where: { id: Number(sessionId) } })
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

        const msgs = Array.isArray(session.messages) ? session.messages : []
        const updated = [
            ...msgs,
            { role: 'admin', content: message, time: new Date().toISOString() } as any,
        ]

        await prisma.supportChat.update({
            where: { id: session.id },
            data: { messages: updated },
        })

        return NextResponse.json({ ok: true, messages: updated })
    } catch (e) {
        console.error('Chat reply error', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    } finally {
    }
}
