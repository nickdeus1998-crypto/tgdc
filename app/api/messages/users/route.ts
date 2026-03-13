import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'
export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.uid) return NextResponse.json({ users: [] }, { status: 200 })

    const users = await prisma.user.findMany({
      where: { id: { not: Number(payload.uid) } },
      select: { id: true, email: true, name: true, role: true },
      orderBy: { id: 'asc' },
    })
    return NextResponse.json({ users })
  } catch (e) {
    return NextResponse.json({ users: [] }, { status: 200 }) }
}

