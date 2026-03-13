import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function POST(req: NextRequest) {
  try {
    const { path, session } = await req.json().catch(() => ({ path: null, session: null }))
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await prisma.pageView.create({ data: { path, session: typeof session === 'string' ? session : null } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'track_failed' }, { status: 500 }) }
}

