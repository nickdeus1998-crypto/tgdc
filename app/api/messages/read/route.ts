import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'


// Mark all messages from a specific sender as read
export async function POST(request: Request) {
    try {
        const cookie = request.headers.get('cookie') || ''
        const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
        const token = m ? decodeURIComponent(m[1]) : null
        const payload = token ? verifyJwt(token, getJwtSecret()) : null
        if (!payload?.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const uid = Number(payload.uid)

        const body = await request.json().catch(() => null)
        const fromUserId = Number(body?.fromUserId)
        if (!fromUserId) return NextResponse.json({ error: 'fromUserId required' }, { status: 400 })

        await prisma.userMessage.updateMany({
            where: {
                senderId: fromUserId,
                recipientId: uid,
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        })

        return NextResponse.json({ ok: true })
    } catch (e) {
        console.error('Mark read error', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    } finally {
    }
}
