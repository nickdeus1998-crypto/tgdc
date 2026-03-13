import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'


export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = Number(idStr)
        if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        const body = await req.json()
        const data: any = {}
        if (typeof body.name === 'string') data.name = body.name
        if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder
        const updated = await prisma.publicationFolder.update({ where: { id }, data })
        return NextResponse.json(updated)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 })
    } finally {
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params
        const id = Number(idStr)
        if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
        // Unlink publications from this folder
        await prisma.informationItem.updateMany({
            where: { folderId: id },
            data: { folderId: null },
        })
        await prisma.publicationFolder.delete({ where: { id } })
        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
    } finally {
    }
}
