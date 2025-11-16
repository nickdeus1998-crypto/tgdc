"use client";

import { useEffect, useState } from 'react';

interface Leader {
  id: number;
  name: string;
  role: string;
  imageUrl?: string | null;
}

interface LevelGroup {
  order: number;
  label: string;
  members: Leader[];
}

const LeaderCard = ({ leader }: { leader: Leader }) => (
  <div className="col-span-1 text-center p-4">
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-full flex flex-col items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={leader.imageUrl || '/geothermal.jpg'} alt={leader.name} className="w-full h-48 object-cover rounded-xl mb-3" />
      <p className="text-sm font-semibold text-gray-900 leading-tight">{leader.name}</p>
      <p className="text-xs text-gray-600 mt-1 uppercase">{leader.role}</p>
    </div>
  </div>
);

export default function OrgStructure() {
  const [levels, setLevels] = useState<LevelGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        const res = await fetch('/api/org-structure');
        if (!res.ok) throw new Error('Failed to load org structure');
        const data = await res.json();
        setLevels(Array.isArray(data?.levels) ? data.levels : []);
      } catch (error) {
        console.error('OrgStructure fetch error', error);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStructure();
  }, []);

  if (loading) {
    return (
      <section id="org-structure" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          Loading organization chart...
        </div>
      </section>
    );
  }

  if (!levels.length) {
    return (
      <section id="org-structure" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          Organization structure will be published soon.
        </div>
      </section>
    );
  }

  const topLevel = levels[0];
  const otherLevels = levels.slice(1);

  return (
    <section id="org-structure" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow border border-gray-100 p-6 sm:p-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
              <span className="text-[#326101] text-sm font-medium">Organizational Structure</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Leadership Snapshot</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A simple view of TGDC leadership with each management tier in a single row.
            </p>
          </div>

          <div className="flex flex-col items-center mb-12">
            {topLevel.members.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
            <p className="text-sm text-gray-500 mt-2">{topLevel.label}</p>
          </div>

          {otherLevels.map((level) => (
            <div key={level.order} className="border-t border-gray-100 py-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">{level.label}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {level.members.map((leader) => (
                  <LeaderCard key={leader.id} leader={leader} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
