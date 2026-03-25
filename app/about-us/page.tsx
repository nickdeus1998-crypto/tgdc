"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import OrgStructure from '../components/OrgStructure';
import { sanitizeHtml } from '@/app/lib/sanitize';

interface TimelineItem {
  year: string;
  title: string;
  timeAgo: string;
  description: string;
}

interface Stat {
  target: number;
  label: string;
}

interface BackgroundItem {
  title: string;
  description: string;
}

interface MissionVisionItem {
  title: string;
  description: string;
  points: string[];
  icon: string;
  gradient: string;
}

interface CoreValue {
  title: string;
  description: string;
  icon: string;
}

interface KeyAchievement {
  label: string;
  value: string;
}

// Defaults used before CMS data loads
const defaultTimelineItems: TimelineItem[] = [
  {
    year: '2008',
    title: 'Foundation',
    timeAgo: '15 years ago',
    description:
      'Tanzania Geothermal Development Company was established as a subsidiary of Tanzania Electric Supply Company (TANESCO) to spearhead the development of geothermal energy resources in Tanzania. Our mission was clear: to harness the country\'s vast geothermal potential for sustainable energy production.',
  },
  {
    year: '2012',
    title: 'First Exploration',
    timeAgo: '11 years ago',
    description:
      'Commenced comprehensive geothermal exploration activities in the Rift Valley region, including surface studies, geochemical analysis, and geophysical surveys. This marked the beginning of our systematic approach to identifying and evaluating geothermal resources across Tanzania.',
  },
  {
    year: '2016',
    title: 'Major Breakthrough',
    timeAgo: '7 years ago',
    description:
      'Successfully completed the first phase of drilling operations at Ngozi geothermal prospect, confirming significant geothermal resources. This achievement positioned Tanzania as a key player in East Africa\'s geothermal energy sector and attracted international partnerships and funding.',
  },
  {
    year: '2020',
    title: 'Expansion Phase',
    timeAgo: '3 years ago',
    description:
      'Expanded operations to multiple geothermal prospects across Tanzania, including Songwe, Kiejo-Mbaka, and Luhoi. Established strategic partnerships with international development agencies and private sector investors to accelerate project development and technology transfer.',
  },
  {
    year: '2023',
    title: 'Present Day',
    timeAgo: 'Current',
    description:
      'Today, TGDC leads Tanzania\'s geothermal development with active projects across the country. We continue to advance sustainable energy solutions, contribute to national energy security, and support Tanzania\'s commitment to clean energy transition and climate change mitigation.',
  },
];

const defaultStats: Stat[] = [
  { target: 15, label: 'Years of Experience' },
  { target: 8, label: 'Active Projects' },
  { target: 250, label: 'MW Potential' },
  { target: 50, label: 'Expert Team' },
];

const defaultBackgroundItems: BackgroundItem[] = [
  {
    title: 'Government Initiative',
    description:
      'Established as a strategic government initiative to develop Tanzania\'s abundant geothermal resources, supporting national energy security and economic development goals.',
  },
  {
    title: 'Rift Valley Advantage',
    description:
      'Located in the East African Rift Valley, Tanzania possesses exceptional geothermal potential with over 5,000 MW of estimated capacity across multiple geothermal prospects.',
  },
  {
    title: 'Technical Expertise',
    description:
      'Our multidisciplinary team combines local knowledge with international best practices, ensuring sustainable and efficient geothermal development across all project phases.',
  },
  {
    title: 'Strategic Partnerships',
    description:
      'Collaborating with international development partners, technology providers, and financial institutions to accelerate geothermal development and knowledge transfer.',
  },
];

const defaultMissionVision: MissionVisionItem[] = [
  {
    title: 'Our Mission',
    description:
      'To develop Tanzania\'s geothermal energy resources in a sustainable, efficient, and environmentally responsible manner, contributing to national energy security, economic growth, and improved quality of life for all Tanzanians.',
    points: [
      'Sustainable energy development',
      'Environmental stewardship',
      'Community empowerment',
      'Technical excellence',
    ],
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />',
    gradient: 'from-[#326101] to-[#639427]',
  },
  {
    title: 'Our Vision',
    description:
      'To be the leading geothermal energy developer in East Africa, recognized for excellence in sustainable energy solutions, innovation, and contribution to regional energy security and climate change mitigation.',
    points: [
      'Regional leadership in geothermal',
      'Innovation and technology advancement',
      'Climate change mitigation',
      'Sustainable development goals',
    ],
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />',
    gradient: 'from-[#639427] to-[#8BC34A]',
  },
];

