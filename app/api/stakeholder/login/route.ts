import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyPassword, signJwt, getJwtSecret, stakeholderCookieOptions } from '@/app/lib/auth'
import { sendMail } from '@/app/lib/email'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    const user = await prisma.stakeholder.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    const ok = await verifyPassword(password, user.password)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signJwt({ sid: user.id, role: 'stakeholder', email: user.email }, getJwtSecret())
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name })
    res.headers.append('Set-Cookie', `stakeholder_token=${token}; ${stakeholderCookieOptions()}`)

    await sendMail({ to: process.env.COMPANY_EMAIL || '', subject: 'Stakeholder login', text: `${user.name} (${user.email}) logged in.` })

    return res
  } catch (e) {
    console.error('LOGIN error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

