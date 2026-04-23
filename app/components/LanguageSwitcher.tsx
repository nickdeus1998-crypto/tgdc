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

  const switchTo = (code: string) => {
    setCurrent(code);
    
    // We intentionally do NOT call setLocale(code) here.
    // Keeping the React UI in English ensures Google Translate has a 
    // consistent source text to translate, which fixes the "partial translation" issue.

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
