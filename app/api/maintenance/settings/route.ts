import { NextResponse } from 'next/server'
import { getMaintenanceSettings, isMaintenanceMode } from '@/lib/maintenance'

export async function GET() {
    try {
        const [settings, maintenanceActive] = await Promise.all([
            getMaintenanceSettings(),
            isMaintenanceMode()
        ])

        if (!settings) {
            return NextResponse.json({
                maintenanceActive: false,
                maintenanceTitle: 'Site Under Maintenance',
                maintenanceMessage: "We're currently performing scheduled maintenance. We'll be back soon!",
            })
        }

        return NextResponse.json({
            maintenanceActive,
            maintenanceTitle: settings.maintenanceTitle,
            maintenanceMessage: settings.maintenanceMessage,
            maintenanceEndTime: settings.maintenanceEndTime,
        })
    } catch (error) {
        console.error('Error fetching maintenance settings:', error)
        return NextResponse.json(
            { error: 'Failed to fetch maintenance settings', maintenanceActive: false },
            { status: 500 }
        )
    }
}
