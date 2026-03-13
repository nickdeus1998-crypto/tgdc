import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit') || '8')))
    const hasRange = !!(searchParams.get('from') || searchParams.get('to'))
    let start: Date
    let end: Date
    if (hasRange) {
      const fromStr = searchParams.get('from')
      const toStr = searchParams.get('to')
      start = fromStr ? new Date(fromStr) : new Date(Date.now() - 6*24*3600*1000)
      end = toStr ? new Date(toStr) : new Date()
    } else {
      const days = Math.max(1, Math.min(365, Number(searchParams.get('days') || '7')))
      end = new Date()
      start = new Date(end)
      start.setDate(end.getDate() - (days - 1))
    }
    start.setHours(0,0,0,0)
    end.setHours(23,59,59,999)

    const rows = await prisma.pageView.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { path: true, session: true },
    })

    const agg = new Map<string, { pageviews: number; visitors: Set<string> }>()
    for (const r of rows) {
      const key = r.path || '/'
      const bucket = agg.get(key) || { pageviews: 0, visitors: new Set<string>() }
      bucket.pageviews += 1
      if (r.session) bucket.visitors.add(r.session)
      agg.set(key, bucket)
    }

    const list = Array.from(agg.entries())
      .map(([path, v]) => ({ path, pageviews: v.pageviews, visitors: v.visitors.size }))
      .sort((a, b) => b.pageviews - a.pageviews)
      .slice(0, limit)

    return NextResponse.json({ from: start.toISOString(), to: end.toISOString(), list })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'top_pages_failed' }, { status: 500 }) }
}
