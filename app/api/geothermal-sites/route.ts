import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const zone = searchParams.get('zone')
    const q = (searchParams.get('q') || '').toLowerCase()

    const where: any = {}
    if (zone && zone !== 'All') where.zone = zone
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
        { tag: { contains: q, mode: 'insensitive' } },
      ]
    }

    const list = await prisma.geothermalSite.findMany({ where, orderBy: { id: 'desc' } })
    const items = list.map((s) => ({
      id: s.slug,
      title: s.title,
      summary: s.summary,
      details: Array.isArray(s.details) ? s.details : [],
      tag: s.tag || undefined,
      zone: s.zone,
      lat: s.lat,
      lng: s.lng,
    }))
    return NextResponse.json({ items })
  } catch (e) {
    console.error('PUBLIC geothermal-sites error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

