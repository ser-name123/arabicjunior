"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  Gift, 
  ArrowRight,
  ClipboardList,
  Monitor,
  UserCheck,
  HeartHandshake,
  BookOpen,
  PencilRuler,
  Tv,
  Hourglass,
  School,
  Target,
  Plus,
  Minus,
  HelpCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button-2";

const localWhyTakeTrialItems = [
  {
    title: "Understand Their Level",
    titleColor: "text-[#0B46AD]",
    bgColor: "bg-[#EBF2FC]",
    borderColor: "border-[#D0E7FF]",
    iconColor: "text-[#0B46AD]",
    icon: "ClipboardList",
    desc: "We identify your child's current Arabic abilities."
  },
  {
    title: "Experience Our Classes",
    titleColor: "text-[#FB6238]",
    bgColor: "bg-[#FFF5F1]",
    borderColor: "border-[#FFD0BD]",
    iconColor: "text-[#FB6238]",
    icon: "Monitor",
    desc: "See how our interactive lessons work."
  },
  {
    title: "Meet a Teacher",
    titleColor: "text-[#00A389]",
    bgColor: "bg-[#E6F7F0]",
    borderColor: "border-[#A7E2CB]",
    iconColor: "text-[#00A389]",
    icon: "UserCheck",
    desc: "Meet an experienced Arabic teacher."
  },
  {
    title: "Get Parent Feedback",
    titleColor: "text-[#FFA800]",
    bgColor: "bg-[#FFFDF0]",
    borderColor: "border-[#FEEFD0]",
    iconColor: "text-[#FFA800]",
    icon: "HeartHandshake",
    desc: "Understand strengths and areas to improve."
  }
];

const processSteps = [
  {
    num: "01",
    numBg: "bg-[#0B46AD]",
    title: "Understand Your Child",
    description: "We learn about your child's grade, school curriculum, previous Arabic learning and current challenges.",
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="38" r="8" fill="#EBF2FC" stroke="#0B46AD" strokeWidth="2"/>
        <path d="M12 56 C12 48, 32 48, 32 56" stroke="#0B46AD" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="42" cy="38" r="8" fill="#FFF5F1" stroke="#FB6238" strokeWidth="2"/>
        <path d="M32 56 C32 48, 52 48, 52 56" stroke="#FB6238" strokeWidth="2" strokeLinecap="round"/>
        <rect x="20" y="8" width="24" height="15" rx="4" fill="white" stroke="#0B46AD" strokeWidth="1.5"/>
        <circle cx="26" cy="15" r="1.5" fill="#0B46AD"/>
        <circle cx="32" cy="15" r="1.5" fill="#0B46AD"/>
        <circle cx="38" cy="15" r="1.5" fill="#0B46AD"/>
        <path d="M28 23 L25 26 L25 23 Z" fill="white" stroke="#0B46AD" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    num: "02",
    numBg: "bg-[#FB6238]",
    title: "Assess Their Level",
    description: "The teacher evaluates key Arabic skills appropriate for their age and grade.",
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="18" y="10" width="28" height="44" rx="4" fill="#E6F7F0" stroke="#00A389" strokeWidth="2"/>
        <rect x="26" y="5" width="12" height="7" rx="1.5" fill="#00A389"/>
        <line x1="25" y1="22" x2="39" y2="22" stroke="#00A389" strokeWidth="2" strokeLinecap="round"/>
        <line x1="25" y1="32" x2="39" y2="32" stroke="#00A389" strokeWidth="2" strokeLinecap="round"/>
        <line x1="25" y1="42" x2="35" y2="42" stroke="#00A389" strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 22 L24 22 M22 32 L24 32 M22 42 L24 42" stroke="#00A389" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    num: "03",
    numBg: "bg-[#FFA800]",
    title: "Experience Arabic Learning",
    description: "Your child participates in an interactive lesson designed around their level.",
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="14" width="48" height="32" rx="4" fill="#FFFDF0" stroke="#FFA800" strokeWidth="2"/>
        <line x1="4" y1="48" x2="60" y2="48" stroke="#FFA800" strokeWidth="3.5" strokeLinecap="round"/>
        <rect x="22" y="22" width="20" height="16" rx="2" fill="#FFA800" opacity="0.15"/>
        <circle cx="32" cy="27" r="4.5" stroke="#FFA800" strokeWidth="2"/>
        <path d="M25 38 C25 33, 39 33, 39 38" stroke="#FFA800" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    num: "04",
    numBg: "bg-[#9333EA]",
    title: "Recommend Next Steps",
    description: "We share feedback and suggest the most suitable learning approach.",
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" stroke="#9333EA" strokeWidth="2" fill="#F3E8FF"/>
        <circle cx="32" cy="32" r="14" stroke="#9333EA" strokeWidth="2"/>
        <circle cx="32" cy="32" r="6" fill="#9333EA"/>
        <line x1="48" y1="16" x2="34" y2="30" stroke="#9333EA" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M50 14 L50 21 L43 21 Z" fill="#9333EA" stroke="#9333EA" strokeWidth="1"/>
      </svg>
    )
  }
];

