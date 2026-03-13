
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroButton {
  label: string;
  href: string;
  visible: boolean;
}

interface HeroSectionProps {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  imageSrc: string;
  images?: string[];
  buttons?: HeroButton[];
}

// Default buttons shown when no data from admin
const defaultButtons: HeroButton[] = [
  { label: 'Start Your Project', href: '/about-us', visible: true },
  { label: 'View Case Studies', href: '/projects', visible: true },
];

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  highlight,
  description,
  imageSrc,
  images,
  buttons,
}) => {
  // Use admin-configured buttons or fall back to defaults
  const activeButtons = (buttons && buttons.length > 0 ? buttons : defaultButtons).filter((b) => b.visible);

  // Rotating background images
  const provided = Array.isArray(images) ? images.filter(Boolean) : [];
  const fallbackImages = (provided.length ? provided : [imageSrc, '/geothermal.jpg', '/image2.jpeg']).filter(Boolean) as string[];
  const [candidates, setCandidates] = useState<string[]>(fallbackImages);

  // Dual-layer crossfade
  const [layerA, setLayerA] = useState(candidates[0] || '/geothermal.jpg');
  const [layerB, setLayerB] = useState(candidates[1] || candidates[0] || '/geothermal.jpg');
  const [showB, setShowB] = useState(false);
  const idxRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const providedImages = Array.isArray(images) ? images.filter(Boolean) : [];
    const next = (providedImages.length ? providedImages : [imageSrc, '/geothermal.jpg', '/image2.jpeg']).filter(Boolean) as string[];
    setCandidates(next);
    setLayerA(next[0] || '/geothermal.jpg');
    setLayerB(next[1] || next[0] || '/geothermal.jpg');
    idxRef.current = 0;
    setShowB(false);
  }, [images, imageSrc]);

  const advance = useCallback(() => {
    if (candidates.length <= 1) return;
    const nextImageIdx = (idxRef.current + 1) % candidates.length;
    const nextSrc = candidates[nextImageIdx];
    idxRef.current = nextImageIdx;

    if (showB) {
      setLayerA(nextSrc);
      requestAnimationFrame(() => setShowB(false));
    } else {
      setLayerB(nextSrc);
      requestAnimationFrame(() => setShowB(true));
    }
  }, [candidates, showB]);

  const jumpTo = useCallback((idx: number) => {
    if (idx === idxRef.current) return;
    const nextSrc = candidates[idx];
    idxRef.current = idx;

    if (showB) {
      setLayerA(nextSrc);
      requestAnimationFrame(() => setShowB(false));
    } else {
      setLayerB(nextSrc);
      requestAnimationFrame(() => setShowB(true));
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 5000);
  }, [candidates, showB, advance]);

  useEffect(() => {
    if (candidates.length <= 1) return;
    timerRef.current = setInterval(advance, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [candidates, advance]);

  return (
    <section className="relative w-screen -ml-[calc((100vw-100%)/2)] h-[60vh] sm:h-[75vh] md:h-[85vh] min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] max-h-[900px] overflow-hidden">
      {/* Background images — dual-layer crossfade */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: showB ? 0 : 1 }}
        >
          <Image
            src={layerA}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => { e.currentTarget.src = '/geothermal.jpg'; }}
          />
        </div>
        <div
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: showB ? 1 : 0 }}
        >
          <Image
            src={layerB}
            alt="Hero background"
            fill
            className="object-cover"
            sizes="100vw"
            onError={(e) => { e.currentTarget.src = '/geothermal.jpg'; }}
          />
        </div>
      </div>

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl space-y-6">
          {/* Heading */}
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-lg">
            {title}
            <span className="block bg-gradient-to-r from-[#639427] to-[#8ab542] bg-clip-text text-transparent">
              {highlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg lg:text-xl text-white/90 leading-relaxed max-w-xl drop-shadow">
            {description}
          </p>

          {/* Dynamic Buttons */}
          {activeButtons.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {activeButtons.map((btn, i) => (
                <Link
                  key={i}
                  href={btn.href}
                  className={
                    i === 0
                      ? 'group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#326101] to-[#639427] text-white px-8 py-4 rounded-full font-semibold text-base overflow-hidden shadow-lg shadow-green-900/20 hover:shadow-xl hover:shadow-green-900/30 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300'
                      : 'group relative inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-base backdrop-blur-sm hover:bg-white/10 hover:border-white/60 active:scale-[0.98] transition-all duration-300'
                  }
                >
                  {/* Shine effect on primary button */}
                  {i === 0 && (
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  )}
                  <span className="relative">{btn.label}</span>
                  <svg
                    className={`relative w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${i === 0 ? 'text-white/80' : 'text-white/60'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image indicators */}
      {candidates.length > 1 && (
        <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {candidates.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === idxRef.current
                ? 'bg-white w-6'
                : 'bg-white/50 hover:bg-white/70 w-2'
                }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
