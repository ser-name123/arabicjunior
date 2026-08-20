import { Metadata } from "next";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";


const FALLBACK_METADATA: Metadata = {
    title: "Arabic Tuition for Kids Near Me | CBSE Arabic Classes",
    description: "Find the best Arabic tuition near you for kids & CBSE students. Enroll in local Arabic tuition classes with expert tutors for personalized learning. Book a trial now.",
    alternates: {
        canonical: "https://arabicjuniors.com/contact-us",
    },
    keywords: ["Arabic tuition near me", "Arabic for CBSE students", "Local Arabic classes UAE", "Kids Arabic tutor UAE"],
    openGraph: {
        title: "Contact Us | Find Local Arabic Tuition for Kids",
        description: "Reach out to join the top Arabic classes near you for kids in UAE.",
        url: "https://arabicjuniors.com/contact-us",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Join Arabic Classes Near You in UAE",
        description: "Find expert Arabic tuition for CBSE students & kids near your location.",
    },
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("contact-us", FALLBACK_METADATA);
}
