'use client';

import { useEffect } from 'react';

const weglotKey = process.env.NEXT_PUBLIC_WEGLOT_KEY;

export default function WeglotLoader() {
  useEffect(() => {
    if (!weglotKey) return;
    if (typeof window === 'undefined') return;
    if ((window as any).Weglot) {
      (window as any).Weglot.initialize({ api_key: weglotKey });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.weglot.com/weglot.min.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).Weglot) {
        (window as any).Weglot.initialize({ api_key: weglotKey });
      }
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (!weglotKey) return null;

  return <div className="weglot-container" />;
}
