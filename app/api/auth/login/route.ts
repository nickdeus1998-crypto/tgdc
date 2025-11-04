import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyPassword, signJwt, getJwtSecret, stakeholderCookieOptions } from '@/app/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const ok = await verifyPassword(password, user.password)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signJwt({ uid: user.id, role: user.role, email: user.email }, getJwtSecret())
    const res = NextResponse.json({ id: user.id, email: user.email, role: user.role })
    res.headers.append('Set-Cookie', `user_token=${token}; ${stakeholderCookieOptions()}`)
    return res
  } catch (e) {
    console.error('AUTH LOGIN error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

