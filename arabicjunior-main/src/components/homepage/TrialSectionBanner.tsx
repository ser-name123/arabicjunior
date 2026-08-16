"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gift,
  ArrowRight,
  ClipboardCheck,
  MonitorPlay,
  BookOpenCheck,
  MessageSquareMore,
  GraduationCap,
  Users2,
  BookOpen,
  HelpCircle
} from "lucide-react";
import { Button } from "../ui/button-2";
import Reveal from "../Reveal";

const localFeatures = [
  { title: "Personalised Assessment", icon: "ClipboardCheck" },
  { title: "Live Interactive Lesson", icon: "MonitorPlay" },
  { title: "UAE Curriculum Support", icon: "BookOpenCheck" },
  { title: "Parent Feedback", icon: "MessageSquareMore" }
];

const localBottomCards = [
  { title: "Expert Teachers", desc: "Experienced native & fluent Arabic instructors.", icon: "GraduationCap" },
  { title: "Structured Learning", desc: "Well-planned lessons designed for steady progress.", icon: "BookOpen" },
  { title: "Engaging & Fun", desc: "Interactive activities that make learning enjoyable.", icon: "Users2" }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "ClipboardCheck": return ClipboardCheck;
    case "MonitorPlay": return MonitorPlay;
    case "BookOpenCheck": return BookOpenCheck;
    case "MessageSquareMore": return MessageSquareMore;
    case "GraduationCap": return GraduationCap;
    case "Users2": return Users2;
    case "BookOpen": return BookOpen;
    default: return HelpCircle;
  }
};

