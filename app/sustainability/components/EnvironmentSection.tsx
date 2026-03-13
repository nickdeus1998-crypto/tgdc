// app/sustainability/components/EnvironmentSection.tsx
'use client';

import { useSustainability } from './SustainabilityContext';

export function EnvironmentSection() {
  const { activeTab } = useSustainability();

  if (activeTab !== 'environment') return null;

  return (
    <section className="pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="card bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Environmental</h2>
              <p className="text-sm text-gray-500 mt-1">Geothermal Sector Strategic Environment and Social Assessment</p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">Overview</span>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            TGDC gratefully acknowledges the support of the support received from TANESCO. Timely availability of right amount of funds is critical for project implementation.
            TGDC has continue pursuing grants/soft loans from development partners such as GRMF, SREP, ICEIDA, AfDB and many more to assist in development of the geothermal energy in the country.
          </p>
        </div>
        <div className="card bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Project Environmental and Social Impact Assessment</h3>
              <p className="text-sm text-gray-500 mt-1">Status across active projects</p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            <details className="py-4" open>
              <summary className="flex items-start justify-between cursor-pointer select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Ngozi</h4>
                    <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">EIA issued</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Rungwe & Mbeya Rural Districts • 3 exploration well locations</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 text-gray-700">
                The project preparation studies began in 2015. The environmental and social impact assessment completed and an EIA certificate has been issued.
              </div>
            </details>
            <details className="py-4">
              <summary className="flex items-start justify-between cursor-pointer select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Kiejo-Mbaka</h4>
                    <span className="badge bg-amber-50 text-amber-700 border border-amber-100">Final stage</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Busokelo District, Mbeya • 4 exploration well locations</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 text-gray-700">
                The environmental and social impact assessment is at the final stage. Site verification with NEMC experts has already been conducted.
              </div>
            </details>
            <details className="py-4">
              <summary className="flex items-start justify-between cursor-pointer select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Songwe</h4>
                    <span className="badge bg-blue-50 text-blue-700 border border-blue-100">Initiated</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Songwe Region • Exploration wells + direct use components</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 text-gray-700">
                Studies began in 2018. The environmental and social impact assessment has been initiated. Completion will guide NEMC to issue an EIA certificate.
              </div>
            </details>
            <details className="py-4">
              <summary className="flex items-start justify-between cursor-pointer select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Natron</h4>
                    <span className="badge bg-purple-50 text-purple-700 border border-purple-100">Preliminary EA</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Longido & Loliondo, Arusha • Detailed surface studies proposed</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 text-gray-700">
                A detailed preliminary environmental assessment has been conducted to assess likely impacts during implementation.
              </div>
            </details>
            <details className="py-4">
              <summary className="flex items-start justify-between cursor-pointer select-none">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Mutagata</h4>
                    <span className="badge bg-gray-50 text-gray-700 border border-gray-200">Screening planned</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Kyerwa, Kagera • Detailed surface studies proposed</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-3 text-gray-700">
                Reconnaissance survey for environmental and social studies has been conducted. A detailed project brief will be submitted to NEMC for screening.
              </div>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}