import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
    const cookieStore = await cookies()
    const previewMode = cookieStore.get('preview_mode')?.value === 'true'

    return NextResponse.json({ isPreview: previewMode })
}
