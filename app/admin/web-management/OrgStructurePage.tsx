'use client';

import React, { useEffect, useState } from 'react';
import MediaPicker from '../components/MediaPicker';

interface OrgLeader {
  id: number;
  levelLabel: string;
  levelOrder: number;
  columnOrder: number;
  name: string;
  role: string;
  imageUrl?: string | null;
  isActive: boolean;
}

type FormState = Omit<OrgLeader, 'id'>;

const defaultForm: FormState = {
  levelLabel: 'Leadership Tier',
  levelOrder: 0,
  columnOrder: 0,
  name: '',
  role: '',
  imageUrl: '',
  isActive: true,
};

const OrgStructureAdminPage: React.FC = () => {
  const [items, setItems] = useState<OrgLeader[]>([]);
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
      const res = await fetch('/api/admin/org-structure');
      if (!res.ok) throw new Error('Failed to load leaders');
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load leaders');
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
    const url = editingId ? `/api/admin/org-structure/${editingId}` : '/api/admin/org-structure';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Failed to save leader');
      await load();
      setSuccess(editingId ? 'Leader updated.' : 'Leader added.');
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Failed to save leader');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: OrgLeader) => {
    setEditingId(item.id);
    setForm({
      levelLabel: item.levelLabel,
      levelOrder: item.levelOrder,
      columnOrder: item.columnOrder,
      name: item.name,
      role: item.role,
      imageUrl: item.imageUrl || '',
      isActive: item.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this leader?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/org-structure/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete leader');
      if (editingId === id) resetForm();
      await load();
      setSuccess('Leader removed.');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete leader');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: keyof FormState, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Leader' : 'Add Leader'}</h2>
            <p className="text-sm text-gray-500">Manage entries shown on the About Us organizational structure.</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Label</label>
              <input
                type="text"
                value={form.levelLabel}
                onChange={(e) => updateForm('levelLabel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Row Order</label>
                <input
                  type="number"
                  value={form.levelOrder}
                  onChange={(e) => updateForm('levelOrder', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Order</label>
                <input
                  type="number"
                  value={form.columnOrder}
                  onChange={(e) => updateForm('columnOrder', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                type="text"
                value={form.role}
                onChange={(e) => updateForm('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
                required
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <MediaPicker
                label="Image Source"
                helperText="Pick from the media gallery (stored in /uploads/media) or supply a full URL."
                value={form.imageUrl || ''}
                onChange={(url) => updateForm('imageUrl', url)}
                disabled={saving}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="leader-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateForm('isActive', e.target.checked)}
                className="w-4 h-4 text-[#326101] border-gray-300 rounded"
              />
              <label htmlFor="leader-active" className="text-sm text-gray-700">Active</label>
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
              {editingId ? 'Update Leader' : 'Add Leader'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Current Leaders</h2>
          <button onClick={load} className="text-sm text-[#326101] hover:underline" disabled={loading || saving}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading leaders...</p>
        ) : !items.length ? (
          <p className="text-sm text-gray-500">No entries found.</p>
        ) : (
          <div className="space-y-4">
            {items.map((leader) => (
              <div key={leader.id} className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-500">Row {leader.levelOrder} · Column {leader.columnOrder}</p>
                  <p className="font-semibold text-gray-900">{leader.name}</p>
                  <p className="text-sm text-gray-600">{leader.role}</p>
                  <p className="text-xs text-gray-500">{leader.levelLabel}</p>
                </div>
                <div className="flex gap-3 mt-3 md:mt-0">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => handleEdit(leader)}
                    disabled={saving}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => handleDelete(leader.id)}
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

export default OrgStructureAdminPage;
