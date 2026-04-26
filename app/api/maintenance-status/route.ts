import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Opt out of caching so it's fresh, or use revalidate
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst()
        if (!settings) return NextResponse.json({ active: false })

        let enabled = settings.maintenanceEnabled

        if (settings.maintenanceStartTime && settings.maintenanceEndTime) {
            const currentTime = new Date()
            const startTime = new Date(settings.maintenanceStartTime)
            const endTime = new Date(settings.maintenanceEndTime)
            
            const isScheduled = currentTime >= startTime && currentTime <= endTime
            
            // If the schedule is active, force enabled
            if (isScheduled) {
                enabled = true
            } else if (currentTime > endTime) {
                // If the schedule is in the past, it does NOT override maintenanceEnabled
                // Wait, if they set a schedule for yesterday, and turn it on today, it should be ON today.
                // It just ignores the old schedule.
            } else if (currentTime < startTime) {
                // If it's for the future, maybe it's OFF until the time comes
                // But if they manually turned it ON, do they want it ON now?
                // Usually if there's a future schedule, it overrides manual ON to wait for the schedule.
                enabled = false
            }
        }

        return NextResponse.json({ active: enabled })
    } catch (error) {
        return NextResponse.json({ active: false })
    }
}
