// components/PilotAreasSection.tsx
'use client';

import { useModal } from "./ModalContext";



export function PilotAreasSection() {
  const { openModal } = useModal();

  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Pilot Areas</h3>
          <span className="badge text-white text-xs px-3 py-1 rounded-full">Preliminary Studies</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <h4 className="text-xl font-semibold text-gray-900">Ngozi Area</h4>
              <span className="text-emerald-700 bg-emerald-50 text-xs px-3 py-1 rounded-full">Promising</span>
            </div>
            <p className="text-gray-600 mt-3">
              Preliminary direct-use prospects in greenhouse heating, drying, fish farming, and thermal services aligned with local activities and resource temperature.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-emerald-700 text-sm font-semibold">Greenhouses</div>
                <div className="text-xs text-emerald-900/80">Heating</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-amber-700 text-sm font-semibold">Drying</div>
                <div className="text-xs text-amber-900/80">Grains</div>
              </div>
              <div className="bg-sky-50 rounded-lg p-3 text-center">
                <div className="text-sky-700 text-sm font-semibold">Aquaculture</div>
                <div className="text-xs text-sky-900/80">Fish</div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button 
                onClick={() => openModal('ngozi')} 
                className="bg-primary-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary-green transition-colors"
              >
                Learn more
              </button>
              <span className="text-xs text-gray-500">Temp-driven mix; market-aligned</span>
            </div>
          </div>
          <div className="card bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <h4 className="text-xl font-semibold text-gray-900">Kisaki Area</h4>
              <span className="text-emerald-700 bg-emerald-50 text-xs px-3 py-1 rounded-full">Promising</span>
            </div>
            <p className="text-gray-600 mt-3">
              Potential for industrial process heat, district-level heating/cooling, and agricultural value-add based on water chemistry and temperature.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-rose-50 rounded-lg p-3 text-center">
                <div className="text-rose-700 text-sm font-semibold">Industrial</div>
                <div className="text-xs text-rose-900/80">Processes</div>
              </div>
              <div className="bg-cyan-50 rounded-lg p-3 text-center">
                <div className="text-cyan-700 text-sm font-semibold">Cooling</div>
                <div className="text-xs text-cyan-900/80">Absorption</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 text-center">
                <div className="text-amber-700 text-sm font-semibold">Drying</div>
                <div className="text-xs text-amber-900/80">Agro</div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button 
                onClick={() => openModal('kisaki')} 
                className="bg-primary-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-secondary-green transition-colors"
              >
                Learn more
              </button>
              <span className="text-xs text-gray-500">Feasible & scalable options</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}