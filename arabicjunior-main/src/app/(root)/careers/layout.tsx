import { Metadata } from "next";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";


const FALLBACK_METADATA: Metadata = {
    title: "Careers | Join Our Team of Expert Arabic Tutors in UAE",
    description: "Explore rewarding career opportunities with our Arabic tuition team in UAE. Apply now to become an Arabic tutor and help students succeed with quality education.",
    alternates: {
        canonical: "https://arabicjuniors.com/careers",
    },
    keywords: ["Arabic tutor jobs UAE", "Teaching careers Arabic", "Arabic tuition career UAE"],
    openGraph: {
        title: "Careers at Arabic Juniors",
        description: "Join our team of passionate Arabic tutors in the UAE.",
        url: "https://arabicjuniors.com/careers",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Join Our Arabic Tutoring Team",
        description: "Explore tutor jobs & help shape young minds in UAE.",
    },
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("careers", FALLBACK_METADATA);
}
