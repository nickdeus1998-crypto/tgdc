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
        <ServicesSection
          headerOne={payload.headerOne}
          headerTwo={payload.headerTwo}
          subheader={payload.subheader}
          services={payload.services}
        />
      )}
    </div>
  );
}

