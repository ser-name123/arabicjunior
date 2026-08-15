import { Metadata } from "next";
import React from "react";


export const metadata: Metadata = {
    title: 'Arabic Tuition for School Students in UAE & Sharjah | Fees & Contact Details',
    description: 'Find the best Arabic tuition for school students in UAE & Sharjah. Get affordable fees, expert tutors, & direct contact information for personalized Arabic classes.',
    openGraph: {
        title: 'Arabic Tuition for School Students in UAE & Sharjah | Fees & Contact Details',
        description: 'Find the best Arabic tuition for school students in UAE & Sharjah. Get affordable fees, expert tutors, & direct contact information for personalized Arabic classes.',
        url: 'https://arabicjuniors.com/pricing',
    },
    alternates: {
        canonical: 'https://arabicjuniors.com/pricing'
    }
};

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>{children}</>
    );
};

export default layout;
