
"use client";

import { useState, useEffect, useRef } from 'react';
import AnnouncementBanner from './AnnouncementBanner';
import SideTab from './SideTab';
import AnnouncementsFeed from './AnnouncementsFeed';
import { sanitizeHtml } from '@/app/lib/sanitize';

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

const announcements: Announcement[] = [
  {
    id: 0,
    title: 'Revolutionary Geothermal Technology Unveiled!',
    description: 'Our breakthrough Enhanced Geothermal System (EGS) technology is revolutionizing renewable energy. Available now for new projects!',
    badge: '🚀 BREAKTHROUGH',
    badgeType: 'from-yellow-400 to-orange-400',
    date: 'Dec 2024',
    icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    iconColor: 'text-yellow-300',
    stats: [
      { value: '+60%', label: 'Energy Output', color: 'text-yellow-300' },
      { value: '-40%', label: 'Costs', color: 'text-green-300' },
      { value: '100%', label: 'Clean', color: 'text-blue-300' },
    ],
    highlightedText: 'Available now for new projects!',
    type: 'geothermal',
  },
  {
    id: 1,
    title: 'Global Energy Alliance Formed',
    description: 'Strategic partnership with 15 leading energy companies to accelerate global geothermal deployment. Largest renewable energy alliance ever formed!',
    badge: '🤝 PARTNERSHIP',
    badgeType: 'from-blue-400 to-purple-400',
    date: 'Dec 2024',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
    iconColor: 'text-blue-300',
    stats: [
      { value: '15', label: 'Countries', color: 'text-blue-300' },
      { value: '$2B', label: 'Investment', color: 'text-purple-300' },
      { value: '500MW', label: 'Capacity', color: 'text-green-300' },
    ],
    highlightedText: 'Largest renewable energy alliance ever formed!',
    type: 'partnership',
  },
  {
    id: 2,
    title: "'Innovation of the Year' Award Winner",
    description: 'Recognized by the International Renewable Energy Council for our groundbreaking EGS technology. Leading the future of clean energy!',
    badge: '🏆 AWARD WINNER',
    badgeType: 'from-yellow-400 to-red-400',
    date: 'Nov 2024',
    icon: '<path d="M5 16L3 21l5.25-1.25L12 19l3.75 1.25L21 21l-2-5 2-5-5.25 1.25L12 13l-3.75-1.25L3 11l2 5z"/>',
    iconColor: 'text-yellow-300',
    stats: [
      { value: '#1', label: 'Innovation', color: 'text-yellow-300' },
      { value: 'Global', label: 'Recognition', color: 'text-orange-300' },
      { value: '2024', label: 'Winner', color: 'text-red-300' },
    ],
    highlightedText: 'Leading the future of clean energy!',
    type: 'award',
  },
];