const localChildAssessSkills = [
  {
    title: "Reading",
    textColor: "text-[#00A389]",
    desc: "Ability to read Arabic words and sentences.",
    bgColor: "bg-[#E6F7F0]",
    icon: "BookOpen",
  },
  {
    title: "Writing",
    textColor: "text-[#FB6238]",
    desc: "Letter formation, word writing and sentence writing.",
    bgColor: "bg-[#FFF5F1]",
    icon: "ClipboardList",
  },
  {
    title: "Speaking",
    textColor: "text-[#E05493]",
    desc: "Oral fluency and pronunciation.",
    bgColor: "bg-[#FDF2F8]",
    icon: "UserCheck",
  },
  {
    title: "Vocabulary",
    textColor: "text-[#0062FC]",
    desc: "Knowledge of words and expressions.",
    bgColor: "bg-[#EFF6FF]",
    icon: "HeartHandshake",
  },
  {
    title: "Listening",
    textColor: "text-[#FFA800]",
    desc: "Understanding spoken Arabic at their level.",
    bgColor: "bg-[#FFFDF0]",
    icon: "Gift",
  },
  {
    title: "Grammar",
    textColor: "text-[#EF4444]",
    desc: "Understanding grammar rules and structure.",
    bgColor: "bg-[#FFF0F0]",
    icon: "CheckCircle2",
  }
];

const localParentChooseCards = [
  {
    title: "Personalised Learning",
    desc: "Lessons adapted to your child's current ability.",
    icon: "PencilRuler",
    bgColor: "bg-[#FFF5F1]",
    borderColor: "border-[#FFD0BD]",
    iconColor: "text-[#FB6238]"
  },
  {
    title: "One-to-One Attention",
    desc: "Focused attention from the teacher in every class.",
    icon: "Tv",
    bgColor: "bg-[#E6F7F0]",
    borderColor: "border-[#A7E2CB]",
    iconColor: "text-[#00A389]"
  },
  {
    title: "Experienced Teachers",
    desc: "Teachers who understand how children learn.",
    icon: "UserCheck",
    bgColor: "bg-[#EBF2FC]",
    borderColor: "border-[#D0E7FF]",
    iconColor: "text-[#0B46AD]"
  },
  {
    title: "Interactive Classes",
    desc: "Engaging lessons that keep children involved.",
    icon: "Hourglass",
    bgColor: "bg-[#FFFDF0]",
    borderColor: "border-[#FEEFD0]",
    iconColor: "text-[#FFA800]"
  },
  {
    title: "School Support",
    desc: "Help with school curriculum, homework and exams.",
    icon: "School",
    bgColor: "bg-[#F5F3FF]",
    borderColor: "border-[#DDD6FE]",
    iconColor: "text-[#7C3AED]"
  },
  {
    title: "Clear Parent Feedback",
    desc: "Know your child's strengths and areas of improvement.",
    icon: "Target",
    bgColor: "bg-[#FFF0F0]",
    borderColor: "border-[#FECACA]",
    iconColor: "text-[#EF4444]"
  }
];

const localGettingStartedSteps = [
  {
    num: "1",
    numBg: "bg-[#0B46AD]",
    title: "Tell Us About Your Child",
    desc: "Fill in the short trial request form."
  },
  {
    num: "2",
    numBg: "bg-[#FB6238]",
    title: "We Arrange the Trial",
    desc: "We find a suitable teacher and convenient time."
  },
  {
    num: "3",
    numBg: "bg-[#FFA800]",
    title: "Your Child Attends the Trial",
    desc: "Join the online Arabic class and enjoy learning."
  },
  {
    num: "4",
    numBg: "bg-[#9333EA]",
    title: "Receive Feedback",
    desc: "We discuss your child's level and learning plan."
  }
];

const localChildRightBullets = [
  "Need help with Arabic at school",
  "Find Arabic reading or writing difficult",
  "Need help with grammar and vocabulary",
  "Want to improve speaking skills",
  "Need extra support before exams",
  "Are starting Arabic for the first time",
  "Want personalised one-to-one tuition"
];

const localFaqItems = [
  {
    question: "Is the trial class free?",
    answer: "Yes, the trial class is 100% free with no commitment required."
  },
  {
    question: "How long is the trial class?",
    answer: "The trial class is typically 30 to 45 minutes long, allowing the teacher to evaluate your child and conduct a mini-lesson."
  },
  {
    question: "Who can attend the trial?",
    answer: "The trial is for school-aged children (KG to Grade 6) who want to improve their school Arabic performance or start learning Arabic."
  },
  {
    question: "Is the trial one-to-one?",
    answer: "Yes, all our trial classes and regular classes are strictly 1-on-1 to ensure personalized attention."
  },
  {
    question: "Will you assess my child's Arabic level?",
    answer: "Yes, our teacher will evaluate your child's reading, writing, speaking, and listening skills during the session."
  },
  {
    question: "Do you support UAE school curricula?",
    answer: "Yes, we support all major school boards in the UAE, including UAE MOE, CBSE, British, IB, and American."
  },
  {
    question: "Do I have to enroll after the trial?",
    answer: "No, there is absolutely no obligation to enroll. The trial is for you to experience our classes first."
  }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "ClipboardList": return ClipboardList;
    case "Monitor": return Monitor;
    case "UserCheck": return UserCheck;
    case "HeartHandshake": return HeartHandshake;
    case "BookOpen": return BookOpen;
    case "Gift": return Gift;
    case "CheckCircle2": return CheckCircle2;
    case "PencilRuler": return PencilRuler;
    case "Tv": return Tv;
    case "Hourglass": return Hourglass;
    case "School": return School;
    case "Target": return Target;
    default: return HelpCircle;
  }
};

