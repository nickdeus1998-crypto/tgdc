"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export default function ImpactHighlights() {
  const items = [
    {
      title: 'Ngozi Geothermal',
      catchy: 'Unleashing Ngozi’s Geothermal Promise',
      text: 'High‑potential field in the Rungwe Volcanic Province, poised to power communities and industry.',
      image: '/geothermal.jpg',
      primaryHref: '/projects/ngozi',
      secondaryHref: '/geothermal-sites',
      tag: 'Project Spotlight',
    },
    {
      title: 'TGDC Operations',
      catchy: 'Operations Driving National Impact',
      text: 'Spearheading exploration and development to accelerate Tanzania’s clean energy transition.',
      image: '/tgdc2.png',
      primaryHref: '/about-us',
      secondaryHref: '/services',
      tag: 'Inside TGDC',
    },
    {
      title: 'Leadership In Action',
      catchy: 'Partnerships That Move Energy Forward',
      text: 'Strategic leadership and alliances that unlock investment and deployment at scale.',
      image: '/generalmanager.jpg',
      primaryHref: '/about-us',
      secondaryHref: '/contact',
      tag: 'Partnerships',
    },
  ] as const;

  const [idx, setIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const go = (next: number) => setIdx((next + items.length) % items.length);

  return (
    <section className="relative py-16">
      <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_20%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_400px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%)] pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-flex items-center px-4 py-1.5 bg-green-50 rounded-full text-[#326101] text-sm font-medium">Highlights</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-gray-900">Project Impact Highlights</h2>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">A rotating view of our current projects and milestones.</p>
        </div>

        <div className="relative h-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-xl">
          {items.map((it, i) => (
            <div key={it.title} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? 'auto' : 'none' }}>
              <Image src={it.image} alt={it.title} fill priority className="object-cover" />
              {/* Stronger theme overlays for readability */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1f3f00]/80 via-[#326101]/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />

              {/* Top content: tag, catchy title, CTAs */}
              <div className="absolute top-5 left-5 right-5 md:top-8 md:left-8 md:right-auto md:max-w-xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/30 backdrop-blur-sm text-white text-xs font-medium">
                  {it.tag}
                </div>
                <h3 className="mt-3 md:mt-4 text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-emerald-300">
                    {it.catchy}
                  </span>
                </h3>
                <p className="mt-2 text-sm md:text-base text-white/90 max-w-2xl">
                  {it.text}
                </p>
              </div>

              {/* Bottom caption (subtle) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                <div className="text-sm md:text-base opacity-90 max-w-2xl">
                  <span className="font-semibold">{it.title}</span>
                </div>
              </div>
            </div>
          ))}
          {/* Controls */}
          <button onClick={() => go(idx - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow" aria-label="Previous">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={() => go(idx + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/85 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow" aria-label="Next">
            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
            {items.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className="w-2.5 h-2.5 rounded-full transition-colors" style={{ background: i === idx ? '#326101' : '#ffffffaa' }} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center">
          <a href="/resources" className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-6 py-3 rounded-lg font-semibold shadow hover:shadow-lg transition-all">Explore Resources</a>
        </div>
      </div>
    </section>
  );
}
