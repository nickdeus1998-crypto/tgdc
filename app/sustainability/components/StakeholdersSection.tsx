// app/sustainability/components/StakeholdersSection.tsx
'use client';

import { useSustainability } from './SustainabilityContext';

interface Stakeholder {
  icon: string;
  name: string;
  url: string;
}

const fundSupport: Stakeholder[] = [
  { icon: 'G', name: 'Government of Tanzania', url: 'https://www.tanzania.go.tz/' },
  { icon: 'T', name: 'TANESCO', url: 'https://www.tanesco.co.tz/' },
  { icon: 'J', name: 'JICA', url: 'https://www.jica.go.jp/english/index.html/' },
  { icon: 'C', name: 'CTCN', url: 'https://www.ctc-n.org/' },
  { icon: 'U', name: 'UNEP', url: 'https://www.unep.org/' },
  { icon: 'A', name: 'ARGEO', url: 'https://theargeo.org/' },
  { icon: 'M', name: 'MFA-Iceland', url: 'https://www.government.is/ministries/ministry-for-foreign-affairs/' },
  { icon: 'Af', name: 'AfDB', url: 'https://www.afdb.org/en/' },
  { icon: 'G', name: 'GRMF', url: 'https://grmf-eastafrica.org/' },
];

const technicalSupport: Stakeholder[] = [
  { icon: 'MoE', name: 'Ministry of Energy', url: 'https://www.nishati.go.tz/' },
  { icon: 'VPO', name: 'VPO', url: 'https://www.vpo.go.tz/' },
  { icon: 'T', name: 'TANESCO', url: 'https://www.tanesco.co.tz/' },
  { icon: 'N', name: 'NEMC', url: 'https://www.nemc.or.tz/' },
  { icon: 'GST', name: 'GST', url: 'https://www.gst.go.tz/' },
  { icon: 'UD', name: 'UDOM', url: 'https://www.udom.ac.tz/' },
  { icon: 'MU', name: 'MUST', url: 'https://www.must.ac.tz/' },
  { icon: 'DIT', name: 'DIT', url: 'https://www.dit.ac.tz/' },
  { icon: 'ST', name: 'STAMICO', url: 'https://www.stamico.co.tz/' },
];

const capacityBuilding: Stakeholder[] = [
  { icon: 'J', name: 'JICA', url: 'https://www.jica.go.jp/english/index.html/' },
];

export function StakeholdersSection() {
  const { activeTab, showToast } = useSustainability();

  if (activeTab !== 'stakeholders') return null;

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast();
    } catch {
      showToast('Copy failed. Please copy manually.');
    }
  };

  const renderList = (items: Stakeholder[], cols: number = 2) => (
    <ul className={`mt-4 grid md:grid-cols-${cols} gap-3`}>
      {items.map((item, index) => (
        <li key={index} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 p-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-emerald-100 text-emerald-700 grid place-items-center font-bold">{item.icon}</div>
            <div>
              <div className="font-medium text-gray-900">{item.name}</div>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#326101] hover:underline">
                {new URL(item.url).hostname}
              </a>
            </div>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
            onClick={() => handleCopy(item.url)}
          >
            Copy
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <section className="pb-16">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        <div className="card bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Stakeholders</h2>
              <p className="text-sm text-gray-500 mt-1">Fund support</p>
            </div>
            <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-100">Funding</span>
          </div>
          {renderList(fundSupport)}
        </div>
        <div className="card bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Technical support</p>
            </div>
            <span className="badge bg-blue-50 text-blue-700 border border-blue-100">Technical</span>
          </div>
          {renderList(technicalSupport)}
        </div>
        <div className="card bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Capacity building</p>
            </div>
            <span className="badge bg-amber-50 text-amber-700 border border-amber-100">Capacity</span>
          </div>
          {renderList(capacityBuilding, 1)}
        </div>
      </div>
    </section>
  );
}