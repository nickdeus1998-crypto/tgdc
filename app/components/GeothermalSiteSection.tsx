'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
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

const MAX_SITES = 6;

const GeothermalSection: NextPage = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersLayerRef = useRef<LeafletLayerGroup | null>(null);
  const leafletModuleRef = useRef<typeof import('leaflet') | null>(null);

  const displaySites = useMemo(() => sites.slice(0, MAX_SITES), [sites]);
  const activeZones = useMemo(() => Array.from(new Set(displaySites.map((s) => s.zone))), [displaySites]);

  useEffect(() => {
    let cancelled = false;
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/geothermal-sites');
        if (!res.ok) throw new Error('Failed to fetch geothermal sites');
        const json = await res.json();
        const items: Site[] = Array.isArray(json?.items) ? json.items : [];
        if (!cancelled) {
          setSites(items.slice(0, MAX_SITES));
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
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current).setView([-6.369028, 34.888822], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
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

  useEffect(() => {
    if (!leafletModuleRef.current || !markersLayerRef.current || !mapRef.current) return;
    const L = leafletModuleRef.current;
    markersLayerRef.current.clearLayers();
    const bounds: [number, number][] = [];

    displaySites.forEach((site) => {
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
      mapRef.current?.setView(bounds[0] as any, 6);
    } else {
      mapRef.current?.fitBounds(bounds as any, { padding: [32, 32], maxZoom: 7 } as any);
    }
  }, [displaySites]);

  const stats = [
    { label: 'Identified Sites', value: displaySites.length ? displaySites.length.toString() : '—' },
    {
      label: 'MW Potential',
      value:
        displaySites.length >= MAX_SITES
          ? '5,000'
          : (displaySites.length * 200).toLocaleString(),
    },
    {
      label: 'Active Regions',
      value: activeZones.length ? activeZones.length.toString() : '—',
    },
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
              <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
                <span className="text-[#326101] text-sm font-medium">Tanzania Energy Network</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Geothermal Sites in
                <span className="block bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent">
                  Tanzania
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover Tanzania&apos;s geothermal potential across the Rift Valley. The highlights
                below are synced with our CMS so the homepage always reflects the newest projects.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-gradient-to-br from-[#326101] to-[#639427] text-white rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-white/80 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-xl mb-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Tanzania Geothermal Map</h3>
                  <p className="text-gray-600">
                    Explore the latest six projects synced from our database.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#326101]">
                  {activeZones.length
                    ? activeZones.map((zone) => (
                        <span
                          key={zone}
                          className="px-3 py-1 rounded-full bg-green-50 border border-green-100"
                        >
                          {zone}
                        </span>
                      ))
                    : (
                      <span className="text-gray-500">Zones will appear once data loads.</span>
                    )}
                </div>
              </div>
              <div
                ref={mapContainerRef}
                className="h-[500px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)]"
              />
            </div>

            <div className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Featured Geothermal Projects
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
                      <h4 className="text-2xl font-bold">{site.title}</h4>
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
            </div>

            <div className="bg-gradient-to-r from-[#326101]/10 to-[#639427]/10 rounded-3xl p-8 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Powering Tanzania&apos;s Energy Future
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join us in developing Tanzania&apos;s vast geothermal potential. Together, we can provide
                clean, reliable energy for millions while supporting sustainable economic growth.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/geothermal-sites"
                  className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-center"
                >
                  Explore Investment Opportunities
                </a>
                <a
                  href="/information-center"
                  className="bg-white text-[#326101] border-2 border-[#326101] px-8 py-4 rounded-full font-semibold hover:bg-[#326101] hover:text-white transition-all duration-300 text-center"
                >
                  Download Tanzania Report
                </a>
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
