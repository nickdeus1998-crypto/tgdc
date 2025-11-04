'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Id = number | string;

interface SiteItem {
  id?: Id;
  slug: string; // client id used in map
  title: string;
  summary: string;
  details: string[]; // array of lines
  tag?: string | null;
  zone: string;
  lat: number;
  lng: number;
}

const TGREEN = '#326101';
const TEXT_DARK = '#111111';

const ZONES = ['Eastern Zone', 'Lake Zone', 'Southern Zone', 'Northern Zone', 'Central Zone'];

const API = {
  list: async () => fetch('/api/admin/geothermal-sites'),
  create: async (body: SiteItem) => fetch('/api/admin/geothermal-sites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
  update: async (id: Id, patch: Partial<SiteItem>) => fetch(`/api/admin/geothermal-sites/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }),
  delete: async (id: Id) => fetch(`/api/admin/geothermal-sites/${id}`, { method: 'DELETE' }),
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1" style={{ color: TEXT_DARK }}>{label}</span>
      {children}
    </label>
  );
}

const GeothermalSitesPage: React.FC = () => {
  const [items, setItems] = useState<SiteItem[]>([]);
  const [form, setForm] = useState<SiteItem>({ slug: '', title: '', summary: '', details: [], tag: '', zone: 'Eastern Zone', lat: -6.5, lng: 35.0 });
  const [editing, setEditing] = useState<Id | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ list?: boolean; save?: boolean; del?: Id | null }>({ list: true });
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setLoading((b) => ({ ...b, list: true }));
    setErr(null);
    try {
      const res = await API.list();
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

  useEffect(() => { load(); }, []);

  // Initialize leaflet map for picking coordinates
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const initial: [number, number] = [
      Number.isFinite(form.lat) ? Number(form.lat) : -6.5,
      Number.isFinite(form.lng) ? Number(form.lng) : 35.0,
    ];
    const map = L.map(mapContainerRef.current, { scrollWheelZoom: true, dragging: true }).setView(initial, 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;

    const valid = initial[0] >= -90 && initial[0] <= 90 && initial[1] >= -180 && initial[1] <= 180;
    if (valid) {
      const m = L.marker(initial, { draggable: true }).addTo(map);
      markerRef.current = m;
      m.on('dragend', () => {
        const ll = m.getLatLng();
        setForm((v) => ({ ...v, lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) }));
      });
    }

    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        markerRef.current = L.marker(e.latlng, { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const ll = markerRef.current!.getLatLng();
          setForm((v) => ({ ...v, lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) }));
        });
      }
      setForm((v) => ({ ...v, lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) }));
    });

    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.off();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // When lat/lng typed manually, update marker and pan a bit
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
      markerRef.current.on('dragend', () => {
        const ll = markerRef.current!.getLatLng();
        setForm((v) => ({ ...v, lat: Number(ll.lat.toFixed(6)), lng: Number(ll.lng.toFixed(6)) }));
      });
    }
    map.setView([lat, lng], Math.max(map.getZoom(), 7));
  }, [form.lat, form.lng]);

  const submit = async () => {
    setLoading((b) => ({ ...b, save: true }));
    setErr(null);
    try {
      const payload: SiteItem = {
        ...form,
        lat: Number(form.lat),
        lng: Number(form.lng),
        details: Array.isArray(form.details) ? form.details : String(form.details || '').split(/\r?\n/).filter(Boolean),
      } as any;
      if (editing != null) {
        const res = await API.update(editing, payload);
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await API.create(payload);
        if (!res.ok) throw new Error('Create failed');
      }
      setForm({ slug: '', title: '', summary: '', details: [], tag: '', zone: 'Eastern Zone', lat: -6.5, lng: 35.0 });
      setEditing(null);
      await load();
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
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Delete failed');
    } finally {
      setLoading((b) => ({ ...b, del: null }));
    }
  };

  const detailsText = (form.details || []).join('\n');

  return (
    <div className="space-y-6">
      {err && (
        <div className="text-sm" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: 12 }}>{err}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" style={{ color: TEXT_DARK }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold" style={{ color: TEXT_DARK }}>Geothermal Sites</h3>
          <button
            onClick={() => { setForm({ slug: '', title: '', summary: '', details: [], tag: '', zone: 'Eastern Zone', lat: -6.5, lng: 35.0 }); setEditing(null); }}
            className="text-sm px-3 py-2 rounded-md border border-gray-200"
          >
            New Site
          </button>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {loading.list ? (
                <div className="text-sm" style={{ color: '#6b7280' }}>Loading...</div>
              ) : (
                items.map((s) => (
                  <div key={String(s.id)} className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold" style={{ color: TEXT_DARK }}>{s.title}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>{s.slug} • {s.zone}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>{s.summary}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>lat {s.lat}, lng {s.lng}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-xs px-2 py-1 rounded border border-gray-200" onClick={() => { setEditing(s.id ?? null); setForm({ ...s, details: (s.details || []) as any }); }}>Edit</button>
                        <button className="text-xs px-2 py-1 rounded border border-red-200" style={{ color: '#b91c1c' }} disabled={loading.del === (s.id ?? null)} onClick={() => remove(s.id ?? '')}>{loading.del === (s.id ?? null) ? 'Deleting...' : 'Delete'}</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <div className="space-y-3">
              <Field label="Slug (short id e.g., kisaki)">
                <input value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} placeholder="e.g., kisaki" />
              </Field>
              <Field label="Title">
                <input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} placeholder="Kisaki geothermal site" />
              </Field>
              <Field label="Summary">
                <textarea value={form.summary} onChange={(e) => setForm((v) => ({ ...v, summary: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} rows={3} />
              </Field>
              <Field label="Details (one per line)">
                <textarea value={detailsText} onChange={(e) => setForm((v) => ({ ...v, details: e.target.value.split(/\r?\n/).filter(Boolean) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} rows={4} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tag (optional)">
                  <input value={form.tag || ''} onChange={(e) => setForm((v) => ({ ...v, tag: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} placeholder="Rufiji • Selous" />
                </Field>
                <Field label="Zone">
                  <select value={form.zone} onChange={(e) => setForm((v) => ({ ...v, zone: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white" style={{ color: TEXT_DARK }}>
                    {ZONES.map((z) => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Latitude (-90 to 90)">
                  <input type="number" step="0.000001" value={form.lat} onChange={(e) => setForm((v) => ({ ...v, lat: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} />
                </Field>
                <Field label="Longitude (-180 to 180)">
                  <input type="number" step="0.000001" value={form.lng} onChange={(e) => setForm((v) => ({ ...v, lng: Number(e.target.value) }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg" style={{ color: TEXT_DARK }} />
                </Field>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: TEXT_DARK }}>Pick location on map (click or drag marker)</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (mapRef.current) mapRef.current.setView([-6.5, 35.0], 6);
                    }}
                    className="text-xs px-2 py-1 rounded border border-gray-200"
                  >
                    Reset view
                  </button>
                </div>
                <div ref={mapContainerRef} className="rounded-lg border border-gray-200" style={{ height: 280 }} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button onClick={submit} disabled={!!loading.save} className="text-white text-sm font-semibold rounded-md px-3 py-2" style={{ backgroundColor: TGREEN }}>
                  {editing != null ? 'Update' : 'Create'} Site
                </button>
                {editing != null && (
                  <button onClick={() => { setEditing(null); setForm({ slug: '', title: '', summary: '', details: [], tag: '', zone: 'Eastern Zone', lat: -6.5, lng: 35.0 }); }} className="text-sm underline">Cancel</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeothermalSitesPage;
