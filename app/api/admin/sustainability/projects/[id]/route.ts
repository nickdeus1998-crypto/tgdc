import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'

const prisma = new PrismaClient()

function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
  const token = m ? decodeURIComponent(m[1]) : null
  const payload = token ? verifyJwt(token, getJwtSecret()) : null
  return payload?.role === 'admin'
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    const body = await request.json()
    const updated = await prisma.sustainabilityProject.update({
      where: { id },
      data: {
        name: body.name,
        status: body.status,
        location: body.location,
        description: body.description,
        badgeColor: body.badgeColor,
        badgeTextColor: body.badgeTextColor,
        badgeBorderColor: body.badgeBorderColor,
        isOpen: !!body.isOpen,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error('ADMIN sustainability project update error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!isAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await prisma.sustainabilityProject.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('ADMIN sustainability project delete error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