const TrialSectionBanner = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/homepage-trial`);
        const result = await res.json();
        if (res.ok && result.data) {
          setSettings(result.data);
        }
      } catch (err) {
        console.error("Error loading homepage trial settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const badgeText = settings?.badgeText || "Free Trial Class";
  const heading = settings?.heading || "Let Your Child Experience";
  const headingHighlight = settings?.headingHighlight || "Arabic Learning";
  const headingSuffix = settings?.headingSuffix || "the Right Way";
  const description = settings?.description || "Give your child a chance to experience a personalized online Arabic lesson with an experienced teacher.";
  
  const features = settings?.features || localFeatures;
  const btnBookText = settings?.btnBookText || "Book a Free Trial for My Child";
  const btnDetailsText = settings?.btnDetailsText || "More Details";
  const subtext1 = settings?.subtext1 || "No long-term commitment.";
  const subtext2 = settings?.subtext2 || "Discover the right learning approach for your child.";
  const imageUrl = settings?.imageUrl || "/free_trial_banner_student.png";
  const bottomCards = settings?.bottomCards || localBottomCards;

  return (
    <section className="py-12 font-sans">
      <div className="container">
        <div className="bg-white border border-[#E2E8F0] shadow-[0px_4px_30px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden flex flex-col justify-between">
          
          {/* Main Section */}
          <div className="p-6 md:pl-12 md:pr-0 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-white relative overflow-hidden">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 z-10">
              
              {/* Orange Badge */}
              <Reveal variant="up" delay={50}>
                <div className="inline-flex items-center gap-1.5 bg-[#FF4500] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  <Gift size={14} />
                  {badgeText}
                </div>
              </Reveal>

              {/* Title with Custom Wavy Underline */}
              <Reveal variant="up" delay={100}>
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-[42px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                    {heading}{" "}
                    <span className="relative inline-block text-[#FB6238]">
                      {headingHighlight}
                      {/* SVG Wavy Underline */}
                      <span className="absolute -bottom-2 left-0 w-full text-[#FBBF24]">
                        <svg className="w-full h-2.5" viewBox="0 0 100 10" preserveAspectRatio="none" fill="none">
                          <path 
                            d="M0,5 Q12.5,0 25,5 T50,5 T75,5 T100,5" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </span>{" "}
                    {headingSuffix}
                  </h2>
                </div>
              </Reveal>

              {/* Subtitle description */}
              <Reveal variant="up" delay={150}>
                <p className="text-neutral-600 text-sm md:text-base leading-relaxed pt-2">
                  {description}
                </p>
              </Reveal>

              {/* 4 Feature Circles */}
              <Reveal variant="up" delay={200}>
                <div className="grid grid-cols-4 gap-3 pt-4">
                  {features.map((feat: any, idx: number) => {
                    const Icon = getIconComponent(feat.icon);
                    const bgs = ["bg-[#FFF5F1]", "bg-[#F0FAF0]", "bg-[#FFFDF0]", "bg-[#F0F7FF]"];
                    const borders = ["border-[#FFD0BD]", "border-[#D1EED1]", "border-[#FEEFD0]", "border-[#D0E7FF]"];
                    const textColors = ["text-[#FA4E1A]", "text-[#34B53A]", "text-[#FFA800]", "text-[#02A0FC]"];
                    
                    return (
                      <div key={idx} className="flex flex-col items-center text-center space-y-2">
                        <div className={`w-12 h-12 rounded-full ${bgs[idx % bgs.length]} border ${borders[idx % borders.length]} flex items-center justify-center ${textColors[idx % textColors.length]} shadow-sm`}>
                          <Icon size={20} />
                        </div>
                        <span 
                          className="text-xs md:text-sm font-semibold text-neutral-800 leading-snug"
                          dangerouslySetInnerHTML={{ __html: feat.title.replace(/\s/g, "<br />") }}
                        />
                      </div>
                    );
                  })}
                </div>
              </Reveal>

              {/* Action Buttons */}
              <Reveal variant="up" delay={250}>
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Link href="/register">
                    <Button className="w-full sm:w-auto h-13 px-8 bg-[#FB6238] hover:bg-[#E04E26] text-white font-bold text-base rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
                      {btnBookText}
                      <ArrowRight size={17} />
                    </Button>
                  </Link>
                  <Link href="/trial-landing">
                    <Button variant="outline" className="w-full sm:w-auto h-13 px-7 border-2 border-[#FB6238] text-[#FB6238] hover:bg-[#FFF5F1] font-bold text-base rounded-xl flex items-center justify-center gap-2 transition-all">
                      {btnDetailsText}
                    </Button>
                  </Link>
                </div>
              </Reveal>

              {/* Subtext info */}
              <Reveal variant="up" delay={300}>
                <div className="text-xs md:text-sm font-normal text-neutral-500 space-y-1 pt-2">
                  {subtext1 && <p>{subtext1}</p>}
                  {subtext2 && <p>{subtext2}</p>}
                </div>
              </Reveal>
            </div>

            {/* Right Image Column (Only Image - Flush Right, Extra Large Size) */}
            <Reveal variant="scale" delay={150} className="lg:col-span-6 flex justify-end items-center relative z-10 w-full h-full pr-0">
              <div className="w-full max-w-[800px] h-[420px] sm:h-[500px] md:h-[580px] lg:h-[640px] relative flex items-center justify-end">
                <Image
                  src={imageUrl}
                  alt="Free trial Arabic class illustration"
                  fill
                  className="object-contain object-right"
                  priority
                />
              </div>
            </Reveal>

          </div>

          {/* Bottom Horizontal Value Proposition Bar */}
          <div className="border-t border-[#F1F5F9] bg-[#FAFAFA] px-6 py-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0 z-10">
            {bottomCards.map((card: any, idx: number) => {
              const Icon = getIconComponent(card.icon);
              const bgs = ["bg-[#E6F7F0]", "bg-[#FFF9E6]", "bg-[#EEF2FF]"];
              const borders = ["border-[#A7E2CB]", "border-[#FEE19A]", "border-[#C7D2FE]"];
              const textColors = ["text-[#00A389]", "text-[#FFC000]", "text-[#4F46E5]"];
              
              return (
                <Reveal key={idx} variant="up" index={idx} delay={300} className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full ${bgs[idx % bgs.length]} border ${borders[idx % borders.length]} ${textColors[idx % textColors.length]} flex items-center justify-center shrink-0 shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-neutral-800">{card.title}</h4>
                    <p className="text-xs text-neutral-500 font-normal mt-0.5">{card.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrialSectionBanner;
