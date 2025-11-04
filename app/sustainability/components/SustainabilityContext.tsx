// app/sustainability/components/SustainabilityContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SustainabilityContextType {
  activeTab: 'environment' | 'stakeholders';
  setActiveTab: (tab: 'environment' | 'stakeholders') => void;
  showToast: (msg?: string) => void;
}

const SustainabilityContext = createContext<SustainabilityContextType | undefined>(undefined);

export function SustainabilityProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<'environment' | 'stakeholders'>('environment');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg = 'Link copied to clipboard') => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1500);
  };

  return (
    <SustainabilityContext.Provider value={{ activeTab, setActiveTab, showToast }}>
      {children}
      {toastVisible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm shadow-lg toast">
          {toastMessage}
        </div>
      )}
    </SustainabilityContext.Provider>
  );
}

export const useSustainability = () => {
  const context = useContext(SustainabilityContext);
  if (!context) throw new Error('useSustainability must be used within SustainabilityProvider');
  return context;
};