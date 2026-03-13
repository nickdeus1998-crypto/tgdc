import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function GET() {
  try {
    const items = await prisma.sustainabilityPartner.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        url: true,
        initial: true,
        category: true,
        badgeColor: true,
        badgeTextColor: true,
        badgeBorderColor: true,
      },
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error('PUBLIC sustainability partners error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

