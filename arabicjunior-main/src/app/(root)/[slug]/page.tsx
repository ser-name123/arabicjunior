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
    numBg: "bg-[#3b82f6]",
    title: "Understand Your Child",
    description: "We learn about your child's grade, school curriculum, previous Arabic learning and current challenges.",
    illustration: (
      <svg className="w-[100px] h-[75px]" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 72c0-8 6-12 15-12s15 4 15 12" fill="#eab308" />
        <circle cx="30" cy="50" r="9" fill="#fed7aa" />
        <path d="M21 48c0-5 9-8 9-8s9 3 9 8" fill="#1e293b" />
        <path d="M27 49h6v1.5h-6z" fill="#f97316" />

        <path d="M45 72c0-8 6-12 15-12s15 4 15 12" fill="#f97316" />
        <circle cx="60" cy="50" r="9" fill="#fdba74" />
        <path d="M51 48c0-5 9-8 9-8s9 3 9 8" fill="#0f172a" />
        <path d="M57 49h6v1.5h-6z" fill="#3b82f6" />

        <rect x="22" y="6" width="36" height="22" rx="6" fill="#2563eb" />
        <path d="M30 28l-4 6v-6h4z" fill="#2563eb" />
        <circle cx="32" cy="17" r="2.5" fill="#ffffff" />
        <circle cx="40" cy="17" r="2.5" fill="#ffffff" />
        <circle cx="48" cy="17" r="2.5" fill="#ffffff" />
      </svg>
    )
  },
  {
    num: "02",
    numBg: "bg-[#fb6238]",
    title: "Assess Their Level",
    description: "The teacher evaluates key Arabic skills appropriate for their age and grade.",
    illustration: (
      <svg className="w-[80px] h-[80px]" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="12" width="36" height="56" rx="6" fill="#f8fafc" stroke="#0f766e" strokeWidth="3" />
        <rect x="32" y="6" width="16" height="10" rx="2" fill="#0f766e" />
        <circle cx="40" cy="11" r="2" fill="#ffffff" />
        <path d="M28 28l4 4 8-8" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="44" y1="30" x2="52" y2="30" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 42l4 4 8-8" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="44" y1="44" x2="52" y2="44" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 56l4 4 8-8" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="44" y1="58" x2="52" y2="58" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    num: "03",
    numBg: "bg-[#ffa800]",
    title: "Experience Arabic Learning",
    description: "Your child participates in an interactive lesson designed around their level.",
    illustration: (
      <svg className="w-[100px] h-[75px]" viewBox="0 0 100 75" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="10" width="72" height="46" rx="4" fill="#0f172a" />
        <rect x="18" y="14" width="64" height="38" fill="#1e293b" />
        <circle cx="50" cy="12" r="1" fill="#ef4444" />
        <circle cx="50" cy="27" r="7" fill="#fed7aa" />
        <path d="M50 20c-4 0-6 3-6 5s1 4 3 4 3-4 3-4" fill="#1e293b" />
        <path d="M38 52c0-8 8-10 12-10s12 2 12 10" fill="#0f766e" />
        <path d="M36 40c2 0 3-2 3-4s-1-4-3-4-3 2-3 4 1 4 3 4z" fill="#fed7aa" />
        <path d="M6 56h88l-6 10H12L6 56z" fill="#475569" />
        <rect x="36" y="60" width="28" height="3" rx="1.5" fill="#334155" />
      </svg>
    )
  },
  {
    num: "04",
    numBg: "bg-[#9333ea]",
    title: "Recommend Next Steps",
    description: "We share feedback and suggest the most suitable learning approach.",
    illustration: (
      <svg className="w-[80px] h-[80px]" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="40" cy="40" r="32" fill="#f3e8ff" stroke="#7e22ce" strokeWidth="3" />
        <circle cx="40" cy="40" r="22" stroke="#7e22ce" strokeWidth="3" fill="#ffffff" />
        <circle cx="40" cy="40" r="12" stroke="#7e22ce" strokeWidth="3" fill="#f3e8ff" />
        <circle cx="40" cy="40" r="5" fill="#7e22ce" />
        <line x1="60" y1="20" x2="43" y2="37" stroke="#7e22ce" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M62 14l6 6-4 4-6-6z" fill="#a855f7" />
        <path d="M62 14l-6-6M68 20l-6-6" stroke="#7e22ce" strokeWidth="2.5" />
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

const trialClassFeatures = [
  {
    title: "Understand Their Level",
    desc: "We identify your child’s current Arabic abilities.",
    titleColor: "#3972c9",
    bgColor: "#f2f7ff",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 19c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6z" fill="#4c7fd8" />
        <path d="M12 37c0-5.5 4.5-9 12-9s12 3.5 12 9" stroke="#4c7fd8" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M11 16c1.933 0 3.5-1.567 3.5-3.5S12.933 9 11 9s-3.5 1.567-3.5 3.5S9.067 16 11 16z" fill="#4c7fd8" opacity="0.6" />
        <path d="M4 35c0-4 3.5-6.5 7-6.5" stroke="#4c7fd8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        <path d="M37 16c1.933 0 3.5-1.567 3.5-3.5S38.933 9 37 9s-3.5 1.567-3.5 3.5S35.067 16 37 16z" fill="#4c7fd8" opacity="0.6" />
        <path d="M44 35c0-4-3.5-6.5-7-6.5" stroke="#4c7fd8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    )
  },
  {
    title: "Experience Our Classes",
    desc: "See how our interactive lessons work.",
    titleColor: "#f15a24",
    bgColor: "#fff5ee",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="10" width="32" height="24" rx="3" stroke="#f15a24" strokeWidth="3" fill="#fff5ee" />
        <path d="M18 17h12" stroke="#f15a24" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 22h8" stroke="#f15a24" strokeWidth="2" strokeLinecap="round" />
        <circle cx="31" cy="23" r="3" fill="#f15a24" />
        <path d="M16 34l-3 6" stroke="#f15a24" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 34l3 6" stroke="#f15a24" strokeWidth="3" strokeLinecap="round" />
        <path d="M24 34v6" stroke="#f15a24" strokeWidth="3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: "Meet a Teacher",
    desc: "Meet an experienced Arabic teacher.",
    titleColor: "#397bc5",
    bgColor: "#effafa",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="15" r="6" fill="#239b9a" />
        <path d="M8 36c0-5 5-8 10-8s10 3 10 8" fill="#239b9a" />
        <path d="M34 10l1.2 2.5 2.8.4-2 2 1 2.8-3-1.5-3 1.5 1-2.8-2-2 2.8-.4z" fill="none" stroke="#239b9a" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M38 21l.8 1.7 1.9.3-1.4 1.3.7 1.9-2-1-2 1 .7-1.9-1.4-1.3 1.9-.3z" fill="none" stroke="#239b9a" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M32 29l.6 1.2 1.3.2-1 1 .5 1.3-1.4-.7-1.4.7.5-1.3-1-1 1.3-.2z" fill="none" stroke="#239b9a" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    title: "Get Parent Feedback",
    desc: "Understand strengths and areas to improve.",
    titleColor: "#f29b00",
    bgColor: "#fffaf0",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 6c9.941 0 12 2.059 12 12s-2.059 12-12 12-12-2.059-12-12 2.059-12 12-12z" stroke="#f4a300" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
        <path d="M19 28v11l5-3 5 3V28" stroke="#f4a300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="18" r="5" fill="#f4a300" />
      </svg>
    )
  }
];

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
  const heroImageUrl = settings?.heroImageUrl || "/hero-student-new.jpg";

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
  const curriculaImageUrl = settings?.curriculaImageUrl || "/dubai-skyline.png";

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
    <div className="min-h-screen bg-white pb-20 font-sans">
      
      {/* 1. First Section: Hero
          Follows the approved mockup: a frameless cut-out subject resting on a
          soft blue blob, with Arabic letters floating around it. No card, no
          border, no drop shadow — the artwork sits directly on the page. */}
      <section className="pt-8 pb-10 md:pt-12 lg:py-16 relative overflow-hidden bg-white min-h-[500px] lg:min-h-[560px] flex items-center">
        
        {/* Desktop Image anchored flush to absolute right-0 top-0 bottom-0 with ZERO right space */}
        <div className="hidden lg:block absolute top-0 right-0 bottom-0 w-[50%] xl:w-[54%] z-0 pointer-events-none select-none">
          <Image
            src="/hero-student-new.jpg"
            alt="Smiling student learning Arabic online"
            fill
            className="object-cover object-left-center scale-[1.02] origin-right"
            priority
          />
        </div>

        <div className="w-full px-6 sm:px-12 lg:px-20 xl:px-32 mx-auto max-w-[1880px] relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 z-10">

              {/* Blue Badge with hover styling & pulsing icon */}
              <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0B46AD] to-[#1E62EC] text-white px-4 py-2 rounded-full text-[12.5px] sm:text-[13px] font-black uppercase tracking-[0.14em] shadow-sm border border-blue-400/20 hover:scale-[1.02] transition-transform duration-300 select-none">
                <Gift size={15} className="text-[#FFC72C] fill-[#FFC72C] shrink-0 animate-pulse" />
                {heroBadgeText}
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <h1 className="text-[38px] sm:text-[46px] lg:text-[52px] xl:text-[56px] font-black text-black leading-[1.06] tracking-[-0.025em]">
                  {heroHeading}<br />
                  <span className="bg-gradient-to-r from-[#FB6238] to-[#FF8159] bg-clip-text text-transparent">{heroHeadingHighlight}</span> Potential
                </h1>
                <h3 className="text-[22px] md:text-[27px] lg:text-[29px] font-bold text-[#FB6238] leading-snug">
                  {heroSubheading}
                </h3>
              </div>

              {/* Description Paragraphs. Held to a wider measure to bring
                  content and image closer together. */}
              <div className="text-slate-600 text-[16px] sm:text-[17px] leading-[1.65] space-y-3 max-w-[40rem] font-medium">
                {heroDescription1 && <p>{heroDescription1}</p>}
                {heroDescription2 && <p>{heroDescription2}</p>}
              </div>

              {/* 2x2 Feature Checkmarks Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 max-w-[40rem] pt-1">
                {heroBullets.map((bullet: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 group/item">
                    <div className="w-[22px] h-[22px] rounded-full bg-gradient-to-tr from-[#0B46AD] to-[#3B82F6] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(59,130,246,0.3)] group-hover/item:scale-110 transition-transform duration-200">
                      <svg className="w-[13px] h-[13px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[15px] sm:text-[15.5px] font-bold text-neutral-800 group-hover/item:text-neutral-900 transition-colors duration-150">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button & Grade Subtext */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleBookClick}
                  className="group w-full sm:w-auto h-[56px] px-8 bg-gradient-to-r from-[#FB6238] to-[#FF7A53] hover:from-[#E04E26] hover:to-[#FB6238] text-white font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_22px_rgba(251,98,56,0.28)] hover:shadow-[0_12px_28px_rgba(251,98,56,0.42)] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-300 text-[16.5px]"
                >
                  {heroCtaText}
                  <ArrowRight size={19} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Button>
                <p className="text-[14px] font-bold text-neutral-500/90">
                  {heroCtaSubtext}
                </p>
              </div>

            </div>

            {/* Mobile/Tablet Artwork Column */}
            <div className="lg:hidden relative w-full h-[360px] sm:h-[440px] select-none overflow-hidden">
              <Image
                src="/hero-student-new.jpg"
                alt="Smiling student learning Arabic online"
                fill
                className="object-cover object-right-bottom scale-[1.05] origin-right"
                priority
              />
            </div>

          </div>
        </div>
      </section>

      {/* 2. Second Section: Why Take a Trial? */}
      <section className="py-[28px] md:py-[36px] bg-[#fffdfb] relative select-none">
        <div className="w-[90%] max-w-[1250px] mx-auto p-[22px_24px_24px] bg-white border border-[#f4e8df] rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative z-10">
          
          {/* Top Label */}
          <div className="text-[15.5px] sm:text-[16px] font-black text-[#f15a24] uppercase tracking-[0.5px] mb-2 font-sans">
            {whySubheader}
          </div>

          {/* Main Heading */}
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#08265c] leading-[1.12] tracking-[-0.5px] mb-3 whitespace-pre-line font-sans">
            {whyHeading}
          </h2>

          {/* Description */}
          <p className="text-[15.5px] sm:text-[16px] font-medium leading-[1.6] text-slate-600 max-w-[46rem] mb-6 font-sans">
            {whyDescription}
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {whyCards.map((card: any, index: number) => {
              const CardIcon = getIconComponent(card.icon);
              return (
                <div 
                  key={index}
                  className="bg-white border border-[#f4e8df] rounded-[18px] min-h-[245px] p-5 text-center flex flex-col items-center justify-start hover:-translate-y-1 hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                >
                  {/* Icon Circle */}
                  <div className={`w-[72px] h-[72px] rounded-full ${card.bgColor || 'bg-[#FFF5F1]'} border ${card.borderColor || 'border-[#FFD0BD]'} ${card.iconColor || 'text-[#FB6238]'} flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(0,0,0,0.03)] shrink-0`}>
                    <CardIcon size={34} />
                  </div>

                  {/* Card Title */}
                  <h4 className="text-[17.5px] sm:text-[18px] font-bold leading-snug mb-2 font-sans text-center">
                    <span className={card.titleColor || 'text-[#08265c]'}>{card.title}</span>
                  </h4>

                  {/* Card Description */}
                  <p className="text-[14.5px] sm:text-[15px] font-medium leading-[1.55] text-slate-600 font-sans text-center">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 3. Third Section: A Simple 4-Step Process */}
      <section className="py-[28px] md:py-[36px] bg-[#fffdfb] relative select-none">
        <div className="w-[90%] max-w-[1250px] mx-auto relative z-10">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-[15.5px] sm:text-[16px] font-black tracking-[0.5px] text-[#f15a24] uppercase font-sans">
              {processSubheader}
            </span>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#08265c] leading-[1.12] tracking-[-0.5px] font-sans">
              {processHeading}
            </h2>
          </div>

          {/* Steps Timeline Box */}
          <div className="bg-white border border-[#f4e8df] rounded-[18px] p-[0px_24px_32px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative z-10">
            
            {/* Horizontal Timeline Connector (Desktop only) */}
            <div className="absolute top-0 left-[12.5%] right-[12.5%] w-[75%] h-[2px] hidden lg:block bg-gradient-to-r from-[#0B46AD] via-[#FB6238] to-[#9333EA] -z-10" />
            
            {/* Intermediate Concentric Connection Loops */}
            <div className="absolute top-0 left-[25%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#FB6238] bg-white hidden lg:flex items-center justify-center shadow-sm z-30">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0B46AD]" />
            </div>
            <div className="absolute top-0 left-[50%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#FFA800] bg-white hidden lg:flex items-center justify-center shadow-sm z-30">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FB6238]" />
            </div>
            <div className="absolute top-0 left-[75%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#9333EA] bg-white hidden lg:flex items-center justify-center shadow-sm z-30">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFA800]" />
            </div>

            {/* Steps Columns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-dashed divide-neutral-200/80">
              {processSteps.map((step, index) => {
                return (
                  <div key={index} className="flex flex-col items-center text-center relative pt-12 pb-4 px-4 min-h-[330px] group cursor-pointer">
                    
                    {/* Number Badge */}
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px] rounded-full ${step.numBg} text-white font-black flex items-center justify-center text-[20px] shadow-[0_6px_16px_rgba(0,0,0,0.08)] shrink-0 border-4 border-white z-20 transition-all duration-300 group-hover:scale-110`}>
                      {step.num}
                    </div>

                    {/* Step Title */}
                    <h4 className="text-[17.5px] sm:text-[18px] font-bold text-[#08265c] mb-2 mt-4 text-center font-sans">
                      {step.title}
                    </h4>

                    {/* Step Description */}
                    <p className="text-[14.5px] sm:text-[15px] font-medium leading-[1.55] text-slate-600 mb-6 text-center max-w-[240px] font-sans">
                      {step.description}
                    </p>

                    {/* Illustration at the bottom */}
                    <div className="mt-auto w-24 h-24 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
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
      <section className="py-16 md:py-24 bg-white">
        <div className="w-[90%] max-w-[1250px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Card: A Trial Designed Around Your Child */}
            <div className="border border-[#f4e8df] rounded-[18px] p-6 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] bg-white hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] transition-all duration-300">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Header Text */}
                <div className="lg:col-span-6 space-y-2 text-left lg:max-w-[320px]">
                  <span className="text-[13px] font-bold tracking-[0.2px] text-[#f15a24] uppercase font-sans">
                    {assessSubheader}
                  </span>
                  <h3 className="text-[24px] md:text-[28px] font-bold text-[#08265c] leading-tight font-sans">
                    {assessTitle}
                  </h3>
                  <p className="text-slate-600 text-[14px] leading-relaxed font-medium font-sans">
                    {assessDescription}
                  </p>
                </div>

                {/* Right Side: Radial Skills Diagram */}
                <div className="lg:col-span-6 relative w-[420px] h-[390px] mx-auto lg:mx-0 lg:-ml-40 flex items-center justify-center scale-90 sm:scale-100 lg:scale-[0.92] xl:scale-[0.98] 2xl:scale-100 origin-center py-4 lg:mt-24 shrink-0">
                  {/* Center Hub */}
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-4 border-[#fffdfb] bg-white shadow-[0_4px_16px_rgba(8,38,92,0.08)] flex flex-col items-center justify-center z-10 text-center select-none pointer-events-none">
                    <span className="text-[11px] sm:text-[13px] font-black text-[#08265c] uppercase leading-tight max-w-[60px] tracking-wide">YOUR CHILD</span>
                  </div>

                  {/* Connecting Vector Lines */}
                  <svg className="absolute inset-0 w-full h-full text-slate-200/80 -z-0 pointer-events-none" viewBox="0 0 100 100">
                    <line x1="50" y1="50" x2="50" y2="12" stroke="#15803d" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="50" y1="50" x2="85" y2="30" stroke="#c2410c" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="50" y1="50" x2="85" y2="70" stroke="#be123c" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="50" y1="50" x2="50" y2="88" stroke="#0f172a" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="50" y1="50" x2="15" y2="70" stroke="#1d4ed8" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                    <line x1="50" y1="50" x2="15" y2="30" stroke="#e11d48" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
                  </svg>

                  {/* Hub 1: Reading (Top) */}
                  <div className="absolute top-[0%] left-1/2 -translate-x-1/2 w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full border border-[#00A389]/40 bg-white shadow-sm flex flex-col items-center justify-center p-1.5 px-3 text-center">
                    <svg className="w-9 h-9 sm:w-[38px] sm:h-[38px] mb-0.5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="4" y="6" width="24" height="20" rx="3" fill="#e8f8f2" stroke="#15803d" strokeWidth="2" />
                      <path d="M16 6v20" stroke="#15803d" strokeWidth="1.5" strokeDasharray="2 2" />
                      <circle cx="10" cy="12" r="2" fill="#15803d" />
                      <line x1="14" y1="12" x2="22" y2="12" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="10" cy="18" r="2" fill="#15803d" />
                      <line x1="14" y1="18" x2="20" y2="18" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
                      <path d="M24 16l2 2 4-4" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[12.5px] sm:text-[14px] font-black text-[#15803d] leading-tight">Reading</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-bold leading-[1.25] mt-0.5 select-none">Ability to read words & sentences</span>
                  </div>

                  {/* Hub 2: Writing (Top Right) */}
                  <div className="absolute top-[18%] right-[0%] w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full border border-[#f97316]/40 bg-white shadow-sm flex flex-col items-center justify-center p-1.5 px-3 text-center">
                    <svg className="w-9 h-9 sm:w-[38px] sm:h-[38px] mb-0.5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#fff7ed" stroke="#ea580c" strokeWidth="2" />
                      <path d="M12 20h8" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                      <path d="M13 16l3-7 3 7H13z" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" strokeLinejoin="round" />
                      <path d="M22 10l-3 3" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-[12.5px] sm:text-[14px] font-black text-[#c2410c] leading-tight">Writing</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-bold leading-[1.25] mt-0.5 select-none">Letter & word formation</span>
                  </div>

                  {/* Hub 3: Speaking (Bottom Right) */}
                  <div className="absolute bottom-[18%] right-[0%] w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full border border-[#ef4444]/40 bg-white shadow-sm flex flex-col items-center justify-center p-1.5 px-3 text-center">
                    <svg className="w-9 h-9 sm:w-[38px] sm:h-[38px] mb-0.5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#fff5f5" stroke="#e11d48" strokeWidth="2" />
                      <path d="M12 18c0-3 2-5 5-5s5 2 5 5-2 5-5 5-5-2-5-5z" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2" />
                      <path d="M17 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="#e11d48" />
                      <path d="M24 14c1 0 2 1 2 2s-1 2-2 2" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-[12.5px] sm:text-[14px] font-black text-[#be123c] leading-tight">Speaking</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-bold leading-[1.25] mt-0.5 select-none">Confidence in communication</span>
                  </div>

                  {/* Hub 4: Vocabulary (Bottom) */}
                  <div className="absolute bottom-[0%] left-1/2 -translate-x-1/2 w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full border border-[#0f172a]/20 bg-white shadow-sm flex flex-col items-center justify-center p-1.5 px-3 text-center">
                    <svg className="w-9 h-9 sm:w-[38px] sm:h-[38px] mb-0.5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="20" height="20" rx="3" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
                      <rect x="10" y="10" width="12" height="12" rx="1.5" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
                      <path d="M13 14h6M13 18h4" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-[12.5px] sm:text-[14px] font-black text-[#0f172a] leading-tight">Vocabulary</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-bold leading-[1.25] mt-0.5 select-none">Words & expressions</span>
                  </div>

                  {/* Hub 5: Listening (Bottom Left) */}
                  <div className="absolute bottom-[18%] left-[0%] w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full border border-[#3b82f6]/40 bg-white shadow-sm flex flex-col items-center justify-center p-1.5 px-3 text-center">
                    <svg className="w-9 h-9 sm:w-[38px] sm:h-[38px] mb-0.5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
                      <path d="M10 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                      <rect x="8" y="15" width="4" height="6" rx="1.5" fill="#2563eb" />
                      <rect x="20" y="15" width="4" height="6" rx="1.5" fill="#2563eb" />
                    </svg>
                    <span className="text-[12.5px] sm:text-[14px] font-black text-[#1d4ed8] leading-tight">Listening</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-bold leading-[1.25] mt-0.5 select-none">Understanding spoken Arabic</span>
                  </div>

                  {/* Hub 6: Grammar (Top Left) */}
                  <div className="absolute top-[18%] left-[0%] w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] rounded-full border border-[#ec4899]/40 bg-white shadow-sm flex flex-col items-center justify-center p-1.5 px-3 text-center">
                    <svg className="w-9 h-9 sm:w-[38px] sm:h-[38px] mb-0.5 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#fdf2f8" stroke="#db2777" strokeWidth="2" />
                      <path d="M11 13h10M11 17h10M11 21h6" stroke="#db2777" strokeWidth="2" strokeLinecap="round" />
                      <rect x="17" y="19" width="4" height="4" rx="1" fill="#db2777" />
                    </svg>
                    <span className="text-[12.5px] sm:text-[14px] font-black text-[#e11d48] leading-tight">Grammar</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-700 font-bold leading-[1.25] mt-0.5 select-none">Sentence structures</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Card: We Support All Major UAE School Curricula */}
            <div className="border border-[#f4e8df] rounded-[18px] p-6 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between bg-white hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] transition-all duration-300 relative overflow-hidden min-h-[460px]">
              
              {/* Top Header & Badges Container */}
              <div className="space-y-5 z-10 relative">
                {/* Card Header */}
                <div className="space-y-2">
                  <span className="text-[13px] font-bold tracking-[0.2px] text-[#f15a24] uppercase font-sans">
                    {curriculaSubheader}
                  </span>
                  <h3 className="text-[24px] md:text-[28px] font-bold text-[#08265c] leading-tight font-sans">
                    {curriculaTitle}
                  </h3>
                  <p className="text-slate-600 text-[14px] leading-relaxed font-medium font-sans">
                    {curriculaDescription}
                  </p>
                </div>

                {/* Curriculum Badges Row */}
                <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5 md:gap-3 pt-1">
                  {curriculaBadges.map((badge: string, idx: number) => {
                    const badgeBgs = ["bg-[#0B46AD]", "bg-[#FB6238]", "bg-[#0062FC]", "bg-[#7C3AED]", "bg-[#EF4444]"];
                    const selectedBg = badgeBgs[idx % badgeBgs.length];
                    return (
                      <span 
                        key={idx} 
                        className={`px-5 py-2.5 md:px-6 md:py-2.5 ${selectedBg} text-white text-[14px] md:text-[15px] font-bold rounded-xl tracking-normal shadow-sm hover:scale-[1.03] transition-all duration-300 select-none cursor-default shrink-0`}
                      >
                        {badge}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Dubai Skyline Image Illustration locked to absolute bottom */}
              <div className="absolute bottom-0 left-0 right-0 w-full select-none pointer-events-none z-0 h-[220px] md:h-[260px] overflow-hidden">
                <Image
                  src={curriculaImageUrl}
                  alt="Dubai Skyline Illustration"
                  fill
                  className="object-cover object-bottom scale-[1.05] origin-bottom"
                  priority
                />
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. Fifth Section: More Than Just a Demo Class (6 Value Cards Grid) */}
      <section className="py-[28px] md:py-[36px] bg-[#fffdfb] relative select-none">
        <div className="w-[90%] max-w-[1250px] mx-auto p-[22px_24px_24px] bg-white border border-[#f4e8df] rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative z-10">
          {/* Top Label / Subheader */}
          <div className="text-[15.5px] sm:text-[16px] font-black text-[#f15a24] uppercase tracking-[0.5px] mb-2 text-center font-sans">
            {chooseSubheader}
          </div>

          {/* Main Heading */}
          <h2 className="text-[28px] md:text-[34px] font-bold text-[#08265c] leading-[1.12] tracking-[-0.5px] mb-7 text-center font-sans">
            {chooseHeading}
          </h2>

          {/* Cards 6-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {chooseCards.map((card: any, index: number) => {
              const CardIcon = getIconComponent(card.icon);
              return (
                <div 
                  key={index}
                  className="bg-white border border-[#f4e8df] rounded-[18px] p-5 text-center flex flex-col items-center justify-start min-h-[270px] hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                >
                  {/* Icon Circle */}
                  <div className={`w-[64px] h-[64px] rounded-full ${card.bgColor || 'bg-[#FFF5F1]'} border ${card.borderColor || 'border-[#FFD0BD]'} ${card.iconColor || 'text-[#FB6238]'} flex items-center justify-center mb-4 shadow-[0_4px_14px_rgba(0,0,0,0.03)] shrink-0`}>
                    <CardIcon size={32} />
                  </div>

                  {/* Card Title */}
                  <h4 className="text-[17px] sm:text-[18px] font-bold text-[#08265c] leading-snug mb-2 font-sans text-center">
                    {card.title}
                  </h4>

                  {/* Card Description / Subheading */}
                  <p className="text-[14.5px] sm:text-[15px] text-slate-600 leading-[1.55] font-medium font-sans text-center">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. Sixth Section: Getting Started Is Easy (4-Step Onboarding Timeline) */}
      <section className="py-[28px] md:py-[36px] bg-[#fffdfb] relative select-none">
        <div className="w-[90%] max-w-[1250px] mx-auto p-[22px_24px_24px] bg-white border border-[#f4e8df] rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative z-10">
          
          {/* Header Description */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="text-[15.5px] sm:text-[16px] font-black tracking-[0.5px] text-[#f15a24] uppercase mb-1.5 font-sans">
              {onboardingSubheader}
            </div>
            <h2 className="text-[28px] md:text-[34px] font-bold text-[#08265c] leading-[1.12] tracking-[-0.5px] font-sans">
              {onboardingHeading}
            </h2>
          </div>

          {/* 4 Steps Row with Arrow Connectors */}
          <div className="flex flex-col lg:flex-row items-center lg:justify-between gap-4 lg:gap-3 max-w-full mx-auto">
            {onboardingSteps.map((step: any, index: number) => {
              return (
                <React.Fragment key={index}>
                  
                  {/* Step Card */}
                  <div className="bg-white border border-[#f4e8df] rounded-[18px] p-6 text-center flex flex-col items-center justify-start flex-1 w-full min-h-[220px] hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] hover:-translate-y-1 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                    
                    {/* Circle Badge */}
                    <div className={`w-12 h-12 rounded-full ${step.numBg || 'bg-[#0B46AD]'} text-white font-black flex items-center justify-center text-[18px] shadow-sm shrink-0 mb-4`}>
                      {step.num}
                    </div>

                    {/* Step Title & Description */}
                    <div className="space-y-2">
                      <h4 className="text-[17px] sm:text-[18px] font-bold text-[#08265c] leading-snug font-sans text-center">
                        {step.title}
                      </h4>
                      <p className="text-[14.5px] sm:text-[15px] font-medium text-slate-600 leading-[1.55] font-sans text-center">
                        {step.desc}
                      </p>
                    </div>

                  </div>

                  {/* Connecting Arrow */}
                  {index < onboardingSteps.length - 1 && (
                    <div className="text-[#2563eb] shrink-0 my-3 lg:my-0 flex items-center justify-center px-1">
                      <ArrowRight size={22} className="hidden lg:block stroke-[2.5]" />
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
      <section className="py-[28px] md:py-[36px] bg-[#fffdfb] relative select-none">
        <div className="w-[90%] max-w-[1250px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Card: Is This Right for Your Child? */}
            <div className="lg:col-span-6 border border-[#f4e8df] rounded-[18px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] bg-white hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] transition-all duration-300 relative overflow-hidden flex flex-col justify-center min-h-[480px]">
              
              <div className="space-y-4 z-10 relative max-w-[62%] sm:max-w-[58%] my-auto">
                {/* Card Header */}
                <div className="space-y-2">
                  <div className="text-[15.5px] sm:text-[16px] font-black tracking-[0.5px] text-[#f15a24] uppercase font-sans">
                    {suitabilitySubheader}
                  </div>
                  <h3 className="text-[28px] md:text-[34px] font-bold text-[#08265c] leading-[1.12] tracking-[-0.5px] font-sans">
                    {suitabilityTitle}
                  </h3>
                  <p className="text-slate-600 text-[15px] sm:text-[15.5px] leading-[1.55] font-medium font-sans">
                    {suitabilityDescription}
                  </p>
                </div>

                {/* Orange Checkmarks Bullet List */}
                <div className="space-y-2.5 pt-1">
                  {suitabilityBullets.map((bullet: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5">
                      <div className="w-[20px] h-[20px] rounded-full bg-[#FB6238] flex items-center justify-center shrink-0 shadow-sm">
                        <svg className="w-[12px] h-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[13.5px] sm:text-[14.5px] font-bold text-black leading-tight font-sans">{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right-Side Student Artwork centered vertically */}
              <div className="absolute right-0 top-0 bottom-0 w-[46%] sm:w-[48%] pointer-events-none select-none overflow-hidden z-0 flex items-center justify-end">
                <div className="relative w-full h-full z-10">
                  <Image
                    src="/suitability_girl_student.jpg"
                    alt="Happy child student holding books"
                    fill
                    className="object-contain object-right scale-[1.05] origin-right"
                    priority
                  />
                </div>
              </div>

            </div>

            {/* Right Card: Frequently Asked Questions Accordion */}
            <div className="lg:col-span-6 border border-[#f4e8df] rounded-[18px] p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] bg-white hover:border-[#f15a24]/30 hover:shadow-[0_8px_24px_rgba(241,90,36,0.04)] transition-all duration-300 flex flex-col justify-between min-h-[480px]">
              
              <div>
                {/* Card Header */}
                <div className="space-y-2 mb-6">
                  <div className="text-[15.5px] sm:text-[16px] font-black tracking-[0.5px] text-[#f15a24] uppercase font-sans">
                    {faqSubheader}
                  </div>
                  <h3 className="text-[28px] md:text-[34px] font-bold text-[#08265c] leading-[1.12] tracking-[-0.5px] font-sans">
                    {faqTitle}
                  </h3>
                </div>

                {/* Accordion Questions List */}
                <div className="space-y-2.5">
                  {faqItems.map((item: any, index: number) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div 
                        key={index}
                        className="bg-white border border-[#f4e8df] rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.015)] overflow-hidden transition-all duration-300 hover:border-[#f15a24]/30"
                      >
                        {/* Accordion Trigger Button */}
                        <button
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between text-left p-[12px_18px] gap-4 group select-none"
                        >
                          <span className="text-[14.5px] sm:text-[15.5px] font-bold text-[#08265c] font-sans leading-tight">
                            {item.question}
                          </span>
                          <div className="shrink-0 text-slate-400 group-hover:text-[#FB6238] transition-colors font-bold text-[18px]">
                            {isOpen ? <Minus size={18} className="stroke-[2.5]" /> : <Plus size={18} className="stroke-[2.5]" />}
                          </div>
                        </button>

                        {/* Accordion Answer Content */}
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? "max-h-[160px] opacity-100 px-4 pb-3.5" : "max-h-0 opacity-0"
                          }`}
                        >
                          <p className="text-[13.5px] sm:text-[14px] text-slate-600 leading-[1.55] font-medium font-sans">
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
        </div>
      </section>

      {/* 8. Eighth Section: Bottom Conversion CTA Banner */}
      <section className="py-[28px] md:py-[36px] bg-[#fffdfb] relative select-none">
        <div className="w-[90%] max-w-[1250px] mx-auto relative z-10">
          <div className="bg-[#1b3472] rounded-[18px] p-6 md:p-8 text-white relative overflow-hidden shadow-[0_8px_30px_rgba(27,52,114,0.18)] flex flex-col lg:flex-row items-center justify-between gap-6 min-h-[160px] md:min-h-[180px]">
            
            {/* Background Floating Arabic Letters */}
            <span className="absolute top-3 left-10 text-white/10 text-4xl font-bold pointer-events-none select-none z-0">
              ن
            </span>
            <span className="absolute top-1/3 right-12 text-white/10 text-4xl font-bold pointer-events-none select-none z-0">
              ذ
            </span>
            <span className="absolute bottom-4 right-6 text-white/10 text-5xl font-bold pointer-events-none select-none z-0">
              ن
            </span>

            {/* Left Side: Female Arabic Teacher with Headphones and Laptop */}
            <div className="flex-shrink-0 relative w-44 h-36 md:w-56 md:h-44 lg:w-64 lg:h-48 z-10 select-none pointer-events-none flex items-end justify-start">
              <Image
                src="/female-teacher.png"
                alt="Friendly Arabic teacher behind laptop"
                fill
                className="object-contain object-left-bottom"
                priority
              />
            </div>

            {/* Center: CTA Texts */}
            <div className="space-y-2 text-center lg:text-left flex-1 max-w-xl z-10">
              <h3 className="text-[24px] md:text-[30px] lg:text-[32px] font-bold text-white leading-tight font-sans">
                {ctaHeading}
              </h3>
              <p className="text-[#dbeafe] text-[13.5px] md:text-[14.5px] font-medium leading-relaxed font-sans max-w-[440px]">
                {ctaDescription}
              </p>
            </div>

            {/* Right Side: CTA Button & Commitment Subtext */}
            <div className="flex flex-col items-center lg:items-end gap-2.5 shrink-0 z-10 w-full lg:w-auto max-w-md">
              <Button 
                onClick={handleBookClick}
                className="w-full sm:w-auto h-[52px] px-8 bg-[#f15a24] hover:bg-[#d94e1b] text-white font-extrabold rounded-xl flex items-center justify-center gap-2.5 shadow-[0_4px_16px_rgba(241,90,36,0.35)] hover:shadow-[0_6px_20px_rgba(241,90,36,0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 text-[15px] sm:text-[16px]"
              >
                {ctaButtonText}
                <ArrowRight size={18} className="stroke-[2.5]" />
              </Button>
              <span className="text-[12px] sm:text-[13px] text-[#dbeafe]/90 text-center lg:text-right font-medium leading-normal font-sans">
                No long-term commitment. Discover the right learning approach for your child.
              </span>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
