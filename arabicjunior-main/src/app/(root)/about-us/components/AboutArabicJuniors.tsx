"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  MessageSquare,
  BookOpen,
  Smile,
  GraduationCap,
  Target,
  ShieldCheck,
  Star,
  MessageCircle,
} from "lucide-react";
import Reveal from "@/components/Reveal";

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Users": return Users;
    case "MessageSquare": return MessageSquare;
    case "BookOpen": return BookOpen;
    case "Smile": return Smile;
    case "GraduationCap": return GraduationCap;
    case "Target": return Target;
    case "ShieldCheck": return ShieldCheck;
    default: return Users;
  }
};

const defaultFeatureCards = [
  {
    title: "Passionate About Arabic Learning",
    desc: "At Arabic Juniors, we make Arabic learning simple, engaging, and accessible for learners of all ages. Our experienced teachers create a supportive environment that builds confidence and strong language skills.",
    icon: "Users",
  },
  {
    title: "Practical Communication Focus",
    desc: "Our instructors help students improve their speaking, reading, writing, and listening skills through structured lessons and regular practice. We encourage active participation so learners can use Arabic naturally in everyday situations.",
    icon: "MessageSquare",
  },
  {
    title: "Well-Planned Arabic Language Course",
    desc: "We offer a well-planned Arabic language course suitable for beginners and students who want to strengthen their existing knowledge. Every lesson helps learners progress step by step with continuous guidance from experienced teachers.",
    icon: "BookOpen",
  },
  {
    title: "Special Approach for Young Learners",
    desc: "Our Arabic for kids program includes engaging activities, interactive exercises, and age-appropriate lessons that make learning both fun and effective. We inspire children to build a strong foundation in the language from an early age.",
    icon: "Smile",
  },
];

const defaultBottomCards = [
  {
    title: "Experienced Teachers",
    desc: "Qualified and passionate instructors dedicated to your child's success.",
    icon: "Users",
  },
  {
    title: "Interactive Learning",
    desc: "Engaging lessons with activities that make learning enjoyable and effective.",
    icon: "GraduationCap",
  },
  {
    title: "Proven Progress",
    desc: "Structured approach that helps learners build skills step by step.",
    icon: "Target",
  },
  {
    title: "Safe & Supportive",
    desc: "A friendly and encouraging environment where every learner feels valued.",
    icon: "ShieldCheck",
  },
];

