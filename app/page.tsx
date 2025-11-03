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
import AdminPanel from './admin/AdminPanel';
import ProjectSection from './components/ProjectSection';
import InformationCenterSection from './components/InformationCenterSection';

interface HeroData {
  title: string;
  subheading: string;
  highlight?: string;
  imageUrl?: string;
}
interface ServicesData {
  headerOne: string;
  headerTwo: string;
  subheader?: string;
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

  // Fallback for services if fetch fails
  const defaultServicesData: ServicesData = {
    headerOne: t('services.fallbackHeaderOne'),
    headerTwo: t('services.fallbackHeaderTwo'),
    subheader: t('services.fallbackSubheader'),
    services: [],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
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
            />
            <StatSection />
            <ImpactHighlights />
            <ServicesSection
              headerOne={servicesData?.headerOne || defaultServicesData.headerOne}
              headerTwo={servicesData?.headerTwo || defaultServicesData.headerTwo}
              subheader={servicesData?.subheader || defaultServicesData.subheader}
              services={servicesData?.services || defaultServicesData.services}
            />
            <NewsSection />
            <InformationCenterSection />
            <AnnouncementSection />
            <GeothermalSitesSection />
            <ProjectSection />
            {/* <AdminPanel /> */}
          </>
        )}
      </main>
    </div>
  );
}
