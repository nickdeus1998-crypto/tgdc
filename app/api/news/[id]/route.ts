import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const row = await prisma.news.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await request.json()
    const { title, category, date, content, images, videos, coverImage } = body || {}
    const data: any = {}
    if (typeof title === 'string') data.title = title
    if (typeof category === 'string') data.category = category
    if (typeof content === 'string') data.content = content
    if (typeof coverImage === 'string') data.coverImage = coverImage
    if (date) data.date = new Date(date)
    if (Array.isArray(images)) data.images = images
    if (Array.isArray(videos)) data.videos = videos
    const updated = await prisma.news.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.news.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