export default function TrialLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const slugParam = unwrappedParams.slug;

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/trial-landing/${slugParam}`);
        const result = await res.json();
        if (res.ok && result.data) {
          setSettings(result.data);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // If loading and it's not the default route, show loading
  if (loading && slugParam !== "trial-landing") {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[50vh] bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-neutral-500 text-sm mt-2 font-medium">Loading...</p>
      </div>
    );
  }

  // Once loaded, if the database slug doesn't match the current URL slug, trigger 404
  const dbSlug = settings?.slug || "trial-landing";
  if (!loading && dbSlug !== slugParam) {
    notFound();
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleBookClick = () => {
    router.push("/register");
  };

  // Fallback to defaults if settings are not loaded yet
  const heroBadgeText = settings?.heroBadgeText || "Free Trial Class";
  const heroHeading = settings?.heroHeading || "Discover Your Child's";
  const heroHeadingHighlight = settings?.heroHeadingHighlight || "Arabic";
  const heroSubheading = settings?.heroSubheading || "Start With a Free Trial Class";
  const heroDescription1 = settings?.heroDescription1 || "Not sure what level your child is at or what kind of Arabic support they need?";
  const heroDescription2 = settings?.heroDescription2 || "Let your child experience a personalized online Arabic class with one of our experienced teachers.";
  const heroBullets = settings?.heroBullets || [
    "Personalised Evaluation",
    "Live Interactive Lesson",
    "Parent Feedback",
    "UAE Curriculum Support"
  ];
  const heroCtaText = settings?.heroCtaText || "Book My Child's Free Trial";
  const heroCtaSubtext = settings?.heroCtaSubtext || "For UAE School Students | KG – Grade 6";
  const heroImageUrl = settings?.heroImageUrl || "/free_trial_landing_student.png";

  const whySubheader = settings?.whySubheader || "Why Take a Trial?";
  const whyHeading = settings?.whyHeading || "Before You Enrol, See How Your Child Learns";
  const whyDescription = settings?.whyDescription || "Our trial class gives both parents and students an opportunity to experience our teaching approach before committing to a course.";
  const whyCards = settings?.whyCards || localWhyTakeTrialItems;

  const processSubheader = settings?.processSubheader || "What Happens During The Trial?";
  const processHeading = settings?.processHeading || "A Simple 4-Step Process";

  const assessSubheader = settings?.assessSubheader || "What Do We Assess?";
  const assessTitle = settings?.assessTitle || "A Trial Designed Around Your Child";
  const assessDescription = settings?.assessDescription || "We evaluate important Arabic skills to understand your child's current level.";
  const assessSkills = settings?.assessSkills || localChildAssessSkills;

  const curriculaSubheader = settings?.curriculaSubheader || "Arabic Support For UAE Curricula";
  const curriculaTitle = settings?.curriculaTitle || "We Support All Major UAE School Curricula";
  const curriculaDescription = settings?.curriculaDescription || "We tailor our classes to match your child's school requirements.";
  const curriculaBadges = settings?.curriculaBadges || ["UAE MOE", "CBSE", "British", "IB", "American"];

  const chooseSubheader = settings?.chooseSubheader || "Why Parents Choose Our Trial";
  const chooseHeading = settings?.chooseHeading || "More Than Just a Demo Class";
  const chooseCards = settings?.chooseCards || localParentChooseCards;

  const onboardingSubheader = settings?.onboardingSubheader || "How It Works";
  const onboardingHeading = settings?.onboardingHeading || "Getting Started Is Easy";
  const onboardingSteps = settings?.onboardingSteps || localGettingStartedSteps;

  const suitabilitySubheader = settings?.suitabilitySubheader || "Who Is The Trial For?";
  const suitabilityTitle = settings?.suitabilityTitle || "Is This Right for Your Child?";
  const suitabilityDescription = settings?.suitabilityDescription || "Our trial class is ideal for UAE school students who:";
  const suitabilityBullets = settings?.suitabilityBullets || localChildRightBullets;
  const suitabilityImageUrl = settings?.suitabilityImageUrl || "/arabic-studies.png";

  const faqSubheader = settings?.faqSubheader || "Frequently Asked Questions";
  const faqTitle = settings?.faqTitle || "Frequently Asked Questions";
  const faqItems = settings?.faqItems || localFaqItems;

  const ctaHeading = settings?.ctaHeading || "Ready to See Your Child Grow in Arabic?";
  const ctaDescription = settings?.ctaDescription || "Give your child the opportunity to experience a personalized Arabic lesson with an experienced teacher.";
  const ctaButtonText = settings?.ctaButtonText || "Book a Free Trial Class Today";
  const ctaSubtext = settings?.ctaSubtext || "No long-term commitment. Discover the right learning approach for your child.";
  const ctaImageUrl = settings?.ctaImageUrl || "/female-teacher.png";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      
      {/* 1. First Section: Mockup-Accurate Hero */}
      <section className="py-12 md:py-20 relative overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Blue Badge */}
              <div className="inline-flex items-center gap-1.5 bg-[#0B46AD] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                <Gift size={14} />
                {heroBadgeText}
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                  {heroHeading}<br />
                  <span className="text-[#FB6238]">{heroHeadingHighlight}</span> Potential
                </h1>
                <h3 className="text-xl md:text-2xl font-bold text-[#FB6238]">
                  {heroSubheading}
                </h3>
              </div>

              {/* Description Paragraphs */}
              <div className="text-neutral-600 text-sm md:text-base leading-relaxed space-y-3 max-w-2xl">
                {heroDescription1 && <p>{heroDescription1}</p>}
                {heroDescription2 && <p>{heroDescription2}</p>}
              </div>

              {/* 2x2 Feature Checkmarks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 pt-2">
                {heroBullets.map((bullet: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#0B46AD] shrink-0" size={20} />
                    <span className="text-sm font-bold text-neutral-800">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button & Grade Subtext */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleBookClick}
                  className="w-full sm:w-auto h-14 px-8 bg-[#FB6238] hover:bg-[#E04E26] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-base"
                >
                  {heroCtaText}
                  <ArrowRight size={18} />
                </Button>
                <p className="text-xs md:text-sm font-medium text-neutral-500">
                  {heroCtaSubtext}
                </p>
              </div>

            </div>

            {/* Right Image Column with Custom Wave Background and Floating Letters */}
            <div className="lg:col-span-5 flex justify-center relative w-full py-8 lg:py-0">
              
              {/* Soft Blue Wave/Circle Background behind student */}
              <div className="absolute w-[360px] h-[360px] md:w-[450px] md:h-[450px] bg-[#EBF2FC] rounded-full pointer-events-none z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90" />

              {/* Floating Arabic Letters */}
              <span className="absolute top-4 right-12 text-[#FF8B66] text-5xl font-bold font-serif pointer-events-none select-none z-20 animate-float-slow">
                ج
              </span>
              <span className="absolute top-1/3 left-4 text-[#4ADE80] text-5xl font-bold font-serif pointer-events-none select-none z-20 animate-float-slow" style={{ animationDelay: '1.5s' }}>
                أ
              </span>
              <span className="absolute bottom-12 right-10 text-[#FACC15] text-4xl font-bold font-serif pointer-events-none select-none z-20 animate-float-slow" style={{ animationDelay: '2.5s' }}>
                ब
              </span>

              {/* Image Container */}
              <div className="relative w-72 h-72 sm:w-[26rem] sm:h-[26rem] select-none pointer-events-none flex items-center justify-center animate-float-slow z-10">
                <Image
                  src={heroImageUrl}
                  alt="Smiling student waving on laptop"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. Second Section: Why Take a Trial? */}
      <section className="py-14 md:py-20 bg-white border-y border-neutral-100">
        <div className="container">
          
          {/* Header Description */}
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#FB6238] uppercase">
              {whySubheader}
            </span>
            <h2 className="text-3xl md:text-[38px] font-extrabold text-[#0F172A] leading-tight">
              {whyHeading}
            </h2>
            <p className="text-neutral-600 text-sm md:text-base max-w-2xl leading-relaxed pt-1">
              {whyDescription}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyCards.map((item: any, index: number) => {
              const IconComponent = getIconComponent(item.icon);
              return (
                <div 
                  key={index}
                  className="bg-white border border-[#E2E8F0] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] rounded-[20px] p-6 text-center space-y-4 hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col items-center"
                >
                  {/* Icon Circle */}
                  <div className={`w-14 h-14 rounded-full ${item.bgColor || 'bg-[#EBF2FC]'} border ${item.borderColor || 'border-[#D0E7FF]'} flex items-center justify-center ${item.iconColor || 'text-[#0B46AD]'} shadow-sm shrink-0`}>
                    <IconComponent size={24} />
                  </div>
                  
                  {/* Card Title */}
                  <h4 className={`text-base font-extrabold ${item.titleColor || 'text-[#0B46AD]'}`}>
                    {item.title}
                  </h4>
                  
                  {/* Card Description */}
                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal">
                    {item.desc || item.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Third Section: A Simple 4-Step Process */}
      <section className="py-16 md:py-24 bg-slate-50/30">
        <div className="container">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#FB6238] uppercase">
              {processSubheader}
            </span>
            <h2 className="text-3xl md:text-[38px] font-extrabold text-[#0F172A] leading-tight">
              {processHeading}
            </h2>
          </div>

          {/* Steps Timeline Box */}
          <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-8 md:p-12 shadow-[0px_10px_35px_rgba(15,23,42,0.02)] relative z-10 overflow-hidden">
            
            {/* Horizontal Timeline Connector (Desktop only) */}
            <div className="absolute top-[52px] left-[12.5%] right-[12.5%] w-[75%] h-[2px] hidden lg:block -z-10 bg-gradient-to-r from-[#0B46AD] via-[#FB6238] to-[#9333EA]" />
            
            {/* Intermediate Concentric Connection Loops */}
            <div className="absolute top-[45px] left-[37.5%] -translate-x-1/2 w-4.5 h-4.5 rounded-full border-2 border-[#FB6238] bg-white hidden lg:flex items-center justify-center -z-10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#0B46AD]" />
            </div>
            <div className="absolute top-[45px] left-[62.5%] -translate-x-1/2 w-4.5 h-4.5 rounded-full border-2 border-[#FFA800] bg-white hidden lg:flex items-center justify-center -z-10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#FB6238]" />
            </div>
            <div className="absolute top-[45px] left-[75%] -translate-x-1/2 w-4.5 h-4.5 rounded-full border-2 border-[#9333EA] bg-white hidden lg:flex items-center justify-center -z-10 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#FFA800]" />
            </div>

            {/* Steps Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
              {processSteps.map((step, index) => {
                return (
                  <div key={index} className="flex flex-col items-center text-center space-y-6 relative">
                    
                    {/* Number Badge */}
                    <div className={`w-12 h-12 rounded-full ${step.numBg} text-white font-extrabold flex items-center justify-center text-base shadow-md shrink-0 border-4 border-white`}>
                      {step.num}
                    </div>

                    {/* Step Content */}
                    <div className="space-y-3 flex-1">
                      <h4 className="text-lg font-extrabold text-[#0F172A]">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-normal max-w-[240px] mx-auto">
                        {step.description}
                      </p>
                    </div>

                    {/* Illustration at the bottom */}
                    <div className="h-20 flex items-center justify-center pt-2">
                      {step.illustration}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* 4. Fourth Section: Side-by-Side Dual Values (Assessments & Curricula) */}
      <section className="py-16 md:py-24 bg-white border-y border-neutral-100">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Card: A Trial Designed Around Your Child */}
            <div className="border border-[#E2E8F0] rounded-[24px] p-6 md:p-10 shadow-[0px_4px_25px_rgba(0,0,0,0.015)] flex flex-col justify-between space-y-8 bg-white hover:border-neutral-200 transition-all duration-300">
              
              {/* Card Header */}
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest text-[#FB6238] uppercase">
                  {assessSubheader}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight">
                  {assessTitle}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {assessDescription}
                </p>
              </div>

              {/* Radial Skills Diagram */}
              <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] mx-auto flex items-center justify-center scale-90 sm:scale-100 py-4 shrink-0">
                {/* Center Hub */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-slate-50 bg-white shadow-[0px_8px_20px_rgba(15,23,42,0.06)] flex flex-col items-center justify-center z-10 text-center select-none pointer-events-none">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Your</span>
                  <span className="text-xs sm:text-sm font-black text-[#0B46AD] uppercase leading-none">Child</span>
                </div>

                {/* Connecting Vector Lines */}
                <svg className="absolute inset-0 w-full h-full text-slate-200 -z-0 pointer-events-none" viewBox="0 0 100 100">
                  <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="50" y1="50" x2="80" y2="30" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="50" y1="50" x2="80" y2="70" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="50" y1="50" x2="50" y2="85" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="50" y1="50" x2="20" y2="70" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                  <line x1="50" y1="50" x2="20" y2="30" stroke="currentColor" strokeWidth="0.75" strokeDasharray="3 3" />
                </svg>

                {/* Hub 1: Reading (Top) */}
                <div className="absolute top-[2%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center w-20">
                  <div className="w-8 h-8 rounded-full bg-[#E6F7F0] border border-[#A7E2CB] text-[#00A389] flex items-center justify-center shadow-sm">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 mt-1 leading-none">Reading</span>
                </div>

                {/* Hub 2: Writing (Top Right) */}
                <div className="absolute top-[22%] right-[2%] flex flex-col items-center text-center w-20">
                  <div className="w-8 h-8 rounded-full bg-[#FFF5F1] border border-[#FFD0BD] text-[#FB6238] flex items-center justify-center shadow-sm">
                    <ClipboardList size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 mt-1 leading-none">Writing</span>
                </div>

                {/* Hub 3: Speaking (Bottom Right) */}
                <div className="absolute bottom-[22%] right-[2%] flex flex-col items-center text-center w-20">
                  <div className="w-8 h-8 rounded-full bg-[#FDF2F8] border border-[#FBCFE8] text-[#E05493] flex items-center justify-center shadow-sm">
                    <UserCheck size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 mt-1 leading-none">Speaking</span>
                </div>

                {/* Hub 4: Vocabulary (Bottom) */}
                <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 flex flex-col items-center text-center w-20">
                  <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#BFDBFE] text-[#0062FC] flex items-center justify-center shadow-sm">
                    <HeartHandshake size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 mt-1 leading-none">Vocabulary</span>
                </div>

                {/* Hub 5: Listening (Bottom Left) */}
                <div className="absolute bottom-[22%] left-[2%] flex flex-col items-center text-center w-20">
                  <div className="w-8 h-8 rounded-full bg-[#FFFDF0] border border-[#FEEFD0] text-[#FFA800] flex items-center justify-center shadow-sm">
                    <Gift size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 mt-1 leading-none">Listening</span>
                </div>

                {/* Hub 6: Grammar (Top Left) */}
                <div className="absolute top-[22%] left-[2%] flex flex-col items-center text-center w-20">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F0] border border-[#FECACA] text-[#EF4444] flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={14} />
                  </div>
                  <span className="text-[10px] font-bold text-neutral-800 mt-1 leading-none">Grammar</span>
                </div>

              </div>

              {/* 3x2 Grid Details List of Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100/80">
                {assessSkills.map((skill: any, index: number) => {
                  const SkillIcon = getIconComponent(skill.icon);
                  return (
                    <div key={index} className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg ${skill.bgColor || 'bg-[#E6F7F0]'} ${skill.textColor || 'text-[#00A389]'} flex items-center justify-center shrink-0`}>
                        <SkillIcon size={16} />
                      </div>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-[#0F172A]">{skill.title}</h5>
                        <p className="text-[11px] text-neutral-500 leading-normal">{skill.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Right Card: We Support All Major UAE School Curricula */}
            <div className="border border-[#E2E8F0] rounded-[24px] p-6 md:p-10 shadow-[0px_4px_25px_rgba(0,0,0,0.015)] flex flex-col justify-between space-y-8 bg-white hover:border-neutral-200 transition-all duration-300 relative overflow-hidden">
              
              {/* Card Header */}
              <div className="space-y-2 z-10">
                <span className="text-xs font-bold tracking-widest text-[#FB6238] uppercase">
                  {curriculaSubheader}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight">
                  {curriculaTitle}
                </h3>
                <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                  {curriculaDescription}
                </p>
              </div>

              {/* Curriculum Badges Row */}
              <div className="flex flex-wrap gap-2.5 z-10">
                {curriculaBadges.map((badge: string, idx: number) => {
                  const badgeBgs = ["bg-[#0B46AD]", "bg-[#FB6238]", "bg-[#0062FC]", "bg-[#7C3AED]", "bg-[#EF4444]"];
                  const selectedBg = badgeBgs[idx % badgeBgs.length];
                  return (
                    <span key={idx} className={`px-4 py-2 ${selectedBg} text-white text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm`}>
                      {badge}
                    </span>
                  );
                })}
              </div>

              {/* Dubai Skyline SVG Illustration at the base */}
              <div className="w-full pt-6 select-none pointer-events-none relative -mb-10 -mx-6 md:-mx-10 self-end opacity-85 z-0">
                <svg className="w-full h-auto text-[#C8D9F1]" viewBox="0 0 500 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 145 H500 V150 H0 Z" fill="#CBD5E1"/>
                  <path d="M 240 145 L 243 145 L 243 100 L 245 100 L 245 60 L 248 60 L 248 20 L 250 20 L 250 8 L 251 8 L 251 20 L 253 20 L 253 60 L 256 60 L 256 100 L 258 100 L 258 145 Z" fill="currentColor" />
                  <rect x="60" y="110" width="10" height="35" fill="currentColor" opacity="0.6"/>
                  <rect x="75" y="95" width="14" height="50" fill="currentColor"/>
                  <rect x="95" y="105" width="12" height="40" fill="currentColor" opacity="0.7"/>
                  <rect x="112" y="80" width="18" height="65" fill="currentColor"/>
                  <rect x="135" y="115" width="10" height="30" fill="currentColor" opacity="0.8"/>
                  <rect x="150" y="90" width="16" height="55" fill="currentColor"/>
                  <rect x="172" y="70" width="22" height="75" fill="currentColor"/>
                  <rect x="200" y="105" width="14" height="40" fill="currentColor" opacity="0.9"/>
                  <rect x="218" y="95" width="16" height="50" fill="currentColor"/>
                  <rect x="268" y="100" width="14" height="45" fill="currentColor"/>
                  <rect x="288" y="85" width="18" height="60" fill="currentColor"/>
                  <rect x="312" y="55" width="24" height="90" fill="currentColor"/>
                  <rect x="342" y="110" width="12" height="35" fill="currentColor" opacity="0.8"/>
                  <rect x="360" y="90" width="15" height="55" fill="currentColor"/>
                  <rect x="382" y="75" width="20" height="70" fill="currentColor"/>
                  <rect x="408" y="115" width="10" height="30" fill="currentColor" opacity="0.7"/>
                  <rect x="424" y="95" width="16" height="50" fill="currentColor"/>
                  <rect x="445" y="110" width="12" height="35" fill="currentColor" opacity="0.6"/>
                  <path d="M 30 145 Q 33 125 35 110" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                  <path d="M 35 110 Q 25 105 15 112" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M 35 110 Q 28 100 22 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M 35 110 Q 35 95 35 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M 35 110 Q 42 100 48 95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <path d="M 35 110 Q 45 105 55 112" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Fifth Section: More Than Just a Demo Class (6 Value Cards Grid) */}
      <section className="py-16 md:py-24 bg-[#FAFBFD] border-b border-neutral-100">
        <div className="container">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#FB6238] uppercase">
              {chooseSubheader}
            </span>
            <h2 className="text-3xl md:text-[38px] font-extrabold text-[#0F172A] leading-tight">
              {chooseHeading}
            </h2>
          </div>

          {/* Cards 6-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
            {chooseCards.map((card: any, index: number) => {
              const CardIcon = getIconComponent(card.icon);
              return (
                <div 
                  key={index}
                  className="bg-white border border-[#E2E8F0] shadow-[0px_4px_25px_rgba(15,23,42,0.01)] rounded-[20px] p-6 text-center space-y-4 hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col items-center justify-between min-h-[250px]"
                >
                  <div className="space-y-4 flex flex-col items-center w-full">
                    {/* Icon Circle */}
                    <div className={`w-12 h-12 rounded-full ${card.bgColor || 'bg-[#FFF5F1]'} border ${card.borderColor || 'border-[#FFD0BD]'} ${card.iconColor || 'text-[#FB6238]'} flex items-center justify-center shadow-sm shrink-0`}>
                      <CardIcon size={20} />
                    </div>

                    {/* Card Title */}
                    <h4 className="text-sm font-extrabold text-[#0F172A] leading-tight">
                      {card.title}
                    </h4>
                  </div>

                  {/* Card Description */}
                  <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Sixth Section: Getting Started Is Easy (4-Step Onboarding Timeline) */}
      <section className="py-16 md:py-24 bg-white border-b border-neutral-100">
        <div className="container">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#FB6238] uppercase">
              {onboardingSubheader}
            </span>
            <h2 className="text-3xl md:text-[38px] font-extrabold text-[#0F172A] leading-tight">
              {onboardingHeading}
            </h2>
          </div>

          {/* 4 Steps Row with Arrow Connectors */}
          <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-6 lg:gap-4 max-w-6xl mx-auto">
            {onboardingSteps.map((step: any, index: number) => {
              return (
                <React.Fragment key={index}>
                  
                  {/* Step Card */}
                  <div className="bg-white border border-[#E2E8F0] shadow-[0px_4px_25px_rgba(15,23,42,0.015)] rounded-[20px] p-6 text-center space-y-4 hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col items-center flex-1 w-full max-w-[280px] min-h-[200px] justify-center">
                    
                    {/* Circle Badge */}
                    <div className={`w-10 h-10 rounded-full ${step.numBg || 'bg-[#0B46AD]'} text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0`}>
                      {step.num}
                    </div>

                    {/* Step Title & Description */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-extrabold text-[#0F172A] leading-tight">
                        {step.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-neutral-500 leading-normal font-normal">
                        {step.desc}
                      </p>
                    </div>

                  </div>

                  {/* Connecting Arrow */}
                  {index < onboardingSteps.length - 1 && (
                    <div className="text-[#0B46AD] shrink-0 my-2 lg:my-0 flex items-center justify-center">
                      <ArrowRight size={24} className="hidden lg:block animate-pulse" />
                      <svg className="w-6 h-6 lg:hidden animate-bounce text-[#FB6238]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                      </svg>
                    </div>
                  )}

                </React.Fragment>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. Seventh Section: Side-by-Side Right Child Audience & FAQ Accordion */}
      <section className="py-16 md:py-24 bg-[#FAFBFD] border-b border-neutral-100">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Card: Is This Right for Your Child? */}
            <div className="border border-[#E2E8F0] rounded-[24px] p-6 md:p-10 shadow-[0px_4px_25px_rgba(0,0,0,0.015)] bg-white hover:border-neutral-200 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full min-h-[520px]">
              
              <div className="space-y-6">
                {/* Card Header */}
                <div className="space-y-2">
                  <span className="text-xs font-bold tracking-widest text-[#FB6238] uppercase">
                    {suitabilitySubheader}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight">
                    {suitabilityTitle}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                    {suitabilityDescription}
                  </p>
                </div>

                {/* Orange Checkmarks Bullet List */}
                <div className="space-y-3">
                  {suitabilityBullets.map((bullet: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="text-[#FB6238] shrink-0" size={18} />
                      <span className="text-xs sm:text-sm font-medium text-neutral-700">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic Right-Aligned Student Portrait with Floating Arabic Letters */}
              <div className="relative w-full h-44 mt-6 flex justify-end items-end select-none pointer-events-none">
                <div className="absolute w-24 h-24 bg-[#FFE8DF] rounded-full bottom-0 right-4 -z-0 opacity-60" />
                <div className="absolute w-16 h-16 bg-[#EBF2FC] rounded-full top-2 right-20 -z-0 opacity-50" />

                {/* Floating Letters */}
                <span className="absolute top-2 right-24 text-[#FB6238] text-2xl font-bold font-serif animate-float-slow">
                  خ
                </span>
                <span className="absolute top-1/2 right-12 text-[#4ADE80] text-3xl font-bold font-serif animate-float-slow" style={{ animationDelay: '1.2s' }}>
                  ब
                </span>
                <span className="absolute bottom-8 right-32 text-[#FFA800] text-2xl font-bold font-serif animate-float-slow" style={{ animationDelay: '2.4s' }}>
                  أ
                </span>

                {/* Student image */}
                <div className="relative w-40 h-44 z-10">
                  <Image
                    src={suitabilityImageUrl}
                    alt="Happy child student holding books"
                    fill
                    className="object-contain object-bottom"
                  />
                </div>

              </div>

            </div>

            {/* Right Card: Frequently Asked Questions Accordion */}
            <div className="border border-[#E2E8F0] rounded-[24px] p-6 md:p-10 shadow-[0px_4px_25px_rgba(0,0,0,0.015)] bg-white hover:border-neutral-200 transition-all duration-300 h-full min-h-[520px]">
              
              {/* Card Header */}
              <div className="space-y-2 mb-6">
                <span className="text-xs font-bold tracking-widest text-[#FB6238] uppercase">
                  {faqSubheader}
                </span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] leading-tight">
                  {faqTitle}
                </h3>
              </div>

              {/* Accordion Questions List */}
              <div className="space-y-3.5">
                {faqItems.map((item: any, index: number) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div 
                      key={index}
                      className="border-b border-neutral-100 pb-3.5 last:border-0 last:pb-0"
                    >
                      {/* Accordion Trigger Button */}
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full flex items-center justify-between text-left gap-4 py-1.5 group select-none"
                      >
                        <span className="text-xs sm:text-sm font-extrabold text-neutral-800 group-hover:text-[#FB6238] transition-colors leading-tight">
                          {item.question}
                        </span>
                        <div className="shrink-0 text-neutral-400 group-hover:text-[#FB6238] transition-colors">
                          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                        </div>
                      </button>

                      {/* Accordion Answer Content */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isOpen ? "max-h-[140px] opacity-100 mt-2" : "max-h-0 opacity-0"
                        }`}
                      >
                        <p className="text-xs text-neutral-500 leading-relaxed font-normal bg-slate-50/50 p-3 rounded-lg border border-neutral-50">
                          {item.answer}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 8. Eighth Section: Ready to See Your Child Grow in Arabic? CTA Banner */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container">
          <div className="bg-[#2E4888] rounded-[24px] p-8 md:p-12 text-white relative overflow-hidden shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Background Floating Letters */}
            <span className="absolute top-4 left-1/4 text-white/5 text-5xl font-bold font-serif pointer-events-none select-none z-0 animate-float-slow">
              ع
            </span>
            <span className="absolute bottom-6 right-1/3 text-white/5 text-4xl font-bold font-serif pointer-events-none select-none z-0 animate-float-slow" style={{ animationDelay: '1.8s' }}>
              ذ
            </span>
            <span className="absolute top-1/2 right-12 text-white/5 text-5xl font-bold font-serif pointer-events-none select-none z-0 animate-float-slow" style={{ animationDelay: '2.8s' }}>
              न
            </span>

            {/* Left Side: Hijab Teacher with Headphones and Laptop */}
            <div className="flex-shrink-0 relative w-48 h-40 md:w-56 md:h-48 z-10 select-none pointer-events-none">
              <div className="absolute w-36 h-36 bg-white/10 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
              <Image
                src={ctaImageUrl}
                alt="Friendly Arabic teacher waving behind laptop"
                fill
                className="object-contain"
              />
            </div>

            {/* Center: CTA Texts */}
            <div className="space-y-4 text-center lg:text-left flex-1 max-w-2xl z-10">
              <h3 className="text-2xl md:text-3xl font-extrabold leading-tight">
                {ctaHeading}
              </h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                {ctaDescription}
              </p>
            </div>

            {/* Right Side: CTA Button & Subtext */}
            <div className="flex flex-col items-center gap-3 shrink-0 z-10 w-full lg:w-auto">
              <Button 
                onClick={handleBookClick}
                className="w-full sm:w-auto h-14 px-8 bg-[#FB6238] hover:bg-[#E04E26] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-base"
              >
                {ctaButtonText}
                <ArrowRight size={18} />
              </Button>
              <span className="text-[11px] text-white/70 text-center leading-normal">
                {ctaSubtext}
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
