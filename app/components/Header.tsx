"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "./I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import SearchModal from "./SearchModal";

interface HeaderSettings {
  emblemUrl?: string | null;
  logoUrl?: string | null;
  topTitle?: string;
  mainTitle?: string;
  tanescoMail?: string;
  tgdcMail?: string;
}

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
  icon?: string; // SVG path data
}

interface NavItem {
  name: string;
  href: string;
  dropdown?: DropdownItem[];
}

export default function Header() {
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [settings, setSettings] = useState<HeaderSettings | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Cmd+K / Ctrl+K global shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/header');
        if (res.ok) {
          const data = await res.json();
          if (data && data.mainTitle) {
            setSettings(data);
          }
        }
      } catch (err) {
        console.error('Error fetching header settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleMouseEnter = useCallback((name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(name);
  }, []);

  const handleMouseLeave = useCallback(() => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }, []);

  // Navigation items with dropdown sub-items
  const navItems: NavItem[] = [
    {
      name: t("nav.home"),
      href: "/",
    },
    {
      name: t("nav.about"),
      href: "/about-us",
      dropdown: [
        {
          label: "About TGDC",
          href: "/about-us",
          description: "Overview and introduction",
          icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
        },
        {
          label: "Our History",
          href: "/about-us#history",
          description: "How TGDC was established",
          icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        {
          label: "Background",
          href: "/about-us#background",
          description: "Context and mandate",
          icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        },
        {
          label: "Mission & Vision",
          href: "/about-us#mission-vision",
          description: "Our purpose and strategic direction",
          icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
        },
        {
          label: "Board of Directors",
          href: "/board-of-directors",
          description: "Our governance board",
          icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
        },
        {
          label: "Management",
          href: "/about-us#org-structure",
          description: "Our leadership team",
          icon: "M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.21 0-4 1.79-4 4v5h8v-5c0-2.21-1.79-4-4-4z",
        },
        {
          label: "FAQs",
          href: "/faqs",
          description: "Frequently asked questions",
          icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        },
      ],
    },
    {
      name: t("nav.services"),
      href: "/services",
      dropdown: [
        {
          label: "Mandate",
          href: "/services#mandate",
          description: "Our core mandate and responsibilities",
          icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        },
        {
          label: "Services",
          href: "/services",
          description: "Our full service portfolio",
          icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
        },
      ],
    },
    {
      name: t("nav.projects"),
      href: "/projects",
    },
    {
      name: t("nav.geothermalSites"),
      href: "/geothermal-sites",
    },
    {
      name: t("nav.sustainability"),
      href: "/sustainability",
    },
    {
      name: t("nav.informationCenter"),
      href: "/information-center",
      dropdown: [
        {
          label: "All Resources",
          href: "/information-center",
          description: "Photos, videos, newsletters & press",
          icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        },
        {
          label: "News & Updates",
          href: "/news",
          description: "Latest news and announcements",
          icon: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
        },
        {
          label: "Photo Gallery",
          href: "/information-center#photos",
          description: "Browse our image collection",
          icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
        },
        {
          label: "Video Library",
          href: "/information-center#videos",
          description: "Watch our project videos",
          icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
        },
      ],
    },
    {
      name: t("nav.procurement"),
      href: "/procurement",
    },
  ];

  return (
    <>
      {/* Top Utility Bar */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-end text-[13px]">
            <Link
              href="/contact"
              className="text-white font-medium hover:text-green-300 transition-colors"
            >
              Contact Us
            </Link>
            <span className="mx-3 text-white/40">|</span>
            <a
              href={settings?.tanescoMail || "https://mail.tanesco.go.tz"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-medium"
            >
              TANESCO Mail
            </a>
            <span className="mx-3 text-white/40">|</span>
            <a
              href={settings?.tgdcMail || "https://mail.tgdc.go.tz"}
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
      <div className="relative bg-gray-900/95 backdrop-blur-sm border-b border-white/5">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7">
          <div className="flex items-center justify-between">
            {/* Emblem on the left */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0">
              <Image src={settings?.emblemUrl || "/emblem.png"} alt="Emblem" fill className="rounded-md object-contain" />
            </div>

            {/* Center titles */}
            <div className="flex-1 px-4 text-center text-white">
              <h3 className="text-xs sm:text-sm md:text-base font-semibold tracking-wide">
                {settings?.topTitle || "United Republic of Tanzania"}
              </h3>
              <h1 className="text-sm sm:text-lg md:text-2xl font-extrabold leading-tight">
                {settings?.mainTitle || "Tanzania Geothermal Development Company"}
              </h1>
            </div>

            {/* TGDC logo on the right */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
              <Image src={settings?.logoUrl || "/tgdc.png"} alt="TGDC Logo" fill className="rounded-lg object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/70 shadow-lg border-b border-gray-100 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 lg:h-14">
            {/* Desktop Navigation */}
            <nav ref={navRef} className="hidden lg:flex items-center gap-1 whitespace-nowrap">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Nav Link */}
                  <Link
                    href={item.href}
                    className={`group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[13px] font-medium tracking-wide transition-all duration-200 ${activeDropdown === item.name
                      ? 'text-[#326101] bg-[#326101]/5'
                      : 'text-gray-700 hover:text-[#326101] hover:bg-[#326101]/5'
                      }`}
                  >
                    {item.name}
                    {item.dropdown && (
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180 text-[#326101]' : 'text-gray-400'
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Panel */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div
                      className="absolute top-full left-0 pt-2 z-50"
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div
                        className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[280px] animate-in fade-in slide-in-from-top-1 duration-200"
                        style={{
                          animation: 'dropdownIn 0.2s ease-out',
                        }}
                      >
                        {/* Dropdown Header */}
                        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.name}</p>
                        </div>

                        {/* Dropdown Items */}
                        <div className="py-1.5">
                          {item.dropdown.map((sub, idx) => (
                            <Link
                              key={idx}
                              href={sub.href}
                              onClick={() => setActiveDropdown(null)}
                              className="group/item flex items-start gap-3 px-4 py-3 hover:bg-[#326101]/5 transition-all duration-150"
                            >
                              {/* Icon */}
                              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#326101]/8 group-hover/item:bg-[#326101]/15 flex items-center justify-center transition-colors duration-150 mt-0.5">
                                <svg
                                  className="w-[18px] h-[18px] text-[#326101]/70 group-hover/item:text-[#326101] transition-colors"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sub.icon} />
                                </svg>
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 group-hover/item:text-[#326101] transition-colors">
                                  {sub.label}
                                </p>
                                {sub.description && (
                                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                    {sub.description}
                                  </p>
                                )}
                              </div>

                              {/* Arrow */}
                              <svg
                                className="w-4 h-4 text-gray-300 group-hover/item:text-[#326101] group-hover/item:translate-x-0.5 transition-all flex-shrink-0 mt-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ))}
                        </div>

                        {/* View All Footer */}
                        <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-100">
                          <Link
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="group/footer flex items-center justify-center gap-1.5 text-xs font-semibold text-[#326101] hover:text-[#4c8f02] transition-colors"
                          >
                            View All {item.name}
                            <svg className="w-3.5 h-3.5 group-hover/footer:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Search + CTA + language */}
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-2 text-gray-500 hover:text-[#326101] px-3 py-2 rounded-lg hover:bg-[#326101]/5 transition-all duration-200"
                title="Search (⌘K)"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[11px] border border-gray-200 rounded px-1.5 py-0.5 text-gray-400 group-hover:border-[#326101]/20 group-hover:text-[#326101]/60 font-mono transition-colors">⌘K</span>
              </button>
              <LanguageSwitcher />
              <Link
                href="/stakeholder/login"
                className="whitespace-nowrap bg-gradient-to-r from-[#326101] to-[#639427] text-white px-6 py-2 rounded-full font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                {t('nav.stakeholders')}
              </Link>
            </div>

            {/* Mobile Search + Menu Button */}
            <div className="lg:hidden flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-700 hover:text-[#326101] p-2 rounded-md transition-colors duration-200"
                title="Search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-800">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Links */}
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.name}>
                  {/* Parent Item */}
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      className="flex-1 text-gray-700 hover:text-[#326101] font-medium text-[15px] px-3 py-3 rounded-lg hover:bg-[#326101]/5 transition-all"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.dropdown && (
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.name ? null : item.name)}
                        className={`p-3 rounded-lg transition-all ${mobileExpanded === item.name
                          ? 'text-[#326101] bg-[#326101]/5'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${mobileExpanded === item.name ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Mobile Sub-items */}
                  {item.dropdown && mobileExpanded === item.name && (
                    <div className="ml-3 pl-3 border-l-2 border-[#326101]/15 space-y-0.5 pb-2">
                      {item.dropdown.map((sub, idx) => (
                        <Link
                          key={idx}
                          href={sub.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-[#326101] hover:bg-[#326101]/5 transition-all"
                        >
                          <div className="w-7 h-7 rounded-md bg-[#326101]/8 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3.5 h-3.5 text-[#326101]/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={sub.icon} />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{sub.label}</p>
                            {sub.description && (
                              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{sub.description}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Footer */}
            <div className="px-6 py-5 border-t border-gray-100 space-y-4">
              <LanguageSwitcher />
              <Link
                href="/stakeholder/login"
                className="block bg-gradient-to-r from-[#326101] to-[#639427] text-white px-6 py-3 rounded-full font-medium text-base hover:shadow-lg transition-all duration-300 text-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.stakeholders')}
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Dropdown animation styles */}
      <style jsx global>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
