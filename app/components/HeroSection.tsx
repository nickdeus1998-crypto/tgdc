
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface HeroSectionProps {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  imageSrc: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  badge,
  title,
  highlight,
  description,
  imageSrc,
}) => {
  // Rotating list of images (hardcoded)
  const candidates = ['/image1.jpeg', '/image2.jpeg', '/geothermal.jpg'] as const as string[];

  const [frontSrc, setFrontSrc] = useState<string>(candidates[0] || '/geothermal.jpg');
  const [backSrc, setBackSrc] = useState<string>(candidates[1] || candidates[0] || '/geothermal.jpg');
  const [flipped, setFlipped] = useState(false);
  const idxRef = useRef(0);

  // Initialize rotation sources on mount
  useEffect(() => {
    const list = candidates;
    idxRef.current = 0;
    setFrontSrc(list[0] || '/geothermal.jpg');
    setBackSrc(list[1] || list[0] || '/geothermal.jpg');
    setFlipped(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-flip interval
  useEffect(() => {
    const interval = setInterval(() => {
      // Start flip
      setFlipped(true);
      // After flip animation completes, advance images and reset
      const timeout = setTimeout(() => {
        const list = candidates.length ? candidates : [frontSrc];
        const nextIdx = (idxRef.current + 1) % list.length;
        const nextFront = list[nextIdx];
        const nextBack = list[(nextIdx + 1) % list.length];
        idxRef.current = nextIdx;
        setFrontSrc(nextFront);
        setBackSrc(nextBack);
        setFlipped(false);
      }, 700); // match CSS transition duration
      return () => clearTimeout(timeout);
    }, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.join('|')]);

  return (
    <section className="py-20 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div className="space-y-8">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span className="text-green-700 text-sm font-medium">{badge}</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {title}
              <span className="block bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent">
                {highlight}
              </span>
            </h1>

            {/* Paragraph */}
            <p className="text-xl text-gray-600 leading-relaxed">{description}</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300">
              Start Your Project
            </button>
            <button className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-green-700 hover:text-green-700 transition-all duration-300">
              View Case Studies
            </button>
          </div>
        </div>

        {/* Right illustration (flipping card) - simplified, no outside card */}
        <div className="relative flex items-center justify-end">
          <div className="relative mx-auto md:ml-auto w-full max-w-lg" style={{ perspective: '1000px' }}>
            {/* Aspect ratio box for stable layout */}
            <div className="relative w-full pt-[75%]">
              <div
                className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-700"
                style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
              >
                {/* Front side */}
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                  <Image
                    src={frontSrc}
                    alt="Hero Illustration"
                    fill
                    className="object-cover rounded-2xl"
                    priority
                    onError={() => {
                      if (frontSrc !== '/geothermal.jpg') setFrontSrc('/geothermal.jpg');
                    }}
                  />
                </div>
                {/* Back side */}
                <div className="absolute inset-0" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
                  <Image
                    src={backSrc}
                    alt="Hero Illustration"
                    fill
                    className="object-cover rounded-2xl"
                    priority
                    onError={() => {
                      if (backSrc !== '/geothermal.jpg') setBackSrc('/geothermal.jpg');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
