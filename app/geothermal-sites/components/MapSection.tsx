// app/geothermal-sites/components/MapSection.tsx
'use client';

import { useSite } from './SiteContext';

export function MapSection() {
  const { currentZone, setCurrentZone, easternCount, othersCount, totalCount } = useSite();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Zone Map</h3>
          <p className="text-gray-600 text-sm">Click a zone to filter the site list.</p>
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
      <div className="w-full">
        <svg viewBox="0 0 900 520" className="w-full h-auto">
          <g className={`zone-hex ${currentZone === "Eastern Zone" ? 'active' : ''}`} onClick={() => setCurrentZone("Eastern Zone")}>
            <polygon points="150,140 210,105 270,140 270,210 210,245 150,210" fill="#10b981" opacity="0.9" />
            <text x="210" y="178" textAnchor="middle" fill="white" fontSize="16" fontWeight="700">Eastern</text>
          </g>
          <g className={`zone-hex ${currentZone === "Lake Zone" ? 'active' : ''}`} onClick={() => setCurrentZone("Lake Zone")}>
            <polygon points="370,70 430,35 490,70 490,140 430,175 370,140" fill="#d1d5db" opacity="0.9" />
            <text x="430" y="108" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Lake</text>
          </g>
          <g className={`zone-hex ${currentZone === "Southern Zone" ? 'active' : ''}`} onClick={() => setCurrentZone("Southern Zone")}>
            <polygon points="370,220 430,185 490,220 490,290 430,325 370,290" fill="#d1d5db" opacity="0.9" />
            <text x="430" y="258" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Southern</text>
          </g>
          <g className={`zone-hex ${currentZone === "Northern Zone" ? 'active' : ''}`} onClick={() => setCurrentZone("Northern Zone")}>
            <polygon points="590,140 650,105 710,140 710,210 650,245 590,210" fill="#d1d5db" opacity="0.9" />
            <text x="650" y="178" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Northern</text>
          </g>
          <g className={`zone-hex ${currentZone === "Central Zone" ? 'active' : ''}`} onClick={() => setCurrentZone("Central Zone")}>
            <polygon points="480,360 540,325 600,360 600,430 540,465 480,430" fill="#d1d5db" opacity="0.9" />
            <text x="540" y="398" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">Central</text>
          </g>
          <g className={`zone-hex ${currentZone === "All" ? 'active' : ''}`} onClick={() => setCurrentZone("All")}>
            <polygon points="210,370 270,335 330,370 330,440 270,475 210,440" fill="#d1d5db" opacity="0.9" />
            <text x="270" y="408" textAnchor="middle" fill="#111827" fontSize="16" fontWeight="700">All</text>
          </g>
        </svg>
      </div>
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
  );
}