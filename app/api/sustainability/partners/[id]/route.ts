import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma: any = new PrismaClient()

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const row = await prisma.sustainabilityPartner.findUnique({ where: { id } })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (e) { return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 }) }
  finally { await prisma.$disconnect() }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await req.json()
    const data: any = {}
    for (const k of ['name','url','initial','category','badgeColor','badgeTextColor','badgeBorderColor']) {
      if (typeof body?.[k] === 'string') data[k] = body[k]
    }
    const updated = await prisma.sustainabilityPartner.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) { return NextResponse.json({ error: 'Failed to update' }, { status: 500 }) }
  finally { await prisma.$disconnect() }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.sustainabilityPartner.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) { return NextResponse.json({ error: 'Failed to delete' }, { status: 500 }) }
  finally { await prisma.$disconnect() }
}

