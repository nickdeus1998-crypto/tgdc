import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'
import { clearMaintenanceCache } from '@/lib/maintenance'

// Verify admin authentication — properly validates JWT signature + admin role
function verifyAdmin(request: Request): boolean {
    const cookie = request.headers.get('cookie') || ''
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = match ? decodeURIComponent(match[1]) : null
    if (!token) return false
    const payload = verifyJwt(token, getJwtSecret())
    return payload?.role === 'admin'
}

export async function GET(request: Request) {
    try {
        if (!verifyAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        let settings = await prisma.siteSettings.findFirst()

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    maintenanceEnabled: false,
                    maintenanceMessage: "We're currently performing scheduled maintenance. We'll be back soon!",
                    maintenanceTitle: 'Site Under Maintenance',
                },
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error fetching maintenance settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

export async function PUT(request: Request) {
    try {
        if (!verifyAdmin(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            maintenanceEnabled,
            maintenanceMessage,
            maintenanceTitle,
            maintenanceStartTime,
            maintenanceEndTime,
        } = body

        // Get existing settings or create new
        let settings = await prisma.siteSettings.findFirst()

        if (settings) {
            // Update existing
            settings = await prisma.siteSettings.update({
                where: { id: settings.id },
                data: {
                    maintenanceEnabled,
                    maintenanceMessage,
                    maintenanceTitle,
                    maintenanceStartTime: maintenanceStartTime ? new Date(maintenanceStartTime) : null,
                    maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
                },
            })
        } else {
            // Create new
            settings = await prisma.siteSettings.create({
                data: {
                    maintenanceEnabled,
                    maintenanceMessage,
                    maintenanceTitle,
                    maintenanceStartTime: maintenanceStartTime ? new Date(maintenanceStartTime) : null,
                    maintenanceEndTime: maintenanceEndTime ? new Date(maintenanceEndTime) : null,
                },
            })
        }

        // Clear the cache so changes take effect immediately
        clearMaintenanceCache()

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Error updating maintenance settings:', error)
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        )
    }
}
