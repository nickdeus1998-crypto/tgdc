import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'
import { clearMaintenanceCache } from '@/lib/maintenance'


// Verify admin authentication
async function verifyAdmin() {
    const cookieStore = await cookies()
    const token = cookieStore.get('user_token')?.value

    if (!token) {
        return false
    }

    // In a real implementation, verify the JWT token here
    // For now, we'll just check if it exists
    return true
}

export async function GET() {
    try {
        const isAdmin = await verifyAdmin()
        if (!isAdmin) {
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
        const isAdmin = await verifyAdmin()
        if (!isAdmin) {
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
