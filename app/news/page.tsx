import Link from 'next/link'
import { PrismaClient } from '@prisma/client'

function categoryBadge(cat: string) {
  const k = (cat || '').toLowerCase()
  if (k.includes('project')) return 'bg-[#326101]/10 text-[#326101]'
  if (k.includes('innovation')) return 'bg-blue-100 text-blue-700'
  if (k.includes('partner')) return 'bg-purple-100 text-purple-700'
  if (k.includes('sustain')) return 'bg-green-100 text-green-700'
  if (k.includes('industry')) return 'bg-orange-100 text-orange-700'
  return 'bg-gray-100 text-gray-700'
}

export default async function NewsIndex() {
  const prisma = new PrismaClient()
  const rows = await prisma.news.findMany({ orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] })
  await prisma.$disconnect()

  const articles = rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: new Date(r.date).toLocaleDateString(),
    category: r.category,
    badge: categoryBadge(r.category),
    coverImage: r.coverImage || '',
    excerpt: (r.content || '').replace(/\s+/g, ' ').slice(0, 160) + ((r.content || '').length > 160 ? '…' : ''),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
              <span className="text-[#326101] text-sm font-medium">Latest Updates</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">News & Insights</h1>
            <p className="text-gray-600 mt-3">Company news, projects, and industry stories.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((a) => (
              <article key={a.id} className="bg-white rounded-2xl overflow-hidden shadow border border-gray-100">
                {a.coverImage && (
                  <div className="relative h-48 w-full overflow-hidden">
                    {/* Using plain img to avoid external domain restrictions */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.coverImage} alt={a.title} className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-gray-500">{a.date}</div>
                    <span className={`px-3 py-1 ${a.badge} text-xs font-medium rounded-full`}>{a.category}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{a.title}</h2>
                  <p className="text-gray-600 mb-4">{a.excerpt}</p>
                  <Link href={`/news/${a.id}`} className="text-[#326101] font-semibold hover:text-[#639427]">Read more →</Link>
                </div>
              </article>
            ))}
            {articles.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 text-center text-gray-600">No news yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

