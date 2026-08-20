import { Metadata } from "next";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";


const FALLBACK_METADATA: Metadata = {
    title: "Private Online Arabic Tutor for UAE Students & Kids",
    description: "Learn Arabic with an online Arabic tutor for Indian expats in UAE. Private Arabic tuition for kids and students with flexible online classes.Book now.",
    alternates: {
        canonical: "https://arabicjuniors.com/our-teachers",
    },
    keywords: ["Arabic tutors UAE", "Private Arabic teacher", "Online Arabic tutor", "Arabic tutor for Indian expats"],
    openGraph: {
        title: "Expert Arabic Tutors for Kids in UAE",
        description: "Learn from certified Arabic tutors online or in-person. Ideal for Indian expat families in UAE.",
        url: "https://arabicjuniors.com/our-teachers",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "Hire Arabic Tutors Online in UAE",
        description: "Private, flexible Arabic lessons for expat kids in the UAE.",
    },
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("our-teachers", FALLBACK_METADATA);
}
