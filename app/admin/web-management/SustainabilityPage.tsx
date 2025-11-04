'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Id = string | number;

interface Project {
  id?: Id;
  name: string;
  status: string;
  location: string;
  description: string;
  badgeColor: string;
  badgeTextColor: string;
  badgeBorderColor: string;
  isOpen?: boolean;
}

interface Stakeholder {
  id?: Id;
  name: string;
  url: string;
  initial: string;
  category: string;
  badgeColor: string;
  badgeTextColor: string;
  badgeBorderColor: string;
}

type Busy = { list?: boolean; save?: boolean; del?: Id | null };

const emptyProject: Project = {
  name: '',
  status: 'Planned',
  location: '',
  description: '',
  badgeColor: 'bg-emerald-50',
  badgeTextColor: 'text-emerald-700',
  badgeBorderColor: 'border-emerald-100',
  isOpen: false,
};

const emptyStakeholder: Stakeholder = {
  name: '',
  url: '',
  initial: '',
  category: 'Fund support',
  badgeColor: 'bg-emerald-50',
  badgeTextColor: 'text-emerald-700',
  badgeBorderColor: 'border-emerald-100',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function ColorRow<T extends { badgeColor: string; badgeTextColor: string; badgeBorderColor: string }>(
  props: {
    value: T;
    onChange: (patch: Partial<T>) => void;
  },
) {
  const { value, onChange } = props;
  return (
    <div className="grid md:grid-cols-3 gap-3">
      <Field label="Badge BG class">
        <input
          value={value.badgeColor}
          onChange={(e) => onChange({ badgeColor: e.target.value } as Partial<T>)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          placeholder="bg-emerald-50"
        />
      </Field>
      <Field label="Badge Text class">
        <input
          value={value.badgeTextColor}
          onChange={(e) => onChange({ badgeTextColor: e.target.value } as Partial<T>)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          placeholder="text-emerald-700"
        />
      </Field>
      <Field label="Badge Border class">
        <input
          value={value.badgeBorderColor}
          onChange={(e) => onChange({ badgeBorderColor: e.target.value } as Partial<T>)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
          placeholder="border-emerald-100"
        />
      </Field>
    </div>
  );
}

const API = {
  listProjects: async () => fetch('/api/admin/sustainability/projects'),
  createProject: async (body: Project) =>
    fetch('/api/admin/sustainability/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  updateProject: async (id: Id, body: Partial<Project>) =>
    fetch(`/api/admin/sustainability/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  deleteProject: async (id: Id) => fetch(`/api/admin/sustainability/projects/${id}`, { method: 'DELETE' }),

  listPartners: async () => fetch('/api/admin/sustainability/partners'),
  createPartner: async (body: Stakeholder) =>
    fetch('/api/admin/sustainability/partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  updatePartner: async (id: Id, body: Partial<Stakeholder>) =>
    fetch(`/api/admin/sustainability/partners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  deletePartner: async (id: Id) => fetch(`/api/admin/sustainability/partners/${id}`, { method: 'DELETE' }),
};

const TGREEN = '#326101';
const TGREEN_DARK = '#2a5200';
const TEXT_DARK = '#111111';

const SectionHeader: React.FC<{ title: string; cta?: React.ReactNode }> = ({ title, cta }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-xl font-bold" style={{ color: TEXT_DARK }}>{title}</h3>
    {cta}
  </div>
);

const SustainabilityPage: React.FC = () => {
  const [loading, setLoading] = useState<Busy>({ list: true });
  const [err, setErr] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Stakeholder[]>([]);

  const [pForm, setPForm] = useState<Project>(emptyProject);
  const [pEditing, setPEditing] = useState<Id | null>(null);

  const [sForm, setSForm] = useState<Stakeholder>(emptyStakeholder);
  const [sEditing, setSEditing] = useState<Id | null>(null);

  const reload = async () => {
    setLoading((b) => ({ ...b, list: true }));
    setErr(null);
    try {
      const [prj, stk] = await Promise.all([API.listProjects(), API.listPartners()]);
      if (!prj.ok || !stk.ok) throw new Error('Failed to load data');
      const prjJ = await prj.json();
      const stkJ = await stk.json();
      setProjects(Array.isArray(prjJ) ? prjJ : prjJ.items || []);
      setPartners(Array.isArray(stkJ) ? stkJ : stkJ.items || []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load');
    } finally {
      setLoading((b) => ({ ...b, list: false }));
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const onSubmitProject = async () => {
    setLoading((b) => ({ ...b, save: true }));
    setErr(null);
    try {
      if (pEditing != null) {
        const res = await API.updateProject(pEditing, pForm);
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await API.createProject(pForm);
        if (!res.ok) throw new Error('Create failed');
      }
      setPForm(emptyProject);
      setPEditing(null);
      await reload();
    } catch (e: any) {
      setErr(e?.message || 'Save failed');
    } finally {
      setLoading((b) => ({ ...b, save: false }));
    }
  };

  const onDeleteProject = async (id: Id) => {
    setLoading((b) => ({ ...b, del: id }));
    setErr(null);
    try {
      const res = await API.deleteProject(id);
      if (!res.ok) throw new Error('Delete failed');
      await reload();
    } catch (e: any) {
      setErr(e?.message || 'Delete failed');
    } finally {
      setLoading((b) => ({ ...b, del: null }));
    }
  };

  const onSubmitStakeholder = async () => {
    setLoading((b) => ({ ...b, save: true }));
    setErr(null);
    try {
      if (sEditing != null) {
        const res = await API.updatePartner(sEditing, sForm);
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await API.createPartner(sForm);
        if (!res.ok) throw new Error('Create failed');
      }
      setSForm(emptyStakeholder);
      setSEditing(null);
      await reload();
    } catch (e: any) {
      setErr(e?.message || 'Save failed');
    } finally {
      setLoading((b) => ({ ...b, save: false }));
    }
  };

  const onDeleteStakeholder = async (id: Id) => {
    setLoading((b) => ({ ...b, del: id }));
    setErr(null);
    try {
      const res = await API.deletePartner(id);
      if (!res.ok) throw new Error('Delete failed');
      await reload();
    } catch (e: any) {
      setErr(e?.message || 'Delete failed');
    } finally {
      setLoading((b) => ({ ...b, del: null }));
    }
  };

  const categories = useMemo(
    () => ['Fund support', 'Technical support', 'Capacity building'],
    [],
  );

  return (
    <div className="space-y-6">
      {err && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{err}</div>
      )}

      {/* Projects */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{ color: TEXT_DARK }}>
        <SectionHeader
          title="Projects (ESIA Status)"
          cta={
            <button
              onClick={() => { setPForm(emptyProject); setPEditing(null); }}
              className="text-sm px-3 py-2 rounded-md border border-gray-200"
            >
              New Project
            </button>
          }
        />
        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {loading.list ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                projects.map((p) => (
                  <div key={String(p.id ?? p.name)} className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <span className={`text-[11px] px-2 py-1 rounded-full ${p.badgeColor} ${p.badgeTextColor} border ${p.badgeBorderColor}`}>{p.status}</span>
                        </div>
                        <div className="text-xs text-gray-500">{p.location}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                          onClick={() => { setPEditing(p.id ?? null); setPForm({ ...emptyProject, ...p }); }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
                          disabled={loading.del === (p.id ?? null)}
                          onClick={() => onDeleteProject(p.id ?? '')}
                        >
                          {loading.del === (p.id ?? null) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{p.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <Field label="Name">
                <input
                  value={pForm.name}
                  onChange={(e) => setPForm((v) => ({ ...v, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  style={{ color: TEXT_DARK }}
                  placeholder="Project name"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <input
                    value={pForm.status}
                    onChange={(e) => setPForm((v) => ({ ...v, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    style={{ color: TEXT_DARK }}
                    placeholder="e.g. Ongoing"
                  />
                </Field>
                <Field label="Location">
                  <input
                    value={pForm.location}
                    onChange={(e) => setPForm((v) => ({ ...v, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    style={{ color: TEXT_DARK }}
                    placeholder="Region, Country"
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={pForm.description}
                  onChange={(e) => setPForm((v) => ({ ...v, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  style={{ color: TEXT_DARK }}
                  rows={4}
                />
              </Field>
              <ColorRow value={pForm} onChange={(patch) => setPForm((v) => ({ ...v, ...patch }))} />
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={!!pForm.isOpen}
                  onChange={(e) => setPForm((v) => ({ ...v, isOpen: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                Open by default
              </label>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onSubmitProject}
                  disabled={!!loading.save}
                  className="text-white text-sm font-semibold rounded-md px-3 py-2"
                  style={{ backgroundColor: TGREEN }}
                >
                  {pEditing != null ? 'Update Project' : 'Add Project'}
                </button>
                {pEditing != null && (
                  <button
                    onClick={() => { setPEditing(null); setPForm(emptyProject); }}
                    className="text-sm text-gray-600 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stakeholders / Partners */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{ color: TEXT_DARK }}>
        <SectionHeader
          title="Stakeholders / Partners"
          cta={
            <button
              onClick={() => { setSForm(emptyStakeholder); setSEditing(null); }}
              className="text-sm px-3 py-2 rounded-md border border-gray-200"
            >
              New Partner
            </button>
          }
        />
        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {loading.list ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                partners.map((s) => (
                  <div key={String(s.id ?? s.url)} className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.url}</div>
                        <div className="text-xs text-gray-500">{s.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                          onClick={() => { setSEditing(s.id ?? null); setSForm({ ...emptyStakeholder, ...s }); }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50"
                          disabled={loading.del === (s.id ?? null)}
                          onClick={() => onDeleteStakeholder(s.id ?? '')}
                        >
                          {loading.del === (s.id ?? null) ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs mt-2">
                      <span className={`inline-block text-[11px] px-2 py-1 rounded-full ${s.badgeColor} ${s.badgeTextColor} border ${s.badgeBorderColor}`}>
                        {s.initial || '—'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <Field label="Name">
                <input
                  value={sForm.name}
                  onChange={(e) => setSForm((v) => ({ ...v, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  style={{ color: TEXT_DARK }}
                  placeholder="Partner name"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="URL">
                  <input
                    value={sForm.url}
                    onChange={(e) => setSForm((v) => ({ ...v, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    style={{ color: TEXT_DARK }}
                    placeholder="https://example.org"
                  />
                </Field>
                <Field label="Initial">
                  <input
                    value={sForm.initial}
                    onChange={(e) => setSForm((v) => ({ ...v, initial: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    style={{ color: TEXT_DARK }}
                    placeholder="AB"
                  />
                </Field>
              </div>
              <Field label="Category">
                <select
                  value={sForm.category}
                  onChange={(e) => setSForm((v) => ({ ...v, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white"
                  style={{ color: TEXT_DARK }}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <ColorRow value={sForm} onChange={(patch) => setSForm((v) => ({ ...v, ...patch }))} />
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={onSubmitStakeholder}
                  disabled={!!loading.save}
                  className="text-white text-sm font-semibold rounded-md px-3 py-2"
                  style={{ backgroundColor: TGREEN }}
                >
                  {sEditing != null ? 'Update Partner' : 'Add Partner'}
                </button>
                {sEditing != null && (
                  <button
                    onClick={() => { setSEditing(null); setSForm(emptyStakeholder); }}
                    className="text-sm text-gray-600 underline"
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

export default SustainabilityPage;
