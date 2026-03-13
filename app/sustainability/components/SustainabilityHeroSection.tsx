// app/sustainability/components/HeroSection.tsx
export function SustainabilityHeroSection() {
  return (
    <section className="bg-[#8BC34A] text-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-extrabold mt-4 leading-tight">
          Environment and Stakeholders
        </h1>
        <p className="text-white/90 text-lg md:text-xl mt-4 max-w-3xl">
          A simple overview of our environmental approach and the partners
          supporting geothermal development in Tanzania.
        </p>
      </div>
    </section>
  );
}