import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NOTE: Middleware runs on the Edge runtime — do not import Node 'crypto'.
// Implement minimal HS256 JWT verification using Web Crypto here.

function getJwtSecret() {
  return process.env.STAKEHOLDER_JWT_SECRET || process.env.USER_JWT_SECRET || 'dev-stakeholder-secret-change-me'
}

function b64urlToUint8(input: string): Uint8Array {
  // pad base64 string
  let b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

async function verifyJwtEdge(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const data = enc.encode(`${h}.${p}`);
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
    const sigBytes = b64urlToUint8(s);
    if (sig.length !== sigBytes.length || !sig.every((v, i) => v === sigBytes[i])) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToUint8(p)));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  // Protect stakeholder dashboard
  if (pathname.startsWith('/stakeholder/dashboard')) {
    const token = req.cookies.get('stakeholder_token')?.value
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/stakeholder/login'
      return NextResponse.redirect(url)
    }
  }

  // Protect admin routes for authenticated users with admin role
  if (pathname.startsWith('/admin')) {
    const token = req.cookies.get('user_token')?.value
    if (!token) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    const payload = await verifyJwtEdge(token, getJwtSecret())
    if (!payload || payload.role !== 'admin') {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/stakeholder/:path*', '/admin/:path*'],
}
