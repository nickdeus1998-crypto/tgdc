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
    
    // Set the Google Translate cookie
    // We set it multiple ways to ensure it sticks on .go.tz domains
    const cookieValue = `googtrans=/en/${code}`;
    document.cookie = `${cookieValue}; path=/`;
    document.cookie = `${cookieValue}; path=/; domain=${window.location.hostname}`;
    
    // Also try to set it on the base domain if it's a subdomain (like www.tgdc.go.tz)
    const parts = window.location.hostname.split('.');
    if (parts.length >= 3) {
      const baseDomain = parts.slice(-3).join('.');
      document.cookie = `${cookieValue}; path=/; domain=${baseDomain}`;
    }

    const triggerGoogle = () => {
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (select) {
        select.value = code;
        select.dispatchEvent(new Event("change"));
      } else {
        // Retry if the widget hasn't finished loading yet
        setTimeout(triggerGoogle, 500);
      }
    };
    
    triggerGoogle();
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
