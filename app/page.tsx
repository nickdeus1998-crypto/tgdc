'use client';

import { useEffect, useState } from 'react';
import { useI18n } from './components/I18nProvider';
import axios from 'axios';
import AnnouncementSection from './components/AnnouncementSection';
import ImpactHighlights from './components/ImpactHighlights';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import ServicesSection from './components/ServiceSection';
import StatSection from './components/StatSection';
import SideTab from './components/SideTab';
import LearnMoreModal from './components/LearnMoreModal';
import ContactModal from './components/ContactModal';
import AnnouncementBanner from './components/AnnouncementBanner';
import GeothermalSitesSection from './components/GeothermalSiteSection';
import PortfolioPage from './components/PortfolioPage';
import ProjectSection from './components/ProjectSection';
import InformationCenterSection from './components/InformationCenterSection';
import FAQSection from './components/FAQSection';
import FloatingAnnouncement from './components/FloatingAnnouncement';


interface HeroData {
  title: string;
  subheading: string;
  highlight?: string;
  imageUrl?: string;
  images?: string[];
  buttons?: { label: string; href: string; visible: boolean }[];
}
interface ServicesData {
  headerOne: string;
  headerTwo: string;
  subheader?: string;
  mandate?: string;
  mandateTitle?: string;
  mandateVisibleOnHomepage?: boolean;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  services: Array<{
    id: number;
    icon: string;
    title: string;
    content: string;
    features: string[];
  }>;
}

export default function Home() {
  const { t } = useI18n();
  const [currentAnnouncement, setCurrentAnnouncement] = useState<number>(0);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [modalType, setModalType] = useState<string | null>(null);
  const [contactModalType, setContactModalType] = useState<string | null>(null);
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [servicesData, setServicesData] = useState<ServicesData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hero and services data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroResponse, servicesResponse] = await Promise.all([
          axios.get('/api/hero'),
          axios.get('/api/services'),
        ]);
        setHeroData(heroResponse.data);
        setServicesData(servicesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle announcement banner visibility
  useEffect(() => {
    const timer = setTimeout(() => setShowBanner(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Map heroData to HeroSection props (unchanged)
  const badge = '🌍 Sustainable Energy';
  const titleWords = heroData?.title?.split(' ') || [];
  const highlight = heroData?.highlight || (titleWords.length > 1 ? titleWords[titleWords.length - 1] : 'Energy');
  const title = heroData && titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : heroData?.title || 'Discover Geothermal';
  const description = heroData?.subheading || 'Leading sustainable energy solutions.';
  const imageSrc = heroData?.imageUrl || '/geothermal.jpeg';
  const heroImages = Array.isArray(heroData?.images) ? heroData.images : undefined;
  const heroButtons = Array.isArray(heroData?.buttons) ? heroData.buttons : undefined;

  // Fallback for services if fetch fails
  const defaultServicesData: ServicesData = {
    headerOne: t('services.fallbackHeaderOne'),
    headerTwo: t('services.fallbackHeaderTwo'),
    subheader: t('services.fallbackSubheader'),
    services: [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-600">{t('common.loading')}</p>
          </div>
        )}
        {error && <p className="text-sm text-red-500 mb-4">{t('common.errorLoading')}</p>}
        {!isLoading && (
          <>
            <HeroSection
              badge={badge}
              title={title}
              highlight={highlight}
              description={description}
              imageSrc={imageSrc}
              images={heroImages}
              buttons={heroButtons}
            />
            <StatSection />
            <ImpactHighlights />

            {/* ─── Mandate Section (standalone) ─── */}
            {servicesData?.mandateVisibleOnHomepage && servicesData?.mandate && (
              <section className="py-16 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                      {servicesData?.mandateTitle || 'Our Mandate'}
                    </h2>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-[#326101]/[0.03] border border-[#326101]/10 rounded-2xl p-8 md:p-10">
                    <div className="flex gap-5 items-start">
                      <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-xl bg-[#326101]/10 items-center justify-center mt-1">
                        <svg className="w-6 h-6 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed">{servicesData.mandate}</p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <ServicesSection
              headerOne={servicesData?.headerOne || defaultServicesData.headerOne}
              headerTwo={servicesData?.headerTwo || defaultServicesData.headerTwo}
              subheader={servicesData?.subheader || defaultServicesData.subheader}
              services={servicesData?.services || defaultServicesData.services}
              maxItems={6}
              ctaTitle={servicesData?.ctaTitle}
              ctaSubtitle={servicesData?.ctaSubtitle}
              ctaPrimaryLabel={servicesData?.ctaPrimaryLabel}
              ctaPrimaryHref={servicesData?.ctaPrimaryHref}
              ctaSecondaryLabel={servicesData?.ctaSecondaryLabel}
              ctaSecondaryHref={servicesData?.ctaSecondaryHref}
            />

            {/* <InformationCenterSection /> */}
            {/* <AnnouncementSection /> */}
            <ProjectSection />
            <GeothermalSitesSection />
            <NewsSection />
            <FAQSection />
            <FloatingAnnouncement />

          </>
        )}
      </main>
    </div>
  );
}
