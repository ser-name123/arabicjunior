import { Metadata } from "next";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";


const FALLBACK_METADATA: Metadata = {
    title: "About Arabic Juniors | Arabic for kids",
    description: "Learn about Arabic Juniors, our mission, experienced teachers, and student-focused approach to helping learners build strong Arabic language skills.",
    alternates: {
        canonical: "https://arabicjuniors.com/about-us",
    },
    keywords: ["About Arabic Juniors", "Arabic tuition team", "Experienced Arabic teachers UAE"],
    openGraph: {
        title: "About Arabic Juniors | Meet Our Team",
        description: "Meet our team of Arabic education experts dedicated to student success across the UAE.",
        url: "https://arabicjuniors.com/about-us",
        type: "profile",
    },
    twitter: {
        card: "summary",
        title: "Get to Know Our Arabic Tutors",
        description: "Experienced and passionate tutors focused on personalized Arabic learning.",
    },
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("about-us", FALLBACK_METADATA);
}
