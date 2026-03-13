'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateNewsPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    date: '',
    title: '',
    category: '',
    content: '',
    coverImage: '',
    images: '',
    videos: '',
  });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setOk(null); setLoading(true);
    try {
      const images = form.images
        .split(/\n|,/)
        .map(s => s.trim())
        .filter(Boolean);
      const videos = form.videos
        .split(/\n|,/)
        .map(s => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          content: form.content,
          date: form.date || undefined,
          coverImage: form.coverImage || undefined,
          images,
          videos,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setOk('News article created.');
      setTimeout(() => router.push('/admin'), 800);
    } catch (e: any) {
      setErr(e.message || 'Error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create News</h1>
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        {ok && <p className="text-sm text-emerald-600 mb-3">{ok}</p>}
        <form onSubmit={onSubmit} className="space-y-5 bg-white border border-gray-100 rounded-2xl shadow p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Category</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g., Project Update" className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Cover Image URL</label>
            <input value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={8} required className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Images (one per line or comma separated)</label>
              <textarea value={form.images} onChange={e => setForm({ ...form, images: e.target.value })} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Videos (one per line or comma separated)</label>
              <textarea value={form.videos} onChange={e => setForm({ ...form, videos: e.target.value })} rows={4} className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">Cancel</button>
            <button disabled={loading} className="px-4 py-2 rounded-md bg-[#326101] text-white disabled:opacity-60">{loading ? 'Saving…' : 'Save News'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

