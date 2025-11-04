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

export function signJwt(payload: Record<string, any>, secret: string, expiresInSec = 60 * 60 * 24 * 7) {
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
  return process.env.STAKEHOLDER_JWT_SECRET || 'dev-stakeholder-secret-change-me'
}

export function stakeholderCookieOptions() {
  const week = 60 * 60 * 24 * 7
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${week}`
}

