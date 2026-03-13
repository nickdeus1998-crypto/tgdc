import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


interface Ctx { params: Promise<{ id: string }> }

// PATCH /api/media-folders/:id  { name?, sortOrder? }
export async function PATCH(request: Request, ctx: Ctx) {
    try {
        const { id: rawId } = await ctx.params
        const id = Number(rawId)
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

        const body = await request.json()
        const data: Record<string, any> = {}
        if (body.name !== undefined) data.name = body.name.trim()
        if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

        const folder = await prisma.mediaFolder.update({ where: { id }, data })
        return NextResponse.json(folder)
    } catch (error) {
        console.error('PATCH /api/media-folders/:id error', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// DELETE /api/media-folders/:id  (also deletes all children recursively)
export async function DELETE(_request: Request, ctx: Ctx) {
    try {
        const { id: rawId } = await ctx.params
        const id = Number(rawId)
        if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

        // Recursive delete all descendants
        async function deleteRecursive(folderId: number) {
            const children = await prisma.mediaFolder.findMany({ where: { parentId: folderId } })
            for (const child of children) {
                await deleteRecursive(child.id)
            }
            // Unlink items in this folder
            await prisma.informationItem.updateMany({ where: { folderId }, data: { folderId: null } })
            await prisma.mediaFolder.delete({ where: { id: folderId } })
        }

        await deleteRecursive(id)
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('DELETE /api/media-folders/:id error', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
