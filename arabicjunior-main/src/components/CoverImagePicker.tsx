"use client"

import { useState, useEffect } from "react"
import { ImagePlus, Pencil } from "lucide-react"
import Image from "next/image"

export default function CoverImageUploader({
    initialUrl,
    onSelect,
}: {
    initialUrl?: string // from backend (edit mode)
    onSelect: (file: File | null) => void
}) {
    const [preview, setPreview] = useState<string | null>(initialUrl || null)
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        if (initialUrl) setPreview(initialUrl)
    }, [initialUrl])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null
        if (!selected) return

        setFile(selected)
        setPreview(URL.createObjectURL(selected))
        onSelect(selected)
    }

    return (
        <div className="relative w-full">
            {preview ? (

                <div
                    aria-label="blog-feature-image-wrapper"
                    className="relative flex w-full mb-8"
                >
                    <Image
                        src={preview}
                        alt="blog feature image"
                        width={1320}
                        height={300}
                        priority
                        className="rounded-xl aspect-video w-full object-cover object-top"
                    />

                    <label className="absolute top-2 right-2 text-white bg-orange-500 p-2 rounded-full shadow-lg cursor-pointer">
                        <Pencil size={16} />
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50">
                    <ImagePlus size={32} className="mb-2" />
                    <span>Click to select cover image</span>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </label>
            )}
        </div>
    )
}
