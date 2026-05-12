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

const DEFAULT_GEO_STATS: { label: string; value: string }[] = [
  { label: 'Identified Sites', value: '4' },
  { label: 'MW Potential', value: '800' },
  { label: 'Active Regions', value: '1' },
  { label: 'USD Investment', value: '2.5B' },
];

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
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<{ list?: boolean; save?: boolean; del?: Id | null }>({ list: true });
  
  const [geoStats, setGeoStats] = useState<{ label: string; value: string }[]>([]);
  const [savingStats, setSavingStats] = useState(false);
  
  const [featuredTitle, setFeaturedTitle] = useState('Featured Geothermal Projects');
  const [geoSectionTitle, setGeoSectionTitle] = useState('Geothermal Sites in Tanzania');
  const [geoSectionSubtitle, setGeoSectionSubtitle] = useState("Discover Tanzania's geothermal potential across the Rift Valley.");
  
  const [zoneMapTitle, setZoneMapTitle] = useState('Zone Map');
  const [zoneMapSubhead, setZoneMapSubhead] = useState('Click a zone to filter, then explore exact site pins on the map.');
  const [activeLabel, setActiveLabel] = useState('Active');
  const [noDataLabel, setNoDataLabel] = useState('No data yet');
  
  const [heroTitle, setHeroTitle] = useState('Tanzania’s Geothermal Sites by Zone');
  const [heroDescription, setHeroDescription] = useState('Explore geothermal prospects across zones. Start with the Eastern Zone sites and drill down into each location’s background and status.');
  
  const [homeMapTitle, setHomeMapTitle] = useState('Tanzania Geothermal Map');
  const [homeMapSubhead, setHomeMapSubhead] = useState('Click a zone to filter markers and projects.');
  
  const [savingTitle, setSavingTitle] = useState(false);
  
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  const load = async () => {
    setLoading((b) => ({ ...b, list: true }));
    setErr(null);
    try {
      const res = await API.list();
      if (!res.ok) throw new Error('Failed to load sites');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || 'Failed to load sites');
      setItems([]);
    } finally {
      setLoading((b) => ({ ...b, list: false }));
    }
  };

  useEffect(() => {
    load();
    // Fetch stats
    fetch('/api/geothermal-stats')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setGeoStats(data);
        } else {
          setGeoStats(DEFAULT_GEO_STATS);
        }
      })
      .catch(() => { setGeoStats(DEFAULT_GEO_STATS); });

    // Fetch section titles and zone map settings
    const settingsKeys = [
      { key: 'geothermal_featured_title', setter: setFeaturedTitle },
      { key: 'geothermal_section_title', setter: setGeoSectionTitle },
      { key: 'geothermal_section_subtitle', setter: setGeoSectionSubtitle },
      { key: 'geothermal_zone_map_title', setter: setZoneMapTitle },
      { key: 'geothermal_zone_map_subhead', setter: setZoneMapSubhead },
      { key: 'geothermal_active_label', setter: setActiveLabel },
      { key: 'geothermal_nodata_label', setter: setNoDataLabel },
      { key: 'geothermal_hero_title', setter: setHeroTitle },
      { key: 'geothermal_hero_description', setter: setHeroDescription },
      { key: 'geothermal_home_map_title', setter: setHomeMapTitle },
      { key: 'geothermal_home_map_subhead', setter: setHomeMapSubhead },
    ];
    settingsKeys.forEach(({ key, setter }) => {
      fetch(`/api/site-settings?key=${key}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.value) setter(data.value); })
        .catch(() => { });
    });
  }, []);

  // Leaflet map initialization
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const initial: [number, number] = [
      Number.isFinite(form.lat) ? Number(form.lat) : -6.5,
      Number.isFinite(form.lng) ? Number(form.lng) : 35.0,
    ];
    const map = L.map(mapContainerRef.current, { scrollWheelZoom: true, dragging: true }).setView(initial, 6);

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

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
    setSuccess(null);
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
      setSuccess('Geothermal site saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Save failed');
    } finally {
      setLoading((b) => ({ ...b, save: false }));
    }
  };

  const remove = async (id: Id) => {
    if (!confirm('Delete this site?')) return;
    setLoading((b) => ({ ...b, del: id }));
    setErr(null);
    try {
      const res = await API.delete(id);
      if (!res.ok) throw new Error('Delete failed');
      setSuccess('Site deleted.');
      setTimeout(() => setSuccess(null), 3000);
      await load();
    } catch (e: any) {
      setErr(e?.message || 'Delete failed');
    } finally {
      setLoading((b) => ({ ...b, del: null }));
    }
  };

  const saveAllSettings = async () => {
    setSavingTitle(true);
    setErr(null);
    setSuccess(null);
    try {
      const allSettings = [
        { key: 'geothermal_featured_title', value: featuredTitle },
        { key: 'geothermal_section_title', value: geoSectionTitle },
        { key: 'geothermal_section_subtitle', value: geoSectionSubtitle },
        { key: 'geothermal_zone_map_title', value: zoneMapTitle },
        { key: 'geothermal_zone_map_subhead', value: zoneMapSubhead },
        { key: 'geothermal_active_label', value: activeLabel },
        { key: 'geothermal_nodata_label', value: noDataLabel },
        { key: 'geothermal_hero_title', value: heroTitle },
        { key: 'geothermal_hero_description', value: heroDescription },
        { key: 'geothermal_home_map_title', value: homeMapTitle },
        { key: 'geothermal_home_map_subhead', value: homeMapSubhead },
      ];
      
      const results = await Promise.all(
        allSettings.map(s => fetch('/api/site-settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(s)
        }))
      );
      
      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) throw new Error(`${failed.length} settings failed to save.`);
      
      setSuccess('All titles and hero settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setErr(e?.message || 'Failed to save settings');
    } finally {
      setSavingTitle(false);
    }
  };

  const detailsText = (form.details || []).join('\n');

  return (
    <div className="space-y-8 pb-20">
      {/* Toast Notifications */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
        {err && (
          <div className="p-4 rounded-xl shadow-2xl border border-red-200 bg-red-50 text-red-600 animate-in fade-in slide-in-from-top-4 duration-300 min-w-[300px]">
            <p className="text-sm font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Error: {err}
            </p>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl shadow-2xl border border-green-200 bg-green-50 text-green-700 animate-in fade-in slide-in-from-top-4 duration-300 min-w-[300px]">
            <p className="text-sm font-bold flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              Success: {success}
            </p>
          </div>
        )}
      </div>

      {/* ─── Global Configuration ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between bg-gray-50/50 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Geothermal Page Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">Manage public headings, descriptions, and map labels across the geothermal modules.</p>
          </div>
          <button
            onClick={saveAllSettings}
            disabled={savingTitle}
            className="px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 hover:shadow-xl"
            style={{ backgroundColor: TGREEN }}
          >
            {savingTitle ? 'Saving...' : 'Save All Configuration'}
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8">
          {/* Group: Homepage Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Homepage Section</h3>
            <div className="space-y-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
              <Field label="Section Title">
                <input type="text" value={geoSectionTitle} onChange={(e) => setGeoSectionTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Geothermal Sites in Tanzania" />
              </Field>
              <Field label="Section Subtitle">
                <input type="text" value={geoSectionSubtitle} onChange={(e) => setGeoSectionSubtitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Discover Tanzania's geothermal potential..." />
              </Field>
              <div className="pt-2">
                <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-tighter">Homepage Map Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Map Title">
                    <input type="text" value={homeMapTitle} onChange={(e) => setHomeMapTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Tanzania Geothermal Map" />
                  </Field>
                  <Field label="Map Subhead">
                    <input type="text" value={homeMapSubhead} onChange={(e) => setHomeMapSubhead(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Click a zone to filter..." />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Group: Geothermal Sites Page Hero */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dedicated Page Hero</h3>
            <div className="space-y-4 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
              <Field label="Hero Title (Main Heading)">
                <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold" style={{ color: TEXT_DARK }} placeholder="Tanzania’s Geothermal Sites by Zone" />
              </Field>
              <Field label="Hero Description (Intro Text)">
                <textarea value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm min-h-[100px] leading-relaxed" style={{ color: TEXT_DARK }} placeholder="Explore geothermal prospects across zones..." />
              </Field>
              <Field label="Featured Projects Heading">
                <input type="text" value={featuredTitle} onChange={(e) => setFeaturedTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Featured Geothermal Projects" />
              </Field>
            </div>
          </div>

          {/* Group: Zone Map UI & Legend */}
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Zone Map UI & Legend</h3>
             <div className="grid md:grid-cols-3 gap-6 p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="space-y-4">
                  <Field label="Zone Map Title">
                    <input type="text" value={zoneMapTitle} onChange={(e) => setZoneMapTitle(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Zone Map" />
                  </Field>
                  <Field label="Zone Map Subhead">
                    <input type="text" value={zoneMapSubhead} onChange={(e) => setZoneMapSubhead(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Click a zone to filter..." />
                  </Field>
                </div>
                <div className="space-y-4">
                  <Field label="Legend: Active Label">
                    <input type="text" value={activeLabel} onChange={(e) => setActiveLabel(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="Active" />
                  </Field>
                  <Field label="Legend: No Data Label">
                    <input type="text" value={noDataLabel} onChange={(e) => setNoDataLabel(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="No data yet" />
                  </Field>
                </div>
                <div className="flex flex-col justify-end pb-1">
                   <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-tight">Legend Preview</div>
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <span className="w-3.5 h-3.5 rounded bg-emerald-500"></span> {activeLabel}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                          <span className="w-3.5 h-3.5 rounded bg-gray-300"></span> {noDataLabel}
                        </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* ─── Geothermal Stats Cards ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Homepage Stats Cards</h3>
            <p className="text-sm text-gray-500 mt-1">Four highlight cards displayed above the map on the homepage.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setGeoStats(DEFAULT_GEO_STATS)}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              type="button"
              onClick={async () => {
                setSavingStats(true);
                setErr(null);
                setSuccess(null);
                try {
                  const res = await fetch('/api/geothermal-stats', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(geoStats),
                  });
                  if (!res.ok) throw new Error('Failed to save stats');
                  const data = await res.json();
                  if (Array.isArray(data)) setGeoStats(data);
                  setSuccess('Homepage stats saved successfully.');
                  setTimeout(() => setSuccess(null), 3000);
                } catch (e: any) {
                  setErr(e?.message || 'Failed to save stats');
                } finally {
                  setSavingStats(false);
                }
              }}
              disabled={savingStats}
              className="px-6 py-2 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: TGREEN }}
            >
              {savingStats ? 'Saving...' : 'Save Stats'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {geoStats.map((stat, i) => (
            <div
              key={i}
              className="text-white rounded-2xl p-5 text-center shadow-lg transition-transform hover:-translate-y-1"
              style={{ background: `linear-gradient(135deg, ${TGREEN}, #639427)` }}
            >
              <div className="text-2xl font-black mt-2">{stat.value || '—'}</div>
              <div className="text-white/70 text-[11px] font-bold uppercase tracking-widest mt-1">{stat.label || 'Label'}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {geoStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
              <span className="text-gray-300 text-xs font-black w-6">{i + 1}</span>
              <input
                value={stat.label}
                onChange={(e) => { const copy = [...geoStats]; copy[i] = { ...copy[i], label: e.target.value }; setGeoStats(copy); }}
                placeholder="Label (e.g., Identified Sites)"
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white"
              />
              <input
                value={stat.value}
                onChange={(e) => { const copy = [...geoStats]; copy[i] = { ...copy[i], value: e.target.value }; setGeoStats(copy); }}
                placeholder="Value"
                className="w-32 px-4 py-2 border border-gray-200 rounded-xl text-sm bg-white font-bold"
              />
              <button
                type="button"
                onClick={() => setGeoStats(geoStats.filter((_, j) => j !== i))}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGeoStats([...geoStats, { label: '', value: '' }])}
          className="mt-4 text-sm font-bold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          style={{ color: TGREEN }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Stat Card
        </button>
      </div>

      {/* ─── Geothermal Sites Management ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Site Locations & Details</h3>
            <p className="text-sm text-gray-500 mt-1">Add or edit specific geothermal prospects and their coordinates.</p>
          </div>
          <button
            onClick={() => { setForm({ slug: '', title: '', summary: '', details: [], tag: '', zone: 'Eastern Zone', lat: -6.5, lng: 35.0 }); setEditing(null); }}
            className="px-6 py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            + Add New Site
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* List of sites */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Existing Sites</h4>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {loading.list ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#326101] rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-500">Loading sites database...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400">No geothermal sites added yet.</p>
                </div>
              ) : (
                items.map((s) => (
                  <div key={String(s.id)} className={`group border rounded-2xl p-5 transition-all duration-200 ${editing === s.id ? 'border-[#326101] bg-green-50/30' : 'border-gray-100 hover:border-gray-300 bg-white'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase tracking-tight">{s.zone}</span>
                          <span className="text-xs font-mono text-gray-400">{s.slug}</span>
                        </div>
                        <h5 className="font-bold text-gray-900 text-lg leading-tight">{s.title}</h5>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{s.summary}</p>
                        <div className="flex items-center gap-4 mt-3 text-[11px] font-medium text-gray-400">
                           <span className="flex items-center gap-1">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                             {s.lat}, {s.lng}
                           </span>
                           <span className="flex items-center gap-1 uppercase tracking-tighter">
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                             {s.tag || 'No tags'}
                           </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <button 
                          className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-600 shadow-sm hover:border-[#326101] hover:text-[#326101] transition-all"
                          onClick={() => { setEditing(s.id ?? null); setForm({ ...s, details: (s.details || []) as any }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button 
                          className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 shadow-sm hover:border-red-200 hover:text-red-500 transition-all"
                          disabled={loading.del === (s.id ?? null)}
                          onClick={() => remove(s.id ?? '')}
                        >
                          {loading.del === (s.id ?? null) ? (
                            <div className="w-5 h-5 border-2 border-red-100 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Site Editor Form */}
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{editing ? 'Edit Site Details' : 'Create New Site'}</h4>
            <div className="space-y-5">
              <Field label="Short ID (Slug) *">
                <input value={form.slug} onChange={(e) => setForm((v) => ({ ...v, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono" style={{ color: TEXT_DARK }} placeholder="e.g., kisaki-geothermal" />
              </Field>
              <Field label="Full Site Title *">
                <input value={form.title} onChange={(e) => setForm((v) => ({ ...v, title: e.target.value }))} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold" style={{ color: TEXT_DARK }} placeholder="Kisaki Geothermal Prospect" />
              </Field>
              <Field label="Summary Description *">
                <textarea value={form.summary} onChange={(e) => setForm((v) => ({ ...v, summary: e.target.value }))} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none" style={{ color: TEXT_DARK }} rows={3} placeholder="Provide a brief overview of the site..." />
              </Field>
              <Field label="Key Highlights (One per line)">
                <textarea value={detailsText} onChange={(e) => setForm((v) => ({ ...v, details: e.target.value.split(/\r?\n/) }))} 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} rows={4} placeholder="e.g. Estimated potential: 200MW\nAccessibility: Year-round" />
              </Field>
              
              <div className="grid grid-cols-2 gap-4">
                <Field label="Zone Area">
                  <select value={form.zone} onChange={(e) => setForm((v) => ({ ...v, zone: e.target.value }))} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white" style={{ color: TEXT_DARK }}>
                    {ZONES.map((z) => (<option key={z} value={z}>{z}</option>))}
                  </select>
                </Field>
                <Field label="Context Tag (Optional)">
                  <input value={form.tag || ''} onChange={(e) => setForm((v) => ({ ...v, tag: e.target.value }))} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" style={{ color: TEXT_DARK }} placeholder="e.g. Rufiji • Morogoro" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude">
                  <input type="number" step="0.000001" value={form.lat} onChange={(e) => setForm((v) => ({ ...v, lat: Number(e.target.value) }))} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono" style={{ color: TEXT_DARK }} />
                </Field>
                <Field label="Longitude">
                  <input type="number" step="0.000001" value={form.lng} onChange={(e) => setForm((v) => ({ ...v, lng: Number(e.target.value) }))} 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono" style={{ color: TEXT_DARK }} />
                </Field>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Map Coordinate Picker</span>
                  <button type="button" onClick={() => mapRef.current?.setView([-6.5, 35.0], 6)} className="text-[10px] font-bold text-[#326101] hover:underline">RESET VIEW</button>
                </div>
                <div ref={mapContainerRef} className="rounded-2xl border border-gray-200 overflow-hidden shadow-inner bg-white" style={{ height: 280 }} />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={submit} 
                  disabled={!!loading.save} 
                  className="flex-1 py-3 px-6 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: TGREEN }}
                >
                  {loading.save ? 'Saving...' : editing != null ? 'Update Site' : 'Create Site'}
                </button>
                {editing != null && (
                  <button 
                    onClick={() => { setEditing(null); setForm({ slug: '', title: '', summary: '', details: [], tag: '', zone: 'Eastern Zone', lat: -6.5, lng: 35.0 }); }} 
                    className="px-6 py-3 rounded-xl text-sm font-bold border border-gray-200 hover:bg-white transition-colors"
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

export default GeothermalSitesPage;
