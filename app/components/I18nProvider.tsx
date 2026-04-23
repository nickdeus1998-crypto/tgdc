'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../i18n/messages/en.json';
import sw from '../i18n/messages/sw.json';

type Messages = Record<string, any>;
type Locale = 'en' | 'sw';

const allMessages: Record<Locale, Messages> = { en, sw } as const;

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, k: string) => (acc && k in acc ? acc[k] : undefined), obj);
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Initialize from localStorage or cookie on mount
  useEffect(() => {
    // Force English source text so Google Translate can work reliably on the whole page.
    setLocaleState('en');
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('locale', l);
      if (typeof document !== 'undefined') document.cookie = `locale=${encodeURIComponent(l)}; path=/; max-age=31536000`;
    } catch {}
  };

  const messages = allMessages[locale] || allMessages.en;

  const t = useMemo(() => {
    return (key: string) => {
      const val = getByPath(messages, key);
      if (typeof val === 'string') return val;
      // Fallback to English, then key
      const fallback = getByPath(allMessages.en, key);
      return typeof fallback === 'string' ? fallback : key;
    };
  }, [messages]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

