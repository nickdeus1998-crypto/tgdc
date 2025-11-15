'use client'
import React, { useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet with SSR disabled
import 'leaflet/dist/leaflet.css';

interface GeothermalSite {
  name: string;
  location: string;
  lat: number;
  lng: number;
  capacity: string;
  status: 'operational' | 'construction' | 'planned';
  description: string;
}

const tanzaniaGeothermalSites: GeothermalSite[] = [
  {
    name: "Luhoi Geothermal Plant",
    location: "Mbeya Region",
    lat: -8.9167,
    lng: 33.4667,
    capacity: "50 MW",
    status: "operational",
    description: "Tanzania's first operational geothermal power plant, pilot project",
  },
  {
    name: "Ngozi Geothermal Field",
    location: "Mbeya Region",
    lat: -9.1167,
    lng: 33.5833,
    capacity: "200 MW",
    status: "construction",
    description: "Major geothermal development near Ngozi volcanic crater",
  },
  {
    name: "Songwe Geothermal",
    location: "Mbeya Region",
    lat: -9.2333,
    lng: 33.4167,
    capacity: "100 MW",
    status: "construction",
    description: "High-temperature geothermal resource in Southern Highlands",
  },
  {
    name: "Mbeya Geothermal Complex",
    location: "Mbeya Region",
    lat: -8.9000,
    lng: 33.4500,
    capacity: "150 MW",
    status: "construction",
    description: "Integrated geothermal development project",
  },
  {
    name: "Lake Natron Geothermal",
    location: "Arusha Region",
    lat: -2.4167,
    lng: 36.0500,
    capacity: "150 MW",
    status: "planned",
    description: "Geothermal prospect near alkaline Lake Natron",
  },
  {
    name: "Ol Doinyo Lengai",
    location: "Arusha Region",
    lat: -2.7667,
    lng: 35.9167,
    capacity: "100 MW",
    status: "planned",
    description: "Active volcano with geothermal potential",
  },
  {
    name: "Lake Manyara Geothermal",
    location: "Manyara Region",
    lat: -3.3833,
    lng: 35.8167,
    capacity: "80 MW",
    status: "planned",
    description: "Rift Valley geothermal prospect",
  },
  {
    name: "Ngorongoro Geothermal",
    location: "Arusha Region",
    lat: -3.1667,
    lng: 35.5833,
    capacity: "120 MW",
    status: "planned",
    description: "Geothermal resource in Ngorongoro Conservation Area",
  },
  {
    name: "Lake Eyasi Geothermal",
    location: "Manyara Region",
    lat: -3.6000,
    lng: 35.0333,
    capacity: "90 MW",
    status: "planned",
    description: "Geothermal exploration in Eyasi Rift",
  },
  {
    name: "Hanang Geothermal",
    location: "Manyara Region",
    lat: -4.4333,
    lng: 35.4500,
    capacity: "70 MW",
    status: "planned",
    description: "Volcanic geothermal prospect",
  },
  {
    name: "Kilimanjaro Geothermal",
    location: "Kilimanjaro Region",
    lat: -3.0758,
    lng: 37.3531,
    capacity: "200 MW",
    status: "planned",
    description: "High-altitude geothermal resource near Mt. Kilimanjaro",
  },
  {
    name: "Rungwe Geothermal",
    location: "Mbeya Region",
    lat: -9.1333,
    lng: 33.6667,
    capacity: "180 MW",
    status: "planned",
    description: "Volcanic geothermal field in Rungwe district",
  },
  {
    name: "Kiejo-Mbaka Geothermal",
    location: "Mbeya Region",
    lat: -9.0500,
    lng: 33.5167,
    capacity: "75 MW",
    status: "construction",
    description: "Geothermal development in Kiejo-Mbaka area",
  },
  {
    name: "Lake Rukwa Geothermal",
    location: "Rukwa Region",
    lat: -7.8333,
    lng: 32.4167,
    capacity: "60 MW",
    status: "planned",
    description: "Rift Valley geothermal prospect",
  },
  {
    name: "Mbozi Geothermal",
    location: "Mbeya Region",
    lat: -9.3167,
    lng: 32.7500,
    capacity: "85 MW",
    status: "planned",
    description: "Geothermal exploration in Mbozi district",
  },
];

const GeothermalSection: NextPage = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Ensure code only runs in the browser
    if (typeof window !== 'undefined' && mapContainerRef.current && !mapRef.current) {
      // Dynamically import Leaflet
          import('leaflet').then((L) => {
      if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([-6.369028, 34.888822], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapRef.current);
      }


        const createIcon = (status: string) => {
          const colors: { [key: string]: string } = {
            operational: '#10b981',
            construction: '#f59e0b',
            planned: '#3b82f6',
          };
          return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
              width: 20px;
              height: 20px;
              background-color: ${colors[status]};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });
        };

        tanzaniaGeothermalSites.forEach((site) => {
          const marker = L.marker([site.lat, site.lng], {
            icon: createIcon(site.status),
          }).addTo(mapRef.current!);
          const popupContent = `
            <div class="site-popup min-w-[250px]">
              <h3 class="text-[#326101] font-bold text-[1.1em] mb-2">${site.name}</h3>
              <div class="location text-gray-600 text-[0.9em] mb-2">📍 ${site.location}</div>
              <div class="capacity bg-gradient-to-r from-[#326101] to-[#639427] text-white px-2 py-1 rounded-md text-[0.8em] font-bold mb-2 inline-block">${site.capacity}</div>
              <div class="status status-${site.status} text-[0.85em] px-1.5 py-0.5 rounded font-medium
                ${site.status === 'operational' ? 'bg-green-100 text-green-700' : ''}
                ${site.status === 'construction' ? 'bg-yellow-100 text-yellow-700' : ''}
                ${site.status === 'planned' ? 'bg-blue-100 text-blue-700' : ''}">
                ${site.status.charAt(0).toUpperCase() + site.status.slice(1)}
              </div>
              <p class="mt-2 text-[0.9em] text-gray-600">${site.description}</p>
            </div>
          `;
          marker.bindPopup(popupContent, {
            className: 'leaflet-popup-content-wrapper rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)]',
          });
        });
      });

      const animateCounter = (elementId: string, targetValue: number, suffix: string = '') => {
        const element = document.getElementById(elementId);
        if (!element) return;
        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();
        const updateCounter = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);
          element.textContent = currentValue.toLocaleString() + suffix;
          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          }
        };
        requestAnimationFrame(updateCounter);
      };

      const handleLoad = () => {
        setTimeout(() => {
          animateCounter('totalSites', 15);
          animateCounter('totalCapacity', 5000);
          animateCounter('totalRegions', 8);
          animateCounter('investment', 2.5, 'B');
        }, 500);
      };

      window.addEventListener('load', handleLoad);


      (async () => {
      const L = await import('leaflet');

      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
        iconUrl: '/leaflet/marker-icon.png',
        shadowUrl: '/leaflet/marker-shadow.png',
      });

      if (mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([-6.369028, 34.888822], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
        }).addTo(mapRef.current);

        // Example marker
        L.marker([-9.098, 33.633]).addTo(mapRef.current)
          .bindPopup('Ngozi Geothermal Site - 30 MW');
      }
    })();

      return () => {
        window.removeEventListener('load', handleLoad);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Geothermal Sites in Tanzania</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
                <span className="text-[#326101] text-sm font-medium">🇹🇿 Tanzania Energy Network</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Geothermal Sites in
                <span className="block bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent">
                  Tanzania
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover Tanzania's incredible geothermal potential across the East African Rift Valley.
                From the volcanic highlands of Kilimanjaro to the geothermal fields of the Great Rift Valley.
              </p>
            </div>
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <div className="bg-gradient-to-br from-[#326101] to-[#639427] text-white rounded-2xl p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-2 animate-[countUp_1s_ease-out_forwards]" id="totalSites">15</div>
                <div className="text-white/80 text-sm font-medium">Identified Sites</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-2 animate-[countUp_1s_ease-out_forwards]" id="totalCapacity">5,000</div>
                <div className="text-white/80 text-sm font-medium">MW Potential</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-2 animate-[countUp_1s_ease-out_forwards]" id="totalRegions">8</div>
                <div className="text-white/80 text-sm font-medium">Active Regions</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl p-6 text-center transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-3xl font-bold mb-2 animate-[countUp_1s_ease-out_forwards]" id="investment">2.5B</div>
                <div className="text-white/80 text-sm font-medium">USD Investment</div>
              </div>
            </div>
            {/* Interactive Map */}
            <div className="bg-white rounded-2xl p-6 shadow-xl mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Tanzania Geothermal Map</h3>
                  <p className="text-gray-600">Explore geothermal sites across Tanzania's Rift Valley system</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Operational</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Development</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Exploration</span>
                  </div>
                </div>
              </div>
              <div ref={mapContainerRef} className="h-[500px] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.1)]" />
            </div>
            {/* Featured Sites Grid */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Geothermal Projects</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]">
                  <div
                    className="h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InNreSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjODdDRUVCIi8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0U2RjNGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9Im1vdW50YWluIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0QjU1NjMiLz4KPHN0b3Agb2Zmc2V0PSI3MCUiIHN0b3AtY29sb3I9IiM2QjcyODAiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMzI2MTAxIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjc2t5KSIvPgo8cG9seWdvbiBwb2ludHM9IjAsMTgwIDEwMCwxMjAgMjAwLDgwIDMwMCwxMDAgNDAwLDE0MCA0MDAsMjQwIDAsMjQwIiBmaWxsPSJ1cmwoI21vdW50YWluKSIvPgo8Y2lyY2xlIGN4PSIzMjAiIGN5PSI2MCIgcj0iMjAiIGZpbGw9IiNGRkY3RUQiIG9wYWNpdHk9IjAuOCIvPgo8Y2lyY2xlIGN4PSIzNDAiIGN5PSI4MCIgcj0iMTUiIGZpbGw9IiNGRkY3RUQiIG9wYWNpdHk9IjAuNiIvPgo8Y2lyY2xlIGN4PSIzNjAiIGN5PSI3MCIgcj0iMTIiIGZpbGw9IiNGRkY3RUQiIG9wYWNpdHk9IjAuNCIvPgo8dGV4dCB4PSIyMCIgeT0iMjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSI+TmdvemkgR2VvdGhlcm1hbCBGaWVsZDwvdGV4dD4KPC9zdmc+')] bg-cover bg-center bg-no-repeat relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/30 before:to-black/10 before:z-[1]"
                  >
                    <div className="absolute bottom-4 left-4 text-white z-[2]">
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full mb-2">🌋 Mbeya Region</div>
                      <h4 className="text-xl font-bold">Ngozi Geothermal</h4>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-[#326101]">200 MW</span>
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Development</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Located near the Ngozi volcanic crater in the Southern Highlands.
                      High-temperature geothermal resource with excellent development potential.
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Mbeya, Tanzania
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]">
                  <div
                    className="h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InNreTIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZCQjY0MiIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRDdBMTQiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJsYWtlIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjAlIiB5Mj0iMTAwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNFRjQ0NDQiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjREMxOTE3Ii8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyNDAiIGZpbGw9InVybCgjc2t5MikiLz4KPGVsbGlwc2UgY3g9IjIwMCIgY3k9IjE4MCIgcng9IjE1MCIgcnk9IjQwIiBmaWxsPSJ1cmwoI2xha2UpIi8+Cjxwb2x5Z29uIHBvaW50cz0iNTAsMTYwIDEwMCwxNDAgMTUwLDEzMCAyMDAsMTM1IDI1MCwxNDAgMzAwLDE0NSAzNTAsMTUwIDQwMCwxNjAgNDAwLDI0MCA1MCwyNDAiIGZpbGw9IiM2MzkyMjciLz4KPGNpcmNsZSBjeD0iMzIwIiBjeT0iNDAiIHI9IjMwIiBmaWxsPSIjRkZGN0VEIiBvcGFjaXR5PSIwLjkiLz4KPHRleHQgeD0iMjAiIHk9IjIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkxha2UgTmF0cm9uIEFyZWF8L3RleHQ+Cjwvc3ZnPg==')] bg-cover bg-center bg-no-repeat relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/30 before:to-black/10 before:z-[1]"
                  >
                    <div className="absolute bottom-4 left-4 text-white z-[2]">
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full mb-2">🏔️ Arusha Region</div>
                      <h4 className="text-xl font-bold">Lake Natron</h4>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">150 MW</span>
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Exploration</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Geothermal prospect in the Eastern Rift Valley near the alkaline Lake Natron.
                      Strategic location with high-temperature geothermal indicators.
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Arusha, Tanzania
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-2 hover:scale-102 hover:shadow-[0_25px_50px_rgba(0,0,0,0.15)]">
                  <div
                    className="h-48 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDQwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InNreTMiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzM5ODNGNiIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNEQkVBRkUiLz4KPC9saW5lYXJHcmFkaWVudD4KPGxpbmVhckdyYWRpZW50IGlkPSJmb3Jlc3QiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzMyNjEwMSIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM2MzkyMjciLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0idXJsKCNza3kzKSIvPgo8cG9seWdvbiBwb2ludHM9IjAsMTYwIDgwLDE0MCAyMDAsMTIwIDMyMCwxMzAgNDAwLDE1MCA0MDAsMjQwIDAsMjQwIiBmaWxsPSJ1cmwoI2ZvcmVzdCkiLz4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iMTQwIiByPSI4IiBmaWxsPSIjRkZGN0VEIiBvcGFjaXR5PSIwLjgiLz4KPGNpcmNsZSBjeD0iMTIwIiBjeT0iMTMwIiByPSI2IiBmaWxsPSIjRkZGN0VEIiBvcGFjaXR5PSIwLjYiLz4KPGNpcmNsZSBjeD0iMTQwIiBjeT0iMTM1IiByPSI0IiBmaWxsPSIjRkZGN0VEIiBvcGFjaXR5PSIwLjQiLz4KPHJlY3QgeD0iMTgwIiB5PSIxNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI2MCIgZmlsbD0iIzY2NjY2NiIvPgo8cmVjdCB4PSIxODUiIHk9IjE0NSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjNEI1NTYzIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIj5MdWhvaSBHZW90aGVybWFsPC90ZXh0Pgo8L3N2Zz4=')] bg-cover bg-center bg-no-repeat relative overflow-hidden before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-black/30 before:to-black/10 before:z-[1]"
                  >
                    <div className="absolute bottom-4 left-4 text-white z-[2]">
                      <div className="text-xs bg-white/20 px-2 py-1 rounded-full mb-2">⚡ Mbeya Region</div>
                      <h4 className="text-xl font-bold">Luhoi Geothermal</h4>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">50 MW</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Operational</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      Tanzania's first operational geothermal power plant. Pilot project demonstrating
                      the viability of geothermal energy in the East African Rift system.
                    </p>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Mbeya, Tanzania
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-[#326101]/10 to-[#639427]/10 rounded-3xl p-8 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Powering Tanzania's Energy Future
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join us in developing Tanzania's vast geothermal potential. Together, we can provide
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
        @keyframes countUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .leaflet-popup-content {
          margin: 16px;
          font-family: inherit;
        }
      `}</style>
    </>
  );
};

export default GeothermalSection;
