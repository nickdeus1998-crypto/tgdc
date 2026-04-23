"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./I18nProvider";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [current, setCurrent] = useState<string>(locale);

  // Sync state if locale changes from elsewhere
  useEffect(() => {
    setCurrent(locale);
  }, [locale]);

  const switchTo = (code: string) => {
    // 1. Update manual translations (React state)
    setLocale(code as "en" | "sw");
    setCurrent(code);

    // 2. Update machine translations (Google Translate Widget)
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event("change"));
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
