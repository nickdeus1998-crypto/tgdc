import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


export async function GET() {
    try {
        const rows = await prisma.news.findMany({
            orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
        })
        return NextResponse.json({ items: rows }, { status: 200 })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
    } finally {
    }
}

export async function POST(request: Request) {
    try {
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
    } finally {
    }
}
