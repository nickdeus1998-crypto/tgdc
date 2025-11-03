'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Newsletter {
  id: number;
  title: string;
  size: string; // optional display-only; may be empty
  url: string;
}

interface PressRelease {
  id: number;
  title: string;
  date: string;
  tag: string; // derived from content (project/event/notice)
  summary: string; // from description
  body: string; // from description
  url: string; // direct link (often PDF)
}

const InformationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('photos');
  const [photoFilter, setPhotoFilter] = useState<string>('all');
  const [newsletterSearch, setNewsletterSearch] = useState<string>('');
  const [pressSearch, setPressSearch] = useState<string>('');
  const [pressFilter, setPressFilter] = useState<string>('all');
  const [lightbox, setLightbox] = useState<{ open: boolean; src: string; caption: string; href: string }>({
    open: false,
    src: '',
    caption: '',
    href: '',
  });
  const [toast, setToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [pressModal, setPressModal] = useState<{ open: boolean; item: PressRelease | null }>({ open: false, item: null });

  const showToast = (message: string = 'Link copied to clipboard') => {
    setToast({ open: true, message });
    setTimeout(() => setToast({ open: false, message: '' }), 1500);
  };

  const closeLightbox = () => {
    setLightbox({ open: false, src: '', caption: '', href: '' });
  };

  const openPressModal = (item: PressRelease) => {
    setPressModal({ open: true, item });
  };

  const closePressModal = () => {
    setPressModal({ open: false, item: null });
  };

  const copyPressTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      showToast('Title copied');
    } catch {
      showToast('Copy failed');
    }
  };

  type PhotoCard = { href: string; caption: string; category: 'events' | 'field'; alt: string; badge: string };
  const [photos, setPhotos] = useState<PhotoCard[]>([]);
  const [videos, setVideos] = useState<Array<{ title: string; duration: string; url: string }>>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);

  const deriveCategory = (title?: string, description?: string): 'events' | 'field' => {
    const t = `${title || ''} ${description || ''}`.toLowerCase()
    if (t.includes('field')) return 'field'
    if (t.includes('event') || t.includes('stakeholder') || t.includes('workshop')) return 'events'
    return 'events'
  }
  const deriveTag = (title?: string, description?: string): 'project' | 'event' | 'notice' => {
    const t = `${title || ''} ${description || ''}`.toLowerCase()
    if (t.includes('notice')) return 'notice'
    if (t.includes('event')) return 'event'
    return 'project'
  }

  useEffect(() => {
    (async () => {
      try {
        const [pRes, vRes, nRes, prRes] = await Promise.all([
          fetch('/api/information?kind=photo'),
          fetch('/api/information?kind=video'),
          fetch('/api/information?kind=newsletter'),
          fetch('/api/information?kind=press'),
        ])
        const [p, v, n, pr] = await Promise.all([
          pRes.ok ? pRes.json() : Promise.resolve([]),
          vRes.ok ? vRes.json() : Promise.resolve([]),
          nRes.ok ? nRes.json() : Promise.resolve([]),
          prRes.ok ? prRes.json() : Promise.resolve([]),
        ])

        setPhotos((p || []).map((it: any) => ({
          href: it.url,
          caption: it.title,
          category: deriveCategory(it.title, it.description),
          alt: it.title,
          badge: 'Photo',
        })))
        setVideos((v || []).map((it: any) => ({
          title: it.title,
          duration: (it.description && /\b\d{1,2}:\d{2}\b/.test(it.description)) ? (it.description.match(/\b\d{1,2}:\d{2}\b/)![0]) : '—',
          url: it.url,
        })))
        setNewsletters((n || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          size: '',
          url: it.url,
        })))
        setPressReleases((pr || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          date: it.date || it.createdAt || new Date().toISOString(),
          tag: deriveTag(it.title, it.description),
          summary: it.description || '',
          body: it.description || '',
          url: it.url,
        })))
      } catch (e) {
        // fail silently for this view
      }
    })()
  }, [])

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen">
      {/* Hero */}
      <section
        className="bg-[radial-gradient(900px_460px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_420px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20"
      >
        <div className="max-w-6xl mx-auto px-6">
          <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            Information Center
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            Photo Gallery • Video Gallery • Newsletter • Press Releases
          </h1>
          <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
            Browse visual highlights, watch videos, download newsletters, and read official announcements.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <div className="flex flex-wrap gap-2">
              {['photos', 'videos', 'newsletter', 'press'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${activeTab === tab ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('letter', 'sletter')} Gallery
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className={`${activeTab === 'photos' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
              <p className="text-sm text-gray-600">Click any photo to view it larger.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'events', 'field'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPhotoFilter(filter)}
                  className={`px-3 py-1.5 rounded-full border text-xs text-gray-700 hover:bg-green-50 border-[#cfe6cf] ${photoFilter === filter ? 'bg-[#e8f5e8] text-[#326101]' : ''}`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[14px]">
            {photos
              .filter((photo) => photoFilter === 'all' || photo.category === photoFilter)
              .map((photo) => (
                <Link
                  key={photo.href}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLightbox({ open: true, src: photo.href, caption: photo.caption, href: photo.href });
                  }}
                  className="group relative block overflow-hidden rounded-xl border bg-white hover:shadow-md transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                  title={photo.caption}
                >
                  <Image
                    src={photo.href}
                    alt={photo.alt}
                    width={800}
                    height={160}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Image failed to load';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 text-[11px] bg-black/60 text-white px-2 py-0.5 rounded">
                    {photo.badge}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Video Gallery */}
      <section className={`${activeTab === 'videos' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Video Gallery</h2>
              <p className="text-sm text-gray-600">Click a video to open it in a new tab.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.title}
                className="rounded-xl border bg-white p-4 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
              >
                <div className="aspect-video rounded-lg bg-gray-100 grid place-items-center text-gray-500 text-sm">
                  Video Placeholder
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{video.title}</div>
                    <div className="text-xs text-gray-500">Duration: {video.duration}</div>
                  </div>
                  <Link
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={`${activeTab === 'newsletter' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Newsletter</h2>
              <p className="text-sm text-gray-600">A simple list of PDF documents to open or download.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search newsletters..."
                value={newsletterSearch}
                onChange={(e) => setNewsletterSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
              />
            </div>
          </div>
          <div className="space-y-3">
            {newsletters
              .filter((n) => n.title.toLowerCase().includes(newsletterSearch.toLowerCase()))
              .map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border bg-white p-4 flex items-center justify-between gap-3 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center font-bold">
                      PDF
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{n.title}</div>
                      <div className="text-xs text-gray-500">{n.size}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
                    >
                      Open
                    </Link>
                    <button
                      onClick={() => window.open(n.url, '_blank')}
                      className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            {newsletters.filter((n) => n.title.toLowerCase().includes(newsletterSearch.toLowerCase())).length === 0 && (
              <div className="p-4 rounded-xl border bg-gray-50 text-sm text-gray-600">No newsletters found.</div>
            )}
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className={`${activeTab === 'press' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Press Releases</h2>
              <p className="text-sm text-gray-600">Search and filter official announcements.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search press releases"
                  value={pressSearch}
                  onChange={(e) => setPressSearch(e.target.value)}
                  className="w-64 pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute right-3 top-2.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {['all', 'project', 'event', 'notice'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setPressFilter(filter)}
                  className={`px-3 py-1.5 rounded-full border text-xs text-gray-700 hover:bg-green-50 border-[#cfe6cf] ${pressFilter === filter ? 'bg-[#e8f5e8] text-[#326101]' : ''}`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {pressReleases
              .filter((p) => pressFilter === 'all' || p.tag === pressFilter)
              .filter((p) => p.title.toLowerCase().includes(pressSearch.toLowerCase()) || p.summary.toLowerCase().includes(pressSearch.toLowerCase()))
              .map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border bg-white p-4 transition-transform duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{p.title}</h3>
                        <span
                          className={`text-[11px] px-2 py-1 rounded-full capitalize ${
                            p.tag === 'project'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : p.tag === 'event'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}
                        >
                          {p.tag}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(p.date).toLocaleDateString()}</div>
                      <p className="text-sm text-gray-700 mt-2">{p.summary}</p>
                    </div>
                    {p.url ? (
                      <Link
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                      >
                        Read
                      </Link>
                    ) : (
                      <button
                        onClick={() => openPressModal(p)}
                        className="px-3 py-1.5 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {pressReleases
              .filter((p) => pressFilter === 'all' || p.tag === pressFilter)
              .filter((p) => p.title.toLowerCase().includes(pressSearch.toLowerCase()) || p.summary.toLowerCase().includes(pressSearch.toLowerCase()))
              .length === 0 && (
              <div className="p-4 rounded-xl border bg-gray-50 text-sm text-gray-600">No press releases found.</div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={closeLightbox}></div>
          <div className="relative bg-white max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between p-3 border-b">
              <div className="text-sm text-gray-600">{lightbox.caption}</div>
              <button onClick={closeLightbox} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="bg-black grid place-items-center">
              <Image src={lightbox.src} alt={lightbox.caption} width={800} height={560} className="max-h-[70vh] w-auto object-contain" />
            </div>
            <div className="flex items-center justify-end gap-2 p-3 border-t bg-gray-50">
              <Link
                href={lightbox.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-[#326101] border border-[#326101] hover:bg-[#326101] hover:text-white"
              >
                Open original
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg animate-[fade_0.25s_ease_both]">
          {toast.message}
        </div>
      )}

      {/* Press Modal */}
      {pressModal.open && pressModal.item && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={closePressModal}></div>
          <div className="relative bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <h4 className="text-lg font-bold text-gray-900">{pressModal.item.title}</h4>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(pressModal.item.date).toLocaleDateString()} • {pressModal.item.tag}
                </div>
              </div>
              <button onClick={closePressModal} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="p-5 text-gray-700 leading-relaxed">
              <p>{pressModal.item.body}</p>
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t flex items-center justify-end gap-2">
              <button
                onClick={() => copyPressTitle(pressModal.item!.title)}
                className="px-3 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-100"
              >
                Copy title
              </button>
              <button
                onClick={closePressModal}
                className="px-3 py-2 rounded-lg text-sm text-white bg-[#326101] hover:bg-[#639427]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InformationCenter;
