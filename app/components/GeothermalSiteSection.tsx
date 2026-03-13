'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import type { Map as LeafletMap, LayerGroup as LeafletLayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Site {
  id: string;
  title: string;
  summary: string;
  details: string[];
  tag?: string;
  zone: string;
  lat: number;
  lng: number;
}

const MAX_SITES = 3;
const ALL_ZONES = ['All Zones', 'Eastern Zone', 'Lake Zone', 'Southern Zone', 'Northern Zone', 'Central Zone'];

const GeothermalSection: NextPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [geoStats, setGeoStats] = useState<{ label: string; value: string }[]>([]);
  const [featuredTitle, setFeaturedTitle] = useState('Featured Geothermal Projects');
  const [geoSectionTitle, setGeoSectionTitle] = useState('Geothermal Sites in Tanzania');
  const [geoSectionSubtitle, setGeoSectionSubtitle] = useState("Discover Tanzania\u0027s geothermal potential across the Rift Valley.");
  const [activeZone, setActiveZone] = useState('All Zones');
  const [mapReady, setMapReady] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<LeafletLayerGroup | null>(null);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);

  // All sites for map, filtered sites for cards
  const filteredSites = useMemo(() => {
    const filtered = activeZone === 'All Zones' ? sites : sites.filter(s => s.zone === activeZone);
    return filtered;
  }, [sites, activeZone]);

  const displaySites = useMemo(() => filteredSites.slice(0, MAX_SITES), [filteredSites]);
  const availableZones = useMemo(() => Array.from(new Set(sites.map(s => s.zone))), [sites]);

  useEffect(() => {
    let cancelled = false;
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/geothermal-sites');
        if (!res.ok) throw new Error('Failed to fetch geothermal sites');
        const json = await res.json();
        const items: Site[] = Array.isArray(json?.items) ? json.items : [];
        if (!cancelled) {
          setSites(items);
        }
      } catch (err) {
        console.error('Unable to load geothermal sites', err);
        if (!cancelled) {
          setFetchError('Unable to load geothermal sites right now. Please try again later.');
        }
      } finally {
        if (!cancelled) setLoadingSites(false);
      }
    };
    fetchSites();

    // Fetch editable stats
    fetch('/api/geothermal-stats')
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setGeoStats(data); })
      .catch(() => { });

    // Fetch editable section title
    fetch('/api/site-settings?key=geothermal_featured_title')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setFeaturedTitle(data.value); })
      .catch(() => { });

    // Fetch editable section titles
    fetch('/api/site-settings?key=geothermal_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setGeoSectionTitle(data.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=geothermal_section_subtitle')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.value) setGeoSectionSubtitle(data.value); })
      .catch(() => { });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || mapRef.current) return;
    let isMounted = true;

    import('leaflet').then((module) => {
      if (!isMounted || !mapContainerRef.current || mapRef.current) return;
      const L = (module as any).default ?? module;
      leafletModuleRef.current = L;

      // Ensure marker assets load correctly
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current).setView([-6.369028, 34.888822], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      setMapReady(true);
    });

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersLayerRef.current = null;
    };
  }, []);

  // Update markers when filteredSites change OR when map becomes ready
  useEffect(() => {
    if (!mapReady || !leafletModuleRef.current || !markersLayerRef.current || !mapRef.current) return;
    const L = leafletModuleRef.current;
    markersLayerRef.current.clearLayers();
    const bounds: [number, number][] = [];

    filteredSites.forEach((site) => {
      if (typeof site.lat !== 'number' || typeof site.lng !== 'number') return;
      const marker = L.marker([site.lat, site.lng]).addTo(markersLayerRef.current!);
      marker.bindPopup(
        `<div class="font-semibold text-gray-900 mb-1">${site.title}</div>
         <div class="text-xs text-gray-600 mb-1">${site.zone}</div>
         <p class="text-xs text-gray-600 mb-0">${site.summary}</p>`
      );
      bounds.push([site.lat, site.lng]);
    });

    if (!bounds.length) {
      mapRef.current?.setView([-6.369028, 34.888822], 6);
      return;
    }

    if (bounds.length === 1) {
      mapRef.current?.setView(bounds[0] as any, 7);
    } else {
      mapRef.current?.fitBounds(bounds as any, { padding: [32, 32], maxZoom: 7 } as any);
    }
  }, [filteredSites, mapReady]);

  const defaultGeoStats: { label: string; value: string }[] = [
    { label: 'Identified Sites', value: '4' },
    { label: 'MW Potential', value: '800' },
    { label: 'Active Regions', value: '1' },
    { label: 'USD Investment', value: '2.5B' },
  ];

  return (
    <>
      <Head>
        <title>Geothermal Sites in Tanzania</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
                {geoSectionTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {geoSectionSubtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {(geoStats.length > 0 ? geoStats : defaultGeoStats).map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gradient-to-br from-[#326101] to-[#639427] text-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="text-3xl font-semibold mb-2">{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl mb-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">Tanzania Geothermal Map</h3>
                  <p className="text-gray-500 text-sm">
                    Click a zone to filter markers and projects.
                  </p>
                </div>
              </div>
              {/* Zone filter tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {ALL_ZONES.map((zone) => {
                  const isActive = activeZone === zone;
                  const hasData = zone === 'All Zones' || availableZones.includes(zone);
                  return (
                    <button
                      key={zone}
                      onClick={() => setActiveZone(zone)}
                      disabled={!hasData && zone !== 'All Zones'}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border
                        ${isActive
                          ? 'bg-[#326101] text-white border-[#326101] shadow-md'
                          : hasData
                            ? 'bg-white text-[#326101] border-[#326101]/30 hover:border-[#326101] hover:bg-green-50'
                            : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                        }`}
                    >
                      {zone}
                      {zone !== 'All Zones' && hasData && (
                        <span className="ml-1.5 text-[10px] opacity-70">
                          ({sites.filter(s => s.zone === zone).length})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div
                ref={mapContainerRef}
                className="h-[500px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)] relative z-0"
              />
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
                {featuredTitle}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loadingSites && (
                  <div className="col-span-full text-center text-gray-500">
                    Loading highlighted projects...
                  </div>
                )}
                {fetchError && !loadingSites && (
                  <div className="col-span-full text-center text-red-500">{fetchError}</div>
                )}
                {!loadingSites && !fetchError && !displaySites.length && (
                  <div className="col-span-full text-center text-gray-500">
                    No geothermal sites have been published yet.
                  </div>
                )}
                {displaySites.map((site) => (
                  <div
                    key={site.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col"
                  >
                    <div className="bg-gradient-to-br from-[#326101] to-[#639427] text-white px-6 py-4">
                      <div className="text-xs uppercase tracking-wide text-white/70">{site.zone}</div>
                      <h4 className="text-xl font-semibold">{site.title}</h4>
                      {site.tag && (
                        <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/20">
                          {site.tag}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <p className="text-gray-600 text-sm mb-4">{site.summary}</p>
                      <ul className="space-y-2 text-sm text-gray-500 flex-1">
                        {(site.details || []).slice(0, 3).map((detail, idx) => (
                          <li key={idx} className="flex">
                            <span className="w-1.5 h-1.5 bg-[#639427] rounded-full mt-2 mr-2" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6">
                        <a
                          href={`/geothermal-sites?site=${site.id}`}
                          className="inline-flex items-center text-[#326101] font-semibold hover:text-[#639427] transition-colors"
                        >
                          View site details
                          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/geothermal-sites"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  View More Sites
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            </div>

          </div>
        </section>
      </div>
      <style jsx global>{`
        .leaflet-popup-content {
          margin: 12px;
          font-family: inherit;
        }
        .leaflet-popup-content p {
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default GeothermalSection;
