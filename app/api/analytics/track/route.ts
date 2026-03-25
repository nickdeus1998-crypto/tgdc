import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// ---------- In-memory rate limiter for analytics tracking ----------
const trackRateMap = new Map<string, { count: number; resetAt: number }>()
const TRACK_MAX_PER_WINDOW = 30   // max page views per window
const TRACK_WINDOW_MS = 60_000    // 1-minute window
const MAX_PATH_LENGTH = 500       // max characters for path
const MAX_SESSION_LENGTH = 128    // max characters for session id

function checkTrackRateLimit(ip: string): boolean {
    const now = Date.now()
    const entry = trackRateMap.get(ip)
    if (!entry || now > entry.resetAt) {
        trackRateMap.set(ip, { count: 1, resetAt: now + TRACK_WINDOW_MS })
        return true
    }
    if (entry.count >= TRACK_MAX_PER_WINDOW) return false
    entry.count++
    return true
}

function getClientIp(request: NextRequest): string {
    const xff = request.headers.get('x-forwarded-for')
    return xff?.split(',')[0]?.trim() || '0.0.0.0'
}
// -------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // Rate limit check
    const ip = getClientIp(req)
    if (!checkTrackRateLimit(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 })
    }

    const { path, session } = await req.json().catch(() => ({ path: null, session: null }))
    if (!path || typeof path !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    // Input validation: enforce max lengths
    const sanitizedPath = path.slice(0, MAX_PATH_LENGTH)
    const sanitizedSession = typeof session === 'string' ? session.slice(0, MAX_SESSION_LENGTH) : null

    await prisma.pageView.create({ data: { path: sanitizedPath, session: sanitizedSession } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
