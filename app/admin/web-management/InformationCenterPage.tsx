'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Id = number | string;
type Kind = 'photo' | 'video' | 'newsletter' | 'press';

interface InfoItem {
  id?: Id;
  kind: Kind;
  title: string;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  date?: string | null; // ISO date string
}

const TGREEN = '#326101';
const TEXT_DARK = '#111111';

const emptyByKind: Record<Kind, InfoItem> = {
  photo: { kind: 'photo', title: '', description: '', url: '', thumbnail: '', date: null },
  video: { kind: 'video', title: '', description: '', url: '', thumbnail: '', date: null },
  newsletter: { kind: 'newsletter', title: '', description: '', url: '', thumbnail: '', date: null },
  press: { kind: 'press', title: '', description: '', url: '', thumbnail: '', date: new Date().toISOString().slice(0, 10) },
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

const InformationCenterPage: React.FC = () => {
  const [activeKind, setActiveKind] = useState<Kind>('photo');
  const [items, setItems] = useState<InfoItem[]>([]);
  const [form, setForm] = useState<InfoItem>(emptyByKind['photo']);
  const [editing, setEditing] = useState<Id | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ list?: boolean; save?: boolean; del?: Id | null }>({ list: true });

  const kinds: Kind[] = useMemo(() => ['photo', 'video', 'newsletter', 'press'], []);

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
    load(activeKind);
  }, [activeKind]);

  const submit = async () => {
    setLoading((b) => ({ ...b, save: true }));
    setErr(null);
    try {
      if (editing != null) {
        const res = await API.update(editing, form);
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await API.create(form);
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
          {it.description && <div className="text-xs" style={{ color: '#6b7280' }}>{it.description}</div>}
          <div className="text-xs" style={{ color: '#6b7280' }}>{it.url}</div>
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

  return (
    <div className="space-y-6">
      {err && (
        <div className="text-sm" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12 }}>{err}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{ color: TEXT_DARK }}>
        <SectionHeader title="Information Center" />
        <div className="mt-4 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => setActiveKind(k)}
              className="px-3 py-1.5 rounded-full border text-xs"
              style={{
                color: activeKind === k ? TGREEN : '#374151',
                background: activeKind === k ? '#e8f5e8' : 'transparent',
                borderColor: '#d1e7d1',
              }}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {loading.list ? (
                <div className="text-sm" style={{ color: '#6b7280' }}>Loading...</div>
              ) : (
                items.map(renderListCard)
              )}
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <Field label="Title">
                <input
                  value={form.title}
                  onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  style={{ color: TEXT_DARK }}
                  placeholder="Title"
                />
              </Field>
              <Field label={activeKind === 'press' ? 'Summary / Body' : 'Description (optional)'}>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  style={{ color: TEXT_DARK }}
                  rows={activeKind === 'press' ? 4 : 3}
                />
              </Field>
              {activeKind === 'press' && (
                <Field label="Date">
                  <input
                    type="date"
                    value={(form.date || '').toString().slice(0, 10)}
                    onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    style={{ color: TEXT_DARK }}
                  />
                </Field>
              )}
              <Field label={activeKind === 'newsletter' ? 'PDF URL' : activeKind === 'video' ? 'Video URL' : 'URL'}>
                <input
                  value={form.url}
                  onChange={(e) => setForm((v) => ({ ...v, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  style={{ color: TEXT_DARK }}
                  placeholder="https://..."
                />
              </Field>
              {(activeKind === 'photo' || activeKind === 'video') && (
                <Field label="Thumbnail URL (optional)">
                  <input
                    value={form.thumbnail || ''}
                    onChange={(e) => setForm((v) => ({ ...v, thumbnail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    style={{ color: TEXT_DARK }}
                    placeholder="https://..."
                  />
                </Field>
              )}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={submit}
                  disabled={!!loading.save}
                  className="text-white text-sm font-semibold rounded-md px-3 py-2"
                  style={{ backgroundColor: TGREEN }}
                >
                  {editing != null ? 'Update' : 'Create'} {activeKind.charAt(0).toUpperCase() + activeKind.slice(1)}
                </button>
                {editing != null && (
                  <button
                    onClick={() => { setEditing(null); setForm(emptyByKind[activeKind]); }}
                    className="text-sm underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationCenterPage;

