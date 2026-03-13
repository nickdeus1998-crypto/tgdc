import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
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
    } finally {
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        await prisma.news.delete({ where: { id } })
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e) {
        console.error('DELETE /api/admin/news/[id] error', e)
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
    } finally {
    }
}
