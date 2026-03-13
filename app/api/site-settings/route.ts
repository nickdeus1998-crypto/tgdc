import prisma from '@/lib/prisma'
import { NextRequest, NextResponse } from "next/server"


// GET /api/site-settings?key=tenderNote
export async function GET(req: NextRequest) {
    try {
        const key = req.nextUrl.searchParams.get('key')
        if (key) {
            const row = await prisma.siteSetting.findUnique({ where: { key } })
            return NextResponse.json(row || { key, value: '' })
        }
        const rows = await prisma.siteSetting.findMany()
        return NextResponse.json(rows)
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    } finally {
    }
}

// POST /api/site-settings { key, value }
export async function POST(req: NextRequest) {
    try {
        const { key, value } = await req.json()
        if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 })

        const row = await prisma.siteSetting.upsert({
            where: { key },
            update: { value: String(value ?? '') },
            create: { key, value: String(value ?? '') },
        })
        return NextResponse.json(row)
    } catch (e) {
        console.error('POST /api/site-settings error', e)
        return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 })
    } finally {
    }
}
