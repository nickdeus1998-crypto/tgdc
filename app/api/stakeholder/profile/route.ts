import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJwt, getJwtSecret, validatePassword, hashPassword } from '@/app/lib/auth'

export async function PUT(request: Request) {
  try {
    const rawToken = request.headers.get('cookie')?.split('stakeholder_token=')[1]?.split(';')[0]
    if (!rawToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyJwt(rawToken, getJwtSecret())
    if (!payload?.sid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { password } = await request.json()
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    const val = validatePassword(password)
    if (!val.valid) {
      return NextResponse.json({ error: val.errors.join('. ') }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    await prisma.stakeholder.update({
      where: { id: payload.sid },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (e) {
    console.error('Stakeholder profile update error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
