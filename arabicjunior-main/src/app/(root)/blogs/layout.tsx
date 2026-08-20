import { Metadata } from "next";
import React from "react";
import { buildPageMetadata } from "@/lib/seo";


const FALLBACK_METADATA: Metadata = {
    title: "Arabic Tuition Blog | Tips, Guides & Resources for Students in UAE",
    description: "Explore our Arabic tuition blog for the latest tips, study guides, and resources. Stay updated with expert advice for students & parents across the UAE.",
    alternates: {
        canonical: "https://arabicjuniors.com/blogs",
    },
    keywords: ["Arabic tuition blog", "Arabic study tips", "Arabic resources UAE"],
    openGraph: {
        title: "Arabic Learning Blog | UAE Students",
        description: "Study tips, guides, and resources for mastering Arabic.",
        url: "https://arabicjuniors.com/blogs",
        type: "article",
    },
    twitter: {
        card: "summary_large_image",
        title: "Arabic Tuition Blog",
        description: "Guides, articles, and resources for Arabic learners in the UAE.",
    },
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata("blogs", FALLBACK_METADATA);
}
