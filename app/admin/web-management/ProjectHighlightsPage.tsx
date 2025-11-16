'use client';

import React, { useEffect, useState } from 'react';

interface ProjectImpact {
  jobs: string;
  co2: string;
  homes: string;
  investment: string;
}

interface ProjectTimelineEntry {
  phase: string;
  status: string;
  date: string;
}

interface AdminProject {
  id: number;
  slug: string;
  title: string;
  location: string;
  category: string;
  status: string;
  capacity: string;
  investment: string;
  progress: number;
  description: string;
  keyFeatures: string[];
  timeline: ProjectTimelineEntry[];
  impact: ProjectImpact;
  imageUrl: string | null;
}

type FormState = Omit<AdminProject, 'id'>;

const defaultImpact: ProjectImpact = { jobs: '', co2: '', homes: '', investment: '' };
const defaultTimeline: ProjectTimelineEntry = { phase: '', status: 'Planned', date: '' };

const defaultForm: FormState = {
  slug: '',
  title: '',
  location: '',
  category: 'development',
  status: 'development',
  capacity: '',
  investment: '',
  progress: 0,
  description: '',
  keyFeatures: [],
  timeline: [defaultTimeline],
  impact: defaultImpact,
  imageUrl: '',
};

const ProjectHighlightsPage: React.FC = () => {
  const [items, setItems] = useState<AdminProject[]>([]);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/project-highlights');
      if (!res.ok) throw new Error('Failed to load project highlights');
      const data = await res.json();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load project highlights');
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
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...form,
      keyFeatures: form.keyFeatures,
      timeline: form.timeline,
      impact: form.impact,
    };

    const url = editingId ? `/api/admin/project-highlights/${editingId}` : '/api/admin/project-highlights';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const message = (await res.json())?.error || 'Failed to save project';
        throw new Error(message);
      }
      setSuccess(editingId ? 'Project updated successfully.' : 'Project created successfully.');
      await load();
      resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: AdminProject) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      title: item.title,
      location: item.location,
      category: item.category,
      status: item.status,
      capacity: item.capacity,
      investment: item.investment,
      progress: item.progress,
      description: item.description,
      keyFeatures: item.keyFeatures || [],
      timeline: item.timeline.length ? item.timeline : [defaultTimeline],
      impact: item.impact || defaultImpact,
      imageUrl: item.imageUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project highlight?')) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/project-highlights/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      setSuccess('Project removed.');
      await load();
      if (editingId === id) resetForm();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  const updateTimelineEntry = (index: number, field: keyof ProjectTimelineEntry, value: string) => {
    setForm((prev) => {
      const copy = prev.timeline.map((entry, idx) => (idx === index ? { ...entry, [field]: value } : entry));
      return { ...prev, timeline: copy };
    });
  };

  const addTimelineEntry = () => {
    setForm((prev) => ({ ...prev, timeline: [...prev.timeline, { ...defaultTimeline }] }));
  };

  const removeTimelineEntry = (index: number) => {
    setForm((prev) => {
      const remaining = prev.timeline.filter((_, idx) => idx !== index);
      return { ...prev, timeline: remaining.length ? remaining : [{ ...defaultTimeline }] };
    });
  };

  const setFeatureText = (value: string) => {
    const features = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, keyFeatures: features }));
  };

  const impactFields: Array<{ key: keyof ProjectImpact; label: string }> = [
    { key: 'jobs', label: 'Jobs Impact' },
    { key: 'co2', label: 'CO₂ Impact' },
    { key: 'homes', label: 'Homes Powered' },
    { key: 'investment', label: 'Investment Impact' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Project Highlight' : 'New Project Highlight'}
              </h2>
              <p className="text-sm text-gray-500">Manage what appears in the homepage portfolio section.</p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-[#326101] hover:underline"
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-4 text-sm text-green-600">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
                >
                  <option value="operational">Operational</option>
                  <option value="construction">Construction</option>
                  <option value="development">Development</option>
                  <option value="exploration">Exploration</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <input
                  type="text"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm((prev) => ({ ...prev, progress: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="text"
                  value={form.capacity}
                  onChange={(e) => setForm((prev) => ({ ...prev, capacity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment</label>
                <input
                  type="text"
                  value={form.investment}
                  onChange={(e) => setForm((prev) => ({ ...prev, investment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={form.imageUrl || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key Features (one per line)</label>
              <textarea
                value={form.keyFeatures.join('\n')}
                onChange={(e) => setFeatureText(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Timeline</label>
                <button
                  type="button"
                  onClick={addTimelineEntry}
                  className="text-sm text-[#326101] hover:underline"
                >
                  + Add milestone
                </button>
              </div>
              <div className="space-y-3">
                {form.timeline.map((entry, index) => (
                  <div key={index} className="grid md:grid-cols-3 gap-3 items-end">
                    <input
                      type="text"
                      placeholder="Phase"
                      value={entry.phase}
                      onChange={(e) => updateTimelineEntry(index, 'phase', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                    />
                    <input
                      type="text"
                      placeholder="Status"
                      value={entry.status}
                      onChange={(e) => updateTimelineEntry(index, 'status', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Date"
                        value={entry.date}
                        onChange={(e) => updateTimelineEntry(index, 'date', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                      />
                      <button
                        type="button"
                        className="px-2 py-2 text-sm text-red-600"
                        onClick={() => removeTimelineEntry(index)}
                        title="Remove milestone"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Impact Metrics</label>
              <div className="grid md:grid-cols-2 gap-3">
                {impactFields.map(({ key, label }) => (
                  <div key={key}>
                      <input
                        type="text"
                        placeholder={label}
                        value={form.impact[key]}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, impact: { ...prev.impact, [key]: e.target.value } }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#326101]"
                      />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-5 py-2 rounded-lg font-semibold hover:shadow-lg disabled:opacity-60"
              >
                {editingId ? 'Update Highlight' : 'Create Highlight'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                disabled={saving}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Published Highlights</h2>
              <p className="text-sm text-gray-500">These records feed the homepage project portfolio.</p>
            </div>
            <button
              type="button"
              onClick={load}
              className="text-sm text-[#326101] hover:underline"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading projects…</p>
          ) : !items.length ? (
            <p className="text-sm text-gray-500">No project highlights found.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.slug}</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{item.capacity || '—'} • {item.category}</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      onClick={() => handleEdit(item)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
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
    </div>
  );
};

export default ProjectHighlightsPage;
