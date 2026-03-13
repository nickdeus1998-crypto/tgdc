import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function POST(request: Request) {
  try {
    const { email, role, token } = await request.json()
    if (!email || !role || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    const expected = process.env.ADMIN_INVITE_TOKEN
    if (!expected || token !== expected) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!['admin', 'user', 'normal'].includes(role)) return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    const updated = await prisma.user.update({ where: { email }, data: { role } })
    return NextResponse.json({ id: updated.id, email: updated.email, role: updated.role }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 }) }
}

