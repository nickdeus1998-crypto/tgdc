'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

interface Announcement {
  id: string | number;
  title: string;
  content: string;
  type: string;
  priority: string;
  scheduledDate: string | null;
  createdAt: string;
  coverImage?: string | null;
  source?: string;
}

interface KnowledgeBaseItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  thumbnail: string;
}

const InformationCenter: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('photos');
  const [photoFilter, setPhotoFilter] = useState<string>('all');
  const [newsletterSearch, setNewsletterSearch] = useState<string>('');
  const [pressSearch, setPressSearch] = useState<string>('');
  const [kbSearch, setKbSearch] = useState<string>('');
  const [reportSearch, setReportSearch] = useState<string>('');
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

  type PhotoCard = { href: string; caption: string; category: 'events' | 'field'; alt: string; badge: string; folderId: number | null };
  const [photos, setPhotos] = useState<PhotoCard[]>([]);
  const [videos, setVideos] = useState<Array<{ id: number; title: string; duration: string; url: string; thumbnail?: string | null; folderId: number | null }>>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
  const [reports, setReports] = useState<Array<Newsletter & { folderId?: number | null }>>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementSearch, setAnnouncementSearch] = useState<string>('');

  const [pubFolders, setPubFolders] = useState<Array<{ id: number; name: string; sortOrder: number }>>([]);
  const [activePubFolder, setActivePubFolder] = useState<number | null>(null);

  // Editable Knowledge Base heading
  const [kbTitle, setKbTitle] = useState('Knowledge Base');
  const [kbSubtitle, setKbSubtitle] = useState('Access technical documents, reports, and guidelines.');

  // Media folders for photo/video
  type MFolder = { id: number; name: string; kind: string; parentId: number | null };
  const [photoFolders, setPhotoFolders] = useState<MFolder[]>([]);
  const [currentPhotoFolderId, setCurrentPhotoFolderId] = useState<number | null>(null);
  const [photoFolderPath, setPhotoFolderPath] = useState<MFolder[]>([]);
  const [videoFolders, setVideoFolders] = useState<MFolder[]>([]);
  const [currentVideoFolderId, setCurrentVideoFolderId] = useState<number | null>(null);
  const [videoFolderPath, setVideoFolderPath] = useState<MFolder[]>([]);

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
        const [pRes, vRes, nRes, prRes, kbRes, rRes, aRes, pfRes] = await Promise.all([
          fetch('/api/information?kind=photo'),
          fetch('/api/information?kind=video'),
          fetch('/api/information?kind=newsletter'),
          fetch('/api/information?kind=press'),
          fetch('/api/information?kind=knowledge-base'),
          fetch('/api/information?kind=report'),
          fetch('/api/announcements'),
          fetch('/api/publication-folders'),
        ])
        const [p, v, n, pr, kb, r, a, pf] = await Promise.all([
          pRes.ok ? pRes.json() : Promise.resolve([]),
          vRes.ok ? vRes.json() : Promise.resolve([]),
          nRes.ok ? nRes.json() : Promise.resolve([]),
          prRes.ok ? prRes.json() : Promise.resolve([]),
          kbRes.ok ? kbRes.json() : Promise.resolve([]),
          rRes.ok ? rRes.json() : Promise.resolve([]),
          aRes.ok ? aRes.json() : Promise.resolve([]),
          pfRes.ok ? pfRes.json() : Promise.resolve([]),
        ])

        // Load editable KB heading from SiteSettings
        fetch('/api/site-settings?key=kb_section_title').then(r => r.ok ? r.json() : null).then(d => { if (d?.value) setKbTitle(d.value); }).catch(() => { });
        fetch('/api/site-settings?key=kb_section_subtitle').then(r => r.ok ? r.json() : null).then(d => { if (d?.value) setKbSubtitle(d.value); }).catch(() => { });

        setPhotos((p || []).map((it: any) => ({
          href: it.url,
          caption: it.title,
          category: deriveCategory(it.title, it.description),
          alt: it.title,
          badge: 'Photo',
          folderId: it.folderId ?? null,
        })))
        setVideos((v || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          duration: (it.description && /\b\d{1,2}:\d{2}\b/.test(it.description)) ? (it.description.match(/\b\d{1,2}:\d{2}\b/)![0]) : '—',
          url: it.url,
          thumbnail: it.thumbnail || null,
          folderId: it.folderId ?? null,
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
        setKnowledgeBase((kb || []).map((it: any) => ({
          id: it.id,
          title: it.title || '',
          subtitle: it.subtitle || '',
          description: it.description || '',
          url: it.url || '',
          thumbnail: it.thumbnail || '',
        })))
        setReports((r || []).map((it: any) => ({
          id: it.id,
          title: it.title,
          size: '',
          url: it.url,
          folderId: it.folderId ?? null,
        })))
        setAnnouncements(a || [])
        setPubFolders(Array.isArray(pf) ? pf : [])

        // Load photo folders
        try {
          const mfRes = await fetch('/api/media-folders?kind=photo&parentId=');
          if (mfRes.ok) setPhotoFolders(await mfRes.json());
        } catch { }
        try {
          const vfRes = await fetch('/api/media-folders?kind=video&parentId=');
          if (vfRes.ok) setVideoFolders(await vfRes.json());
        } catch { }
      } catch (e) {
        // fail silently for this view
      }
    })()
  }, [])

  const loadPhotoFolders = async (parentId: number | null) => {
    try {
      const res = await fetch(`/api/media-folders?kind=photo&parentId=${parentId ?? ''}`);
      if (res.ok) setPhotoFolders(await res.json());
    } catch { }
  };

  const navigatePhotoFolder = (folder: MFolder) => {
    setCurrentPhotoFolderId(folder.id);
    setPhotoFolderPath(p => [...p, folder]);
    loadPhotoFolders(folder.id);
  };

  const navigatePhotoBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPhotoFolderId(null);
      setPhotoFolderPath([]);
      loadPhotoFolders(null);
    } else {
      const target = photoFolderPath[index];
      setCurrentPhotoFolderId(target.id);
      setPhotoFolderPath(p => p.slice(0, index + 1));
      loadPhotoFolders(target.id);
    }
  };

  const getPhotoFolderPreview = (folderId: number) => {
    const item = photos.find(p => p.folderId === folderId);
    return item?.href || null;
  };

  const currentPhotos = photos.filter(p =>
    currentPhotoFolderId === null ? !p.folderId : p.folderId === currentPhotoFolderId
  );

  const loadVideoFolders = async (parentId: number | null) => {
    try {
      const res = await fetch(`/api/media-folders?kind=video&parentId=${parentId ?? ''}`);
      if (res.ok) setVideoFolders(await res.json());
    } catch { }
  };

  const navigateVideoFolder = (folder: MFolder) => {
    setCurrentVideoFolderId(folder.id);
    setVideoFolderPath(p => [...p, folder]);
    loadVideoFolders(folder.id);
  };

  const navigateVideoBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentVideoFolderId(null);
      setVideoFolderPath([]);
      loadVideoFolders(null);
    } else {
      const target = videoFolderPath[index];
      setCurrentVideoFolderId(target.id);
      setVideoFolderPath(p => p.slice(0, index + 1));
      loadVideoFolders(target.id);
    }
  };

  const getVideoFolderPreview = (folderId: number) => {
    const item = videos.find(v => v.folderId === folderId);
    return item?.thumbnail || null;
  };

  const currentVideos = videos.filter(v =>
    currentVideoFolderId === null ? !v.folderId : v.folderId === currentVideoFolderId
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 min-h-screen">
      {/* Hero */}
      <section
        className="bg-[radial-gradient(900px_460px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_420px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20"
      >
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            Information Center
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
              {['photos', 'videos', 'newsletter', 'press', 'knowledge-base', 'reports', 'announcements', 'news'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === 'news') {
                      router.push('/news');
                    } else {
                      setActiveTab(tab);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${activeTab === tab ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white' : ''}`}
                >
                  {tab === 'knowledge-base' ? 'Knowledge Base' : tab === 'reports' ? 'Publications' : tab === 'news' ? 'News' : tab === 'newsletter' ? 'Newsletter' : tab === 'press' ? 'Press' : tab === 'announcements' ? 'Announcement' : (tab.charAt(0).toUpperCase() + tab.slice(1) + ' Gallery')}
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
          </div>

          {/* Breadcrumb */}
          {photoFolderPath.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <button onClick={() => navigatePhotoBreadcrumb(-1)} className="flex items-center gap-1 font-semibold text-gray-500 hover:text-[#326101] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                All Photos
              </button>
              {photoFolderPath.map((f, i) => (
                <span key={f.id} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  <button onClick={() => navigatePhotoBreadcrumb(i)} className={`font-semibold transition-colors ${i === photoFolderPath.length - 1 ? 'text-[#326101]' : 'text-gray-500 hover:text-[#326101]'}`}>
                    {f.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-[14px]">
            {/* Folder cards */}
            {photoFolders.map(folder => {
              const preview = getPhotoFolderPreview(folder.id);
              return (
                <button
                  key={`folder-${folder.id}`}
                  onClick={() => navigatePhotoFolder(folder)}
                  className="group block overflow-hidden rounded-xl border border-gray-200 bg-white cursor-pointer text-left"
                >
                  <div className="w-full h-40 relative">
                    {preview ? (
                      <Image src={preview} alt={folder.name} width={800} height={160} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                        <svg className="w-14 h-14 text-amber-300" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
                        <span className="text-white font-bold text-xs truncate">{folder.name}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Photos */}
            {currentPhotos.map((photo) => (
              <Link
                key={photo.href}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setLightbox({ open: true, src: photo.href, caption: photo.caption, href: photo.href });
                }}
                className="group block"
                title={photo.caption}
              >
                <div className="overflow-hidden rounded-xl border bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)]">
                  <Image
                    src={photo.href}
                    alt={photo.alt}
                    width={800}
                    height={160}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Image failed to load';
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-gray-700 truncate px-1">{photo.caption}</p>
              </Link>
            ))}
            {photoFolders.length === 0 && currentPhotos.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div className="text-gray-500 font-medium">{currentPhotoFolderId ? 'This folder is empty.' : 'No photos available.'}</div>
              </div>
            )}
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

          {/* Breadcrumb */}
          {videoFolderPath.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm flex-wrap">
              <button onClick={() => navigateVideoBreadcrumb(-1)} className="flex items-center gap-1 font-semibold text-gray-500 hover:text-[#326101] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                All Videos
              </button>
              {videoFolderPath.map((f, i) => (
                <span key={f.id} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  <button onClick={() => navigateVideoBreadcrumb(i)} className={`font-semibold transition-colors ${i === videoFolderPath.length - 1 ? 'text-[#326101]' : 'text-gray-500 hover:text-[#326101]'}`}>
                    {f.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Folder cards */}
            {videoFolders.map(folder => {
              const preview = getVideoFolderPreview(folder.id);
              return (
                <button
                  key={`vfolder-${folder.id}`}
                  onClick={() => navigateVideoFolder(folder)}
                  className="group block overflow-hidden rounded-xl border border-gray-200 bg-white cursor-pointer text-left"
                >
                  <div className="aspect-video relative">
                    {preview ? (
                      <Image src={preview} alt={folder.name} width={800} height={450} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
                        <svg className="w-14 h-14 text-amber-300" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
                      </div>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
                        <span className="text-white font-bold text-xs truncate">{folder.name}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Videos */}
            {currentVideos.map((video) => {
              // Extract YouTube video ID from various URL formats
              const getYouTubeId = (url: string): string | null => {
                const patterns = [
                  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
                  /^([a-zA-Z0-9_-]{11})$/,
                ];
                for (const p of patterns) {
                  const m = url.match(p);
                  if (m) return m[1];
                }
                return null;
              };
              const ytId = getYouTubeId(video.url);

              return (
                <div
                  key={video.id}
                  className="rounded-xl border bg-white p-4"
                >
                  {ytId ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  ) : (
                    <Link href={video.url} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-lg bg-gray-900 relative overflow-hidden flex items-center justify-center group">
                      {video.thumbnail ? (
                        <Image src={video.thumbnail} alt={video.title} width={800} height={450} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                      ) : null}
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl z-10 group-hover:bg-[#326101] transition-colors">▶</div>
                    </Link>
                  )}
                  <div className="mt-3">
                    <div className="font-semibold text-gray-900 text-sm">{video.title}</div>
                    {video.duration !== '—' && <div className="text-xs text-gray-500 mt-0.5">Duration: {video.duration}</div>}
                  </div>
                </div>
              );
            })}
            {videoFolders.length === 0 && currentVideos.length === 0 && (
              <div className="col-span-full p-12 text-center rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                <div className="text-gray-500 font-medium">{currentVideoFolderId ? 'This folder is empty.' : 'No videos available.'}</div>
              </div>
            )}
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
                          className={`text-[11px] px-2 py-1 rounded-full capitalize ${p.tag === 'project'
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

      {/* Knowledge Base */}
      <section className={`${activeTab === 'knowledge-base' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{kbTitle}</h2>
              <p className="text-sm text-gray-600">{kbSubtitle}</p>
            </div>
            <div className="relative w-full sm:w-72">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {knowledgeBase
              .filter(n => n.title.toLowerCase().includes(kbSearch.toLowerCase()) || n.subtitle.toLowerCase().includes(kbSearch.toLowerCase()) || n.description.toLowerCase().includes(kbSearch.toLowerCase()))
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/knowledge-base/${item.id}`}
                  className="group rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col"
                >
                  {/* Featured Image */}
                  <div className="relative w-full h-44 bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#326101]/40">
                        <svg className="w-12 h-12 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span className="text-xs font-medium">Article</span>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#326101] transition-colors text-[15px] leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs font-semibold text-[#639427] mt-1 uppercase tracking-wide">
                        {item.subtitle}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed flex-1">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#326101] group-hover:underline">Read More →</span>
                      <span className="w-8 h-8 rounded-full bg-[#326101]/10 text-[#326101] grid place-items-center transition-all group-hover:bg-[#326101] group-hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            {knowledgeBase.filter(n => n.title.toLowerCase().includes(kbSearch.toLowerCase()) || n.subtitle.toLowerCase().includes(kbSearch.toLowerCase()) || n.description.toLowerCase().includes(kbSearch.toLowerCase())).length === 0 && (
              <div className="md:col-span-2 lg:col-span-3 p-12 text-center rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-gray-500 font-medium">No articles found{kbSearch ? ` matching "${kbSearch}"` : ''}.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reports Gallery */}
      <section className={`${activeTab === 'reports' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Publications</h2>
              <p className="text-sm text-gray-600">Download official reports and publications.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search reports..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Folder subtabs */}
            {pubFolders.length > 0 && (
              <div className="md:col-span-2 flex flex-wrap gap-2 mb-1">
                <button
                  onClick={() => setActivePubFolder(null)}
                  className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${activePubFolder === null ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white border-transparent shadow-sm' : 'text-gray-700 hover:bg-green-50 border-[#cfe6cf]'}`}
                >
                  All
                </button>
                {pubFolders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActivePubFolder(f.id)}
                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-all ${activePubFolder === f.id ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white border-transparent shadow-sm' : 'text-gray-700 hover:bg-green-50 border-[#cfe6cf]'}`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            )}
            {reports
              .filter(n => n.title.toLowerCase().includes(reportSearch.toLowerCase()))
              .filter(n => activePubFolder === null || n.folderId === activePubFolder)
              .map((n) => (
                <div
                  key={n.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-3 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl grid place-items-center font-bold text-white shadow-sm transition-transform group-hover:scale-110 ${n.url.toLowerCase().endsWith('.pdf') ? 'bg-red-500' : 'bg-blue-600'}`}>
                      {n.url.toLowerCase().endsWith('.pdf') ? 'PDF' : 'DOC'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#326101] transition-colors">{n.title}</div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-[#326101] bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Official Report</div>
                    </div>
                  </div>
                  <Link
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full text-gray-400 hover:text-[#326101] hover:bg-green-50 transition-all border border-transparent hover:border-green-100"
                    title="Download report"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Link>
                </div>
              ))}
            {reports.filter(n => n.title.toLowerCase().includes(reportSearch.toLowerCase())).filter(n => activePubFolder === null || n.folderId === activePubFolder).length === 0 && (
              <div className="md:col-span-2 p-12 text-center rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="text-gray-500 font-medium">No publications found{reportSearch ? ` matching "${reportSearch}"` : activePubFolder ? ' in this folder' : ''}.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Public Announcements */}
      <section className={`${activeTab === 'announcements' ? 'block' : 'hidden'} pb-16`}>
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Public Announcements</h2>
              <p className="text-sm text-gray-600">Stay informed with official announcements and updates.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search announcements..."
                value={announcementSearch}
                onChange={(e) => setAnnouncementSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="space-y-4">
            {announcements
              .filter((a) => a.title.toLowerCase().includes(announcementSearch.toLowerCase()) || a.content.toLowerCase().includes(announcementSearch.toLowerCase()))
              .map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:shadow-lg group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{a.title}</h3>
                        <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${a.type === 'Urgent'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : a.type === 'Event'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : a.type === 'Meeting'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                          {a.type}
                        </span>
                        {a.priority === 'High' && (
                          <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            High Priority
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none overflow-x-hidden max-h-48 overflow-y-auto pr-1" dangerouslySetInnerHTML={{ __html: a.content }} />
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {a.scheduledDate && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(a.scheduledDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Posted {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 rounded-xl grid place-items-center flex-shrink-0 ${a.priority === 'High'
                      ? 'bg-red-50 text-red-600'
                      : a.priority === 'Low'
                        ? 'bg-gray-50 text-gray-500'
                        : 'bg-emerald-50 text-emerald-600'
                      }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            {announcements.filter((a) => a.title.toLowerCase().includes(announcementSearch.toLowerCase()) || a.content.toLowerCase().includes(announcementSearch.toLowerCase())).length === 0 && (
              <div className="p-12 text-center rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <div className="text-gray-500 font-medium">No announcements found{announcementSearch ? ` matching "${announcementSearch}"` : ''}.</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeLightbox}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {/* Image + caption */}
          <div className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightbox.src}
              alt={lightbox.caption}
              width={1600}
              height={1200}
              className="max-h-[80vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 flex items-center gap-4">
              <p className="text-white/90 text-sm font-medium">{lightbox.caption}</p>
              <Link
                href={lightbox.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-medium transition-colors"
              >
                Open original ↗
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
