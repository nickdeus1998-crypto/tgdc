import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

// Cast to any to avoid type errors before prisma generate
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const row = await prisma.informationItem.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 }) }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await req.json()
    const { kind, title, description, url, thumbnail, date } = body || {}
    const data: any = {}
    if (typeof kind === 'string') data.kind = kind
    if (typeof title === 'string') data.title = title
    if (typeof description === 'string') data.description = description
    if (typeof url === 'string') data.url = url
    if (typeof thumbnail === 'string') data.thumbnail = thumbnail
    if (date) data.date = new Date(date)
    const updated = await prisma.informationItem.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.informationItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
}
