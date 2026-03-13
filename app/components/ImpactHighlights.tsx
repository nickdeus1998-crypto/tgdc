"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface HighlightItem {
  id: number;
  title: string;
  catchy: string;
  text: string;
  image: string;
  primaryHref: string;
  secondaryHref: string;
  tag?: string;
}

export default function ImpactHighlights() {
  const [items, setItems] = useState<HighlightItem[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Project Impact Highlights');
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/impact-highlights');
        if (!res.ok) throw new Error('Failed to load highlights');
        const data = await res.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        if (data?.sectionTitle) setSectionTitle(data.sectionTitle);
      } catch (error) {
        console.error('ImpactHighlights fetch error', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    if (!items.length) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items]);

  const go = (next: number) => setIdx((next + items.length) % items.length);

  return (
    <section className="relative py-16">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{sectionTitle}</h2>
        </div>

        <div className="relative h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden shadow-xl">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-500 text-sm">
              Loading highlights...
            </div>
          )}
          {!loading && !items.length && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 text-gray-500 text-sm">
              No highlights available.
            </div>
          )}
          {items.map((it, i) => (
            <div
              key={it.id ?? it.title}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === idx ? 1 : 0, pointerEvents: i === idx ? 'auto' : 'none' }}
            >
              <Image src={it.image || '/geothermal.jpg'} alt={it.title} fill priority className="object-cover" />

              {/* Bottom bar with title (left) and link (right) */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5 md:p-6">
                <span className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-[#326101] to-[#639427] text-white text-sm md:text-base font-semibold shadow-lg backdrop-blur-sm">
                  {it.title}
                </span>
                <a
                  href={it.primaryHref || '#'}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#326101]/80 backdrop-blur-sm hover:bg-[#326101] transition-colors shadow"
                >
                  View Project
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}

          {items.length > 1 && (
            <>
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
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
                {items.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} className="w-2.5 h-2.5 rounded-full transition-colors" style={{ background: i === idx ? '#326101' : '#ffffffaa' }} aria-label={`Go to slide ${i + 1}`} />
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
