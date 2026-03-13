import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'


function getPayload(request: Request) {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    return token ? verifyJwt(token, getJwtSecret()) : null
}

// GET: admin-only — list all support chat sessions
export async function GET(request: Request) {
    try {
        const payload = getPayload(request)
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sessions = await prisma.supportChat.findMany({
            orderBy: { updatedAt: 'desc' },
        })

        const items = sessions.map(s => {
            const msgs = Array.isArray(s.messages) ? s.messages as any[] : []
            const lastMsg = msgs[msgs.length - 1]
            return {
                id: s.id,
                email: s.email,
                phone: s.phone,
                name: s.name,
                lastMessage: lastMsg?.content || '',
                lastRole: lastMsg?.role || '',
                messageCount: msgs.length,
                closedAt: s.closedAt,
                createdAt: s.createdAt,
                updatedAt: s.updatedAt,
            }
        })

        return NextResponse.json({ items })
    } catch (e) {
        console.error('Chat sessions list error', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    } finally {
    }
}
