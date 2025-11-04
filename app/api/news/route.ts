import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const rows = await prisma.news.findMany({ orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] })
    return NextResponse.json(rows, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, category, date, content, images, videos, coverImage } = body || {}
    if (!title || !category || !content) {
      return NextResponse.json({ error: 'title, category, and content are required' }, { status: 400 })
    }
    const payload: any = {
      title,
      category,
      content,
      coverImage: coverImage || null,
    }
    if (date) payload.date = new Date(date)
    if (Array.isArray(images)) payload.images = images
    if (Array.isArray(videos)) payload.videos = videos

    const created = await prisma.news.create({ data: payload })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('POST /api/news error', e)
    return NextResponse.json({ error: 'Failed to save news' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

