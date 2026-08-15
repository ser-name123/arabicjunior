"use client";

import React, { useState, useEffect } from "react";

type SchoolLogo = {
  _id: string;
  name: string;
  logoUrl: string;
  logoPublicId: string;
};

// Fallback school logos in case the admin hasn't uploaded any yet.
// These use high-quality placeholder illustrations or clean text-based logos.
const fallbackSchools = [
  { name: "Dubai British School", id: "f1" },
  { name: "GEMS Wellington Academy", id: "f2" },
  { name: "Repton School Dubai", id: "f3" },
  { name: "Kings' School Dubai", id: "f4" },
  { name: "Nord Anglia International", id: "f5" },
  { name: "Jumeirah College", id: "f6" },
];

const SchoolLogosMarquee = () => {
  const [logos, setLogos] = useState<SchoolLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/school-logos`);
        const result = await res.json();
        if (res.ok && result.data && result.data.length > 0) {
          setLogos(result.data);
        }
      } catch (err) {
        console.error("Failed to load school logos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogos();
  }, []);

  // Duplicate items to ensure smooth continuous scrolling
  const listToRender = logos.length > 0 ? logos : [];

  // We want at least 15 items in the list to make the loop seamless.
  // We repeat the array as many times as needed.
  let displayList: any[] = [];
  if (listToRender.length > 0) {
    const repeats = Math.ceil(15 / listToRender.length);
    for (let i = 0; i < repeats; i++) {
      displayList = [...displayList, ...listToRender];
    }
  }

  // If loading and database is empty, we don't render anything or render skeletons.
  if (loading && logos.length === 0) {
    return (
      <div className="w-full py-8 bg-[#FAFBFD] border-y border-neutral-100">
        <div className="container flex items-center justify-center gap-8 animate-pulse">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-10 w-28 bg-neutral-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // If not loading and database is empty, we render fallback school names styled beautifully.
  const isFallback = displayList.length === 0;
  const items = isFallback ? [...fallbackSchools, ...fallbackSchools, ...fallbackSchools] : displayList;

  return (
    <section 
      aria-label="enrolled-students-schools" 
      className="w-full bg-[#FAFBFD] border-y border-neutral-100/80 py-10 my-8 overflow-hidden relative"
    >
      <div className="container mb-6 text-center">
        <h4 className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">
          Our Students Come From Prominent UAE Schools
        </h4>
      </div>

      <div className="relative w-full">
        {/* Left and Right Side Fade-Out Overlays */}
        <div 
          className="absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-32 pointer-events-none bg-gradient-to-r from-[#FAFBFD] to-transparent" 
          aria-hidden="true"
        />
        <div 
          className="absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-32 pointer-events-none bg-gradient-to-l from-[#FAFBFD] to-transparent" 
          aria-hidden="true"
        />

        {/* Scrolling track */}
        <div className="flex w-max relative">
          <div className="flex animate-marquee-scroll whitespace-nowrap gap-x-12 sm:gap-x-20 items-center pr-12 sm:pr-20">
            {items.map((item, idx) => (
              <div 
                key={`school-1-${idx}`} 
                className="flex items-center justify-center select-none"
              >
                {!isFallback && "logoUrl" in item ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="h-10 md:h-14 w-auto object-contain max-w-[140px] filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    draggable={false}
                  />
                ) : (
                  <span className="text-neutral-400 font-semibold text-lg md:text-xl tracking-wider border border-dashed border-neutral-200 py-1.5 px-4 rounded-lg bg-white">
                    🏫 {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Duplicate track for seamless infinite scroll */}
          <div className="flex animate-marquee-scroll whitespace-nowrap gap-x-12 sm:gap-x-20 items-center pr-12 sm:pr-20" aria-hidden="true">
            {items.map((item, idx) => (
              <div 
                key={`school-2-${idx}`} 
                className="flex items-center justify-center select-none"
              >
                {!isFallback && "logoUrl" in item ? (
                  <img
                    src={item.logoUrl}
                    alt={item.name}
                    className="h-10 md:h-14 w-auto object-contain max-w-[140px] filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    draggable={false}
                  />
                ) : (
                  <span className="text-neutral-400 font-semibold text-lg md:text-xl tracking-wider border border-dashed border-neutral-200 py-1.5 px-4 rounded-lg bg-white">
                    🏫 {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SchoolLogosMarquee;
