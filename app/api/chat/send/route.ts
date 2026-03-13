import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


// POST: visitor sends a follow-up message to an existing session
export async function POST(request: Request) {
    try {
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
            { role: 'visitor', content: message, time: new Date().toISOString() } as any,
        ]

        await prisma.supportChat.update({
            where: { id: session.id },
            data: { messages: updated },
        })

        return NextResponse.json({ ok: true, messages: updated })
    } catch (e) {
        console.error('Chat send error', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    } finally {
    }
}
