"use client"
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import OrgStructure from '../components/OrgStructure';

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

const timelineItems: TimelineItem[] = [
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

const stats: Stat[] = [
  { target: 15, label: 'Years of Experience' },
  { target: 8, label: 'Active Projects' },
  { target: 250, label: 'MW Potential' },
  { target: 50, label: 'Expert Team' },
];

const backgroundItems: BackgroundItem[] = [
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

const missionVision: MissionVisionItem[] = [
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

const coreValues: CoreValue[] = [
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

const AboutUs: React.FC = () => {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [counterValues, setCounterValues] = useState<{ [key: string]: number }>(
    Object.fromEntries(stats.map((stat) => [stat.label, 0]))
  );
  const statsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Fade-in animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set(prev).add(entry.target.getAttribute('data-section')!));
        }
      });
    }, observerOptions);

    document.querySelectorAll('.section-fade-in').forEach((el) => {
      observer.observe(el);
    });

    // Stats counter animation
    const animateCounter = (label: string, target: number, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCounterValues((prev) => ({ ...prev, [label]: target }));
          clearInterval(timer);
        } else {
          setCounterValues((prev) => ({ ...prev, [label]: Math.floor(start) }));
        }
      }, 16);
    };

    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            stats.forEach((stat) => animateCounter(stat.label, stat.target));
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsSectionRef.current) {
      statsObserver.observe(statsSectionRef.current);
    }

    return () => {
      observer.disconnect();
      statsObserver.disconnect();
    };
  }, []);

  const handleSmoothScroll = (id: string) => {
    // Validate that the id is not empty or '#'
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
          <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            About Us 
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
            About TGDC
          </h1>
          <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
           Leading Tanzania's sustainable energy future through innovative geothermal development
          </p>
        </div>
      </section>

      {/* Quick Stats */}
      <section id="stats" ref={statsSectionRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`section-fade-in transition-all duration-800 ease-out ${visibleSections.has(stat.label) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
                data-section={stat.label}
              >
                <div
                  className="text-5xl font-extrabold bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent"
                  data-target={stat.target}
                >
                  {counterValues[stat.label]}
                </div>
                <p className="text-gray-600 font-medium mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section id="history" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`section-fade-in text-center mb-16 transition-all duration-800 ease-out ${visibleSections.has('history') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
            data-section="history"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our History</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A journey of innovation and sustainable energy development in Tanzania
            </p>
          </div>
          <div className="relative">
            <div className="space-y-12">
              {timelineItems.map((item, index) => (
                <div
                  key={item.year}
                  className={`relative flex items-start space-x-8 section-fade-in transition-all duration-800 ease-out ${visibleSections.has(item.year) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
                  data-section={item.year}
                >
                  <div
                    className="absolute left-3 top-[45px] w-[18px] h-[18px] bg-[#326101] border-3 border-white rounded-full shadow-[0_0_0_3px_#326101]"
                    style={{ zIndex: 10 }}
                  ></div>
                  {index < timelineItems.length - 1 && (
                    <div
                      className="absolute left-5 top-[60px] bottom-[-20px] w-[2px] bg-gradient-to-b from-[#326101] to-[#639427]"
                    ></div>
                  )}
                  <div className="flex-1 bg-[#E8F5E8] p-8 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <h3 className="text-2xl font-bold text-[#326101]">{item.year} - {item.title}</h3>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">{item.timeAgo}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Background Section */}
      <section id="background" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              className={`section-fade-in transition-all duration-800 ease-out ${visibleSections.has('background-left') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
              data-section="background-left"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-8">Our Background</h2>
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
              className={`section-fade-in transition-all duration-800 ease-out ${visibleSections.has('background-right') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
              data-section="background-right"
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Key Achievements</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#E8F5E8] rounded-lg">
                    <span className="font-medium text-gray-900">Geothermal Wells Drilled</span>
                    <span className="text-2xl font-bold text-[#326101]">12+</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#E8F5E8] rounded-lg">
                    <span className="font-medium text-gray-900">Prospects Identified</span>
                    <span className="text-2xl font-bold text-[#326101]">15</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#E8F5E8] rounded-lg">
                    <span className="font-medium text-gray-900">MW Confirmed Capacity</span>
                    <span className="text-2xl font-bold text-[#326101]">100+</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#E8F5E8] rounded-lg">
                    <span className="font-medium text-gray-900">International Partners</span>
                    <span className="text-2xl font-bold text-[#326101]">8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission-vision" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`section-fade-in text-center mb-16 transition-all duration-800 ease-out ${visibleSections.has('mission-vision') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
            data-section="mission-vision"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Mission & Vision</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Driving Tanzania&apos;s sustainable energy future through innovative geothermal solutions
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {missionVision.map((item) => (
              <div
                key={item.title}
                className={`section-fade-in p-8 rounded-2xl transition-all duration-300 bg-[linear-gradient(135deg,rgba(50,97,1,0.05),rgba(99,148,39,0.05))] border border-[rgba(50,97,1,0.1)] hover:-translate-y-[5px] hover:shadow-[0_20px_40px_rgba(50,97,1,0.1)]`}
                data-section={item.title}
              >
                <div className="flex items-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mr-4`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <g dangerouslySetInnerHTML={{ __html: item.icon }} />
                    </svg>
                  </div>
                  <h3 className={`text-3xl font-bold ${item.title === 'Our Mission' ? 'text-[#326101]' : 'text-[#639427]'}`}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">{item.description}</p>
                <div className="space-y-3">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${item.title === 'Our Mission' ? 'bg-[#326101]' : 'bg-[#639427]'}`}></div>
                      <span className="text-gray-600">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Core Values */}
          <div
            className={`section-fade-in mt-16 transition-all duration-800 ease-out ${visibleSections.has('core-values') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
            data-section="core-values"
          >
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {coreValues.map((value) => (
                <div key={value.title} className="text-center p-6 bg-[#E8F5E8] rounded-xl">
                  <div className="w-16 h-16 bg-[#326101] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <g dangerouslySetInnerHTML={{ __html: value.icon }} />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-[#326101] mb-3">{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <OrgStructure />

      {/* Call to Action */}
      <section id="cta" className="py-20 bg-gradient-to-r from-[#326101] to-[#639427] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div
            className={`section-fade-in transition-all duration-800 ease-out ${visibleSections.has('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'}`}
            data-section="cta"
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Learn More?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Discover how TGDC is transforming Tanzania&apos;s energy landscape through sustainable geothermal development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/projects"
                className="bg-white text-[#326101] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                View Our Projects
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[#326101] transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
