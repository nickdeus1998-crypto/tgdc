import Link from 'next/link'
import prisma from '@/lib/prisma'
import { sanitizeHtml } from '@/app/lib/sanitize'

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!id) return <div className="p-8">Invalid article</div>
  const row = await prisma.news.findUnique({ where: { id } })
  if (!row) return <div className="p-8">Not found</div>

  const date = new Date(row.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const images: string[] = Array.isArray(row.images) ? (row.images as any) : []
  const videos: string[] = Array.isArray(row.videos) ? (row.videos as any) : []

  const catColor = (() => {
    switch (row.category) {
      case 'Alert': return 'bg-red-50 text-red-600 border-red-100'
      case 'News': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'Update': return 'bg-purple-50 text-purple-600 border-purple-100'
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover image hero */}
      {row.coverImage && (
        <div className="relative w-full h-[300px] md:h-[400px] bg-gray-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={row.coverImage}
            alt={row.title}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          {/* Back button over image */}
          <div className="absolute top-6 left-6 z-10">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white bg-black/25 backdrop-blur-sm px-3.5 py-2 rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button when no cover */}
        {!row.coverImage && (
          <div className="pt-8">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-sm text-[#326101] hover:text-[#639427] font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to News
            </Link>
          </div>
        )}

        {/* Article */}
        <article className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${row.coverImage ? '-mt-16 relative z-10' : 'mt-4'}`}>
          <div className="p-6 md:p-10">
            {/* Title — top */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {row.title}
            </h1>

            {/* Thin separator */}
            <div className="my-6 h-px bg-gray-100" />

            {/* Body content */}
            <div
              className="text-gray-700 leading-relaxed prose prose-green max-w-none
                prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:mt-6 prose-headings:mb-3
                prose-p:mb-4 prose-p:leading-relaxed
                prose-a:text-[#326101] prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:border prose-img:border-gray-100
                prose-blockquote:border-l-[#326101] prose-blockquote:bg-gray-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
                prose-strong:text-gray-900
                prose-ul:my-4 prose-ol:my-4 prose-li:my-1"
              style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(row.content) }}
            />

            {/* Images gallery */}
            {images.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Gallery</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt={`image-${i}`} className="w-full h-auto rounded-xl border border-gray-100" />
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Videos</h3>
                <div className="space-y-2">
                  {videos.map((v, i) => (
                    <a
                      key={i}
                      href={v}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#326101]/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-[#326101]" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                      <span className="text-sm text-gray-500 group-hover:text-[#326101] truncate flex-1">{v}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Date & Category — bottom */}
            <div className="mt-10 pt-5 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {date}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full border ${catColor}`}>
                {row.category}
              </span>
            </div>
          </div>
        </article>

        <div className="h-16" />
      </div>
    </div>
  )
}
