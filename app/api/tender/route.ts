import prisma from '@/lib/prisma'
import { NextResponse } from "next/server"
export async function GET() {
  try {
    const rows = await prisma.tender.findMany({ orderBy: [{ publish: 'desc' }] })
    return NextResponse.json(rows, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch Tenders' }, { status: 500 }) }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ref, title, category, status, deadline, publish, scope, docs } = body || {}

    if (!ref || !title || !category || !status || !deadline || !publish || !scope || !docs) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const created = await prisma.tender.create({
      data: {
        ref: String(ref),
        title: String(title),
        category: String(category),
        status: String(status),
        deadline: new Date(deadline),
        publish: new Date(publish),
        scope: String(scope),
        docs: String(docs),
      },
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    console.error('POST /api/tender error', e)
    return NextResponse.json({ error: 'Failed to create Tender' }, { status: 500 }) }
}
