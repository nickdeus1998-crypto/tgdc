'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Row = {
  id: number;
  title: string;
  category: string;
  date: string;
  coverImage?: string | null;
};

export default function AdminNewsIndex() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to load news');
      const data = await res.json();
      const mapped: Row[] = (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        date: r.date ? new Date(r.date).toLocaleDateString() : '',
        coverImage: r.coverImage,
      }));
      setRows(mapped);
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (id: number) => {
    if (!confirm('Delete this article?')) return;
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage News</h1>
            <p className="text-gray-600">Create, edit, and delete news articles.</p>
          </div>
          <Link href="/admin/news/create" className="bg-[#326101] text-white px-4 py-2 rounded-md hover:bg-[#639427]">New Article</Link>
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Title</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="py-3 px-4">{r.title}</td>
                    <td className="py-3 px-4">{r.category}</td>
                    <td className="py-3 px-4">{r.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Link className="text-[#326101] hover:underline" href={`/news/${r.id}`}>View</Link>
                        <Link className="text-blue-600 hover:underline" href={`/admin/news/${r.id}/edit`}>Edit</Link>
                        <button onClick={() => onDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td className="py-6 px-4 text-gray-600" colSpan={4}>No articles yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

