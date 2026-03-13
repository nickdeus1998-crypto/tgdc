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
  maxItems?: number;
  mandate?: string;
  mandateTitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}

const ServiceSection: React.FC<ServicesSectionProps> = ({
  headerOne,
  headerTwo,
  subheader,
  services,
  maxItems,
  mandate,
  mandateTitle,
  ctaTitle,
  ctaSubtitle,
  ctaPrimaryLabel,
  ctaPrimaryHref,
  ctaSecondaryLabel,
  ctaSecondaryHref,
}) => {
  const { t } = useI18n();
  const visibleServices = maxItems ? services.slice(0, maxItems) : services;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
                {headerOne}
              </h2>
              {subheader && (
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {subheader}
                </p>
              )}
            </div>

            {/* Mandate - visually separate section */}
            {mandate && (
              <div className="mb-16">
                {mandateTitle && (
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">{mandateTitle}</h2>
                )}
                <div className="bg-gradient-to-br from-gray-50 to-[#326101]/[0.03] border border-[#326101]/10 rounded-2xl p-8 md:p-10">
                  <div className="flex gap-5 items-start">
                    <div className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-xl bg-[#326101]/10 items-center justify-center mt-1">
                      <svg className="w-6 h-6 text-[#326101]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">{mandate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Services Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visibleServices.map((service) => (
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
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

            {/* View More Button */}
            {maxItems && services.length > maxItems && (
              <div className="text-center mt-10">
                <a
                  href="/services"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  View More Services
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-[#326101]/5 to-[#639427]/5 rounded-3xl p-8 max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{ctaTitle || t('services.ctaTitle')}</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">{ctaSubtitle || t('services.ctaSubtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href={ctaPrimaryHref || '/about-us'}
                    className="bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-center"
                  >
                    {ctaPrimaryLabel || t('services.ctaPrimary')}
                  </a>
                  <a
                    href={ctaSecondaryHref || '/information-center'}
                    className="border-2 border-[#326101] text-[#326101] px-8 py-3 rounded-full font-semibold hover:bg-[#326101] hover:text-white transition-all duration-300 text-center"
                  >
                    {ctaSecondaryLabel || t('services.ctaSecondary')}
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
