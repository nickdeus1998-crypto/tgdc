import { NextResponse } from 'next/server'
import { verifyJwt, getJwtSecret } from '@/app/lib/auth'
import path from 'path'
import fs from 'fs/promises'

const MEDIA_ROOT = path.join(process.cwd(), 'public', 'uploads', 'media')
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB

const ALLOWED_IMAGES: Array<{ ext: string; mime: string; sig: number[] }> = [
  { ext: 'jpg', mime: 'image/jpeg', sig: [0xff, 0xd8, 0xff] },
  { ext: 'jpeg', mime: 'image/jpeg', sig: [0xff, 0xd8, 0xff] },
  { ext: 'png', mime: 'image/png', sig: [0x89, 0x50, 0x4e, 0x47] },
  { ext: 'gif', mime: 'image/gif', sig: [0x47, 0x49, 0x46, 0x38] },
  { ext: 'webp', mime: 'image/webp', sig: [0x52, 0x49, 0x46, 0x46] },
]

type MediaItem = {
  name: string
  url: string
  sizeBytes: number
  uploadedAt: string
}

function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(/(?:^|; )user_token=([^;]+)/)
  const token = match ? decodeURIComponent(match[1]) : null
  const payload = token ? verifyJwt(token, getJwtSecret()) : null
  return payload?.role === 'admin'
}

async function ensureMediaDir() {
  await fs.mkdir(MEDIA_ROOT, { recursive: true })
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

function getExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

function matchesSignature(bytes: Uint8Array, sig: number[]) {
  if (bytes.length < sig.length) return false
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false
  }
  return true
}

async function listMediaFiles(): Promise<MediaItem[]> {
  await ensureMediaDir()
  const entries = await fs.readdir(MEDIA_ROOT, { withFileTypes: true })
  const files = await Promise.all(
    entries
      .filter(entry => entry.isFile())
      .map(async entry => {
        const absPath = path.join(MEDIA_ROOT, entry.name)
        const stats = await fs.stat(absPath)
        return {
          name: entry.name,
          url: path.posix.join('/uploads', 'media', entry.name),
          sizeBytes: stats.size,
          uploadedAt: stats.mtime.toISOString(),
        }
      }),
  )
  return files.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1))
}

export async function GET(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await listMediaFiles()
    return NextResponse.json({ items })
  } catch (error) {
    console.error('ADMIN media list error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const uploaded = form.getAll('files').filter((file): file is File => file instanceof File)

    if (!uploaded.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    await ensureMediaDir()

    const results: MediaItem[] = []

    for (const file of uploaded) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: `${file.name} is too large. Max file size is 10MB.` },
          { status: 413 },
        )
      }

      const cleanName = sanitizeFilename(file.name)
      const ext = getExtension(cleanName)
      const allowed = ALLOWED_IMAGES.find(item => item.ext === ext)
      if (!allowed) {
        return NextResponse.json(
          { error: `${file.name} has an unsupported file type.` },
          { status: 415 },
        )
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const head = new Uint8Array(buffer.slice(0, 12))
      if (!matchesSignature(head, allowed.sig)) {
        return NextResponse.json(
          { error: `${file.name} does not match expected file signature.` },
          { status: 415 },
        )
      }

      const storedName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
      await fs.writeFile(path.join(MEDIA_ROOT, storedName), buffer)

      results.push({
        name: storedName,
        url: path.posix.join('/uploads', 'media', storedName),
        sizeBytes: buffer.byteLength,
        uploadedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ items: results })
  } catch (error) {
    console.error('ADMIN media upload error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