const defaultCoreValues: CoreValue[] = [
  {
    title: 'Integrity',
    description:
      'We conduct our business with the highest ethical standards, transparency, and accountability in all our operations.',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />',
  },
  {
    title: 'Innovation',
    description:
      'We embrace cutting-edge technologies and innovative approaches to advance geothermal energy development.',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />',
  },
  {
    title: 'Sustainability',
    description:
      'We are committed to environmental protection and sustainable development for future generations.',
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />',
  },
];

const defaultKeyAchievements: KeyAchievement[] = [
  { label: 'Geothermal Wells Drilled', value: '12+' },
  { label: 'Prospects Identified', value: '15' },
  { label: 'MW Confirmed Capacity', value: '100+' },
  { label: 'International Partners', value: '8' },
];

const AboutUs: React.FC = () => {
  const [heroTitle, setHeroTitle] = useState<string>('About TGDC');
  const [heroSubtitle, setHeroSubtitle] = useState<string>(
    "Leading Tanzania's sustainable energy future through innovative geothermal development"
  );
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>(defaultTimelineItems);
  const [stats, setStats] = useState<Stat[]>([]);
  const [backgroundItems, setBackgroundItems] = useState<BackgroundItem[]>(defaultBackgroundItems);
  const [missionVision, setMissionVision] = useState<MissionVisionItem[]>(defaultMissionVision);
  const [coreValues, setCoreValues] = useState<CoreValue[]>(defaultCoreValues);
  const [keyAchievements, setKeyAchievements] = useState<KeyAchievement[]>(defaultKeyAchievements);
  const [historyTitle, setHistoryTitle] = useState('Our History');
  const [historySubtitle, setHistorySubtitle] = useState('A journey of innovation and sustainable energy development in Tanzania');
  const [backgroundTitle, setBackgroundTitle] = useState('Our Background');

  // Load About Us content from CMS API
  useEffect(() => {
    const orDefaultArray = <T,>(arr: any, def: T[]): T[] => (Array.isArray(arr) && arr.length > 0 ? arr : def);
    const load = async () => {
      try {
        const res = await fetch('/api/about');
        if (!res.ok) return;
        const data = await res.json();
        setHeroTitle(data.heroTitle || 'About TGDC');
        setHeroSubtitle(
          data.heroSubtitle || "Leading Tanzania's sustainable energy future through innovative geothermal development"
        );
        setTimelineItems(orDefaultArray<TimelineItem>(data.timeline, defaultTimelineItems));
        setBackgroundItems(orDefaultArray<BackgroundItem>(data.background, defaultBackgroundItems));
        setMissionVision(orDefaultArray<MissionVisionItem>(data.missionVision, defaultMissionVision));
        setCoreValues(orDefaultArray<CoreValue>(data.coreValues, defaultCoreValues));
        setKeyAchievements(orDefaultArray<KeyAchievement>(data.keyAchievements, defaultKeyAchievements));
        let incomingStats: Stat[] = Array.isArray(data.stats) ? data.stats : [];
        // Only use stats that have actual non-zero values — treat empty / all-zero as "not configured"
        const hasRealStats = incomingStats.some((s: any) => Number(s.target) > 0);
        setStats(hasRealStats ? incomingStats : []);
      } catch (e) {
        console.error('About page load error', e);
      }
    };
    load();
    fetch('/api/site-settings?key=history_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHistoryTitle(d.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=history_section_subtitle')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setHistorySubtitle(d.value); })
      .catch(() => { });
    fetch('/api/site-settings?key=background_section_title')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.value) setBackgroundTitle(d.value); })
      .catch(() => { });
  }, []);

  const handleSmoothScroll = (id: string) => {
    if (!id || id === '#') return;
    const target = document.querySelector(`#${id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white min-h-screen box-border">
      {/* Hero Section */}
      <section className="bg-[radial-gradient(900px_460px_at_10%_-10%,rgba(99,148,39,0.18),transparent_60%),radial-gradient(800px_420px_at_110%_0%,rgba(50,97,1,0.18),transparent_60%),linear-gradient(135deg,#326101,#639427)] text-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            {heroTitle}
          </h1>
          <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Quick Stats – only show if configured */}
      {stats.length > 0 && (
        <section id="stats" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <div className="text-5xl font-extrabold bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent">
                    {stat.target}
                  </div>
                  <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* History Section */}
      <section id="history" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{historyTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {historySubtitle}
            </p>
          </div>

          <div className="relative">
            {/* Center line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#326101] via-[#639427] to-[#326101]/30 md:-translate-x-px" />

            <div className="space-y-8 md:space-y-12">
              {timelineItems.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={item.year} className="relative flex items-start">
                    {/* Year badge on the center line */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#326101] to-[#639427] flex items-center justify-center shadow-lg shadow-[#326101]/20 ring-4 ring-white">
                        <span className="text-white font-bold text-[11px] text-center leading-tight px-1">{item.year}</span>
                      </div>
                    </div>

                    {/* Card — alternates left/right on desktop, always right on mobile */}
                    <div className={`ml-20 md:ml-0 md:w-[calc(50%-3.5rem)] ${isLeft ? 'md:mr-auto md:pr-4' : 'md:ml-auto md:pl-4'}`}>
                      <div className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-[#326101]/20 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#326101] transition-colors">{item.title}</h3>
                          <span className="text-xs text-[#326101] bg-[#E8F5E8] px-3 py-1 rounded-full font-medium whitespace-nowrap ml-3">{item.timeAgo}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                        <div className="mt-4 h-1 w-12 bg-gradient-to-r from-[#326101] to-[#639427] rounded-full group-hover:w-20 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section id="background" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={""}
              data-section="background-left"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-8">{backgroundTitle}</h2>
              <div className="space-y-6">
                {backgroundItems.map((item) => (
                  <div key={item.title} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-[#326101] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={""}
              data-section="background-right"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Achievements</h3>
                <div className="space-y-4">
                  {keyAchievements.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-[#E8F5E8] rounded-lg">
                      <span className="font-medium text-gray-900">{item.label}</span>
                      <span className="text-2xl font-bold text-[#326101]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission-vision" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {missionVision.map((item, idx) => {
              const gradient = item.gradient || (idx === 0 ? 'from-[#326101] to-[#639427]' : 'from-[#639427] to-[#8BC34A]');
              const icon = item.icon || (idx === 0
                ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />'
                : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />');
              const isMission = idx === 0;
              return (
                <div
                  key={item.title}
                  className="p-8 rounded-2xl transition-all duration-300 bg-[linear-gradient(135deg,rgba(50,97,1,0.05),rgba(99,148,39,0.05))] border border-[rgba(50,97,1,0.1)] hover:-translate-y-[5px] hover:shadow-[0_20px_40px_rgba(50,97,1,0.1)]"
                  data-section={item.title}
                >
                  <div className="flex items-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mr-4`}>
                      {icon.startsWith('fas ') ? (
                        <i className={`${icon} text-white text-2xl`} />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <g dangerouslySetInnerHTML={{ __html: sanitizeHtml(icon) }} />
                        </svg>
                      )}
                    </div>
                    <h3 className={`text-3xl font-bold ${isMission ? 'text-[#326101]' : 'text-[#639427]'}`}>
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">{item.description}</p>
                  {item.points && item.points.length > 0 && (
                    <div className="space-y-3">
                      {item.points.map((point) => (
                        <div key={point} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${isMission ? 'bg-[#326101]' : 'bg-[#639427]'}`}></div>
                          <span className="text-gray-600">{point}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Core Values */}
          <div
            id="core-values"
            className={"mt-16"}
            data-section="core-values"
          >
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {coreValues.map((value) => {
                const cvIcon = value.icon || '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />';
                return (
                  <div key={value.title} className="text-center p-6 bg-[#E8F5E8] rounded-xl">
                    <div className="w-16 h-16 bg-[#326101] rounded-full flex items-center justify-center mx-auto mb-4">
                      {cvIcon.startsWith('fas ') ? (
                        <i className={`${cvIcon} text-white text-2xl`} />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <g dangerouslySetInnerHTML={{ __html: sanitizeHtml(cvIcon) }} />
                        </svg>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-[#326101] mb-3">{value.title}</h4>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <OrgStructure />

    </div>
  );
};

export default AboutUs;
