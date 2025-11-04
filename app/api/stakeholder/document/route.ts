import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'
import path from 'path'
import fs from 'fs/promises'

const prisma = new PrismaClient()
const MAX_BYTES = 10 * 1024 * 1024 // 10MB

const ALLOWED: Array<{ mime: string; ext: string; sig?: number[] }> = [
  { mime: 'application/pdf', ext: 'pdf', sig: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: 'image/jpeg', ext: 'jpg', sig: [0xff, 0xd8, 0xff] },
  { mime: 'image/jpeg', ext: 'jpeg', sig: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', ext: 'png', sig: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', sig: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx', sig: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', sig: [0x50, 0x4b, 0x03, 0x04] },
  { mime: 'text/plain', ext: 'txt' },
]

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
    const cookie = request.headers.get('cookie') || ''
    const m = cookie.match(/(?:^|; )stakeholder_token=([^;]+)/)
    const token = m ? decodeURIComponent(m[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.sid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file') as unknown as File | null
    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

    const arrayBuf = await file.arrayBuffer()
    const size = arrayBuf.byteLength
    if (size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 })

    // Build storage path under public/uploads/stakeholder/<sid>/
    const sid = String(payload.sid)
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads', 'stakeholder', sid)
    await fs.mkdir(uploadsRoot, { recursive: true })

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const ext = getExt(cleanName)
    const declared = (file as any).type || ''

    // MIME allowlist + simple magic number validation
    const head = new Uint8Array(arrayBuf.slice(0, 8))
    const allow = ALLOWED.find(a => a.ext === ext)
    if (!allow) return NextResponse.json({ error: 'File type not allowed' }, { status: 415 })
    if (allow.sig && !matchesSig(head, allow.sig)) {
      return NextResponse.json({ error: 'File signature does not match type' }, { status: 415 })
    }
    if (declared && declared !== allow.mime) {
      return NextResponse.json({ error: 'Unexpected MIME type' }, { status: 415 })
    }
    const timestamp = Date.now()
    const storedName = `${timestamp}_${cleanName}`
    const absPath = path.join(uploadsRoot, storedName)
    await fs.writeFile(absPath, Buffer.from(arrayBuf))

    const relPublicPath = path.posix.join('/uploads', 'stakeholder', sid, storedName)

    const doc = await prisma.stakeholderDocument.create({
      data: {
        stakeholderId: Number(payload.sid),
        filename: cleanName,
        mimeType: allow.mime,
        sizeBytes: size,
        storagePath: relPublicPath,
      },
    })

    return NextResponse.json({ ok: true, id: doc.id, path: relPublicPath })
  } catch (e) {
    console.error('UPLOAD DOCUMENT error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
