import { NextResponse } from 'next/server'
import { getJwtSecret, verifyJwt } from '@/app/lib/auth'
import path from 'path'
import fs from 'fs/promises'

const MAX_BYTES = 10 * 1024 * 1024 // 10MB

const ALLOWED: Array<{ ext: string; mime: string; sig?: number[] }> = [
  { ext: 'jpg', mime: 'image/jpeg', sig: [0xff, 0xd8, 0xff] },
  { ext: 'jpeg', mime: 'image/jpeg', sig: [0xff, 0xd8, 0xff] },
  { ext: 'png', mime: 'image/png', sig: [0x89, 0x50, 0x4e, 0x47] },
  { ext: 'gif', mime: 'image/gif', sig: [0x47, 0x49, 0x46, 0x38] },
  { ext: 'pdf', mime: 'application/pdf', sig: [0x25, 0x50, 0x44, 0x46] },
  { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sig: [0x50, 0x4b, 0x03, 0x04] },
  { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sig: [0x50, 0x4b, 0x03, 0x04] },
  { ext: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', sig: [0x50, 0x4b, 0x03, 0x04] },
  { ext: 'txt', mime: 'text/plain' },
  { ext: 'csv', mime: 'text/csv' },
  { ext: 'mp4', mime: 'video/mp4' },
]

function getExt(filename: string) {
  const match = filename.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

function matchesSignature(bytes: Uint8Array, sig?: number[]) {
  if (!sig) return true
  if (bytes.length < sig.length) return false
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false
  }
  return true
}

export async function POST(request: Request) {
  try {
    const cookie = request.headers.get('cookie') || ''
    const match = cookie.match(/(?:^|; )user_token=([^;]+)/)
    const token = match ? decodeURIComponent(match[1]) : null
    const payload = token ? verifyJwt(token, getJwtSecret()) : null
    if (!payload?.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const form = await request.formData()
    const file = form.get('file') as unknown as File | null
    if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

    const buf = await file.arrayBuffer()
    if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: 'File too large (10MB max)' }, { status: 413 })

    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const ext = getExt(cleanName)
    const allow = ALLOWED.find(a => a.ext === ext)
    if (!allow) return NextResponse.json({ error: 'File type not allowed' }, { status: 415 })

    const head = new Uint8Array(buf.slice(0, 8))
    if (!matchesSignature(head, allow.sig)) {
      return NextResponse.json({ error: 'File signature mismatch' }, { status: 415 })
    }

    const uid = String(payload.uid)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'messages', uid)
    await fs.mkdir(uploadsDir, { recursive: true })

    const storedName = `${Date.now()}_${cleanName}`
    await fs.writeFile(path.join(uploadsDir, storedName), Buffer.from(buf))

    const relPath = path.posix.join('/uploads', 'messages', uid, storedName)

    return NextResponse.json({
      ok: true,
      attachment: {
        name: cleanName,
        url: relPath,
        mimeType: allow.mime,
        sizeBytes: buf.byteLength,
      },
    })
  } catch (e) {
    console.error('MESSAGE attachment upload error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
