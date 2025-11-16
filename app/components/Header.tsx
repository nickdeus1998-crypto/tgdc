"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/about-us" },
    { name: t("nav.services"), href: "/services" },
    { name: t("nav.resources"), href: "/resources" },
    { name: t("nav.geothermalSites"), href: "/geothermal-sites" },
    { name: t("nav.sustainability"), href: "/sustainability" },
    { name: t("nav.informationCenter"), href: "/information-center" },
    { name: t("nav.procurement"), href: "/procurement" },
    { name: t("nav.news"), href: "/news" },
  ];

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-end text-[13px]">
            <a
              href="https://mail.tanesco.go.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium"
            >
              TANESCO Mail
            </a>
            <span className="mx-3 text-white/40">|</span>
            <a
              href="https://mail.tgdc.go.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium"
            >
              TGDC Mail
            </a>
          </div>
        </div>
      </div>
      {/* Top Header Bar */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 border-b border-gray-700/30">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7">
          <div className="flex items-center justify-between">
            {/* Emblem on the left */}
            <Image src="/emblem.png" alt="Emblem" width={56} height={56} className="rounded-md" />

            {/* Center titles */}
            <div className="flex-1 px-4 text-center text-white">
              <h3 className="text-xs sm:text-sm md:text-base font-semibold tracking-wide">
                United Republic of Tanzania
              </h3>
              <h1 className="text-sm sm:text-lg md:text-2xl font-extrabold leading-tight">
                Tanzania Geothermal Development Company
              </h1>
            </div>

            {/* TGDC logo on the right */}
            <Image src="/tgdc.png" alt="TGDC Logo" width={72} height={72} className="rounded-lg" />
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-lg border-b border-gray-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-green-700 font-medium text-sm tracking-wide py-2"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* CTA + language */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/stakeholder/login"
              className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-2 rounded-full font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              {t('nav.stakeholders')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 p-2 rounded-md transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 bg-white z-50 flex flex-col px-6 py-8 space-y-6">
            {/* Close button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="self-end text-gray-700 p-2"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Links */}
            <nav className="flex-1 flex flex-col justify-center space-y-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-gray-700 hover:text-green-700 font-medium text-lg text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-4 items-center">
              <LanguageSwitcher />
              <Link
                href="/stakeholder/login"
                className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-full font-medium text-base hover:shadow-lg transition-all duration-300 text-center"
              >
                {t('nav.stakeholders')}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
