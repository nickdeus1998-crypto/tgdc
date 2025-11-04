"use client";

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function getOrCreateSession(): string {
  try {
    const key = 'pv_sid'
    let v = localStorage.getItem(key)
    if (!v) {
      const arr = new Uint8Array(16)
      crypto.getRandomValues(arr)
      v = Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('')
      localStorage.setItem(key, v)
    }
    return v
  } catch {
    return ''
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return
    // Do not track admin routes
    if (pathname.startsWith('/admin')) return
    const path = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname
    if (lastSent.current === path) return
    lastSent.current = path
    const payload = JSON.stringify({ path, session: getOrCreateSession() })
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/analytics/track', blob)
      } else {
        fetch('/api/analytics/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload })
      }
    } catch {}
  }, [pathname, searchParams])

  return null
}

