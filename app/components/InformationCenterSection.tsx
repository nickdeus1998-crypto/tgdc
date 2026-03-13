"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: number; title: string; url: string; thumbnail?: string | null; date?: string; description?: string; folderId?: number | null };
type MFolder = { id: number; name: string; kind: string; parentId: number | null };

type TabKind = 'photos' | 'videos' | 'newsletter' | 'press' | 'knowledge-base' | 'reports';

export default function InformationCenterSection() {
  const [activeTab, setActiveTab] = useState<TabKind>('photos');
  const [photos, setPhotos] = useState<Item[]>([]);
  const [videos, setVideos] = useState<Item[]>([]);
  const [newsletters, setNewsletters] = useState<Item[]>([]);
  const [press, setPress] = useState<Item[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<Item[]>([]);
  const [reports, setReports] = useState<Item[]>([]);

  // Photo folder navigation
  const [photoFolders, setPhotoFolders] = useState<MFolder[]>([]);
  const [currentPhotoFolder, setCurrentPhotoFolder] = useState<number | null>(null);
  const [photoFolderPath, setPhotoFolderPath] = useState<MFolder[]>([]);

  // Video folder navigation
  const [videoFolders, setVideoFolders] = useState<MFolder[]>([]);
  const [currentVideoFolder, setCurrentVideoFolder] = useState<number | null>(null);
  const [videoFolderPath, setVideoFolderPath] = useState<MFolder[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, v, n, pr, kb, r] = await Promise.all([
          fetch("/api/information?kind=photo").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=video").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=newsletter&limit=6").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=press&limit=6").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=knowledge-base&limit=6").then(r => r.json()).catch(() => []),
          fetch("/api/information?kind=report&limit=6").then(r => r.json()).catch(() => []),
        ]);
        setPhotos(p || []);
        setVideos(v || []);
        setNewsletters(n || []);
        setPress(pr || []);
        setKnowledgeBase(kb || []);
        setReports(r || []);
      } catch { }
    };
    load();
    loadFolders('photo', null, setPhotoFolders);
    loadFolders('video', null, setVideoFolders);
  }, []);

  const loadFolders = async (kind: string, parentId: number | null, setter: (f: MFolder[]) => void) => {
    try {
      const res = await fetch(`/api/media-folders?kind=${kind}&parentId=${parentId ?? ''}`);
      if (res.ok) setter(await res.json());
    } catch { }
  };

  const navigatePhotoFolder = (folder: MFolder) => {
    setCurrentPhotoFolder(folder.id);
    setPhotoFolderPath(p => [...p, folder]);
    loadFolders('photo', folder.id, setPhotoFolders);
  };

  const navigatePhotoBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentPhotoFolder(null);
      setPhotoFolderPath([]);
      loadFolders('photo', null, setPhotoFolders);
    } else {
      const target = photoFolderPath[index];
      setCurrentPhotoFolder(target.id);
      setPhotoFolderPath(p => p.slice(0, index + 1));
      loadFolders('photo', target.id, setPhotoFolders);
    }
  };

  const navigateVideoFolder = (folder: MFolder) => {
    setCurrentVideoFolder(folder.id);
    setVideoFolderPath(p => [...p, folder]);
    loadFolders('video', folder.id, setVideoFolders);
  };

  const navigateVideoBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentVideoFolder(null);
      setVideoFolderPath([]);
      loadFolders('video', null, setVideoFolders);
    } else {
      const target = videoFolderPath[index];
      setCurrentVideoFolder(target.id);
      setVideoFolderPath(p => p.slice(0, index + 1));
      loadFolders('video', target.id, setVideoFolders);
    }
  };

  // Get preview image for a folder (first photo in that folder)
  const getFolderPreview = (folderId: number, items: Item[]) => {
    const item = items.find(i => i.folderId === folderId);
    return item?.thumbnail || item?.url || null;
  };

  const tabs: { id: TabKind; label: string; icon: string }[] = [
    { id: 'photos', label: 'Photos Gallery', icon: '🖼️' },
    { id: 'videos', label: 'Videos Gallery', icon: '🎥' },
    { id: 'newsletter', label: 'Newsletter Gallery', icon: '✉️' },
    { id: 'press', label: 'Press Gallery', icon: '📰' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: '📚' },
    { id: 'reports', label: 'Report Gallery', icon: '📊' },
  ];

  // Filtered items for current folder level
  const currentPhotos = photos.filter(p =>
    currentPhotoFolder === null ? !p.folderId : p.folderId === currentPhotoFolder
  );
  const currentVideos = videos.filter(v =>
    currentVideoFolder === null ? !v.folderId : v.folderId === currentVideoFolder
  );

  // Breadcrumb component
  const Breadcrumb = ({ path, onNavigate }: { path: MFolder[]; onNavigate: (i: number) => void }) => (
    <div className="flex items-center gap-1.5 mb-6 px-1 text-sm flex-wrap">
      <button onClick={() => onNavigate(-1)} className={`flex items-center gap-1 font-semibold transition-colors ${path.length === 0 ? 'text-[#326101]' : 'text-gray-500 hover:text-[#326101]'}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
        All
      </button>
      {path.map((f, i) => (
        <span key={f.id} className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          <button onClick={() => onNavigate(i)} className={`font-semibold transition-colors ${i === path.length - 1 ? 'text-[#326101]' : 'text-gray-500 hover:text-[#326101]'}`}>
            {f.name}
          </button>
        </span>
      ))}
    </div>
  );

  // Folder card component
  const FolderCard = ({ folder, preview, onClick }: { folder: MFolder; preview: string | null; onClick: () => void }) => (
    <button onClick={onClick} className="group block text-left w-full">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm transition-all group-hover:border-[#326101] group-hover:shadow-lg relative">
        {preview ? (
          <img src={preview} alt={folder.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-amber-300" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
          </div>
        )}
        {/* Folder overlay badge */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
            <span className="text-white font-bold text-sm truncate">{folder.name}</span>
          </div>
        </div>
      </div>
    </button>
  );

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Information Centre</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our latest media, newsletters, and technical documents in our comprehensive knowledge base.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${activeTab === tab.id
                ? 'bg-[#326101] text-white shadow-lg scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">

          {/* PHOTOS with folder navigation */}
          {activeTab === 'photos' && (
            <div>
              {(currentPhotoFolder !== null || photoFolderPath.length > 0) && (
                <Breadcrumb path={photoFolderPath} onNavigate={navigatePhotoBreadcrumb} />
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Folder cards first */}
                {photoFolders.map(f => (
                  <FolderCard key={`folder-${f.id}`} folder={f} preview={getFolderPreview(f.id, photos)} onClick={() => navigatePhotoFolder(f)} />
                ))}
                {/* Then loose photos */}
                {currentPhotos.map(p => (
                  <a key={p.id} href={p.url} target="_blank" rel="noreferrer" className="group block">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-white shadow-sm transition-transform group-hover:scale-[1.02]">
                      <img src={p.thumbnail || p.url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-3 text-sm font-bold text-gray-900 truncate px-1">{p.title}</div>
                  </a>
                ))}
                {photoFolders.length === 0 && currentPhotos.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    {currentPhotoFolder ? 'This folder is empty.' : 'No photos available.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIDEOS with folder navigation */}
          {activeTab === 'videos' && (
            <div>
              {(currentVideoFolder !== null || videoFolderPath.length > 0) && (
                <Breadcrumb path={videoFolderPath} onNavigate={navigateVideoBreadcrumb} />
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Folder cards first */}
                {videoFolders.map(f => (
                  <FolderCard key={`folder-${f.id}`} folder={f} preview={getFolderPreview(f.id, videos)} onClick={() => navigateVideoFolder(f)} />
                ))}
                {/* Then loose videos */}
                {currentVideos.map(v => (
                  <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="group block bg-white p-4 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video w-full rounded-xl bg-gray-900 mb-4 flex items-center justify-center relative overflow-hidden">
                      {v.thumbnail ? (
                        <img src={v.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      ) : null}
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl z-10 group-hover:bg-[#326101] transition-colors">▶</div>
                    </div>
                    <div className="font-bold text-gray-900 mb-1">{v.title}</div>
                    <div className="text-xs text-gray-500">{v.date ? new Date(v.date).toLocaleDateString() : ''}</div>
                  </a>
                ))}
                {videoFolders.length === 0 && currentVideos.length === 0 && (
                  <div className="col-span-full text-center py-20 text-gray-400">
                    {currentVideoFolder ? 'This folder is empty.' : 'No videos available.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {(activeTab === 'newsletter' || activeTab === 'press' || activeTab === 'knowledge-base' || activeTab === 'reports') && (
            <div className="grid md:grid-cols-2 gap-4">
              {(() => {
                const currentItems = activeTab === 'newsletter' ? newsletters : activeTab === 'press' ? press : activeTab === 'knowledge-base' ? knowledgeBase : reports;
                if (currentItems.length === 0) return <div className="col-span-full text-center py-20 text-gray-400">No items found in this category.</div>;

                return currentItems.map(item => (
                  activeTab === 'knowledge-base' ? (
                    <Link key={item.id} href={`/knowledge-base/${item.id}`} className="flex items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-[#326101] group">
                      <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-2xl mr-4 group-hover:bg-[#326101] group-hover:text-white transition-colors">📚</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                      </div>
                      <div className="ml-4 text-gray-300 group-hover:text-[#326101] transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </Link>
                  ) : (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="flex items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-[#326101] group">
                      <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center text-2xl mr-4 group-hover:bg-[#326101] group-hover:text-white transition-colors">
                        {activeTab === 'newsletter' ? '✉️' : activeTab === 'press' ? '📰' : activeTab === 'reports' ? '📊' : '📘'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                          {item.date ? <span>{new Date(item.date).toLocaleDateString()}</span> : null}
                          {(activeTab === 'reports') && <span className="uppercase font-bold text-[#326101]">Download</span>}
                        </div>
                      </div>
                      <div className="ml-4 text-gray-300 group-hover:text-[#326101] transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </a>
                  )
                ));
              })()}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
