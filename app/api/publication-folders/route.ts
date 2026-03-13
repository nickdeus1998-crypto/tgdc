import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        const folders = await prisma.publicationFolder.findMany({
            orderBy: { sortOrder: 'asc' },
        })
        return NextResponse.json(folders)
    } catch (e: any) {
        console.error('GET /api/publication-folders error:', e)
        return NextResponse.json({ error: 'Failed to fetch folders', detail: e?.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, sortOrder } = body || {}
        if (!name) {
            return NextResponse.json({ error: 'name is required' }, { status: 400 })
        }
        const folder = await prisma.publicationFolder.create({
            data: {
                name: String(name),
                sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
            },
        })
        return NextResponse.json(folder, { status: 201 })
    } catch (e: any) {
        console.error('POST /api/publication-folders error:', e)
        return NextResponse.json({ error: 'Failed to create folder', detail: e?.message }, { status: 500 })
    }
}

