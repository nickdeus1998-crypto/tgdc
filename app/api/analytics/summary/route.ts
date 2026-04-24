import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function GET() {
  try {
    const [news, users, stakeholders, userMsgs, shMsgs, docs, sections, services, stats] = await Promise.all([
      prisma.news.count(),
      prisma.user.count(),
      prisma.stakeholder.count(),
      prisma.userMessage.count(),
      prisma.stakeholderMessage.count(),
      prisma.stakeholderDocument.count(),
      prisma.serviceSection.count(),
      prisma.service.count(),
      prisma.stat.findMany({ where: { title: { in: ['pageviews7d', 'visitors7d'] } } }),
    ])

    const statMap = Object.fromEntries(stats.map(s => [s.title, Number((s as any).value) || 0])) as Record<string, number>

    // Fallback: compute from PageView for last 7 days if Stat values missing
    let pv7 = statMap['pageviews7d'] || 0
    let vis7 = statMap['visitors7d'] || 0
    const now = new Date()
    if (!pv7 || !vis7) {
      const start7 = new Date(now)
      start7.setDate(now.getDate() - 6)
      const events7 = await prisma.pageView.findMany({
        where: { createdAt: { gte: start7 } },
        select: { session: true },
      })
      pv7 = events7.length
      const set7 = new Set<string>()
      for (const e of events7) if (e.session) set7.add(e.session)
      vis7 = set7.size
    }

    // Compute 30-day unique visitors for the footer "Monthly Site Visitors" counter
    const start30 = new Date(now)
    start30.setDate(now.getDate() - 29)
    const events30 = await prisma.pageView.findMany({
      where: { createdAt: { gte: start30 } },
      select: { session: true },
    })
    const set30 = new Set<string>()
    for (const e of events30) if (e.session) set30.add(e.session)
    const vis30 = set30.size

    return NextResponse.json({
      news,
      users,
      stakeholders,
      messages: { user: userMsgs, stakeholder: shMsgs },
      documents: docs,
      services: { sections, services },
      pageviews7d: pv7,
      visitors7d: vis7,
      visitors30d: vis30,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'analytics_failed' }, { status: 500 }) }
}
