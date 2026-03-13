// app/sustainability/components/TabsSection.tsx
'use client';

import { useSustainability } from './SustainabilityContext';

export function TabsSection() {
  const { activeTab, setActiveTab } = useSustainability();

  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <div className="flex gap-2">
            <button
              className={`tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${activeTab === 'environment' ? 'active' : ''}`}
              onClick={() => setActiveTab('environment')}
            >
              Environment
            </button>
            <button
              className={`tab-btn px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-green-50 ${activeTab === 'stakeholders' ? 'active' : ''}`}
              onClick={() => setActiveTab('stakeholders')}
            >
              Stakeholders
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}