const AboutArabicJuniors = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
        const res = await fetch(`${baseUrl}/about-juniors`);
        const result = await res.json();
        if (res.ok && result.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch about juniors settings:", err);
      }
    };
    fetchData();
  }, []);

  const badgeText = data?.badgeText || "About Arabic Juniors";
  const heading = data?.heading || "Making";
  const headingHighlight = data?.headingHighlight || "Arabic";
  const headingSuffix = data?.headingSuffix || "Learning Simple, Engaging & Accessible";
  const imageUrl = data?.imageUrl || "/free_trial_banner_student.png";
  const featureCards = data?.featureCards && data.featureCards.length ? data.featureCards : defaultFeatureCards;
  const bottomCards = data?.bottomCards && data.bottomCards.length ? data.bottomCards : defaultBottomCards;

  const cardStyles = [
    { titleColor: "text-[#FB6238]", bg: "bg-[#FFF2EE]", border: "border-[#FFD0BD]", text: "text-[#FB6238]" },
    { titleColor: "text-[#EAB308]", bg: "bg-[#FEFCE8]", border: "border-[#FEF08A]", text: "text-[#EAB308]" },
    { titleColor: "text-[#EC4899]", bg: "bg-[#FDF2F8]", border: "border-[#FBCFE8]", text: "text-[#EC4899]" },
    { titleColor: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]", border: "border-[#DDD6FE]", text: "text-[#8B5CF6]" },
  ];

  const bottomStyles = [
    "bg-[#FB6238]",
    "bg-[#F59E0B]",
    "bg-[#EC4899]",
    "bg-[#8B5CF6]",
  ];

  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden font-sans">
      <div className="container relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <Reveal variant="up" delay={50} className="text-center max-w-3xl mx-auto mb-12 relative">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-[#FB6238] opacity-60 font-semibold">──✦──</span>
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#FB6238] uppercase">
              {badgeText}
            </span>
            <span className="text-[#FB6238] opacity-60 font-semibold">──✦──</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            {heading}{" "}
            <span className="text-[#FB6238]">{headingHighlight}</span>{" "}
            <span className="block mt-1">{headingSuffix}</span>
          </h2>

          <div className="hidden lg:block absolute -top-4 -right-16 pointer-events-none select-none">
            <span className="text-[#FB6238] text-4xl font-extrabold font-serif absolute -top-2 right-12 animate-bounce">
              أ
            </span>
            <span className="text-[#F59E0B] text-3xl font-extrabold font-serif absolute top-6 right-24">
              ب
            </span>
            <span className="text-[#EC4899] text-2xl font-extrabold font-serif absolute top-12 right-6">
              ت
            </span>
          </div>
        </Reveal>

        {/* MAIN 2-COLUMN SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* LEFT COLUMN: Graphic Card (Full Width & Height Image, No Extra Background) */}
          <Reveal variant="left" delay={100} className="lg:col-span-6 flex flex-col justify-center">
            <div className="relative w-full h-full min-h-[460px] lg:min-h-[520px] rounded-3xl overflow-hidden shadow-sm flex items-center justify-center">
              
              {/* Main Image (Spans Full Container Width & Height) */}
              <Image
                src={imageUrl}
                alt="Arabic Juniors Online Learning Class"
                fill
                className="object-cover rounded-3xl"
                priority
              />

              {/* Floating Pink Chat Bubble (Top Left) */}
              <div className="absolute top-6 left-6 bg-[#EC4899] text-white p-3 rounded-2xl shadow-lg z-20 animate-pulse">
                <MessageCircle size={22} className="fill-white" />
              </div>

              {/* White Badge Card (Bottom Left) */}
              <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm border border-neutral-100 rounded-2xl p-3.5 sm:p-4 shadow-xl z-20 flex items-center gap-3 max-w-[230px]">
                <div className="w-10 h-10 rounded-full bg-[#FFF2EE] border border-[#FFD0BD] text-[#FB6238] flex items-center justify-center shrink-0">
                  <Star size={20} className="fill-[#FB6238]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">Learn Arabic</h4>
                  <p className="text-[11px] text-neutral-500 font-medium mt-0.5 leading-tight">
                    Build Confidence <br /> Grow Together
                  </p>
                </div>
              </div>

            </div>
          </Reveal>

          {/* RIGHT COLUMN: 4 Feature Cards */}
          <Reveal variant="right" delay={150} className="lg:col-span-6 flex flex-col justify-between gap-4">
            {featureCards.map((card: any, idx: number) => {
              const Icon = getIconComponent(card.icon);
              const style = cardStyles[idx % cardStyles.length];
              return (
                <div key={idx} className="bg-white border border-neutral-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full ${style.bg} border ${style.border} ${style.text} flex items-center justify-center shrink-0 shadow-xs mt-0.5`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className={`text-base sm:text-lg font-bold ${style.titleColor}`}>{card.title}</h3>
                    <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium mt-1">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </Reveal>

        </div>

        {/* BOTTOM 4 VALUE CARDS BAR */}
        <Reveal variant="up" delay={200}>
          <div className="bg-[#FFF8F5] border border-[#FFE8E0] rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bottomCards.map((card: any, idx: number) => {
              const Icon = getIconComponent(card.icon);
              const bgClass = bottomStyles[idx % bottomStyles.length];
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${bgClass} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-neutral-900">{card.title}</h4>
                    <p className="text-xs sm:text-sm text-neutral-700 font-medium mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

      </div>
    </section>
  );
};

export default AboutArabicJuniors;
