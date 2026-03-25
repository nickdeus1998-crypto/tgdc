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

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const id = parseInt(params.id)
        const body = await request.json()
        const { title, category, date, content, coverImage, expiresAt } = body || {}

        if (!title || !category || !content) {
            return NextResponse.json({ error: 'title, category, and content are required' }, { status: 400 })
        }

        const updated = await prisma.news.update({
            where: { id },
            data: {
                title,
                category,
                content,
                coverImage: coverImage || null,
                date: date ? new Date(date) : undefined,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            },
        })
        return NextResponse.json(updated, { status: 200 })
    } catch (e) {
        console.error('PUT /api/admin/news/[id] error', e)
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const id = parseInt(params.id)
        await prisma.news.delete({ where: { id } })
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e) {
        console.error('DELETE /api/admin/news/[id] error', e)
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
    }
}
