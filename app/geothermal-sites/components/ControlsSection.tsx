// app/geothermal-sites/components/ControlsSection.tsx
'use client';

import { useSite } from './SiteContext';

export function ControlsSection() {
  const { currentZone, setCurrentZone, setCurrentQuery } = useSite();
  const zones: (typeof currentZone)[] = ["Eastern Zone", "Lake Zone", "Southern Zone", "Northern Zone", "Central Zone", "All"];

  return (
    <section className="py-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {zones.map(zone => (
                <button
                  key={zone}
                  className={`chip px-3 py-1.5 rounded-full border text-sm text-gray-700 hover:bg-green-50 border-green-200 ${currentZone === zone ? 'active' : ''}`}
                  onClick={() => setCurrentZone(zone)}
                >
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
                onChange={e => setCurrentQuery(e.target.value.trim())}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}