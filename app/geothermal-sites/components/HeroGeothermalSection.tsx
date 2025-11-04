// app/geothermal-sites/components/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="hero-bg text-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <span className="inline-flex items-center gap-2 text-sm bg-white/15 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          Geothermal Sites
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
          Tanzania’s Geothermal Sites by Zone
        </h1>
        <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
          Explore geothermal prospects across zones. Start with the Eastern Zone sites and drill down into each location’s background and status.
        </p>
      </div>
    </section>
  );
}