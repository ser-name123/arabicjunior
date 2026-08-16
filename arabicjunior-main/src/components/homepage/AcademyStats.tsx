"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, GraduationCap, MonitorPlay, School } from "lucide-react";
import Reveal from "../Reveal";
import CountUp from "../CountUp";

type StatItem = {
  key: string;
  value: string;
  label: string;
  desc: string;
};

type AcademyStatsData = {
  heading: string;
  subHeading: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  stats: StatItem[];
};

const iconAndStyles = [
  {
    icon: <Users className="h-6 w-6 text-[#FB6238]" />,
    iconBg: "bg-[#FFF2EE]",
    valueColor: "text-[#FB6238]",
  },
  {
    icon: <GraduationCap className="h-6 w-6 text-[#7C3AED]" />,
    iconBg: "bg-[#F5F3FF]",
    valueColor: "text-[#7C3AED]",
  },
  {
    icon: <MonitorPlay className="h-6 w-6 text-[#0062FC]" />,
    iconBg: "bg-[#EFF6FF]",
    valueColor: "text-[#0062FC]",
  },
  {
    icon: <School className="h-6 w-6 text-[#E05493]" />,
    iconBg: "bg-[#FDF2F8]",
    valueColor: "text-[#E05493]",
  },
];

const AcademyStats = () => {
  const [data, setData] = useState<AcademyStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/academy-stats`);
        const result = await res.json();
        if (res.ok && result.data) {
          setData(result.data);
        }
      } catch (e) {
        console.error("Failed to fetch academy stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const headingToRender = data?.heading || "Growing Together.";
  const subHeadingToRender = data?.subHeading || "Learning Without Limits.";
  const descriptionToRender = data?.description || "Thousands of students across the UAE and beyond trust Arabic Juniors for quality Arabic education and excellent learning experience.";
  const imageUrlToRender = data?.imageUrl || "/academy_stats_boy.png";

  const statsToRender = data?.stats && data.stats.length === 4 ? data.stats : [
    { key: "students", value: "3,500+", label: "Happy Students", desc: "Students from different schools learning Arabic with confidence." },
    { key: "teachers", value: "200+", label: "Expert Teachers", desc: "Qualified and experienced Arabic teachers dedicated to your success." },
    { key: "classes", value: "25,000+", label: "Classes Conducted", desc: "Interactive live classes delivered with engaging and effective methods." },
    { key: "schools", value: "50+", label: "Students from Schools", desc: "Students from various schools across the UAE and beyond." }
  ];

  return (
    <section 
      aria-label="academy-statistics" 
      className="relative py-12 sm:py-16 bg-white overflow-hidden"
    >
      {/* Decorative Floating Dots / Stars / Crosses */}
      <div className="absolute top-10 left-6 opacity-20 hidden md:block">
        {/* Dot grid pattern */}
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-1 w-1 bg-neutral-400 rounded-full" />
          ))}
        </div>
      </div>
      
      {/* Purple Star on left */}
      <div 
        className="absolute top-[25%] left-[8%] opacity-60 text-[#7C3AED] text-3xl font-black hidden md:block select-none animate-float-slow"
        style={{ animationDelay: '0.6s' }}
      >
        ✦
      </div>

      {/* Golden plus sign on left */}
      <div 
        className="absolute bottom-[45%] left-[12%] opacity-60 text-[#FB6238] text-2xl font-bold hidden md:block select-none animate-float-slow"
        style={{ animationDelay: '1.4s' }}
      >
        +
      </div>

      {/* Orange plus sign on right */}
      <div 
        className="absolute top-[20%] right-[32%] opacity-80 text-[#FB6238] text-2xl font-bold hidden lg:block select-none animate-float-slow"
        style={{ animationDelay: '2.2s' }}
      >
        +
      </div>

      {/* Grid Dots on top right */}
      <div className="absolute top-12 right-6 opacity-20 hidden lg:block">
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-1 w-1 bg-neutral-400 rounded-full" />
          ))}
        </div>
      </div>

      <div className="container relative z-10">
        {/* Top Split Layout: Intro & Boy Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
          
          {/* Left Intro Column (Centered content) */}
          <Reveal
            variant="left"
            className="lg:col-span-6 flex flex-col items-center text-center gap-y-4 lg:pr-6"
          >
            <div className="flex items-center gap-x-3 justify-center mb-1">
              <span className="text-[#FB6238] opacity-60 font-semibold">──✦──</span>
              <span className="text-xs sm:text-sm font-bold tracking-widest text-[#FB6238] uppercase">
                Academy Stats
              </span>
              <span className="text-[#FB6238] opacity-60 font-semibold">──✦──</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[2.75rem] font-bold leading-tight text-neutral-900">
              <span>{headingToRender}</span>
              <span className="block text-[#FB6238] mt-2 sm:mt-3">{subHeadingToRender}</span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg font-normal text-neutral-600 max-w-xl mx-auto leading-relaxed">
              {descriptionToRender}
            </p>
          </Reveal>

          {/* Right Image Column (Only Static Image - Larger Width) */}
          <Reveal
            variant="right"
            delay={120}
            className="lg:col-span-6 flex justify-center lg:justify-end relative w-full"
          >
            {/* Image Wrapper */}
            <div className="relative w-full max-w-[560px] h-[340px] sm:h-[420px] md:h-[480px] flex items-center justify-center lg:justify-end">
              <Image
                src={imageUrlToRender}
                alt="Smiling boy studying at desk"
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-contain"
                priority
              />
            </div>
          </Reveal>

        </div>

        {/* Bottom Layout: Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {statsToRender.map((stat, index) => {
            const style = iconAndStyles[index % iconAndStyles.length];
            return (
              <Reveal
                key={index}
                variant="rise"
                index={index}
                step={110}
                className="bg-white border border-neutral-100/80 rounded-xl p-5 hover:border-neutral-200 hover-lift flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Title Row */}
                  <div className="flex items-center gap-x-2.5 mb-3">
                    <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                      {style.icon}
                    </div>
                    <div className="flex flex-col min-w-0">
                      {/* Counts up from zero the first time it scrolls into
                          view. The finished figure is what renders on the
                          server, so it is still in the HTML. */}
                      <CountUp
                        value={stat.value}
                        className={`text-xl sm:text-2xl font-bold leading-none tabular-nums ${style.valueColor}`}
                      />
                      <span className="text-[11px] sm:text-xs xl:text-sm font-extrabold text-neutral-900 mt-1 leading-tight whitespace-nowrap">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm md:text-[15px] text-neutral-700 leading-relaxed font-medium mt-2">
                  {stat.desc}
                </p>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default AcademyStats;
