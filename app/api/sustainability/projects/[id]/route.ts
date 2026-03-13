import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const row = await prisma.sustainabilityProject.findUnique({ where: { id } })
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
    const data: any = {}
    for (const k of ['name','status','location','description','badgeColor','badgeTextColor','badgeBorderColor']) {
      if (typeof body?.[k] === 'string') data[k] = body[k]
    }
    if (typeof body?.isOpen === 'boolean') data.isOpen = body.isOpen
    const updated = await prisma.sustainabilityProject.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.sustainabilityProject.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
}

