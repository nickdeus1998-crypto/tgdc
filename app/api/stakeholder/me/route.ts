import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )stakeholder_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    if (!token) return NextResponse.json({ user: null }, { status: 200 })
    const payload = verifyJwt(token, getJwtSecret())
    if (!payload?.sid) return NextResponse.json({ user: null }, { status: 200 })
    const user = await prisma.stakeholder.findUnique({ where: { id: Number(payload.sid) }, select: { id: true, email: true, name: true } })
    return NextResponse.json({ user }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 })
  } finally {
    await prisma.$disconnect()
  }
}

