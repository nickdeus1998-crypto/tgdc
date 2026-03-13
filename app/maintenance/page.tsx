'use client'

import { useEffect, useState } from 'react'
import { Wrench, Clock, Mail } from 'lucide-react'

interface MaintenanceSettings {
    maintenanceTitle: string
    maintenanceMessage: string
    maintenanceEndTime?: string
}

export default function MaintenancePage() {
    const [settings, setSettings] = useState<MaintenanceSettings>({
        maintenanceTitle: 'Site Under Maintenance',
        maintenanceMessage: "We're currently performing scheduled maintenance. We'll be back soon!",
    })
    const [timeRemaining, setTimeRemaining] = useState<string>('')

    useEffect(() => {
        // Fetch maintenance settings
        fetch('/api/maintenance/settings')
            .then((res) => res.json())
            .then((data) => {
                if (data.maintenanceTitle) setSettings(data)
            })
            .catch(() => {
                // Use defaults if fetch fails
            })
    }, [])

    useEffect(() => {
        if (!settings.maintenanceEndTime) return

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const end = new Date(settings.maintenanceEndTime!).getTime()
            const distance = end - now

            if (distance < 0) {
                setTimeRemaining('Soon')
                clearInterval(interval)
                return
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

            setTimeRemaining(`${hours}h ${minutes}m`)
        }, 1000)

        return () => clearInterval(interval)
    }, [settings.maintenanceEndTime])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Main Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-700">
                    {/* Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 p-6 rounded-full">
                                <Wrench className="w-12 h-12 text-white animate-bounce" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                        {settings.maintenanceTitle}
                    </h1>

                    {/* Message */}
                    <p className="text-lg text-slate-600 dark:text-slate-300 text-center mb-8 leading-relaxed">
                        {settings.maintenanceMessage}
                    </p>

                    {/* Time Remaining */}
                    {timeRemaining && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-6 mb-8 border border-emerald-200 dark:border-slate-600">
                            <div className="flex items-center justify-center gap-3">
                                <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                <div className="text-center">
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                                        Estimated Return Time
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {timeRemaining}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                                    Need Urgent Assistance?
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                    For urgent matters, please contact us at{' '}
                                    <a
                                        href="mailto:support@tgdc.go.tz"
                                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                                    >
                                        support@tgdc.go.tz
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading Animation */}
                    <div className="mt-8 flex justify-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-3 h-3 bg-emerald-600 rounded-full animate-bounce"></div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    Thank you for your patience and understanding
                </p>
            </div>
        </div>
    )
}
