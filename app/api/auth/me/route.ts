import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'
export async function GET(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    if (!token) return NextResponse.json({ user: null }, { status: 200 })
    const payload = verifyJwt(token, getJwtSecret())
    if (!payload?.uid) return NextResponse.json({ user: null }, { status: 200 })
    const user = await prisma.user.findUnique({ where: { id: Number(payload.uid) }, select: { id: true, email: true, name: true, role: true } })
    return NextResponse.json({ user }, { status: 200 })
  } catch {
    return NextResponse.json({ user: null }, { status: 200 }) }
}

