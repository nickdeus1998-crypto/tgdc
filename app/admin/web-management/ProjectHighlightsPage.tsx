'use client';

import React, { useEffect, useState } from 'react';
import MediaPicker from '../components/MediaPicker';

interface PortfolioStat {
  title: string;
  value: string;
  colorFrom: string;
  colorTo: string;
}

interface ProjectResource {
  type: 'image' | 'video' | 'file';
  url: string;
  title?: string;
  description?: string;
}

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
  resources: ProjectResource[];
  imageUrl: string | null;
}

type FormState = Omit<AdminProject, 'id'>;

const defaultImpact: ProjectImpact = { jobs: '', co2: '', homes: '', investment: '' };
const defaultTimeline: ProjectTimelineEntry = { phase: '', status: 'Planned', date: '' };
const defaultResource: ProjectResource = { type: 'image', url: '', title: '', description: '' };

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
  resources: [],
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

  // Portfolio Stats state
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStat[]>([]);
  const [savingStats, setSavingStats] = useState(false);

  // Methodology Button state
  const [methLabel, setMethLabel] = useState('Methodology Details');
  const [methLink, setMethLink] = useState('/information-center');
  const [methVisible, setMethVisible] = useState(true);
  const [savingMeth, setSavingMeth] = useState(false);

  // Section Title state
  const [sectionTitle, setSectionTitle] = useState('Our Projects');
  const [sectionSubtitle, setSectionSubtitle] = useState('Explore our portfolio of geothermal energy projects across Tanzania.');
  const [portfolioTitle, setPortfolioTitle] = useState('Project Portfolio');
  const [portfolioSubtitle, setPortfolioSubtitle] = useState('Discover our comprehensive portfolio of geothermal projects across Tanzania and beyond. From exploration to operation, we deliver sustainable energy solutions.');
  const [savingSectionTitle, setSavingSectionTitle] = useState(false);

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

  const loadPortfolioStats = async () => {
    try {
      const res = await fetch('/api/portfolio-stats');
      if (res.ok) {
        const data = await res.json();
        setPortfolioStats(Array.isArray(data) && data.length > 0 ? data : [
          { title: 'Total Projects', value: '24', colorFrom: '#326101', colorTo: '#639427' },
          { title: 'Total Investment', value: '$1.8B', colorFrom: '#3b82f6', colorTo: '#9333ea' },
          { title: 'Operational', value: '8', colorFrom: '#f97316', colorTo: '#ef4444' },
          { title: 'MW Capacity', value: '2,150', colorFrom: '#22c55e', colorTo: '#14b8a6' },
        ]);
      }
    } catch (e) { /* ignore */ }
  };

  const savePortfolioStats = async () => {
    setSavingStats(true);
    try {
      const res = await fetch('/api/portfolio-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioStats),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setPortfolioStats(updated);
      alert('Portfolio stats saved!');
    } catch (e) {
      alert('Failed to save portfolio stats');
    } finally {
      setSavingStats(false);
    }
  };

  const loadMethodologyButton = async () => {
    try {
      const res = await fetch('/api/methodology-button');
      if (res.ok) {
        const data = await res.json();
        if (data?.label) setMethLabel(data.label);
        if (data?.link) setMethLink(data.link);
        if (data?.visible !== undefined) setMethVisible(data.visible);
      }
    } catch (e) { /* ignore */ }
  };

  const saveMethodologyButton = async () => {
    setSavingMeth(true);
    try {
      const res = await fetch('/api/methodology-button', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: methLabel, link: methLink, visible: methVisible }),
      });
      if (!res.ok) throw new Error('Failed');
      alert('Methodology button saved!');
    } catch (e) {
      alert('Failed to save methodology button');
    } finally {
      setSavingMeth(false);
    }
  };

  useEffect(() => {
    load();
    loadPortfolioStats();
    loadMethodologyButton();

    // Load section title/subtitle
    fetch('/api/site-settings?key=projects_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setSectionTitle(data.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=projects_section_subtitle')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setSectionSubtitle(data.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=portfolio_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setPortfolioTitle(data.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=portfolio_section_subtitle')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setPortfolioSubtitle(data.value); })
      .catch(() => { });
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

    const payload = { ...form };
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
      keyFeatures: Array.isArray(item.keyFeatures) ? item.keyFeatures : [],
      timeline: Array.isArray(item.timeline) && item.timeline.length ? item.timeline : [defaultTimeline],
      impact: item.impact || defaultImpact,
      resources: Array.isArray(item.resources) ? item.resources : [],
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

  const addResource = () => {
    setForm((prev) => ({ ...prev, resources: [...prev.resources, { ...defaultResource }] }));
  };

  const removeResource = (index: number) => {
    setForm((prev) => ({ ...prev, resources: prev.resources.filter((_, idx) => idx !== index) }));
  };

  const updateResource = (index: number, field: keyof ProjectResource, value: string) => {
    setForm((prev) => {
      const copy = prev.resources.map((res, idx) => (idx === index ? { ...res, [field]: value } : res));
      return { ...prev, resources: copy };
    });
  };

  const setFeatureText = (value: string) => {
    const features = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    setForm((prev) => ({ ...prev, keyFeatures: features }));
  };

  const impactFields: Array<{ key: keyof ProjectImpact; label: string }> = [
    { key: 'jobs', label: 'Jobs' },
    { key: 'co2', label: 'CO₂' },
    { key: 'homes', label: 'Homes Powered' },
    { key: 'investment', label: 'Investment' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ─── Page Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Project Highlights</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage portfolio projects, stats, and the methodology link.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="text-sm text-[#326101] hover:underline">
          Refresh
        </button>
      </div>

      {/* ─── Section Title Editor ─── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Section Titles</h2>
            <p className="text-xs text-gray-400 mt-0.5">Headings shown on the public Projects page and homepage Portfolio section.</p>
          </div>
          <button
            type="button"
            disabled={savingSectionTitle}
            onClick={async () => {
              setSavingSectionTitle(true);
              try {
                await Promise.all([
                  fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'projects_section_title', value: sectionTitle }) }),
                  fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'projects_section_subtitle', value: sectionSubtitle }) }),
                  fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'portfolio_section_title', value: portfolioTitle }) }),
                  fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'portfolio_section_subtitle', value: portfolioSubtitle }) }),
                ]);
                alert('Section titles saved!');
              } catch { alert('Failed to save section titles'); }
              finally { setSavingSectionTitle(false); }
            }}
            className="px-4 py-1.5 bg-[#326101] text-white rounded-lg text-xs font-medium hover:bg-[#2a5101] disabled:bg-gray-400"
          >
            {savingSectionTitle ? 'Saving…' : 'Save All'}
          </button>
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1 mt-2">Projects Page (/projects)</p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" placeholder="Our Projects" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
            <input type="text" value={sectionSubtitle} onChange={(e) => setSectionSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" placeholder="Explore our portfolio..." />
          </div>
        </div>
        <p className="text-xs text-gray-500 font-medium mb-1">Homepage Portfolio Section</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input type="text" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" placeholder="Project Portfolio" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Subtitle</label>
            <input type="text" value={portfolioSubtitle} onChange={(e) => setPortfolioSubtitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" placeholder="Discover our comprehensive portfolio..." />
          </div>
        </div>
      </div>

      {/* ─── Settings Row: Portfolio Stats + Methodology Button ─── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Portfolio Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Portfolio Stats Cards</h2>
              <p className="text-xs text-gray-400 mt-0.5">Colored cards at the top of the homepage portfolio.</p>
            </div>
            <button type="button" onClick={savePortfolioStats} disabled={savingStats}
              className="px-3 py-1.5 bg-[#326101] text-white rounded-lg text-xs font-medium hover:bg-[#2a5101] disabled:bg-gray-400">
              {savingStats ? 'Saving...' : 'Save Stats'}
            </button>
          </div>
          <div className="space-y-2">
            {portfolioStats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-100 rounded-lg">
                <input value={stat.title}
                  onChange={(e) => { const c = [...portfolioStats]; c[i] = { ...c[i], title: e.target.value }; setPortfolioStats(c); }}
                  placeholder="Label" className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                <input value={stat.value}
                  onChange={(e) => { const c = [...portfolioStats]; c[i] = { ...c[i], value: e.target.value }; setPortfolioStats(c); }}
                  placeholder="Value" className="w-24 px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                <div className="flex gap-1">
                  <input type="color" value={stat.colorFrom}
                    onChange={(e) => { const c = [...portfolioStats]; c[i] = { ...c[i], colorFrom: e.target.value }; setPortfolioStats(c); }}
                    title="Start" className="w-7 h-7 rounded cursor-pointer border-0" />
                  <input type="color" value={stat.colorTo}
                    onChange={(e) => { const c = [...portfolioStats]; c[i] = { ...c[i], colorTo: e.target.value }; setPortfolioStats(c); }}
                    title="End" className="w-7 h-7 rounded cursor-pointer border-0" />
                </div>
                <button type="button" onClick={() => setPortfolioStats(portfolioStats.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))}
          </div>
          <button type="button"
            onClick={() => setPortfolioStats([...portfolioStats, { title: '', value: '', colorFrom: '#326101', colorTo: '#639427' }])}
            className="mt-2 text-[#326101] hover:underline text-xs">+ Add card</button>
        </div>

        {/* Methodology Button */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-gray-800">Methodology Details Button</h2>
            <p className="text-xs text-gray-400 mt-0.5">Link button on the /projects page below project cards.</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Button Label</label>
              <input type="text" value={methLabel} onChange={(e) => setMethLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Link URL</label>
              <input type="text" value={methLink} onChange={(e) => setMethLink(e.target.value)} placeholder="/information-center"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={methVisible} onChange={(e) => setMethVisible(e.target.checked)}
                  className="w-4 h-4 text-[#326101] rounded border-gray-300 focus:ring-[#326101]" />
                <span className="text-sm text-gray-600">Visible on page</span>
              </label>
              <button type="button" onClick={saveMethodologyButton} disabled={savingMeth}
                className="px-4 py-1.5 bg-[#326101] text-white rounded-lg text-xs font-medium hover:bg-[#639427] disabled:opacity-50">
                {savingMeth ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content: Form + Project List ─── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Left: Create / Edit Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto max-h-[85vh]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the fields and save.</p>
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} disabled={saving} className="text-xs text-[#326101] hover:underline">Cancel</button>
            )}
          </div>
          {error && <div className="mb-3 text-xs text-red-600">{error}</div>}
          {success && <div className="mb-3 text-xs text-green-600">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Slug *</label>
                <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required placeholder="e.g. ngozi-geothermal"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Location *</label>
                <input type="text" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]">
                  <option value="development">Development</option>
                  <option value="exploration">Exploration</option>
                  <option value="production">Production</option>
                  <option value="direct-use">Direct Use</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]">
                  <option value="development">Development</option>
                  <option value="exploration">Exploration</option>
                  <option value="Resource confirmation">Resource Confirmation</option>
                  <option value="production">Production</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Capacity</label>
                <input type="text" value={form.capacity} onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))} placeholder="e.g. 200 MW"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Investment</label>
                <input type="text" value={form.investment} onChange={(e) => setForm((p) => ({ ...p, investment: e.target.value }))} placeholder="e.g. $500M"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Progress %</label>
                <input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm((p) => ({ ...p, progress: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101]" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101] resize-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Key Features (one per line)</label>
              <textarea value={form.keyFeatures.join('\n')} onChange={(e) => setFeatureText(e.target.value)} rows={3} placeholder={"Feature A\nFeature B"}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-[#326101] resize-none" />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Cover Image</label>
              <MediaPicker value={form.imageUrl} onChange={(v) => setForm((p) => ({ ...p, imageUrl: v }))} />
            </div>

            {/* Impact */}
            <fieldset className="border border-gray-100 rounded-lg p-4">
              <legend className="text-xs text-gray-500 px-1">Impact</legend>
              <div className="grid grid-cols-2 gap-3">
                {impactFields.map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-400 mb-1">{label}</label>
                    <input type="text" value={form.impact[key]}
                      onChange={(e) => setForm((p) => ({ ...p, impact: { ...p.impact, [key]: e.target.value } }))}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Timeline */}
            <fieldset className="border border-gray-100 rounded-lg p-4">
              <legend className="text-xs text-gray-500 px-1">Timeline</legend>
              <div className="space-y-2">
                {form.timeline.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input value={entry.phase} onChange={(e) => updateTimelineEntry(idx, 'phase', e.target.value)} placeholder="Phase"
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                    <select value={entry.status} onChange={(e) => updateTimelineEntry(idx, 'status', e.target.value)}
                      className="px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900">
                      <option>Planned</option><option>In Progress</option><option>Completed</option>
                    </select>
                    <input value={entry.date} onChange={(e) => updateTimelineEntry(idx, 'date', e.target.value)} placeholder="Date"
                      className="w-28 px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                    <button type="button" onClick={() => removeTimelineEntry(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addTimelineEntry} className="mt-2 text-[#326101] hover:underline text-xs">+ Add phase</button>
            </fieldset>

            {/* Resources */}
            <fieldset className="border border-gray-100 rounded-lg p-4">
              <legend className="text-xs text-gray-500 px-1">Resources</legend>
              <div className="space-y-2">
                {form.resources.map((res, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <select value={res.type} onChange={(e) => updateResource(idx, 'type', e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded text-sm text-gray-900">
                      <option value="image">Image</option><option value="video">Video</option><option value="file">File</option>
                    </select>
                    <input value={res.url} onChange={(e) => updateResource(idx, 'url', e.target.value)} placeholder="URL"
                      className="flex-1 px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                    <input value={res.title || ''} onChange={(e) => updateResource(idx, 'title', e.target.value)} placeholder="Title"
                      className="w-28 px-2.5 py-1.5 border border-gray-200 rounded text-sm text-gray-900" />
                    <button type="button" onClick={() => removeResource(idx)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addResource} className="mt-2 text-[#326101] hover:underline text-xs">+ Add resource</button>
            </fieldset>

            <button type="submit" disabled={saving}
              className="w-full py-2.5 bg-[#326101] text-white rounded-lg text-sm font-medium hover:bg-[#639427] transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : editingId ? 'Update Project' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* Right: Saved Projects */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto max-h-[85vh]">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-800">Saved Projects</h2>
            <p className="text-xs text-gray-400 mt-0.5">{items.length} record{items.length !== 1 ? 's' : ''} in database</p>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#326101]"></div>
            </div>
          ) : !items.length ? (
            <p className="text-center py-12 text-sm text-gray-400 italic">No project highlights yet.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">{item.slug}</p>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100">
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt="" className="w-14 h-10 object-cover rounded border border-gray-100" />
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                    <span>{item.location}</span>
                    <span>{item.capacity || '—'}</span>
                    <span className="text-[#326101] font-medium">{item.progress ? `${item.progress}%` : '—'}</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(item)} disabled={saving}
                      className="flex-1 px-3 py-1.5 bg-[#326101] text-white rounded-lg text-xs font-medium hover:bg-[#639427]">Edit</button>
                    <button type="button" onClick={() => handleDelete(item.id)} disabled={saving}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">Delete</button>
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
