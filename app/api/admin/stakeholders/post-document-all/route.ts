import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'
import path from 'path'
import fs from 'fs/promises'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

const ALLOWED: Array<{ mime: string; ext: string; sig?: number[] }> = [
    { mime: 'application/pdf', ext: 'pdf', sig: [0x25, 0x50, 0x44, 0x46] },
    { mime: 'image/jpeg', ext: 'jpg', sig: [0xff, 0xd8, 0xff] },
    { mime: 'image/jpeg', ext: 'jpeg', sig: [0xff, 0xd8, 0xff] },
    { mime: 'image/png', ext: 'png', sig: [0x89, 0x50, 0x4e, 0x47] },
    { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', sig: [0x50, 0x4b, 0x03, 0x04] },
    { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', sig: [0x50, 0x4b, 0x03, 0x04] },
    { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', sig: [0x50, 0x4b, 0x03, 0x04] },
    { mime: 'text/plain', ext: 'txt' },
]

function isAdmin(request: Request) {
    const cookie = request.headers.get('cookie') || ''
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = match ? decodeURIComponent(match[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    return payload?.role === 'admin'
}

function getExt(name: string) {
    const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
    return m ? m[1] : ''
}

function matchesSig(buf: Uint8Array, sig?: number[]) {
    if (!sig) return true
    if (buf.length < sig.length) return false
    for (let i = 0; i < sig.length; i++) if (buf[i] !== sig[i]) return false
    return true
}

export async function POST(request: Request) {
    try {
        console.log('[DEBUG] Global upload started');
        if (!isAdmin(request)) {
            console.log('[DEBUG] Unauthorized: Admin check failed');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const form = await request.formData()
        const file = form.get('file') as unknown as File | null
        if (!file) {
            console.log('[DEBUG] Missing file in form data');
            return NextResponse.json({ error: 'Missing file' }, { status: 400 })
        }

        const arrayBuf = await file.arrayBuffer()
        const size = arrayBuf.byteLength
        if (size > MAX_BYTES) {
            console.log('[DEBUG] File too large:', size);
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })
        }

        // Save to a global folder under uploads/stakeholder/global/
        const uploadsRoot = path.join(process.cwd(), 'public', 'uploads', 'stakeholder', 'global')
        await fs.mkdir(uploadsRoot, { recursive: true })

        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const ext = getExt(cleanName)

        const head = new Uint8Array(arrayBuf.slice(0, 8))
        const allow = ALLOWED.find(a => a.ext === ext)
        if (!allow) {
            console.log('[DEBUG] File type not allowed:', ext);
            return NextResponse.json({ error: `File type not allowed: .${ext}` }, { status: 415 })
        }
        if (allow.sig && !matchesSig(head, allow.sig)) {
            console.log('[DEBUG] File signature mismatch');
            return NextResponse.json({ error: 'File signature does not match type' }, { status: 415 })
        }

        const timestamp = Date.now()
        const storedName = `${timestamp}_${cleanName}`
        const absPath = path.join(uploadsRoot, storedName)
        await fs.writeFile(absPath, Buffer.from(arrayBuf))
        console.log('[DEBUG] File saved to:', absPath);

        const relPublicPath = path.posix.join('/uploads', 'stakeholder', 'global', storedName)

        // Fetch all stakeholders
        const stakeholders = await prisma.stakeholder.findMany({ select: { id: true } })
        console.log('[DEBUG] Found stakeholders:', stakeholders.length);

        if (stakeholders.length === 0) {
            return NextResponse.json({ ok: true, message: 'No stakeholders found, document stored globally.', path: relPublicPath })
        }

        // Use sequential loop for better reliability in SQLite
        for (const s of stakeholders) {
            await prisma.stakeholderDocument.create({
                data: {
                    stakeholderId: s.id,
                    filename: cleanName,
                    mimeType: allow.mime,
                    sizeBytes: size,
                    storagePath: relPublicPath,
                    senderRole: 'admin',
                }
            })
        }

        console.log('[DEBUG] Global distribution complete');
        return NextResponse.json({ ok: true, stakeholdersCount: stakeholders.length, path: relPublicPath })
    } catch (e: any) {
        console.error('GLOBAL STAKEHOLDER UPLOAD error', e)
        return NextResponse.json({ error: `Server error: ${e.message || 'Unknown error'}` }, { status: 500 })
    } finally {
    }
}
