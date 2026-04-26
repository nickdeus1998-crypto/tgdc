import prisma from '@/lib/prisma'
import type { SiteSettings } from '@prisma/client'
import type { NextRequest } from 'next/server'

// Cache for maintenance settings to avoid DB queries on every request
let maintenanceCache: {
    enabled: boolean
    settings: SiteSettings | null
    timestamp: number
} | null = null

const CACHE_TTL = 30000 // 30 seconds

/**
 * Check if maintenance mode is currently active
 * Uses caching to minimize database queries
 */
export async function isMaintenanceMode(): Promise<boolean> {
    // Check environment variable override first
    if (process.env.FORCE_MAINTENANCE_MODE === 'true') {
        return true
    }

    // Fetch from database
    try {
        const settings = await getMaintenanceSettings()
        if (!settings) return false

        let enabled = settings.maintenanceEnabled

        // Check scheduled maintenance times
        if (enabled && settings.maintenanceStartTime && settings.maintenanceEndTime) {
            const currentTime = new Date()
            const startTime = new Date(settings.maintenanceStartTime)
            const endTime = new Date(settings.maintenanceEndTime)

            // Only enable if current time is within the scheduled window
            enabled = currentTime >= startTime && currentTime <= endTime
        }

        return enabled
    } catch (error) {
        console.error('Error checking maintenance mode:', error)
        return false
    }
}

/**
 * Get maintenance settings from database
 */
export async function getMaintenanceSettings() {
    try {
        // Get the first (and should be only) settings record
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

        return settings
    } catch (error) {
        console.error('Error fetching maintenance settings:', error)
        return null
    }
}

/**
 * Check if a given pathname should bypass maintenance mode
 */
export function shouldBypassMaintenance(pathname: string): boolean {
    const bypassPaths = [
        '/admin',
        '/login',
        '/stakeholder',
        '/api/admin',
        '/api/auth',
        '/api/stakeholder',
        '/api/site-settings',
        '/api/maintenance',
        '/api/maintenance-status',
        '/preview',
        '/_next',
        '/favicon.ico',
        '/maintenance',
    ]

    return bypassPaths.some((path) => pathname.startsWith(path))
}

export function hasPreviewAccess(request: NextRequest): boolean {
    // Check for preview mode cookie
    const previewCookie = request.cookies.get('preview_mode')?.value
    return previewCookie === 'true'
}

/**
 * Clear the maintenance cache (useful after settings update)
 */
export function clearMaintenanceCache() {
    maintenanceCache = null
}
