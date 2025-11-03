import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!id) return <div className="p-8">Invalid article</div>
  const prisma = new PrismaClient()
  const row = await prisma.news.findUnique({ where: { id } })
  await prisma.$disconnect()
  if (!row) return <div className="p-8">Not found</div>

  const date = new Date(row.date).toLocaleDateString()
  const images: string[] = Array.isArray(row.images) ? (row.images as any) : []
  const videos: string[] = Array.isArray(row.videos) ? (row.videos as any) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/news" className="text-sm text-[#326101] hover:underline">← Back to news</Link>
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{row.title}</h1>
            <div className="text-gray-700 mt-2">{date} • {row.category}</div>
            {row.coverImage && (
              <div className="mt-6 rounded-xl overflow-hidden border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.coverImage} alt={row.title} className="w-full h-auto" />
              </div>
            )}
            <div className="mt-6 text-gray-900 leading-relaxed whitespace-pre-line">
              {row.content}
            </div>
            {images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Images</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt={`image-${i}`} className="w-full h-auto rounded-lg border border-gray-200" />
                  ))}
                </div>
              </div>
            )}
            {videos.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Videos</h3>
                <ul className="list-disc list-inside">
                  {videos.map((v, i) => (
                    <li key={i}><a href={v} className="text-[#326101] hover:underline" target="_blank" rel="noreferrer">{v}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