const AnnouncementSection: React.FC = () => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<number>(0);
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [modalContent, setModalContent] = useState<null | { type: string; title: string; description: string; icon: string; color: string }>(null);
  const [contactModal, setContactModal] = useState<null | { type: string }>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsBannerVisible(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isBannerVisible && isAutoPlaying) startAutoPlay();
    return () => stopAutoPlay();
  }, [isBannerVisible, isAutoPlaying]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoPlay();
        if (autoHideRef.current) clearTimeout(autoHideRef.current);
      } else if (isBannerVisible) {
        if (isAutoPlaying) startAutoPlay();
        autoHideRef.current = setTimeout(() => setIsBannerVisible(false), 15000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isBannerVisible, isAutoPlaying]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 8000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying((prev) => !prev);
  };

  const showAnnouncement = () => {
    setIsBannerVisible(true);
    startAutoPlay();
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    autoHideRef.current = setTimeout(() => setIsBannerVisible(false), 30000);
  };

  const hideAnnouncement = () => {
    setIsBannerVisible(false);
    stopAutoPlay();
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
  };

  const nextAnnouncement = () => {
    setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
  };

  const previousAnnouncement = () => {
    setCurrentAnnouncement((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const goToAnnouncement = (index: number) => {
    if (index !== currentAnnouncement) {
      setCurrentAnnouncement(index);
    }
  };

  const learnMore = (type: string) => {
    const content = {
      geothermal: {
        title: 'Revolutionary EGS Technology',
        description: 'Our Enhanced Geothermal System breakthrough increases energy output by 60% while reducing costs by 40%. This game-changing technology is now available for new projects worldwide.',
        icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
        color: 'from-primary-green to-secondary-green',
      },
      partnership: {
        title: 'Global Energy Alliance',
        description: 'Our strategic partnership with 15 leading energy companies represents the largest renewable energy alliance ever formed, with $2B in committed investment across 15 countries.',
        icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
        color: 'from-blue-500 to-purple-600',
      },
      award: {
        title: 'Innovation Award Winner',
        description: 'Recognized by the International Renewable Energy Council as the #1 innovation of 2024. Our EGS technology is setting new standards for the entire geothermal industry.',
        icon: '<path d="M5 16L3 21l5.25-1.25L12 19l3.75 1.25L21 21l-2-5 2-5-5.25 1.25L12 13l-3.75-1.25L3 11l2 5z"/>',
        color: 'from-yellow-500 to-red-500',
      },
    };
    setModalContent({ ...content[type as keyof typeof content], type });
    if (isAutoPlaying) toggleAutoPlay();
  };

  const contactUs = (type: string) => {
    setContactModal({ type });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isBannerVisible) return;
    switch (event.key) {
      case 'Escape':
        hideAnnouncement();
        break;
      case 'ArrowLeft':
        previousAnnouncement();
        break;
      case 'ArrowRight':
        nextAnnouncement();
        break;
      case ' ':
        event.preventDefault();
        toggleAutoPlay();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isBannerVisible, currentAnnouncement, isAutoPlaying]);

  return (
    <div className={`relative ${isBannerVisible ? 'py-6 sm:py-10 md:py-16 lg:py-20' : 'h-0 overflow-hidden'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnnouncementBanner
          announcements={announcements}
          currentAnnouncement={currentAnnouncement}
          isVisible={isBannerVisible}
          isAutoPlaying={isAutoPlaying}
          onNext={nextAnnouncement}
          onPrevious={previousAnnouncement}
          onGoTo={goToAnnouncement}
          onClose={hideAnnouncement}
          onToggleAutoPlay={toggleAutoPlay}
          onLearnMore={learnMore}
          onContactUs={contactUs}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={() => isAutoPlaying && startAutoPlay()}
        />
        <SideTab isVisible={!isBannerVisible} onClick={showAnnouncement} />
        <AnnouncementsFeed
          items={announcements.map(a => ({ id: a.id, title: a.title, description: a.description, date: a.date }))}
        />
        {modalContent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setModalContent(null)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-[90%] sm:max-w-md mx-auto shadow-2xl transform scale-95 hover:scale-100 transition-transform duration-300">
              <div className="text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${modalContent.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: sanitizeHtml(modalContent.icon) }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">{modalContent.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">{modalContent.description}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setModalContent(null)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setModalContent(null);
                      contactUs(modalContent.type);
                    }}
                    className={`flex-1 bg-gradient-to-r ${modalContent.color} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:shadow-lg transition-all`}
                  >
                    Get Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {contactModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6" onClick={() => setContactModal(null)}>
            <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-[90%] sm:max-w-md mx-auto shadow-2xl transform scale-95 hover:scale-100 transition-transform duration-300">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Get In Touch</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Interested in learning more about our{' '}
                  {contactModal.type === 'geothermal'
                    ? 'breakthrough technology'
                    : contactModal.type === 'partnership'
                    ? 'global alliance'
                    : 'award-winning innovation'}
                  ? Our experts are ready to discuss your project needs.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-center text-gray-700 text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    (555) 123-GEOTHERMAL
                  </div>
                  <div className="flex items-center justify-center text-gray-700 text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@geothermal-tech.com
                  </div>
                </div>
                <button
                  onClick={() => setContactModal(null)}
                  className="w-full bg-gradient-to-r from-primary-green to-secondary-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementSection;
