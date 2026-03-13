'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import MediaPicker from '../components/MediaPicker';

const StableQuillEditor = dynamic(() => import('../components/StableQuillEditor'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';


const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'indent',
  'align',
  'link', 'image', 'video',
  'blockquote', 'code-block',
];

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
  clipboard: { matchVisual: false },
};

type Id = number | string;
type Kind = 'photo' | 'video' | 'newsletter' | 'press' | 'knowledge-base' | 'report';

interface InfoItem {
  id?: Id;
  kind: Kind;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  date?: string | null;
  folderId?: number | null;
  content?: string | null;
}

interface PubFolder {
  id: number;
  name: string;
  sortOrder: number;
}

interface MFolder {
  id: number;
  name: string;
  kind: string;
  parentId: number | null;
  sortOrder: number;
}

const TGREEN = '#326101';
const TEXT_DARK = '#111111';

const emptyByKind: Record<Kind, InfoItem> = {
  photo: { kind: 'photo', title: '', description: '', url: '', thumbnail: '', date: null },
  video: { kind: 'video', title: '', description: '', url: '', thumbnail: '', date: null },
  newsletter: { kind: 'newsletter', title: '', description: '', url: '', thumbnail: '', date: null },
  press: { kind: 'press', title: '', description: '', url: '', thumbnail: '', date: new Date().toISOString().slice(0, 10) },
  'knowledge-base': { kind: 'knowledge-base', title: '', subtitle: '', description: '', content: '', url: '#', thumbnail: '', date: null },
  report: { kind: 'report', title: '', description: '', url: '', thumbnail: '', date: null, folderId: null },
};

const API = {
  list: async (kind: Kind) => fetch(`/api/information?kind=${encodeURIComponent(kind)}`),
  create: async (item: InfoItem) =>
    fetch('/api/information', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) }),
  update: async (id: Id, patch: Partial<InfoItem>) =>
    fetch(`/api/information/${id}` as any, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }),
  delete: async (id: Id) => fetch(`/api/information/${id}` as any, { method: 'DELETE' }),
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>{label}</span>
      {children}
    </label>
  );
}

const SectionHeader: React.FC<{ title: string; cta?: React.ReactNode }> = ({ title, cta }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-xl font-bold" style={{ color: TEXT_DARK }}>{title}</h3>
    {cta}
  </div>
);

