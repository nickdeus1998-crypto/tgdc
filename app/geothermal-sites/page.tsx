'use client'

import React, { useEffect, useState, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import type L from 'leaflet';

interface Site {
  id: string; // slug
  title: string;
  summary: string;
  details: string[];
  tag?: string;
  zone: string;
  lat: number;
  lng: number;
}

const GeothermalSites: NextPage = () => {
  const [currentZone, setCurrentZone] = useState<string>("Eastern Zone");
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [isSideSheetOpen, setIsSideSheetOpen] = useState<boolean>(false);
  const [selectedSite, setSelectedSite] = useState<{ zone: string; site: Site } | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const leafletRef = useRef<typeof L | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const zones = ["Eastern Zone", "Lake Zone", "Southern Zone", "Northern Zone", "Central Zone", "All"];
  const getZoneButtonClass = (zone: string) =>
    `px-3 py-1.5 rounded-full border text-sm transition-all duration-200 ${currentZone === zone
      ? 'bg-gradient-to-r from-[#326101] to-[#639427] text-white border-transparent'
      : 'text-gray-700 border-green-200 hover:bg-green-50'
    }`;
  const getZonePolygonClass = (zone: string) =>
    `cursor-pointer transition-all duration-250 ease-in-out hover:-translate-y-1 hover:brightness-105 ${currentZone === zone ? 'outline outline-3 outline-white/80 outline-offset-[-2px]' : ''
    }`;

  const updateStats = () => {
    const easternCount = sites.filter((s) => s.zone === 'Eastern Zone').length;
    const totalCount = sites.length;
    const othersCount = Math.max(0, totalCount - easternCount);
    return { easternCount, othersCount, totalCount };
  };

  const getFilteredSites = (zone: string, query: string): Site[] => {
    const zoneSites = zone === 'All' ? sites : sites.filter((s) => s.zone === zone);
    return zoneSites.filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.summary.toLowerCase().includes(q) ||
        (!!s.tag && s.tag.toLowerCase().includes(q))
      );
    });
  };

  const openSiteSideSheet = (id: string) => {
    const site = sites.find((x) => x.id === id);
    if (site) {
      setSelectedSite({ zone: site.zone, site });
      setIsSideSheetOpen(true);
    }
  };

  const handleZoneClick = (zone: string) => {
    setCurrentZone(zone);
    updateMarkers();
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(true), 120);
    }
  };

  const updateMarkers = () => {
    const Leaf = leafletRef.current;
    if (!markersLayerRef.current || !mapRef.current || !Leaf) return;
    markersLayerRef.current.clearLayers();
    const filteredSites = getFilteredSites(currentZone, currentQuery);

    const bounds: [number, number][] = [];
    filteredSites.forEach((site) => {
      const coord = { lat: Number(site.lat), lng: Number(site.lng) };
      if (
        Number.isNaN(coord.lat) ||
        Number.isNaN(coord.lng) ||
        coord.lat < -90 || coord.lat > 90 ||
        coord.lng < -180 || coord.lng > 180
      ) return;
      const popupHtml = `
        <div class="font-semibold text-gray-900 mb-1">${site.title}</div>
        <div class="text-sm text-gray-600 mb-2">${site.summary}</div>
        <button class="leaflet-more bg-[#326101] text-white px-3 py-1.5 rounded text-xs font-semibold" data-id="${site.id}">Open details</button>
      `;
      const marker = Leaf.marker([coord.lat, coord.lng]).addTo(markersLayerRef.current!).bindPopup(popupHtml);
      bounds.push([coord.lat, coord.lng]);
    });
    if (bounds.length) {
      if (bounds.length === 1) { mapRef.current.setView(bounds[0] as any, 6); } else { mapRef.current.fitBounds(bounds as any, { padding: [40, 40], maxZoom: 7 } as any); }
    } else {
      mapRef.current.setView([-6.5, 35.0], 5);
    }
    setTimeout(() => mapRef.current?.invalidateSize(true), 120);
  };

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current || mapRef.current) return;
      const Leaf = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      leafletRef.current = Leaf;

      // Fix for broken leaflet marker icons
      delete (Leaf.Icon.Default.prototype as any)._getIconUrl;
      Leaf.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      mapRef.current = Leaf.map(mapContainerRef.current, { scrollWheelZoom: false }).setView([-6.5, 35.0], 5);
      Leaf.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current);
      markersLayerRef.current = Leaf.layerGroup().addTo(mapRef.current);
      updateMarkers();
      setTimeout(() => mapRef.current?.invalidateSize(true), 250);
    };
    initMap();

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(true);
      }
    };
    window.addEventListener('resize', handleResize);

    const handlePopupClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.leaflet-more');
      if (btn) {
        const id = btn.getAttribute('data-id');
        if (id) openSiteSideSheet(id);
      }
    };
    document.addEventListener('click', handlePopupClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('click', handlePopupClick);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Load sites once from API
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch('/api/geothermal-sites');
        if (!res.ok) throw new Error('Failed to load sites');
        const data = await res.json();
        const items: Site[] = (data.items || []).map((s: any) => ({
          id: String(s.id),
          title: s.title,
          summary: s.summary,
          details: Array.isArray(s.details) ? s.details : [],
          tag: s.tag || undefined,
          zone: s.zone,
          lat: Number(s.lat),
          lng: Number(s.lng),
        }));
        setSites(items);
        // Update markers after data loads
        setTimeout(updateMarkers, 50);
      } catch (e: any) {
        setErr(e?.message || 'Failed to load sites');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    updateMarkers();
  }, [currentZone, currentQuery]);

  const { easternCount, othersCount, totalCount } = updateStats();
  const filteredSites = getFilteredSites(currentZone, currentQuery);

  return (
    <>
      <Head>
        <title>TGDC – Geothermal Sites by Zone</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 text-gray-800 box-border">
        {/* Hero Section */}
        <section
          className="bg-[radial-gradient(1000px_500px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(900px_500px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20"
        >
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
              Tanzania’s Geothermal Sites by Zone
            </h1>
            <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
              Explore geothermal prospects across zones. Start with the Eastern Zone sites and drill down into each location’s background and status.
            </p>
          </div>
        </section>

        {/* Zone Controls */}
        <section className="py-6">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {zones.map((zone) => (
                    <button key={zone} className={getZoneButtonClass(zone)} onClick={() => handleZoneClick(zone)}>
                      {zone}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search sites, e.g., Rufiji or Selous"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#326101] focus:border-transparent"
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value.trim().toLowerCase())}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map + List */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-8">
            {/* Hex Map + Leaflet Map */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Zone Map</h3>
                  <p className="text-gray-600 text-sm">Click a zone to filter, then explore exact site pins on the map.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span> Active
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                    <span className="w-3 h-3 rounded bg-gray-300"></span> No data yet
                  </span>
                </div>
              </div>
              <div className="w-full mb-5">
                <svg viewBox="0 0 900 520" className="w-full h-auto">
                  <g className={getZonePolygonClass('Eastern Zone')} onClick={() => handleZoneClick('Eastern Zone')}>
                    <polygon points="150,140 210,105 270,140 270,210 210,245 150,210" fill="#10b981" fillOpacity="0.9" />
                    <text x="210" y="178" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">Eastern</text>
                  </g>
                  <g className={getZonePolygonClass('Lake Zone')} onClick={() => handleZoneClick('Lake Zone')}>
                    <polygon points="370,70 430,35 490,70 490,140 430,175 370,140" fill="#d1d5db" fillOpacity="0.9" />
                    <text x="430" y="108" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Lake</text>
                  </g>
                  <g className={getZonePolygonClass('Southern Zone')} onClick={() => handleZoneClick('Southern Zone')}>
                    <polygon points="370,220 430,185 490,220 490,290 430,325 370,290" fill="#d1d5db" fillOpacity="0.9" />
                    <text x="430" y="258" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Southern</text>
                  </g>
                  <g className={getZonePolygonClass('Northern Zone')} onClick={() => handleZoneClick('Northern Zone')}>
                    <polygon points="590,140 650,105 710,140 710,210 650,245 590,210" fill="#d1d5db" fillOpacity="0.9" />
                    <text x="650" y="178" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Northern</text>
                  </g>
                  <g className={getZonePolygonClass('Central Zone')} onClick={() => handleZoneClick('Central Zone')}>
                    <polygon points="480,360 540,325 600,360 600,430 540,465 480,430" fill="#d1d5db" fillOpacity="0.9" />
                    <text x="540" y="398" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Central</text>
                  </g>
                  <g
                    className={`cursor-pointer transition-all duration-250 ease-in-out hover:-translate-y-1 hover:brightness-105 ${currentZone === 'All' ? 'outline outline-3 outline-white/80 outline-offset-[-2px]' : ''
                      }`}
                    onClick={() => handleZoneClick('All')}
                  >
                    <polygon points="210,370 270,335 330,370 330,440 270,475 210,440" fill="#d1d5db" fillOpacity="0.9" />
                    <text x="270" y="408" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">All</text>
                  </g>
                </svg>
              </div>
              <div ref={mapContainerRef} className="rounded-xl border border-gray-200 overflow-hidden min-h-[320px] h-[22rem]" />
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-emerald-700 font-medium">Eastern</div>
                  <div className="text-2xl font-extrabold text-emerald-900">{easternCount}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-gray-700 font-medium">Other Zones</div>
                  <div className="text-2xl font-extrabold text-gray-900">{othersCount}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-xs text-green-700 font-medium">Total</div>
                  <div className="text-2xl font-extrabold text-green-900">{totalCount}</div>
                </div>
              </div>
            </div>
            {/* Sites List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{currentZone === 'All' ? 'All Zones' : `${currentZone} Sites`}</h3>
                  <p className="text-gray-600 text-sm">Showing {filteredSites.length} site{filteredSites.length === 1 ? '' : 's'}</p>
                </div>
              </div>
              {err && <div className="p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700 mb-3">{err}</div>}
              <div className="space-y-4">
                {filteredSites.length === 0 ? (
                  <div className="p-6 border border-gray-100 rounded-xl bg-gray-50 text-gray-600 text-sm animate-[fade_0.35s_ease-in-out]">
                    {currentZone !== 'All' && sites.filter((s) => s.zone === currentZone).length === 0 && !currentQuery
                      ? `No sites added yet for ${currentZone}.`
                      : 'No matching sites found.'}
                  </div>
                ) : (
                  filteredSites.map((site) => (
                    <div
                      key={site.id}
                      className="border border-gray-100 rounded-xl p-5 bg-white transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] animate-[fade_0.35s_ease-in-out]"
                      data-id={site.id}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{site.title}</h4>
                          <p className="text-gray-600 mt-1">{site.summary}</p>
                          {site.tag && <div className="mt-2 text-xs text-gray-500">Tags: {site.tag}</div>}
                        </div>
                        <button
                          className="bg-[#326101] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#639427]"
                          onClick={() => openSiteSideSheet(site.id)}
                        >
                          View
                        </button>
                      </div>
                      <details className="mt-4 group">
                        <summary className="cursor-pointer text-sm text-[#326101] hover:underline select-none">Read more</summary>
                        <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
                          {site.details.map((detail, index) => (
                            <li key={index}>{detail}</li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Side Sheet (Drawer) */}
        {isSideSheetOpen && selectedSite && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-[fade_0.2s_ease-out]" onClick={() => setIsSideSheetOpen(false)} />
            <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl flex flex-col animate-[slideIn_0.3s_ease-out]">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#326101] text-white">
                <div>
                  <h4 className="text-xl font-bold">{selectedSite.site.title}</h4>
                  <p className="text-sm text-white/70 mt-1 uppercase tracking-wider">{selectedSite.zone}</p>
                </div>
                <button
                  className="p-2 hover:bg-white/10 rounded-full transition-colors leading-none text-2xl"
                  onClick={() => setIsSideSheetOpen(false)}
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Overview</h5>
                  <p className="text-gray-700 text-lg leading-relaxed">{selectedSite.site.summary}</p>
                </div>

                {selectedSite.site.tag && (
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Location Context</h5>
                    <span className="inline-block px-3 py-1 bg-green-50 text-[#326101] rounded-full text-sm font-medium border border-green-100">
                      {selectedSite.site.tag}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Key Highlights</h5>
                  <div className="grid gap-3">
                    {selectedSite.site.details.map((detail, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-[#639427] mt-2 shrink-0" />
                        <span className="text-gray-700">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Site Coordinates</h5>
                  <div className="flex gap-8">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Latitude</div>
                      <div className="font-mono text-gray-900">{selectedSite.site.lat}°</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Longitude</div>
                      <div className="font-mono text-gray-900">{selectedSite.site.lng}°</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">© Tanzania Geothermal Development Company</p>
                <button
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#326101] text-white hover:bg-[#639427] transition-all shadow-md active:scale-95"
                  onClick={() => setIsSideSheetOpen(false)}
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
            @keyframes fade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .leaflet-popup-content-wrapper {
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .leaflet-more {
              cursor: pointer;
              transition: all 0.2s;
            }
            .leaflet-more:hover {
              filter: brightness(1.1);
              transform: translateY(-1px);
            }
          `}</style>
    </>
  );
};

export default GeothermalSites;
