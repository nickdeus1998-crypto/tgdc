import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()
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
    if (!pv7 || !vis7) {
      const now = new Date()
      const start = new Date(now)
      start.setDate(now.getDate() - 6)
      const events = await prisma.pageView.findMany({
        where: { createdAt: { gte: start } },
        select: { session: true },
      })
      pv7 = events.length
      const set = new Set<string>()
      for (const e of events) if (e.session) set.add(e.session)
      vis7 = set.size
    }

    return NextResponse.json({
      news,
      users,
      stakeholders,
      messages: { user: userMsgs, stakeholder: shMsgs },
      documents: docs,
      services: { sections, services },
      pageviews7d: pv7,
      visitors7d: vis7,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'analytics_failed' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
