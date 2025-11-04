// components/RoadmapSection.tsx
'use client';

import { useModal } from "./ModalContext";



export function RoadmapSection() {
  const { openModal } = useModal();

  return (
    <section className="py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">From Preliminary to Pre‑Feasibility</h3>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="relative pl-10">
                <div className="step relative mb-10">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center font-bold">1</div>
                  <h4 className="font-semibold text-gray-900">Preliminary Studies</h4>
                  <p className="text-gray-600 mt-1">Desktop and field-based screening in Ngozi and Kisaki to map use-cases against temperature and chemistry.</p>
                </div>
                <div className="step relative mb-10">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 grid place-items-center font-bold">2</div>
                  <h4 className="font-semibold text-gray-900">Pre‑Feasibility (Planned)</h4>
                  <p className="text-gray-600 mt-1">Define technical parameters, market viability, and optimal configurations for each application.</p>
                </div>
                <div className="step relative mb-10">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-sky-100 text-sky-700 grid place-items-center font-bold">3</div>
                  <h4 className="font-semibold text-gray-900">Environmental & Social Assessment</h4>
                  <p className="text-gray-600 mt-1">Assess impacts and mitigation plans aligned with national standards and best practices.</p>
                </div>
                <div className="relative">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center font-bold">4</div>
                  <h4 className="font-semibold text-gray-900">Stakeholder Engagement</h4>
                  <p className="text-gray-600 mt-1">Involve government, research institutions, entrepreneurs, and private sector to co‑develop opportunities.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-5 rounded-xl">
                <div className="text-emerald-700 text-sm font-semibold">Applications</div>
                <div className="text-3xl font-extrabold text-emerald-900 mt-1">6+</div>
                <p className="text-emerald-900/80 text-sm mt-1">Greenhouses, drying, fish, cooling, processes, heating</p>
              </div>
              <div className="bg-amber-50 p-5 rounded-xl">
                <div className="text-amber-700 text-sm font-semibold">Areas</div>
                <div className="text-3xl font-extrabold text-amber-900 mt-1">2</div>
                <p className="text-amber-900/80 text-sm mt-1">Ngozi & Kisaki (pilot)</p>
              </div>
              <div className="bg-sky-50 p-5 rounded-xl">
                <div className="text-sky-700 text-sm font-semibold">Pathway</div>
                <div className="text-3xl font-extrabold text-sky-900 mt-1">Pre‑FS</div>
                <p className="text-sky-900/80 text-sm mt-1">Technical & market validation</p>
              </div>
              <div className="bg-purple-50 p-5 rounded-xl">
                <div className="text-purple-700 text-sm font-semibold">Collaboration</div>
                <div className="text-3xl font-extrabold text-purple-900 mt-1">Multi‑Party</div>
                <p className="text-purple-900/80 text-sm mt-1">Govt, Academia, Private sector</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              onClick={() => openModal('engage')} 
              className="bg-primary-green text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-secondary-green transition-colors"
            >
              Engage Stakeholders
            </button>
            <button 
              onClick={() => openModal('method')} 
              className="border border-primary-green text-primary-green px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-green hover:text-white transition-colors"
            >
              Methodology Details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}