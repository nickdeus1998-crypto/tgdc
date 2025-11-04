import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

function fmtDay(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function fmtMonth(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
function fmtYear(d: Date) {
  return String(d.getFullYear())
}

export async function GET(req: NextRequest) {
  const prisma = new PrismaClient()
  try {
    const { searchParams } = new URL(req.url)
    const grain = (searchParams.get('grain') || 'day').toLowerCase() as 'day'|'month'|'year'
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

    // Normalize time bounds
    start = new Date(start)
    start.setHours(0,0,0,0)
    end = new Date(end)
    end.setHours(23,59,59,999)

    const rows = await prisma.pageView.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true, session: true },
    })

    const buckets: Record<string, { pageviews: number; visitorsSet: Set<string> }> = {}

    const pushRow = (date: Date, session: string | null) => {
      let key: string
      if (grain === 'year') key = fmtYear(date)
      else if (grain === 'month') key = fmtMonth(date)
      else key = fmtDay(date)
      const bucket = buckets[key] || (buckets[key] = { pageviews: 0, visitorsSet: new Set() })
      bucket.pageviews += 1
      if (session) bucket.visitorsSet.add(session)
    }

    for (const r of rows) pushRow(new Date(r.createdAt), r.session)

    // Pre-fill empty buckets for day grain only (for nice charts)
    if (grain === 'day') {
      const days = Math.max(1, Math.round((end.getTime()-start.getTime())/86400000) + 1)
      for (let i = 0; i < days; i++) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        const key = fmtDay(d)
        if (!buckets[key]) buckets[key] = { pageviews: 0, visitorsSet: new Set() }
      }
    }

    const series = Object.entries(buckets)
      .sort((a,b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, v]) => ({ date, pageviews: v.pageviews, visitors: v.visitorsSet.size }))

    return NextResponse.json({ grain, from: start.toISOString(), to: end.toISOString(), series })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'timeseries_failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
