import Link from 'next/link'
import prisma from '@/lib/prisma'

function categoryBadge(cat: string) {
  switch (cat) {
    case 'Alert': return 'bg-red-50 text-red-600 border-red-100'
    case 'News': return 'bg-blue-50 text-blue-600 border-blue-100'
    case 'Update': return 'bg-purple-50 text-purple-600 border-purple-100'
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-100'
  }
}

export default async function NewsIndex() {
  const rows = await prisma.news.findMany({ orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] })

  const articles = rows.map((r) => ({
    id: r.id,
    title: r.title,
    date: new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    category: r.category,
    badge: categoryBadge(r.category),
    coverImage: r.coverImage || '',
    excerpt: (() => {
      const plain = (r.content || '').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      return plain.slice(0, 140) + (plain.length > 140 ? '…' : '');
    })(),
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-[#326101] to-[#639427] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">News & Updates</h1>
          <p className="text-white/70 mt-2 text-base max-w-xl mx-auto">
            Stay informed with the latest company news, project updates, and industry insights.
          </p>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-400">No articles published yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/news/${a.id}`}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Cover image */}
                  {a.coverImage ? (
                    <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.coverImage}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
                    {/* Title - top */}
                    <h2 className="text-lg font-semibold text-gray-900 leading-snug group-hover:text-[#326101] transition-colors line-clamp-2">
                      {a.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed line-clamp-3 flex-1" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {a.excerpt}
                    </p>

                    {/* Date & Category - bottom */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{a.date}</span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${a.badge}`}>
                        {a.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
