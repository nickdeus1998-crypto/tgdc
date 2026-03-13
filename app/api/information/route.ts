import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Cast to any to avoid type errors before prisma generate
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kind = searchParams.get('kind') || undefined
    const limit = Number(searchParams.get('limit') || '0')
    const where = kind ? { kind } : {}
    const rows = await prisma.informationItem.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      take: limit && limit > 0 ? limit : undefined,
    })
    return NextResponse.json(rows)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch information items' }, { status: 500 }) }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { kind, title, description, url, thumbnail, date } = body || {}
    if (!kind || !title || !url) {
      return NextResponse.json({ error: 'kind, title and url are required' }, { status: 400 })
    }
    const created = await prisma.informationItem.create({
      data: {
        kind: String(kind),
        title: String(title),
        description: description ? String(description) : null,
        url: String(url),
        thumbnail: thumbnail ? String(thumbnail) : null,
        date: date ? new Date(date) : undefined,
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create information item' }, { status: 500 }) }
}
