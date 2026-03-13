import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function GET() {
  try {
    const items = await prisma.sustainabilityProject.findMany({
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        location: true,
        description: true,
        badgeColor: true,
        badgeTextColor: true,
        badgeBorderColor: true,
        isOpen: true,
      },
    })
    return NextResponse.json(items)
  } catch (e) {
    console.error('PUBLIC sustainability projects error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

