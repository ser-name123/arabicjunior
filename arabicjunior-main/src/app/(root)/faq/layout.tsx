import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
    title: "FAQs | Arabic Tuition Frequently Asked Questions | UAE Students",
    description: "Find answers to common questions about our Arabic tuition services, online & home classes, fees, curriculum, and more. Get all the information UAE students & parents need.",
    alternates: {
        canonical: "https://arabicjuniors.com/faq",
    },
    keywords: ["Arabic tuition FAQ", "Arabic class details", "UAE Arabic education questions"],
    openGraph: {
        title: "Arabic Tuition FAQs",
        description: "Answers to your questions about Arabic classes, fees, and schedules.",
        url: "https://arabicjuniors.com/faq",
        type: "website",
    },
    twitter: {
        card: "summary",
        title: "FAQs about Arabic Tuition in UAE",
        description: "Get all the details parents & students need.",
    },
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;
