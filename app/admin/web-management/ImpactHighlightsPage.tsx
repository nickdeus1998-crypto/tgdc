'use client';

import React, { useEffect, useState } from 'react';

interface ImpactHighlight {
  id: number;
  title: string;
  catchy: string;
  description: string;
  imageUrl: string;
  primaryHref: string;
  secondaryHref: string;
  tag?: string | null;
  isActive: boolean;
}

type FormState = Omit<ImpactHighlight, 'id'>;

const defaultForm: FormState = {
  title: '',
  catchy: '',
  description: '',
  imageUrl: '/geothermal.jpg',
  primaryHref: '#',
  secondaryHref: '#',
  tag: '',
  isActive: true,
};

const ImpactHighlightsAdminPage: React.FC = () => {
  const [items, setItems] = useState<ImpactHighlight[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/impact-highlights');
      if (!res.ok) throw new Error('Failed to load highlights');
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load highlights');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = { ...form };
    const url = editingId ? `/api/admin/impact-highlights/${editingId}` : '/api/admin/impact-highlights';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = (await res.json())?.error || 'Failed to save highlight';
        throw new Error(msg);
      }
      setSuccess(editingId ? 'Highlight updated.' : 'Highlight created.');
      await load();
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Failed to save highlight');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: ImpactHighlight) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      catchy: item.catchy,
      description: item.description,
      imageUrl: item.imageUrl || '/geothermal.jpg',
      primaryHref: item.primaryHref,
      secondaryHref: item.secondaryHref,
      tag: item.tag || '',
      isActive: item.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this highlight?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/impact-highlights/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete highlight');
      if (editingId === id) resetForm();
      await load();
      setSuccess('Highlight removed.');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete highlight');
    } finally {
      setSaving(false);
    }
  };

  const onChange = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Highlight' : 'New Highlight'}</h2>
            <p className="text-sm text-gray-500">Manage entries that power the homepage highlights carousel.</p>
          </div>
          {editingId && (
            <button className="text-sm text-[#326101] hover:underline" onClick={resetForm} disabled={saving}>
              Cancel
            </button>
          )}
        </div>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
        {success && <div className="text-sm text-green-600 mb-3">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => onChange('title', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag (optional)</label>
              <input
                type="text"
                value={form.tag || ''}
                onChange={(e) => onChange('tag', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catchy Line</label>
            <input
              type="text"
              value={form.catchy}
              onChange={(e) => onChange('catchy', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => onChange('imageUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => onChange('isActive', e.target.checked)}
                className="w-4 h-4 text-[#326101] border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Link</label>
              <input
                type="text"
                value={form.primaryHref}
                onChange={(e) => onChange('primaryHref', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Link</label>
              <input
                type="text"
                value={form.secondaryHref}
                onChange={(e) => onChange('secondaryHref', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={resetForm}
              disabled={saving}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg font-semibold bg-gradient-to-r from-[#326101] to-[#639427] text-white hover:shadow-lg disabled:opacity-60"
              disabled={saving}
            >
              {editingId ? 'Update Highlight' : 'Create Highlight'}
            </button>
          </div>
        </form>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Existing Highlights</h2>
          <button onClick={load} className="text-sm text-[#326101] hover:underline" disabled={loading || saving}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading highlights...</p>
        ) : !items.length ? (
          <p className="text-sm text-gray-500">No highlights available.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-lg font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.catchy}</p>
                  <span className={`inline-flex mt-1 text-xs px-2 py-0.5 rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => handleEdit(item)}
                    disabled={saving}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => handleDelete(item.id)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImpactHighlightsAdminPage;
