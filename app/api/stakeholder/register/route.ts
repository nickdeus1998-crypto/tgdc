import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword, signJwt, getJwtSecret, stakeholderCookieOptions } from '@/app/lib/auth'
import { sendMail } from '@/app/lib/email'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, password, company, phone } = body || {}
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const exists = await prisma.stakeholder.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    const hashed = await hashPassword(password)
    const created = await prisma.stakeholder.create({ data: { email, name, password: hashed, company: company || null, phone: phone || null } })

    // Issue session
    const token = signJwt({ sid: created.id, role: 'stakeholder', email }, getJwtSecret())
    const res = NextResponse.json({ id: created.id, email, name }, { status: 201 })
    res.headers.append('Set-Cookie', `stakeholder_token=${token}; ${stakeholderCookieOptions()}`)

    // Notify company
    await sendMail({ to: process.env.COMPANY_EMAIL || '', subject: 'New stakeholder registration', text: `${name} (${email}) has registered.` })

    return res
  } catch (e) {
    console.error('REGISTER error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

