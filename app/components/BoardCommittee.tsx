"use client";

import { useEffect, useState } from 'react';

interface Member {
  id: number;
  name: string;
  role: string;
  imageUrl?: string | null;
}

interface LevelGroup {
  order: number;
  label: string;
  members: Member[];
}

const MemberCard = ({ member, isTop = false }: { member: Member; isTop?: boolean }) => (
  <div className="flex flex-col items-center">
    <div className={`bg-white rounded-2xl border-2 ${isTop ? 'border-[#326101]' : 'border-gray-200'} overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isTop ? 'w-56' : 'w-48'}`}>
      {/* Photo — aspect ratio matches recommended 300x350 upload */}
      <div className="aspect-[6/7] overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.imageUrl || '/geothermal.jpg'}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Info */}
      <div className={`${isTop ? 'py-4 px-3' : 'py-3 px-3'} text-center`}>
        <p className={`font-bold text-gray-900 leading-tight ${isTop ? 'text-base' : 'text-sm'}`}>{member.name}</p>
        <p className={`font-semibold text-[#326101] mt-1 leading-tight ${isTop ? 'text-xs' : 'text-[11px]'}`}>{member.role}</p>
      </div>
    </div>
  </div>
);

export default function BoardCommitteeSection() {
  const [levels, setLevels] = useState<LevelGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/board-committee');
        if (!res.ok) throw new Error('Failed to load board committee');
        const data = await res.json();
        setLevels(Array.isArray(data?.levels) ? data.levels : []);
      } catch (error) {
        console.error('BoardCommittee fetch error', error);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <section id="board-committee" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <div className="animate-pulse flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full border-4 border-t-[#326101] animate-spin"></div>
            <p>Loading board committee...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!levels.length) {
    return (
      <section id="board-committee" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Board committee information will be published soon.
        </div>
      </section>
    );
  }

  const topLevel = levels[0];
  const otherLevels = levels.slice(1);

  return (
    <section id="board-committee" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Board Committee</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A comprehensive view of TGDC&apos;s board committee members and governance structure.
          </p>
        </div>

        {/* Org Chart */}
        <div className="flex flex-col items-center">

          {/* Top Level — centered member(s) */}
          <div className="flex justify-center gap-8 flex-wrap">
            {topLevel.members.map((member) => (
              <MemberCard key={member.id} member={member} isTop />
            ))}
          </div>

          {/* Connector: vertical line from top level down */}
          <div className="w-0.5 h-10 bg-[#326101]" />

          {/* Remaining levels */}
          {otherLevels.map((level, levelIdx) => {
            const count = level.members.length;
            return (
              <div key={level.order} className="w-full flex flex-col items-center">

                {/* Horizontal bar spanning the cards */}
                <div className="relative w-full max-w-5xl">
                  <div className="h-0.5 bg-[#326101] mx-auto" style={{ width: count > 1 ? `${Math.min(90, count * 22)}%` : '0%' }} />
                </div>

                {/* Vertical drops to each card + the cards */}
                <div className={`grid gap-x-6 gap-y-0 w-full max-w-5xl ${count === 1 ? 'grid-cols-1 max-w-xs' : count === 2 ? 'grid-cols-2 max-w-lg' : count === 3 ? 'grid-cols-3 max-w-3xl' : 'grid-cols-2 md:grid-cols-4'}`}>
                  {level.members.map((member) => (
                    <div key={member.id} className="flex flex-col items-center">
                      {/* Vertical drop */}
                      <div className="w-0.5 h-6 bg-[#326101]" />
                      <MemberCard member={member} />
                    </div>
                  ))}
                </div>

                {/* Connector to next level if not last */}
                {levelIdx < otherLevels.length - 1 && (
                  <div className="w-0.5 h-10 bg-[#326101]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