const kindLabels: Record<Kind, { label: string; icon: React.ReactNode }> = {
  photo: {
    label: 'Photos',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
  video: {
    label: 'Videos',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  },
  newsletter: {
    label: 'Newsletters',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
  },
  press: {
    label: 'Press Releases',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  },
  'knowledge-base': {
    label: 'Knowledge Base',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  report: {
    label: 'Publications',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
};
const InformationCenterPage: React.FC<{ initialKind?: Kind }> = ({ initialKind }) => {
  const [activeKind, setActiveKind] = useState<Kind>(initialKind || 'photo');
  const [items, setItems] = useState<InfoItem[]>([]);
  const [form, setForm] = useState<InfoItem>(emptyByKind[initialKind || 'photo']);
  const [editing, setEditing] = useState<Id | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ list?: boolean; save?: boolean; del?: Id | null }>({ list: true });

  // Folder state (for report kind)
  const [folders, setFolders] = useState<PubFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<number | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFolder, setRenamingFolder] = useState<{ id: number; name: string } | null>(null);

  // Media folder state (for photo/video kind — supports nesting)
  const [mediaFolders, setMediaFolders] = useState<MFolder[]>([]);
  const [currentMediaFolderId, setCurrentMediaFolderId] = useState<number | null>(null);
  const [mediaFolderPath, setMediaFolderPath] = useState<MFolder[]>([]); // breadcrumb
  const [newMediaFolderName, setNewMediaFolderName] = useState('');
  const [renamingMediaFolder, setRenamingMediaFolder] = useState<{ id: number; name: string } | null>(null);

  const isMediaKind = activeKind === 'photo' || activeKind === 'video';

  const loadFolders = async () => {
    try {
      const res = await fetch('/api/publication-folders');
      if (res.ok) setFolders(await res.json());
    } catch { /* silent */ }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      await fetch('/api/publication-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim(), sortOrder: folders.length }),
      });
      setNewFolderName('');
      await loadFolders();
    } catch { /* silent */ }
  };

  const renameFolder = async () => {
    if (!renamingFolder || !renamingFolder.name.trim()) return;
    try {
      await fetch(`/api/publication-folders/${renamingFolder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renamingFolder.name.trim() }),
      });
      setRenamingFolder(null);
      await loadFolders();
    } catch { /* silent */ }
  };

  const deleteFolder = async (id: number) => {
    try {
      await fetch(`/api/publication-folders/${id}`, { method: 'DELETE' });
      if (activeFolder === id) setActiveFolder(null);
      await loadFolders();
      await load(activeKind);
    } catch { /* silent */ }
  };

  // --- Media folder CRUD ---
  const loadMediaFolders = async (parentId: number | null = null) => {
    try {
      const qs = `kind=${encodeURIComponent(activeKind)}&parentId=${parentId ?? ''}`;
      const res = await fetch(`/api/media-folders?${qs}`);
      if (res.ok) setMediaFolders(await res.json());
    } catch { /* silent */ }
  };

  const createMediaFolder = async () => {
    if (!newMediaFolderName.trim()) return;
    try {
      await fetch('/api/media-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newMediaFolderName.trim(), kind: activeKind, parentId: currentMediaFolderId }),
      });
      setNewMediaFolderName('');
      await loadMediaFolders(currentMediaFolderId);
    } catch { /* silent */ }
  };

  const renameMediaFolder = async () => {
    if (!renamingMediaFolder || !renamingMediaFolder.name.trim()) return;
    try {
      await fetch(`/api/media-folders/${renamingMediaFolder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renamingMediaFolder.name.trim() }),
      });
      setRenamingMediaFolder(null);
      await loadMediaFolders(currentMediaFolderId);
    } catch { /* silent */ }
  };

  const deleteMediaFolder = async (id: number) => {
    try {
      await fetch(`/api/media-folders/${id}`, { method: 'DELETE' });
      await loadMediaFolders(currentMediaFolderId);
      await load(activeKind);
    } catch { /* silent */ }
  };

  const navigateToMediaFolder = (folder: MFolder) => {
    setCurrentMediaFolderId(folder.id);
    setMediaFolderPath((p) => [...p, folder]);
    setForm((v) => ({ ...v, folderId: folder.id }));
    loadMediaFolders(folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      // Root
      setCurrentMediaFolderId(null);
      setMediaFolderPath([]);
      setForm((v) => ({ ...v, folderId: null }));
      loadMediaFolders(null);
    } else {
      const target = mediaFolderPath[index];
      setCurrentMediaFolderId(target.id);
      setMediaFolderPath((p) => p.slice(0, index + 1));
      setForm((v) => ({ ...v, folderId: target.id }));
      loadMediaFolders(target.id);
    }
  };

  const kinds: Kind[] = useMemo(() => ['photo', 'video', 'newsletter', 'press', 'knowledge-base', 'report'], []);

  const load = async (kind: Kind) => {
    setLoading((b) => ({ ...b, list: true }));
    setErr(null);
    try {
      const res = await API.list(kind);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
      setItems([]);
    } finally {
      setLoading((b) => ({ ...b, list: false }));
    }
  };

  useEffect(() => {
    setForm(emptyByKind[activeKind]);
    setEditing(null);
    setActiveFolder(null);
    setCurrentMediaFolderId(null);
    setMediaFolderPath([]);
    setMediaFolders([]);
    load(activeKind);
    if (activeKind === 'report') loadFolders();
    if (activeKind === 'photo' || activeKind === 'video') loadMediaFolders(null);
  }, [activeKind]);

  const submit = async () => {
    setLoading((b) => ({ ...b, save: true }));
    setErr(null);
    try {
      const payload = { ...form };
      // Auto-assign current media folder for photo/video
      if (isMediaKind && currentMediaFolderId && !editing) {
        payload.folderId = currentMediaFolderId;
      }
      if (editing != null) {
        const res = await API.update(editing, payload);
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await API.create(payload);
        if (!res.ok) throw new Error('Create failed');
      }
      setForm(emptyByKind[activeKind]);
      setEditing(null);
      await load(activeKind);
    } catch (e: any) {
      setErr(e?.message || 'Save failed');
    } finally {
      setLoading((b) => ({ ...b, save: false }));
    }
  };

  const remove = async (id: Id) => {
    setLoading((b) => ({ ...b, del: id }));
    setErr(null);
    try {
      const res = await API.delete(id);
      if (!res.ok) throw new Error('Delete failed');
      await load(activeKind);
    } catch (e: any) {
      setErr(e?.message || 'Delete failed');
    } finally {
      setLoading((b) => ({ ...b, del: null }));
    }
  };

  const renderListCard = (it: InfoItem) => (
    <div key={String(it.id)} className="border border-gray-200 rounded-md p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold" style={{ color: TEXT_DARK }}>{it.title}</div>
          {it.subtitle && <div className="text-xs font-medium" style={{ color: '#374151' }}>{it.subtitle}</div>}
          {it.description && <div className="text-xs" style={{ color: '#6b7280' }}>{it.description}</div>}
          <div className="text-xs" style={{ color: '#6b7280' }}>{it.url}</div>
          {activeKind === 'report' && it.folderId && (
            <div className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block" style={{ background: '#e8f5e8', color: TGREEN }}>
              {folders.find(f => f.id === it.folderId)?.name || 'Folder'}
            </div>
          )}
          {activeKind === 'press' && it.date && (
            <div className="text-xs" style={{ color: '#6b7280' }}>{new Date(it.date).toLocaleDateString()}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="text-xs px-2 py-1 rounded border border-gray-200"
            onClick={() => { setEditing(it.id ?? null); setForm({ ...it }); }}
          >
            Edit
          </button>
          <button
            className="text-xs px-2 py-1 rounded border border-red-200"
            style={{ color: '#b91c1c' }}
            disabled={loading.del === (it.id ?? null)}
            onClick={() => remove(it.id ?? '')}
          >
            {loading.del === (it.id ?? null) ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );

  const hasThumbnail = activeKind === 'photo' || activeKind === 'video' || activeKind === 'knowledge-base';
  const isKB = activeKind === 'knowledge-base';

  // Editable KB section heading (for admin only)
  const [kbSectionTitle, setKbSectionTitle] = useState('Knowledge Base');
  const [kbSectionSubtitle, setKbSectionSubtitle] = useState('Access technical documents, reports, and guidelines.');
  const [savingKbHeading, setSavingKbHeading] = useState(false);

  useEffect(() => {
    fetch('/api/site-settings?key=kb_section_title').then(r => r.ok ? r.json() : null).then(d => { if (d?.value) setKbSectionTitle(d.value); }).catch(() => { });
    fetch('/api/site-settings?key=kb_section_subtitle').then(r => r.ok ? r.json() : null).then(d => { if (d?.value) setKbSectionSubtitle(d.value); }).catch(() => { });
  }, []);

  const onContentChange = useCallback((val: string) => {
    setForm((v) => ({ ...v, content: val }));
  }, []);

  const filteredItems = items.filter(it => {
    if (activeKind === 'report') return activeFolder === null || it.folderId === activeFolder;
    if (isMediaKind) return currentMediaFolderId === null ? !it.folderId : it.folderId === currentMediaFolderId;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {err && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{err}</span>
          <button onClick={() => setErr(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {kinds.map((k) => {
            const active = activeKind === k;
            return (
              <button
                key={k}
                onClick={() => setActiveKind(k)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${active
                  ? 'border-[#326101] text-[#326101] bg-green-50/60'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <span className={active ? 'text-[#326101]' : 'text-gray-400'}>{kindLabels[k].icon}</span>
                {kindLabels[k].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Folder management for Reports */}
      {activeKind === 'report' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            <h3 className="text-sm font-semibold text-gray-900">Publication Folders</h3>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <button
              onClick={() => setActiveFolder(null)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFolder === null
                ? 'bg-[#326101] text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >All</button>
            {folders.map((f) => (
              <div key={f.id} className="flex items-center gap-1">
                {renamingFolder?.id === f.id ? (
                  <div className="flex items-center gap-1 bg-white border border-[#326101] rounded-lg px-1">
                    <input
                      value={renamingFolder.name}
                      onChange={(e) => setRenamingFolder({ ...renamingFolder, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && renameFolder()}
                      className="px-2 py-1 text-xs border-0 outline-none w-28 text-gray-900"
                      autoFocus
                    />
                    <button onClick={renameFolder} className="text-xs text-green-600 hover:text-green-800 px-1">✓</button>
                    <button onClick={() => setRenamingFolder(null)} className="text-xs text-gray-400 hover:text-gray-600 px-1">✕</button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setActiveFolder(f.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${activeFolder === f.id
                        ? 'bg-[#326101] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >{f.name}</button>
                    <button onClick={() => setRenamingFolder({ id: f.id, name: f.name })} className="w-5 h-5 rounded text-gray-400 hover:text-[#326101] hover:bg-green-50 flex items-center justify-center text-xs" title="Rename">✎</button>
                    <button onClick={() => deleteFolder(f.id)} className="w-5 h-5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center text-xs" title="Delete">✕</button>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createFolder()}
              placeholder="New folder name..."
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg flex-1 focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
            />
            <button
              onClick={createFolder}
              disabled={!newFolderName.trim()}
              className="text-white text-sm font-medium rounded-lg px-4 py-2 bg-[#326101] hover:bg-[#2a5101] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >+ Add</button>
          </div>
        </div>
      )}

      {/* Main content: two-panel layout */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left panel: Items list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {kindLabels[activeKind].label}
                <span className="ml-2 text-xs font-normal text-gray-400">({filteredItems.length})</span>
              </h3>
            </div>
          </div>

          {/* Media folder Explorer (photo/video) */}
          {isMediaKind && (
            <div className="border-b border-gray-100">
              {/* Breadcrumb */}
              <div className="px-4 py-2 flex items-center gap-1 text-xs bg-gray-50/80 overflow-x-auto">
                <button onClick={() => navigateToBreadcrumb(-1)} className={`flex items-center gap-1 font-medium hover:text-[#326101] transition-colors ${currentMediaFolderId === null ? 'text-[#326101]' : 'text-gray-500'}`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                  Root
                </button>
                {mediaFolderPath.map((f, i) => (
                  <span key={f.id} className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    <button onClick={() => navigateToBreadcrumb(i)} className={`font-medium hover:text-[#326101] transition-colors ${i === mediaFolderPath.length - 1 ? 'text-[#326101]' : 'text-gray-500'}`}>
                      {f.name}
                    </button>
                  </span>
                ))}
              </div>

              {/* Folder grid */}
              {mediaFolders.length > 0 && (
                <div className="px-4 py-3 grid grid-cols-3 gap-2">
                  {mediaFolders.map((f) => (
                    <div key={f.id} className="group relative">
                      {renamingMediaFolder?.id === f.id ? (
                        <div className="flex items-center gap-1 border border-[#326101] rounded-lg px-2 py-1 bg-white">
                          <input
                            value={renamingMediaFolder.name}
                            onChange={(e) => setRenamingMediaFolder({ ...renamingMediaFolder, name: e.target.value })}
                            onKeyDown={(e) => { if (e.key === 'Enter') renameMediaFolder(); if (e.key === 'Escape') setRenamingMediaFolder(null); }}
                            className="text-xs border-0 outline-none flex-1 w-full text-gray-900"
                            autoFocus
                          />
                          <button onClick={renameMediaFolder} className="text-xs text-green-600">✓</button>
                          <button onClick={() => setRenamingMediaFolder(null)} className="text-xs text-gray-400">✕</button>
                        </div>
                      ) : (
                        <button
                          onDoubleClick={() => navigateToMediaFolder(f)}
                          onClick={() => navigateToMediaFolder(f)}
                          className="w-full flex flex-col items-center gap-1 p-2.5 rounded-lg border border-transparent hover:border-[#326101]/30 hover:bg-green-50/50 transition-all text-center"
                        >
                          <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z" /></svg>
                          <span className="text-[11px] font-medium text-gray-700 truncate w-full">{f.name}</span>
                        </button>
                      )}
                      {/* Folder action buttons */}
                      {renamingMediaFolder?.id !== f.id && (
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setRenamingMediaFolder({ id: f.id, name: f.name })} className="w-5 h-5 rounded bg-white/80 text-gray-400 hover:text-[#326101] flex items-center justify-center text-[10px] shadow-sm" title="Rename">✎</button>
                          <button onClick={() => deleteMediaFolder(f.id)} className="w-5 h-5 rounded bg-white/80 text-gray-400 hover:text-red-500 flex items-center justify-center text-[10px] shadow-sm" title="Delete">✕</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Create folder inline */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <input
                  value={newMediaFolderName}
                  onChange={(e) => setNewMediaFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createMediaFolder()}
                  placeholder="New folder…"
                  className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg flex-1 focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                />
                <button
                  onClick={createMediaFolder}
                  disabled={!newMediaFolderName.trim()}
                  className="text-xs font-medium rounded-lg px-3 py-1.5 bg-[#326101] text-white hover:bg-[#2a5101] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >+ Folder</button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto max-h-[600px] divide-y divide-gray-100">
            {loading.list ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#326101] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-10 h-10 mb-2 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <span className="text-sm">No items in this {currentMediaFolderId ? 'folder' : 'location'}</span>
                <span className="text-xs mt-1">Use the form to create one →</span>
              </div>
            ) : (
              filteredItems.map((it) => (
                <div
                  key={String(it.id)}
                  className={`group px-4 py-3.5 hover:bg-green-50/40 transition-colors cursor-default ${editing === it.id ? 'bg-green-50 border-l-2 border-l-[#326101]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail preview */}
                    {(it.thumbnail || activeKind === 'photo') && (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {(it.thumbnail || it.url) ? (
                          <img
                            src={it.thumbnail || it.url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">{it.title}</div>
                      {it.subtitle && <div className="text-xs text-[#639427] font-medium mt-0.5 truncate">{it.subtitle}</div>}
                      {it.description && <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{it.description}</div>}
                      <div className="flex items-center gap-2 mt-1">
                        {activeKind === 'report' && it.folderId && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-[#326101] font-medium border border-green-200">
                            {folders.find(f => f.id === it.folderId)?.name || 'Folder'}
                          </span>
                        )}
                        {activeKind === 'press' && it.date && (
                          <span className="text-[10px] text-gray-400">{new Date(it.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#326101] hover:bg-green-50 transition-all"
                        onClick={() => { setEditing(it.id ?? null); setForm({ ...it }); }}
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        disabled={loading.del === (it.id ?? null)}
                        onClick={() => remove(it.id ?? '')}
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel: Create / Edit form */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900">
              {editing != null ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  Edit {kindLabels[activeKind].label.slice(0, -1)}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                  Create New {kindLabels[activeKind].label.slice(0, -1)}
                </span>
              )}
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {/* KB Section Heading Editor */}
            {isKB && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Section Heading (public page)</span>
                  <button
                    type="button"
                    disabled={savingKbHeading}
                    onClick={async () => {
                      setSavingKbHeading(true);
                      try {
                        await Promise.all([
                          fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'kb_section_title', value: kbSectionTitle }) }),
                          fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'kb_section_subtitle', value: kbSectionSubtitle }) }),
                        ]);
                        alert('Section heading saved!');
                      } catch { alert('Failed to save'); }
                      finally { setSavingKbHeading(false); }
                    }}
                    className="px-3 py-1 bg-[#326101] text-white rounded text-xs font-medium hover:bg-[#2a5101] disabled:bg-gray-400"
                  >
                    {savingKbHeading ? 'Saving…' : 'Save heading'}
                  </button>
                </div>
                <input type="text" value={kbSectionTitle} onChange={e => setKbSectionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 bg-white" placeholder="Knowledge Base" />
                <input type="text" value={kbSectionSubtitle} onChange={e => setKbSectionSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded text-sm text-gray-900 bg-white" placeholder="Access technical documents…" />
              </div>
            )}
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                placeholder="Enter title…"
              />
            </Field>
            {isKB && (
              <Field label="Subtitle">
                <input
                  value={form.subtitle || ''}
                  onChange={(e) => setForm((v) => ({ ...v, subtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                  placeholder="Short subtitle"
                />
              </Field>
            )}
            {isKB && (
              <Field label="Excerpt">
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none resize-none text-gray-900"
                  rows={2}
                  placeholder="Brief summary shown on the card preview…"
                />
              </Field>
            )}
            {isKB && (
              <Field label="Content">
                <div className="border border-gray-200 rounded-lg overflow-visible bg-white relative">
                  <StableQuillEditor
                    value={form.content || ''}
                    onChange={onContentChange}
                    modules={quillModules}
                    formats={quillFormats}
                    style={{ minHeight: 280 }}
                  />
                </div>
              </Field>
            )}
            {!isKB && (
              <Field label={activeKind === 'press' ? 'Summary / Body' : 'Description (optional)'}>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none resize-none text-gray-900"
                  rows={activeKind === 'press' ? 4 : 3}
                />
              </Field>
            )}
            {activeKind === 'press' && (
              <Field label="Date">
                <input
                  type="date"
                  value={(form.date || '').toString().slice(0, 10)}
                  onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                />
              </Field>
            )}
            {(activeKind === 'photo' || activeKind === 'newsletter' || activeKind === 'report') ? (
              <MediaPicker
                label={activeKind === 'photo' ? 'Image URL' : 'Document URL'}
                helperText={activeKind === 'photo' ? 'Select from the media gallery or paste any public image URL.' : 'Select a PDF or Word document from the media gallery.'}
                value={form.url}
                onChange={(url) => setForm((v) => ({ ...v, url }))}
                disabled={!!loading.save}
              />
            ) : !isKB ? (
              <Field label={activeKind === 'video' ? 'Video URL' : 'URL'}>
                <input
                  value={form.url}
                  onChange={(e) => setForm((v) => ({ ...v, url: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                  placeholder="https://..."
                />
              </Field>
            ) : null}
            {hasThumbnail && (
              <MediaPicker
                label={isKB ? 'Featured Image' : 'Thumbnail Image (optional)'}
                helperText={isKB ? 'This image is displayed as the hero on the post page.' : 'Used for previews. Pull from media gallery or paste a URL.'}
                value={form.thumbnail || ''}
                onChange={(url) => setForm((v) => ({ ...v, thumbnail: url }))}
                disabled={!!loading.save}
              />
            )}
            {activeKind === 'report' && folders.length > 0 && (
              <Field label="Assign to Folder">
                <select
                  value={form.folderId ?? ''}
                  onChange={(e) => setForm((v) => ({ ...v, folderId: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                >
                  <option value="">— No folder —</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </Field>
            )}
            {isMediaKind && (
              <Field label="Folder">
                <select
                  value={form.folderId ?? ''}
                  onChange={(e) => setForm((v) => ({ ...v, folderId: e.target.value ? Number(e.target.value) : null }))}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#326101]/20 focus:border-[#326101] outline-none text-gray-900"
                >
                  <option value="">— Root (no folder) —</option>
                  {currentMediaFolderId && mediaFolderPath.length > 0 && (
                    <option value={currentMediaFolderId}>
                      📁 {mediaFolderPath.map(f => f.name).join(' / ')} (current)
                    </option>
                  )}
                  {mediaFolders.map((f) => (
                    <option key={f.id} value={f.id}>📁 {mediaFolderPath.length > 0 ? mediaFolderPath.map(p => p.name).join(' / ') + ' / ' : ''}{f.name}</option>
                  ))}
                </select>
              </Field>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={submit}
                disabled={!!loading.save}
                className="inline-flex items-center gap-2 text-white text-sm font-semibold rounded-lg px-5 py-2.5 bg-[#326101] hover:bg-[#2a5101] disabled:opacity-50 transition-all shadow-sm"
              >
                {loading.save ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : editing != null ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                )}
                {editing != null ? 'Save Changes' : 'Create'} {activeKind === 'knowledge-base' ? 'Post' : kindLabels[activeKind].label.slice(0, -1)}
              </button>
              {editing != null && (
                <button
                  onClick={() => { setEditing(null); setForm(emptyByKind[activeKind]); }}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationCenterPage;
