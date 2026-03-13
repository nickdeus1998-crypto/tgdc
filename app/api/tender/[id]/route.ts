import prisma from '@/lib/prisma'
import { NextResponse } from "next/server"
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const row = await prisma.tender.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 }) }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await request.json()
    const { ref, title, category, status, deadline, publish, scope, docs } = body || {}
    const data: any = {}
    if (typeof ref === 'string') data.ref = ref
    if (typeof title === 'string') data.title = title
    if (typeof category === 'string') data.category = category
    if (typeof status === 'string') data.status = status
    if (deadline) data.deadline = new Date(deadline)
    if (publish) data.publish = new Date(publish)
    if (typeof scope === 'string') data.scope = scope
    if (typeof docs === 'string') data.docs = docs
    const updated = await prisma.tender.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.tender.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
}
