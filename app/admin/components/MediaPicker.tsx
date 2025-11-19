'use client'

import React, { useEffect, useState } from 'react'

type MediaItem = {
  name: string
  url: string
  sizeBytes: number
  uploadedAt: string
}

interface MediaPickerProps {
  label?: string
  helperText?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

const MediaPicker: React.FC<MediaPickerProps> = ({ label, helperText, value, onChange, disabled }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const fetchMedia = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/media', { cache: 'no-store' })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.error || 'Unable to load media files.')
      setMediaItems(Array.isArray(data?.items) ? data.items : [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load media files.'
      setError(message)
    } finally {
      setLoading(false)
      setHasFetched(true)
    }
  }

  useEffect(() => {
    if (isModalOpen && !hasFetched) {
      fetchMedia()
    }
  }, [isModalOpen, hasFetched])

  const handleManualChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleSelect = (item: MediaItem) => {
    onChange(item.url)
    closeModal()
  }

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={value}
          onChange={handleManualChange}
          placeholder="Paste an image URL or pick from media"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
          disabled={disabled}
        />
        <div className="flex gap-2">
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              disabled={disabled}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#326101] text-white text-sm font-semibold hover:bg-[#2a4e04] disabled:opacity-50"
            disabled={disabled}
          >
            Browse Media
          </button>
        </div>
      </div>
      {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      {value && (
        <div className="flex items-center gap-3 mt-1">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
            <img src={value} alt="Selected" className="w-full h-full object-cover" />
          </div>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-[#326101] underline">
            Preview
          </a>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} aria-hidden />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Select Media</h3>
                <p className="text-sm text-gray-500">Choose an image from the media library or upload via Media Gallery.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                aria-label="Close media picker"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="text-center text-gray-500 py-10 text-sm">Loading media&hellip;</div>
              ) : error ? (
                <div className="text-center text-red-600 py-10 text-sm">{error}</div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-sm">
                  No media files found. Upload images from the Media Gallery first.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {mediaItems.map(item => (
                    <button
                      key={item.url}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="border border-gray-200 rounded-xl overflow-hidden text-left hover:border-[#326101] hover:shadow-md transition"
                    >
                      <div className="aspect-video bg-gray-100">
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatSize(item.sizeBytes)} • {new Date(item.uploadedAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 truncate">/uploads/media/{item.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!loading && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <span>Selecting an item will insert its public URL into the field.</span>
                <button type="button" onClick={fetchMedia} className="text-[#326101] font-medium">
                  Refresh list
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaPicker

