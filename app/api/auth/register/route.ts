import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword, signJwt, getJwtSecret, stakeholderCookieOptions } from '@/app/lib/auth'
export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await hashPassword(password)
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? 'admin' : 'user'

    const created = await prisma.user.create({ data: { email, name: name || null, password: hashed, role } })

    const token = signJwt({ uid: created.id, role: created.role, email: created.email }, getJwtSecret())
    const res = NextResponse.json({ id: created.id, email: created.email, role: created.role }, { status: 201 })
    res.headers.append('Set-Cookie', `user_token=${token}; ${stakeholderCookieOptions()}`)
    return res
  } catch (e) {
    console.error('AUTH REGISTER error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

