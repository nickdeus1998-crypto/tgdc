"use client";

import { useEffect, useState } from "react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sw", label: "Kiswahili" },
];

export default function LanguageSwitcher() {
  const [current, setCurrent] = useState<string>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const wg = (window as any).Weglot;
    if (!wg) {
      const timer = setInterval(() => {
        const inst = (window as any).Weglot;
        if (inst) {
          setReady(true);
          setCurrent(inst.getCurrentLang?.() || "en");
          inst.on?.("languageChanged", (lang: string) => setCurrent(lang));
          clearInterval(timer);
        }
      }, 400);
      return () => clearInterval(timer);
    }
    setReady(true);
    setCurrent(wg.getCurrentLang?.() || "en");
    wg.on?.("languageChanged", (lang: string) => setCurrent(lang));
  }, []);

  const switchTo = (code: string) => {
    const wg = (window as any).Weglot;
    if (wg) {
      wg.switchTo?.(code);
    }
  };

  if (!ready) return null;

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchTo(lang.code)}
          className={`px-2 py-1 rounded-full transition ${
            current === lang.code ? "bg-emerald-100 text-emerald-800" : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
