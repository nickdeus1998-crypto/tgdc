import crypto from 'crypto'

// Hash password with scrypt and random salt. Format: scrypt$<salt>$<hash>
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key as Buffer)))
  })
  return `scrypt$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [alg, salt, hashHex] = stored.split('$')
    if (alg !== 'scrypt' || !salt || !hashHex) return false
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key as Buffer)))
    })
    return crypto.timingSafeEqual(Buffer.from(hashHex, 'hex'), derived)
  } catch {
    return false
  }
}

// Minimal JWT HS256 implementation
function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function signJwt(payload: Record<string, any>, secret: string, expiresInSec = 60 * 60) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = { iat: now, exp: now + expiresInSec, ...payload }
  const encodedHeader = base64url(JSON.stringify(header))
  const encodedBody = base64url(JSON.stringify(body))
  const data = `${encodedHeader}.${encodedBody}`
  const sig = crypto.createHmac('sha256', secret).update(data).digest()
  const encodedSig = base64url(sig)
  return `${data}.${encodedSig}`
}

export function verifyJwt(token: string, secret: string): null | Record<string, any> {
  try {
    const [h, b, s] = token.split('.')
    if (!h || !b || !s) return null
    const data = `${h}.${b}`
    const expected = base64url(crypto.createHmac('sha256', secret).update(data).digest())
    if (expected !== s) return null
    const payload = JSON.parse(Buffer.from(b, 'base64').toString('utf8'))
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function getJwtSecret() {
  const secret = process.env.STAKEHOLDER_JWT_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('STAKEHOLDER_JWT_SECRET environment variable is required in production')
    }
    return 'dev-stakeholder-secret-change-me'
  }
  return secret
}

export function stakeholderCookieOptions() {
  const oneHour = 60 * 60
  const isSecure = process.env.FORCE_SECURE_COOKIES === 'true' || process.env.NODE_ENV === 'production'
  const secure = isSecure ? '; Secure' : ''
  return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${oneHour}${secure}`
}

// ── Password Policy ──────────────────────────────────────────────
// Enforces: min 12 chars, uppercase, lowercase, digit, special character
export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  if (!password || password.length < 12) errors.push('Password must be at least 12 characters long')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number')
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~`]/.test(password)) errors.push('Password must contain at least one special character')
  return { valid: errors.length === 0, errors }
}

// ── Login Rate Limiter ───────────────────────────────────────────
// In-memory rate limiter: max attempts per window per IP
const LOGIN_MAX_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

interface RateLimitEntry { count: number; firstAttempt: number }
const loginAttempts = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of loginAttempts) {
    if (now - entry.firstAttempt > LOGIN_WINDOW_MS) loginAttempts.delete(key)
  }
}, 5 * 60 * 1000).unref?.()

export function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    // New window
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
    return { allowed: true }
  }
  if (entry.count >= LOGIN_MAX_ATTEMPTS) {
    const retryAfterSec = Math.ceil((LOGIN_WINDOW_MS - (now - entry.firstAttempt)) / 1000)
    return { allowed: false, retryAfterSec }
  }
  entry.count++
  return { allowed: true }
}

export function recordFailedLogin(ip: string) {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now })
  } else {
    entry.count++
  }
}

// ── Centralized Route Auth Helpers ──────────────────────────────
// Import these in API routes instead of redefining locally.

/** Extract JWT cookie, verify signature, and return the payload (or null). */
function extractPayload(request: Request): Record<string, any> | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|; )user_token=([^;]+)/)
  const token = match ? decodeURIComponent(match[1]) : null
  if (!token) return null
  return verifyJwt(token, getJwtSecret())
}

/** Returns true if the request has a valid JWT with role === 'admin'. */
export function isAdmin(request: Request): boolean {
  const payload = extractPayload(request)
  return payload?.role === 'admin'
}

/** Returns the admin JWT payload, or null if not admin. */
export function getAdminPayload(request: Request): Record<string, any> | null {
  const payload = extractPayload(request)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

/** Returns the JWT payload for any authenticated internal user (admin or user), or null. */
export function getInternalPayload(request: Request): Record<string, any> | null {
  const payload = extractPayload(request)
  if (!payload || !['admin', 'user'].includes(payload.role)) return null
  return payload
}

