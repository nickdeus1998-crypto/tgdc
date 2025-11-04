// components/DiagramSection.tsx
'use client';

import React, { useState } from 'react';

interface RangeData {
  title: string;
  desc: string;
  app: string;
}

export function DiagramSection() {
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<SVGGElement>, title: string, app: string) => {
    setTooltipContent(`${title} – ${app}`);
    setTooltipPosition({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  const openModal = (key: string, title: string, html: string) => {
    // Integrate with modal context if needed, but for now, assuming modal is handled elsewhere or extend.
    // Since diagram click opens modal, but modal is global, use context.
    // For completeness, we'll assume ModalContext handles it.
    const event = new CustomEvent('openModal', { detail: { key, title, html } });
    document.dispatchEvent(event);
  };

  return (
    <section className="py-4">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-gradient-to-br from-white to-green-50/40 border border-green-100 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-start md:items-center justify-between gap-6 flex-col md:flex-row mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Heat Utilization by Temperature Range</h3>
              <p className="text-gray-600 mt-1">Hover over the ranges to see typical applications.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs text-gray-700">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Low Temp
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-gray-700">
                <span className="w-3 h-3 rounded bg-amber-500"></span> Medium Temp
              </span>
              <span className="inline-flex items-center gap-2 text-xs text-gray-700">
                <span className="w-3 h-3 rounded bg-rose-500"></span> High Temp
              </span>
            </div>
          </div>
          <div className="relative">
            <svg viewBox="0 0 1100 220" className="w-full">
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <filter id="soft" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>
              <rect x="70" y="90" width="960" height="20" rx="10" fill="url(#tempGrad)" />
              <rect x="70" y="90" width="960" height="20" rx="10" fill="url(#tempGrad)" filter="url(#soft)" opacity=".25" />
              <g fill="#111827" opacity=".7" fontSize="12">
                <text x="70" y="85">~20°C</text>
                <text x="320" y="85">60°C</text>
                <text x="570" y="85">100°C</text>
                <text x="820" y="85">140°C</text>
                <text x="1000" y="85">180°C+</text>
              </g>
              <g 
                className="range cursor-pointer" 
                onMouseMove={(e) => handleMouseMove(e, 'Low Temperature Uses', 'Fish Farming • Spa • Space Heating')}
                onMouseLeave={handleMouseLeave}
                onClick={() => openModal('Temperature Ranges', 'Low Temperature Uses', `
                  <p class="mb-4">Ideal for aquaculture, balneology, and low-grade heating/cooling applications.</p>
                  <div class="bg-gray-50 p-4 rounded-lg border">
                    <div class="text-sm text-gray-600 mb-2">Typical applications:</div>
                    <div class="text-gray-800 font-medium">Fish Farming • Spa • Space Heating</div>
                  </div>
                `)}
              >
                <rect x="70" y="60" width="300" height="80" rx="12" fill="#10b981" opacity=".12" />
                <rect x="70" y="60" width="300" height="80" rx="12" fill="none" stroke="#10b981" strokeWidth="2" />
                <text x="220" y="105" textAnchor="middle" fill="#065f46" fontWeight="700">Low Temp</text>
              </g>
              <g 
                className="range cursor-pointer" 
                onMouseMove={(e) => handleMouseMove(e, 'Medium Temperature Uses', 'Greenhouses • Drying of Grains • District Heating')}
                onMouseLeave={handleMouseLeave}
                onClick={() => openModal('Temperature Ranges', 'Medium Temperature Uses', `
                  <p class="mb-4">Perfect for agricultural greenhouses, industrial drying, and district heating networks.</p>
                  <div class="bg-gray-50 p-4 rounded-lg border">
                    <div class="text-sm text-gray-600 mb-2">Typical applications:</div>
                    <div class="text-gray-800 font-medium">Greenhouses • Drying of Grains • District Heating</div>
                  </div>
                `)}
              >
                <rect x="370" y="60" width="300" height="80" rx="12" fill="#f59e0b" opacity=".12" />
                <rect x="370" y="60" width="300" height="80" rx="12" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <text x="520" y="105" textAnchor="middle" fill="#7c2d12" fontWeight="700">Medium Temp</text>
              </g>
              <g 
                className="range cursor-pointer" 
                onMouseMove={(e) => handleMouseMove(e, 'High Temperature Uses', 'Industrial Processes • Absorption Cooling • Process Heat')}
                onMouseLeave={handleMouseLeave}
                onClick={() => openModal('Temperature Ranges', 'High Temperature Uses', `
                  <p class="mb-4">Suited for intensive process heat, absorption chilling, and industrial applications.</p>
                  <div class="bg-gray-50 p-4 rounded-lg border">
                    <div class="text-sm text-gray-600 mb-2">Typical applications:</div>
                    <div class="text-gray-800 font-medium">Industrial Processes • Absorption Cooling • Process Heat</div>
                  </div>
                `)}
              >
                <rect x="670" y="60" width="360" height="80" rx="12" fill="#ef4444" opacity=".12" />
                <rect x="670" y="60" width="360" height="80" rx="12" fill="none" stroke="#ef4444" strokeWidth="2" />
                <text x="850" y="105" textAnchor="middle" fill="#7f1d1d" fontWeight="700">High Temp</text>
              </g>
              <g fontSize="12" fill="#374151">
                <text x="110" y="165">Fish farming</text>
                <text x="190" y="165">Spa/balneology</text>
                <text x="290" y="165">Space heating</text>
                <text x="430" y="165">Greenhouse heating</text>
                <text x="560" y="165">Drying of grains</text>
                <text x="740" y="165">Industrial processes</text>
                <text x="930" y="165">Cooling & heating</text>
              </g>
            </svg>
            <div 
              className={`tooltip absolute bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg ${tooltipVisible ? '' : 'hidden'}`}
              style={{ left: `${tooltipPosition.x}px`, top: `${tooltipPosition.y}px` }}
            >
              {tooltipContent}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}