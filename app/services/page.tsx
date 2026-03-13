'use client';

import { useEffect, useState } from 'react';
import ServicesSection from '../components/ServiceSection';

interface Service {
  id: number;
  icon: string;
  title: string;
  content: string;
  features: string[];
}

interface ServicesData {
  headerOne: string;
  headerTwo: string;
  subheader?: string;
  mandate?: string;
  mandateTitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  services: Service[];
}

export default function ServicesPage() {
  const [data, setData] = useState<ServicesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/services');
        if (!res.ok) throw new Error('Failed to load services');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError('Unable to load services.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fallback: ServicesData = {
    headerOne: 'Our',
    headerTwo: 'Services',
    subheader:
      'End-to-end geothermal solutions — from exploration to operations — tailored to your project needs.',
    mandate:
      'TGDC is the sole government entity dedicated to the exploration, development and utilization of geothermal resources in the country with specific mandate to; conduct geothermal resource exploration, manage geothermal drilling, and harness geothermal energy for electricity production and direct heat utilization.',
    services: [
      {
        id: 1,
        icon: 'fas fa-seedling',
        title: 'Site Assessment & Feasibility',
        content:
          'Resource assessment, environmental screening, and techno-economic studies to de-risk development.',
        features: ['Geological surveys', 'Permitting guidance', 'Bankable reports'],
      },
      {
        id: 2,
        icon: 'fas fa-drill',
        title: 'Drilling Support',
        content:
          'End-to-end drilling planning, supervision, and safety to deliver high‑quality well outcomes.',
        features: ['Well design', 'HSE management', 'Rig supervision'],
      },
      {
        id: 3,
        icon: 'fas fa-industry',
        title: 'Plant Design & EPC',
        content:
          'Thermal cycle selection, equipment sizing, and project delivery with trusted partners.',
        features: ['Process design', 'EPC coordination', 'Commissioning'],
      },
      {
        id: 4,
        icon: 'fas fa-bolt',
        title: 'Operations & Maintenance',
        content:
          'Reliability-focused O&M programs to maximize uptime and extend asset life.',
        features: ['Remote monitoring', 'Predictive maintenance', 'Performance tuning'],
      },
      {
        id: 5,
        icon: 'fas fa-leaf',
        title: 'Sustainability & Compliance',
        content:
          'ESG integration, regulatory reporting, and community engagement aligned with best practices.',
        features: ['ESG reporting', 'Stakeholder engagement', 'Audits & certifications'],
      },
      {
        id: 6,
        icon: 'fas fa-chart-line',
        title: 'Advisory & Partnerships',
        content:
          'Commercial advisory, offtake strategy, and partnership structuring for bankable projects.',
        features: ['Financial modeling', 'Offtake strategy', 'JV structuring'],
      },
    ],
  };

  const payload = data && data.services && data.services.length > 0 ? data : fallback;

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <p className="text-gray-600">Loading services…</p>
        </div>
      ) : (
        <>
          {/* ─── Mandate Section ─── */}
          {payload.mandate && (
            <section id="mandate" className="py-16 bg-white">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                    {payload.mandateTitle || 'TGDC Mandate'}
                  </h2>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-[#326101]/[0.03] border border-[#326101]/10 rounded-2xl p-8 md:p-10">
                  <div className="flex gap-5 items-start">
                    <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-xl bg-[#326101]/10 items-center justify-center mt-1">
                      <svg className="w-6 h-6 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {payload.mandate}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ─── Services Section ─── */}
          <ServicesSection
            headerOne={payload.headerOne}
            headerTwo={payload.headerTwo}
            subheader={payload.subheader}
            services={payload.services}
            ctaTitle={payload.ctaTitle}
            ctaSubtitle={payload.ctaSubtitle}
            ctaPrimaryLabel={payload.ctaPrimaryLabel}
            ctaPrimaryHref={payload.ctaPrimaryHref}
            ctaSecondaryLabel={payload.ctaSecondaryLabel}
            ctaSecondaryHref={payload.ctaSecondaryHref}
          />
        </>
      )}
    </div>
  );
}

