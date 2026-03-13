// components/RoadmapSection.tsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export function RoadmapSection() {
  const [label, setLabel] = useState('Methodology Details');
  const [link, setLink] = useState('/information-center');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetch('/api/methodology-button')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.label) setLabel(data.label);
        if (data?.link) setLink(data.link);
        if (data?.visible === false) setVisible(false);
      })
      .catch(() => { });
  }, []);

  if (!visible) return null;

  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <Link
          href={link}
          className="inline-block border-2 border-[#326101] text-[#326101] px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#326101] hover:text-white transition-colors"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}