
"use client";

import { useEffect } from 'react';

interface Announcement {
  id: number;
  title: string;
  description: string;
  badge: string;
  badgeType: string;
  date: string;
  icon: string;
  iconColor: string;
  stats: { value: string; label: string; color: string }[];
  highlightedText: string;
  type: string;
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  currentAnnouncement: number;
  isVisible: boolean;
  isAutoPlaying: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onGoTo: (index: number) => void;
  onClose: () => void;
  onToggleAutoPlay: () => void;
  onLearnMore: (type: string) => void;
  onContactUs: (type: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements,
  currentAnnouncement,
  isVisible,
  isAutoPlaying,
  onNext,
  onPrevious,
  onGoTo,
  onClose,
  onToggleAutoPlay,
  onLearnMore,
  onContactUs,
  onMouseEnter,
  onMouseLeave,
}) => {
  if (announcements.length === 0) return null;

  const announcement = announcements[currentAnnouncement];

  return (
    <div
      className={`fixed top-20 right-4 xs:right-2 z-50 max-w-[85vw] xs:max-w-sm transition-opacity ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl">
        <div className="relative p-5">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-gray-900 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow"
            aria-label="Close announcement banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={onPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center"
            aria-label="Previous announcement"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 rounded-full w-7 h-7 flex items-center justify-center"
            aria-label="Next announcement"
          >
            <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="relative">
            <header className="mb-2">
              <h3 className="text-base font-semibold text-gray-900 pr-8">{announcement.title}</h3>
              <time className="text-xs text-gray-500">{announcement.date}</time>
            </header>
            <p className="text-sm text-gray-700 mb-3 line-clamp-4">{announcement.description}</p>
            <div className="flex items-center justify-between">
              <button onClick={() => onLearnMore(announcement.type)} className="text-sm font-semibold text-[#326101] hover:underline">Learn more</button>
              <button onClick={() => onContactUs(announcement.type)} className="text-sm text-gray-600 hover:underline">Contact</button>
            </div>
            <div className="flex items-center justify-center mt-4 space-x-2">
              {announcements.map((_, index) => (
                <button
                  key={index}
                  onClick={() => onGoTo(index)}
                  className={`w-2.5 h-2.5 rounded-full ${index === currentAnnouncement ? 'bg-gray-900' : 'bg-gray-300'}`}
                  aria-label={`Go to announcement ${index + 1}`}
                ></button>
              ))}
            </div>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <span className={`${isAutoPlaying ? 'inline-block' : 'hidden'} animate-pulse mr-2`}>•</span>
              <span>Auto-rotating</span>
              <button onClick={onToggleAutoPlay} className="ml-2 text-gray-700 hover:underline" aria-label={isAutoPlaying ? 'Pause auto-rotation' : 'Resume auto-rotation'}>
                {isAutoPlaying ? 'Pause' : 'Play'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
