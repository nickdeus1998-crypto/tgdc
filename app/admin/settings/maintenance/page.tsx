'use client'

import { useState, useEffect } from 'react'
import { Power, Eye, Save, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'

interface MaintenanceSettings {
    id: number
    maintenanceEnabled: boolean
    maintenanceMessage: string
    maintenanceTitle: string
    maintenanceStartTime: string | null
    maintenanceEndTime: string | null
}

export default function MaintenanceSettingsPage() {
    const [settings, setSettings] = useState<MaintenanceSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings/maintenance')
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            setMessage({ type: 'error', text: 'Failed to load settings' })
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings) return

        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/admin/settings/maintenance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            })

            if (res.ok) {
                const updated = await res.json()
                setSettings(updated)
                setMessage({ type: 'success', text: 'Settings saved successfully!' })
            } else {
                throw new Error('Failed to save settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            setMessage({ type: 'error', text: 'Failed to save settings' })
        } finally {
            setSaving(false)
        }
    }

    const toggleMaintenance = () => {
        if (!settings) return
        setSettings({ ...settings, maintenanceEnabled: !settings.maintenanceEnabled })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!settings) {
        return (
            <div className="p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-200">Failed to load maintenance settings</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Maintenance Mode Settings
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Control site-wide maintenance mode and customize the maintenance page
                    </p>
                </div>

                {/* Status Message */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                            }`}
                    >
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <AlertTriangle className="w-5 h-5" />
                        )}
                        <p>{message.text}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Maintenance Toggle Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`p-3 rounded-lg ${settings.maintenanceEnabled
                                                ? 'bg-red-100 dark:bg-red-900/30'
                                                : 'bg-green-100 dark:bg-green-900/30'
                                            }`}
                                    >
                                        <Power
                                            className={`w-6 h-6 ${settings.maintenanceEnabled
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-green-600 dark:text-green-400'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                                            Maintenance Mode
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {settings.maintenanceEnabled ? 'Currently Active' : 'Currently Inactive'}
                                        </p>
                                    </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    onClick={toggleMaintenance}
                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${settings.maintenanceEnabled ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-600'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.maintenanceEnabled ? 'translate-x-7' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>

                            {settings.maintenanceEnabled && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-red-900 dark:text-red-100 mb-1">
                                                Site is in Maintenance Mode
                                            </p>
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                Public visitors will see the maintenance page. Admin panel and preview mode
                                                remain accessible.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Settings */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Maintenance Page Content
                            </h3>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Page Title
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.maintenanceTitle || ''}
                                        onChange={(e) =>
                                            setSettings({ ...settings, maintenanceTitle: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Site Under Maintenance"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={settings.maintenanceMessage || ''}
                                        onChange={(e) =>
                                            setSettings({ ...settings, maintenanceMessage: e.target.value })
                                        }
                                        rows={4}
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="We're currently performing scheduled maintenance..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Scheduled Maintenance */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Scheduled Maintenance (Optional)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Start Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Start Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={
                                            settings.maintenanceStartTime
                                                ? new Date(settings.maintenanceStartTime).toISOString().slice(0, 16)
                                                : ''
                                        }
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                maintenanceStartTime: e.target.value ? new Date(e.target.value).toISOString() : null,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* End Time */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        End Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={
                                            settings.maintenanceEndTime
                                                ? new Date(settings.maintenanceEndTime).toISOString().slice(0, 16)
                                                : ''
                                        }
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                maintenanceEndTime: e.target.value ? new Date(e.target.value).toISOString() : null,
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                                If set, maintenance mode will automatically activate/deactivate at these times
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>

                            <a
                                href="/preview"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                <Eye className="w-5 h-5" />
                                Preview Site
                            </a>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                                Quick Info
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </p>
                                    <p
                                        className={`text-lg font-semibold ${settings.maintenanceEnabled
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-green-600 dark:text-green-400'
                                            }`}
                                    >
                                        {settings.maintenanceEnabled ? 'Active' : 'Inactive'}
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                                        <strong>Preview Mode:</strong>
                                    </p>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        Access the live site at <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">/preview</code> while maintenance is active
                                    </p>
                                </div>

                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                    <p className="text-sm text-amber-900 dark:text-amber-100 mb-2">
                                        <strong>Protected Routes:</strong>
                                    </p>
                                    <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                                        <li>• Admin panel</li>
                                        <li>• API endpoints</li>
                                        <li>• Stakeholder portal</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
