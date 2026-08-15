import React from "react";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import { Button } from "@/components/ui/button-2";

export default function StudentThankYouPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50/40 py-16 px-4 relative overflow-hidden font-sans">
      
      {/* Decorative Floating Arabic Letters */}
      <span className="absolute top-10 left-12 text-[#FF8B66]/10 text-7xl font-bold font-serif pointer-events-none select-none animate-float-slow">
        ج
      </span>
      <span className="absolute bottom-16 left-24 text-[#4ADE80]/10 text-6xl font-bold font-serif pointer-events-none select-none animate-float-slow" style={{ animationDelay: '1.2s' }}>
        أ
      </span>
      <span className="absolute top-20 right-16 text-[#FACC15]/10 text-6xl font-bold font-serif pointer-events-none select-none animate-float-slow" style={{ animationDelay: '2.4s' }}>
        ب
      </span>
      <span className="absolute bottom-10 right-28 text-[#9333EA]/10 text-7xl font-bold font-serif pointer-events-none select-none animate-float-slow" style={{ animationDelay: '1.8s' }}>
        ع
      </span>

      {/* Main Card Container */}
      <div className="bg-white border border-[#E2E8F0] shadow-[0px_8px_30px_rgba(0,0,0,0.025)] rounded-[32px] p-8 md:p-12 max-w-lg w-full text-center space-y-8 relative z-10 animate-fade-in">
        
        {/* Animated Checkmark Circle */}
        <div className="mx-auto w-20 h-20 rounded-full bg-[#E6F7F0] border-4 border-white shadow-md flex items-center justify-center text-[#00A389] animate-bounce-slow">
          <CheckCircle2 size={40} className="stroke-[2.5]" />
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#FB6238] uppercase">
            Trial Booked Successfully
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] leading-tight">
            Thank You for <br />
            <span className="text-[#FB6238]">Registering!</span>
          </h1>
        </div>

        {/* Explanation Paragraphs */}
        <div className="text-neutral-600 text-sm md:text-base leading-relaxed space-y-4 max-w-md mx-auto">
          <p>
            We have received your request for a Free Trial Arabic Class.
          </p>
          <p className="bg-slate-50 p-5 rounded-2xl border border-neutral-100/50 text-xs sm:text-sm text-neutral-500 font-medium leading-relaxed">
            Our academic coordinator will review your preferred date and time slot. We will contact you via <strong>WhatsApp</strong> or <strong>Email</strong> within 24 hours to confirm your scheduled slot and provide the online class links.
          </p>
        </div>

        {/* CTA Button (Centered, Brand Orange matching the website) */}
        <div className="pt-4 flex justify-center w-full">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-8 bg-[#FB6238] hover:bg-[#E04E26] text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-sm whitespace-nowrap">
              <Home size={16} />
              Back to Home
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
