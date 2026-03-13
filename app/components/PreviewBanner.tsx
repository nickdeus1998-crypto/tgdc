'use client'

import { useEffect, useState } from 'react'
import { X, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PreviewBanner() {
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check if we're in preview mode
        const checkPreviewMode = async () => {
            try {
                const res = await fetch('/api/preview/check')
                const data = await res.json()
                setIsPreviewMode(data.isPreview)
            } catch (error) {
                console.error('Error checking preview mode:', error)
            }
        }

        checkPreviewMode()
    }, [])

    const exitPreview = async () => {
        try {
            await fetch('/api/preview/exit', { method: 'POST' })
            setIsPreviewMode(false)
            // Redirect to home page or current page to show maintenance view
            window.location.href = '/'
        } catch (error) {
            console.error('Error exiting preview:', error)
        }
    }

    if (!isPreviewMode) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5" />
                    <div>
                        <p className="font-semibold text-sm">Preview Mode Active</p>
                        <p className="text-xs opacity-90">
                            You're viewing the live site while maintenance mode is enabled
                        </p>
                    </div>
                </div>

                <button
                    onClick={exitPreview}
                    className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                    <X className="w-4 h-4" />
                    Exit Preview
                </button>
            </div>
        </div>
    )
}
