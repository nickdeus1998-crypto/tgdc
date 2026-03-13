import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'


// GET: public — returns whether chat is online
export async function GET() {
    try {
        const row = await prisma.siteSetting.findUnique({ where: { key: 'chat_online' } })
        return NextResponse.json({ online: row?.value === 'true' })
    } catch {
        return NextResponse.json({ online: false })
    } finally {
    }
}

// POST: admin-only — toggle online/offline
export async function POST(request: Request) {
    try {
        const cookie = request.headers.get('cookie') || ''
        const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
        const token = m ? decodeURIComponent(m[1]) : null
        const payload = token ? verifyJwt(token, getJwtSecret()) : null
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const online = body.online === true

        await prisma.siteSetting.upsert({
            where: { key: 'chat_online' },
            update: { value: String(online) },
            create: { key: 'chat_online', value: String(online) },
        })

        return NextResponse.json({ online })
    } catch (e) {
        console.error('Chat status toggle error', e)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    } finally {
    }
}
