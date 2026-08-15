"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function Preloader() {
  const [fade, setFade] = useState(false);
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    // Lock scrolling on load
    document.body.style.overflow = "hidden";

    const handleLoad = () => {
      setTimeout(() => {
        setFade(true);
        setTimeout(() => {
          document.body.style.overflow = "";
          setIsDestroyed(true);
        }, 700); // match transition duration
      }, 1200); // premium delay to show loading animation
    };

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      const fallbackTimer = setTimeout(handleLoad, 3000);
      return () => {
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallbackTimer);
      };
    }
  }, []);

  if (isDestroyed) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white transition-all duration-700 ease-in-out ${
        fade ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,98,56,0.04)_0%,transparent_65%)]" />

      {/* Main Centered Box */}
      <div className="flex flex-col items-center gap-6">
        
        {/* Ring & Logo Aspect-Locked Container */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Static Outer Track */}
          <div className="absolute inset-0 rounded-full border border-neutral-100" />
          
          {/* Spinning Gradient Border */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#FB6238] animate-spin" />

          {/* Logo Circle Container */}
          <div className="w-28 h-28 rounded-full bg-white shadow-[0px_10px_35px_rgba(0,0,0,0.05)] flex items-center justify-center p-3 animate-pulse">
            <Image
              src="/arabic-logo-new.png"
              alt="Arabic Juniors Logo"
              width={85}
              height={36}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Text Loading Indicator */}
        <div className="flex flex-col items-center gap-1.5 z-10">
          <span className="text-[#FB6238] font-extrabold text-lg tracking-widest font-sans uppercase animate-pulse">
            Arabic Juniors
          </span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB6238] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB6238] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#FB6238] animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
