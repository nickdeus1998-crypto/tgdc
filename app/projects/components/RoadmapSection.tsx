// components/RoadmapSection.tsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

interface Milestone {
  phase: string;
  title: string;
  description: string;
  status: string;
}

export function RoadmapSection({ milestones: dbMilestones }: { milestones?: Milestone[] }) {
  const [btnLabel, setBtnLabel] = useState('Methodology Details');
  const [btnLink, setBtnLink] = useState('/information-center');
  const [btnVisible, setBtnVisible] = useState(true);

  useEffect(() => {
    fetch('/api/methodology-button')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.label) setBtnLabel(data.label);
        if (data?.link) setBtnLink(data.link);
        if (data?.visible === false) setBtnVisible(false);
      })
      .catch(() => { });
  }, []);

  const defaultMilestones: Milestone[] = [
    {
      phase: '1',
      title: 'Preliminary Studies',
      description: 'Desktop and field-based screening to identify direct-use prospects in potential geothermal areas.',
      status: 'Completed'
    },
    {
      phase: '2',
      title: 'Market & Resource Assessment',
      description: 'Detailed analysis of local economic activities and matching them with technical resource parameters.',
      status: 'In Progress'
    },
    {
      phase: '3',
      title: 'Pilot Demonstrations',
      description: 'Establishing small-scale direct-use installations for greenhouse heating and grain drying.',
      status: 'Planned'
    },
    {
      phase: '4',
      title: 'Commercial Expansion',
      description: 'Scaling up successful pilots into industrial-scale clusters with private sector participation.',
      status: 'Future'
    }
  ];

  const milestones = dbMilestones && dbMilestones.length > 0 ? dbMilestones : defaultMilestones;

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Project Roadmap</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our strategic journey towards commercializing direct-use geothermal heat applications across Tanzania.
          </p>
        </div>

        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[#326101] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <span className="text-xs font-bold">{m.phase}</span>
              </div>
              {/* Content */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{m.title}</h4>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    m.status.toLowerCase().includes('complete') ? 'bg-green-100 text-green-700' :
                    m.status.toLowerCase().includes('progress') ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {m.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {btnVisible && (
          <div className="mt-20 text-center">
            <Link
              href={btnLink}
              className="inline-block border-2 border-[#326101] text-[#326101] px-10 py-3.5 rounded-xl text-sm font-bold hover:bg-[#326101] hover:text-white transition-all active:scale-95 shadow-sm"
            >
              {btnLabel}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}