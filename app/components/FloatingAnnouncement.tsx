"use client";

import { useState, useEffect, useCallback } from 'react';
import { sanitizeHtml } from '@/app/lib/sanitize';

interface Announcement {
    id: number;
    title: string;
    content: string;
    date: string;
    coverImage?: string;
    category: string;
}

export default function FloatingAnnouncement() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const res = await fetch('/api/news');
                if (!res.ok) return;
                const data = await res.json();

                const filtered = data
                    .filter((item: any) =>
                        item.category?.toLowerCase() === 'announcement' ||
                        item.category?.toLowerCase() === 'alert'
                    )
                    .map((item: any) => ({
                        ...item,
                        date: new Date(item.date).toLocaleDateString()
                    }));

                if (filtered.length > 0) {
                    setAnnouncements(filtered);
                    // Auto open after a short delay
                    setTimeout(() => setIsPanelOpen(true), 2500);
                }
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            }
        };

        fetchAnnouncements();
    }, []);

    const nextAnnouncement = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, [announcements.length]);

    const prevAnnouncement = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
    }, [announcements.length]);

    useEffect(() => {
        if (!isAutoPlaying || announcements.length <= 1 || !isPanelOpen) return;

        const timer = setInterval(() => {
            nextAnnouncement();
        }, 6000);

        return () => clearInterval(timer);
    }, [isAutoPlaying, announcements.length, isPanelOpen, nextAnnouncement]);

    if (announcements.length === 0) return null;

    const current = announcements[currentIndex];

    return (
        <>
            {/* Side Toggle Button (Sticky to right middle) */}
            {!isPanelOpen && (
                <button
                    onClick={() => setIsPanelOpen(true)}
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-[10000] bg-[#326101] text-white p-3 rounded-l-2xl shadow-2xl hover:bg-[#254801] transition-all duration-300 transform hover:-translate-x-1 flex flex-col items-center gap-1 group"
                    title="Show Announcements"
                >
                    <div className="relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute -top-2 -left-2 min-w-[18px] h-[18px] bg-orange-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border border-white shadow-sm px-1">
                            {announcements.length}
                        </span>
                    </div>
                    <span className="[writing-mode:vertical-lr] rotate-180 text-[10px] font-bold uppercase tracking-widest py-1">Announcements</span>
                </button>
            )}

            {/* Main Announcement Panel */}
            <div
                className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ease-out sm:w-96 w-[calc(100vw-3rem)] ${isPanelOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
                    }`}
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
            >
                <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden">
                    <div className="relative">
                        {/* Header/Image Section */}
                        <div className="relative h-44 w-full bg-[#1a3300]">
                            {current.coverImage ? (
                                <img
                                    key={current.id}
                                    src={current.coverImage}
                                    alt={current.title}
                                    className="w-full h-full object-cover opacity-80 animate-fade-in"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#326101] to-[#639427] flex items-center justify-center text-white/10">
                                    <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                            {/* Manual Nav Arrows - always visible on hover or mobile */}
                            {announcements.length > 1 && (
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3">
                                    <button onClick={prevAnnouncement} className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button onClick={nextAnnouncement} className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/30 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                </div>
                            )}

                            {/* Top Panel Buttons */}
                            <div className="absolute top-3 right-3 flex gap-2 z-20">
                                <button
                                    onClick={() => setIsPanelOpen(false)}
                                    className="bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-all group/close"
                                    title="Minimize"
                                >
                                    <svg className="w-4 h-4 group-hover/close:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Title Overlay */}
                            <div className="absolute bottom-4 left-5 right-5">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="bg-orange-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded shadow-sm">
                                        {current.category || 'Alert'}
                                    </span>
                                    <span className="text-[10px] text-white/70 font-medium">{current.date}</span>
                                </div>
                                <h3 className="text-base font-bold text-white leading-tight line-clamp-2 animate-slide-up">
                                    {current.title}
                                </h3>
                            </div>
                        </div>

                        {/* Content Section with Max Height & Scroll */}
                        <div className={`p-5 bg-white transition-all duration-300 ${isExpanded ? 'bg-gray-50' : ''}`}>
                            <div className={`text-xs text-gray-600 leading-relaxed custom-scrollbar prose prose-sm max-w-none ${isExpanded ? 'max-h-60 overflow-y-auto pr-2' : 'line-clamp-3'
                                }`} dangerouslySetInnerHTML={{ __html: sanitizeHtml(current.content) }} />

                            <div className="flex gap-2 mt-5">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex-1 bg-[#326101] hover:bg-[#254801] text-white text-[11px] font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-green-900/10"
                                >
                                    {isExpanded ? 'Show Less' : 'View Full Details'}
                                </button>
                                {announcements.length > 1 && (
                                    <button
                                        onClick={nextAnnouncement}
                                        className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-xl transition-colors flex items-center justify-center font-bold"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>

                            {/* Pagination Dots */}
                            {announcements.length > 1 && (
                                <div className="flex justify-center gap-1.5 mt-5">
                                    {announcements.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentIndex(i)}
                                            className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-[#326101]' : 'w-2 bg-gray-200'}`}
                                            aria-label={`Go to item ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #326101;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #254801;
        }
      `}</style>
        </>
    );
}
