// app/geothermal-sites/components/HeroSection.tsx
export function HeroSection() {
  return (
    <section className="hero-bg text-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
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