import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyPassword, signJwt, getJwtSecret, stakeholderCookieOptions, checkLoginRateLimit, recordFailedLogin } from '@/app/lib/auth'
import { sendMail } from '@/app/lib/email'
export async function POST(request: Request) {
  try {
    // Rate limiting by IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    const rateCheck = checkLoginRateLimit(ip)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${Math.ceil((rateCheck.retryAfterSec || 900) / 60)} minutes.` },
        { status: 429 }
      )
    }

    const { email, password } = await request.json()
    if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
    const user = await prisma.stakeholder.findUnique({ where: { email } })
    if (!user) {
      recordFailedLogin(ip)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    const ok = await verifyPassword(password, user.password)
    if (!ok) {
      recordFailedLogin(ip)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signJwt({ sid: user.id, role: 'stakeholder', email: user.email }, getJwtSecret())
    const res = NextResponse.json({ id: user.id, email: user.email, name: user.name })
    res.headers.append('Set-Cookie', `stakeholder_token=${token}; ${stakeholderCookieOptions()}`)

    await sendMail({ to: process.env.COMPANY_EMAIL || '', subject: 'Stakeholder login', text: `${user.name} (${user.email}) logged in.` })

    return res
  } catch (e) {
    console.error('LOGIN error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}
