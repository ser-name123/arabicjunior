"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BackButton({ label }: { label: string }) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.back()}
            aria-label="back-to-prev"
            className="flex items-center gap-x-2 text-yellow-400 text-lg font-medium hover:text-yellow-300 hover:cursor-pointer"
        >
            <ArrowLeft className="text-2xl" />
            <p>{label || 'Back to Blog'}</p>
        </div>
    );
}
