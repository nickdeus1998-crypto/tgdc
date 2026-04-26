import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { shouldBypassMaintenance, hasPreviewAccess } from './lib/maintenance'
// Middleware runs on the Edge runtime — do not import Node 'crypto' or Prisma directly.
// We use a fetch call to an API endpoint to check maintenance status.
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

/**
 * Check maintenance mode via an internal API call.
 * This works around the limitation of not being able to use Prisma in Edge middleware.
 */
async function checkMaintenanceMode(req: NextRequest): Promise<boolean> {
    try {
        // Check environment variable override first
        if (process.env.FORCE_MAINTENANCE_MODE === 'true') {
            return true
        }

        // Call our public maintenance status endpoint with cache busting
        // We use localhost:3000 internally to avoid DNS/SSL issues in the Edge runtime
        const res = await fetch(`http://localhost:3000/api/maintenance-status?t=${Date.now()}`, {
            cache: 'no-store',
        })
        
        if (!res.ok) return false
        
        const data = await res.json()
        return !!data.active
    } catch (error) {
        console.error('Middleware: Error checking maintenance mode:', error)
        return false
    }
}

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Check maintenance mode first (before auth checks)
    // We only check if we are NOT on a bypass path already
    let maintenanceActive = false
    try {
        if (!shouldBypassMaintenance(pathname)) {
            maintenanceActive = await checkMaintenanceMode(req)
        }
    } catch (err) {
        console.error('Middleware maintenance check failed:', err)
    }

    if (maintenanceActive) {
        // Check if user has preview access
        if (!hasPreviewAccess(req)) {
            // Redirect to maintenance page
            const url = req.nextUrl.clone()
            url.pathname = '/maintenance'
            return NextResponse.redirect(url)
        }
    }

    // Handle preview mode activation
    if (pathname.startsWith('/preview')) {
        const adminToken = req.cookies.get('user_token')?.value
        if (!adminToken) {
            // Redirect to login if not authenticated
            const url = req.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Set preview mode cookie and redirect to actual path
        const targetPath = pathname.replace('/preview', '') || '/'
        const url = req.nextUrl.clone()
        url.pathname = targetPath

        const response = NextResponse.redirect(url)
        response.cookies.set('preview_mode', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
        })
        return response
    }

    // Protect stakeholder dashboard
    if (pathname.startsWith('/stakeholder/dashboard')) {
        const token = req.cookies.get('stakeholder_token')?.value
        if (!token) {
            const url = req.nextUrl.clone()
            url.pathname = '/stakeholder/login'
            return NextResponse.redirect(url)
        }
    }

    // Protect admin routes: allow any authenticated user (admins still required by server APIs as needed)
    if (pathname.startsWith('/admin')) {
        const token = req.cookies.get('user_token')?.value
        if (!token) {
            const url = req.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }
    return NextResponse.next()
}

export const config = {
    matcher: ['/stakeholder/:path*', '/admin/:path*', '/preview/:path*', '/((?!api|_next/static|_next/image|favicon.ico|maintenance|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
