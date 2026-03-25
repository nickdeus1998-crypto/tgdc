import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getJwtSecret, verifyJwt, hashPassword, validatePassword } from '@/app/lib/auth'


async function getAuthenticatedUser(request: Request) {
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    if (!token) return null

    const payload = verifyJwt(token, getJwtSecret())
    if (!payload?.uid) return null

    return Number(payload.uid)
}

export async function GET(request: Request) {
    try {
        const userId = await getAuthenticatedUser(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true }
        })

        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    } finally {
    }
}

export async function PUT(request: Request) {
    try {
        const userId = await getAuthenticatedUser(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const data = await request.json()
        const { name, email, password } = data

        // Validation
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser && existingUser.id !== userId) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
        }

        const updateData: any = { name, email }
        if (password && password.trim() !== '') {
            const pwCheck = validatePassword(password)
            if (!pwCheck.valid) {
                return NextResponse.json({ error: pwCheck.errors[0], errors: pwCheck.errors }, { status: 400 })
            }
            updateData.password = await hashPassword(password)
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: { id: true, email: true, name: true, role: true }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    } finally {
    }
}
