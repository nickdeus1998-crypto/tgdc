"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
];

export default function LanguageSwitcher() {
  const { locale } = useI18n();
  const [current, setCurrent] = useState<string>(locale);
  
  useEffect(() => {
    // Check if there is already a Google Translate cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setCurrent(match[1]);
    }
  }, []);

  const switchTo = (code: string) => {
    setCurrent(code);
    
    const cookieValue = `googtrans=/en/${code}`;
    document.cookie = `${cookieValue}; path=/`;
    document.cookie = `${cookieValue}; path=/; domain=${window.location.hostname}`;
    
    const parts = window.location.hostname.split('.');
    if (parts.length >= 3) {
      const baseDomain = parts.slice(-3).join('.');
      document.cookie = `${cookieValue}; path=/; domain=${baseDomain}`;
    }

    // Smart Trigger: Use MutationObserver to watch for the Google dropdown
    const triggerGoogle = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };

    if (!triggerGoogle()) {
      const observer = new MutationObserver((mutations, obs) => {
        if (triggerGoogle()) {
          obs.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Fallback timeout
      setTimeout(() => observer.disconnect(), 10000);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchTo(lang.code)}
          className={`px-2 py-1 rounded-full transition ${
            current === lang.code ? "bg-[#326101]/10 text-[#326101]" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
