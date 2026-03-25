import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ---------- In-memory rate limiter for chat messages ----------
const chatRateMap = new Map<string, { count: number; resetAt: number }>()
const CHAT_MAX_PER_WINDOW = 10   // max messages per window
const CHAT_WINDOW_MS = 60_000    // 1-minute window
const MAX_MESSAGE_LENGTH = 2000  // max characters per message

function checkChatRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = chatRateMap.get(ip)
    if (!entry || now > entry.resetAt) {
        chatRateMap.set(ip, { count: 1, resetAt: now + CHAT_WINDOW_MS })
        return true
    }
    if (entry.count >= CHAT_MAX_PER_WINDOW) return false
    entry.count++
    return true
}

function getClientIp(request: Request): string {
    const xff = request.headers.get('x-forwarded-for')
    return xff?.split(',')[0]?.trim() || '0.0.0.0'
}
// ---------------------------------------------------------------


// POST: visitor sends a follow-up message to an existing session
export async function POST(request: Request) {
    try {
        // Rate limit check
        const ip = getClientIp(request)
        if (!checkChatRateLimit(ip)) {
            return NextResponse.json({ error: 'Too many messages. Please wait a moment.' }, { status: 429 })
        }

        const body = await request.json().catch(() => null)
        const { sessionId, message } = body || {}
        if (!sessionId || !message) {
            return NextResponse.json({ error: 'sessionId and message required' }, { status: 400 })
        }

        // Input validation: enforce message length
        if (typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json({ error: 'Message must be a non-empty string' }, { status: 400 })
        }
        const sanitizedMessage = message.slice(0, MAX_MESSAGE_LENGTH).trim()

        const session = await prisma.supportChat.findUnique({ where: { id: Number(sessionId) } })
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

        const msgs = Array.isArray(session.messages) ? session.messages : []
        const updated = [
            ...msgs,
            { role: 'visitor', content: sanitizedMessage, time: new Date().toISOString() } as any,
        ]

        await prisma.supportChat.update({
            where: { id: session.id },
            data: { messages: updated },
        })

        return NextResponse.json({ ok: true, messages: updated })
    } catch (e) {
        console.error('Chat send error', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
