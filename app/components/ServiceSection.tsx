"use client";

import React from 'react';
import Head from 'next/head';
import { useI18n } from './I18nProvider';

interface Service {
  id: number;
  icon: string;
  title: string;
  content: string;
  features: string[];
}

interface ServicesSectionProps {
  headerOne: string;
  headerTwo: string;
  subheader?: string;
  services: Service[];
}

const ServiceSection: React.FC<ServicesSectionProps> = ({
  headerOne,
  headerTwo,
  subheader,
  services,
}) => {
  const { t } = useI18n();
  return (
    <>
      <Head>
        <title>Services Section</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full mb-4">
                <span className="text-[#326101] text-sm font-medium">{t('services.ourExpertise')}</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                {headerOne}
                <span className="block bg-gradient-to-r from-[#326101] to-[#639427] bg-clip-text text-transparent">
                  {headerTwo}
                </span>
              </h2>
              {subheader && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {subheader}
                </p>
              )}
            </div>

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 transition-all duration-300 ease-in hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#326101] to-[#639427] rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ease-in group-hover:scale-110">
                    {service.icon ? (
                      <i className={`fa ${service.icon} text-3xl text-white`} aria-hidden="true" />
                    ) : (
                      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.93V20a8 8 0 01-7.06-4H8a6 6 0 005 2.91zM4.07 13a8 8 0 010-2h2.02A6 6 0 007 15H5.06A7.96 7.96 0 014.07 13zM8 9H5.06A8 8 0 0111 4v2.07A6 6 0 008 9zm5-4a8 8 0 016.94 4H16a6 6 0 00-3-2.91V5zM20 11a8 8 0 010 2h-2.02A6 6 0 0017 9h2.01zM13 18.93A6 6 0 0016 16h2.94A8 8 0 0113 18.93z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.content}</p>
                  <ul className="space-y-2 text-sm text-gray-500">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#639427] rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-[#326101]/5 to-[#639427]/5 rounded-3xl p-8 max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('services.ctaTitle')}</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{t('services.ctaSubtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/about-us"
                    className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-center"
                  >
                    {t('services.ctaPrimary')}
                  </a>
                  <a
                    href="/information-center"
                    className="border-2 border-[#326101] text-[#326101] px-8 py-3 rounded-full font-semibold hover:bg-[#326101] hover:text-white transition-all duration-300 text-center"
                  >
                    {t('services.ctaSecondary')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServiceSection;
