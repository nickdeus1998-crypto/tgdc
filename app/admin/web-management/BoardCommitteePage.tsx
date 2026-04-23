'use client';

import React, { useEffect, useState } from 'react';
import MediaPicker from '../components/MediaPicker';
import ImageCropper from '../components/ImageCropper';
import axios from 'axios';

interface BoardMember {
  id: number;
  levelLabel: string;
  levelOrder: number;
  columnOrder: number;
  name: string;
  role: string;
  imageUrl?: string | null;
  isActive: boolean;
}

type FormState = Omit<BoardMember, 'id'>;

const defaultForm: FormState = {
  levelLabel: 'Board Tier',
  levelOrder: 0,
  columnOrder: 0,
  name: '',
  role: '',
  imageUrl: '',
  isActive: true,
};

const BoardCommitteeAdminPage: React.FC = () => {
  const [items, setItems] = useState<BoardMember[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cropper state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/board-committee');
      if (!res.ok) throw new Error('Failed to load board members');
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load board members');
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
    const url = editingId ? `/api/admin/board-committee/${editingId}` : '/api/admin/board-committee';
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json())?.error || 'Failed to save member');
      await load();
      setSuccess(editingId ? 'Member updated.' : 'Member added.');
      resetForm();
    } catch (err: any) {
      setError(err?.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: BoardMember) => {
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
    if (!confirm('Delete this member?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/board-committee/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete member');
      if (editingId === id) resetForm();
      await load();
      setSuccess('Member removed.');
    } catch (err: any) {
      setError(err?.message || 'Failed to delete member');
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key: keyof FormState, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropImageSrc(reader.result as string || null);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(file);
      // Reset input value to allow re-selecting same file
      e.target.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropperOpen(false);
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      const file = new File([croppedBlob], `cropped-board-${Date.now()}.jpg`, { type: 'image/jpeg' });
      formData.append('files', file);

      const response = await axios.post('/api/admin/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.items && response.data.items.length > 0) {
        updateForm('imageUrl', response.data.items[0].url);
        setSuccess('Image cropped and uploaded successfully.');
      }
    } catch (err) {
      console.error('Upload error', err);
      setError('Failed to upload cropped image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {isCropperOpen && cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          aspectRatio={300 / 350} // 300x350 ratio
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropperOpen(false)}
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Board Member' : 'Add Board Member'}</h2>
            <p className="text-sm text-gray-500">Manage board committee entries shown on the About Us page.</p>
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
              <div className="mb-2 flex items-end justify-between">
                <label className="block text-sm font-medium text-gray-700">Image Source</label>
                <span className="text-xs text-gray-400">Recommended: 300x350px</span>
              </div>

              <MediaPicker
                value={form.imageUrl || ''}
                onChange={(url) => updateForm('imageUrl', url)}
                disabled={saving || isUploading}
              />

              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400 uppercase font-semibold">Or</span>
                <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-100 transition-colors">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {isUploading ? 'Uploading...' : 'Upload & Crop'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={saving || isUploading} />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="board-member-active"
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateForm('isActive', e.target.checked)}
                className="w-4 h-4 text-[#326101] border-gray-300 rounded"
              />
              <label htmlFor="board-member-active" className="text-sm text-gray-700">Active</label>
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
              {editingId ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Current Board Members</h2>
          <button onClick={load} className="text-sm text-[#326101] hover:underline" disabled={loading || saving}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-500">Loading board members...</p>
        ) : !items.length ? (
          <p className="text-sm text-gray-500">No entries found.</p>
        ) : (
          <div className="space-y-4">
            {items.map((member) => (
              <div key={member.id} className="flex flex-col md:flex-row md:items-center md:justify-between border border-gray-100 rounded-xl p-4">
                <div>
                  <p className="text-sm text-gray-500">Row {member.levelOrder} · Column {member.columnOrder}</p>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.role}</p>
                  <p className="text-xs text-gray-500">{member.levelLabel}</p>
                </div>
                <div className="flex gap-3 mt-3 md:mt-0">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    onClick={() => handleEdit(member)}
                    disabled={saving}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    onClick={() => handleDelete(member.id)}
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

export default BoardCommitteeAdminPage;
