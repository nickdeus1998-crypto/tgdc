import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


// GET /api/media-folders?kind=photo&parentId=  (list folders by kind + optional parent)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const kind = searchParams.get('kind') || 'photo'
        const parentIdParam = searchParams.get('parentId')
        const parentId = parentIdParam === '' || parentIdParam === null ? null : Number(parentIdParam)

        const folders = await prisma.mediaFolder.findMany({
            where: { kind, parentId },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        })
        return NextResponse.json(folders)
    } catch (error) {
        console.error('GET /api/media-folders error', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}

// POST /api/media-folders  { name, kind, parentId? }
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, kind, parentId, sortOrder } = body
        if (!name?.trim() || !kind) {
            return NextResponse.json({ error: 'name and kind are required' }, { status: 400 })
        }
        const folder = await prisma.mediaFolder.create({
            data: {
                name: name.trim(),
                kind,
                parentId: parentId ?? null,
                sortOrder: sortOrder ?? 0,
            },
        })
        return NextResponse.json(folder, { status: 201 })
    } catch (error) {
        console.error('POST /api/media-folders error', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
