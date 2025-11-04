// components/HeroSection.tsx
'use client';

export function HeroResourceSection() {
  return (
    <section className="hero-bg text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 800 400" className="w-full h-full">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#ffffff00" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="url(#g1)" />
          <circle cx="700" cy="80" r="120" fill="url(#g1)" />
          <circle cx="600" cy="320" r="90" fill="url(#g1)" />
        </svg>
      </div>
      <div className="relative max-w-6xl mx-auto px-6">
        <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-300 indicator-dot"></span>
          Resources
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
          Direct Use Geothermal Projects
        </h1>
        <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
          Maximizing geothermal heat for Tanzania’s wellbeing through affordable energy uses in agriculture, aquaculture, processing, and thermal services.
        </p>
      </div>
    </section>
  );
}