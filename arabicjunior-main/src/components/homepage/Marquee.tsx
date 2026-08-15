"use client";

import React from "react";

const marqueeItems = [
  "Speak Arabic",
  "Read Arabic",
  "Write Arabic",
  "Improve Grammar",
  "Build Vocabulary",
  "Practice Conversation",
  "Learn with Confidence"
];

const Marquee = () => {
  // We duplicate the list to ensure the marquee flow is seamless and long enough
  const displayItems = [...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <section 
      aria-label="academic-focus-marquee" 
      className="relative w-full overflow-hidden bg-gradient-to-r from-[#FF60A8] via-[#FB6238] to-[#F5AE14] py-5 shadow-lg my-6 sm:my-10"
    >
      {/* Side gradient overlays to fade the text smoothly at the edges */}
      <div 
        className="absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-32 pointer-events-none bg-gradient-to-r from-[#FF60A8] to-transparent" 
        aria-hidden="true"
      />
      <div 
        className="absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-32 pointer-events-none bg-gradient-to-l from-[#F5AE14] to-transparent" 
        aria-hidden="true"
      />

      {/* Marquee track */}
      <div className="flex w-max relative">
        {/* Animated content list */}
        <div className="flex animate-marquee-scroll whitespace-nowrap gap-x-8 sm:gap-x-12 items-center pr-8 sm:pr-12">
          {displayItems.map((item, idx) => (
            <div 
              key={`marquee-1-${idx}`} 
              className="flex items-center gap-x-3 sm:gap-x-4 text-white font-semibold text-lg sm:text-xl lg:text-2xl tracking-wider select-none hover:scale-105 transition-transform duration-300"
            >
              <span>{item}</span>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse"
                aria-hidden="true"
              >
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
              </svg>
            </div>
          ))}
        </div>

        {/* Duplicate animated list for seamless loop */}
        <div className="flex animate-marquee-scroll whitespace-nowrap gap-x-8 sm:gap-x-12 items-center pr-8 sm:pr-12" aria-hidden="true">
          {displayItems.map((item, idx) => (
            <div 
              key={`marquee-2-${idx}`} 
              className="flex items-center gap-x-3 sm:gap-x-4 text-white font-semibold text-lg sm:text-xl lg:text-2xl tracking-wider select-none hover:scale-105 transition-transform duration-300"
            >
              <span>{item}</span>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse"
                aria-hidden="true"
              >
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" />
              </svg>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;
