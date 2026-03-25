import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'

function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
  const token = m ? decodeURIComponent(m[1]) : null
  const payload = token ? verifyJwt(token, getJwtSecret()) : null
  return payload?.role === 'admin'
}

export async function GET(request: Request) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const rows = await prisma.news.findMany({
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        })
        return NextResponse.json({ items: rows }, { status: 200 })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const body = await request.json()
        const { title, category, date, content, coverImage, expiresAt } = body || {}
        if (!title || !category || !content) {
            return NextResponse.json({ error: 'title, category, and content are required' }, { status: 400 })
        }

        const created = await prisma.news.create({
            data: {
                title,
                category,
                content,
                coverImage: coverImage || null,
                date: date ? new Date(date) : new Date(),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            }
        })
        return NextResponse.json(created, { status: 201 })
    } catch (e) {
        console.error('POST /api/admin/news error', e)
        return NextResponse.json({ error: 'Failed to save news' }, { status: 500 })
    }
}
