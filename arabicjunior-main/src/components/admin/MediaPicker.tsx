"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button-2";

/**
 * A compact file picker that previews whatever was chosen, for images and
 * videos alike.
 *
 * CoverImagePicker, used by the blog editor, is fixed to a 16:9 banner and
 * cannot preview video, so it does not fit the content screens.
 */
export default function MediaPicker({
  accept = "image/*",
  kind = "image",
  initialUrl,
  onSelect,
  previewClassName,
}: {
  accept?: string;
  kind?: "image" | "video";
  initialUrl?: string;
  onSelect: (file: File | null) => void;
  previewClassName?: string;
}) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [name, setName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Only object URLs need revoking; an initialUrl from the API must not be.
  const objectUrl = useRef<string | null>(null);

  useEffect(() => {
    setPreview(initialUrl ?? null);
  }, [initialUrl]);

  useEffect(
    () => () => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = URL.createObjectURL(file);

    setPreview(objectUrl.current);
    setName(file.name);
    onSelect(file);
  };

  const clear = () => {
    if (objectUrl.current) {
      URL.revokeObjectURL(objectUrl.current);
      objectUrl.current = null;
    }
    setPreview(null);
    setName(null);
    onSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <div className="relative inline-flex flex-col gap-2">
          {kind === "image" ? (
            // A blob: preview cannot go through next/image, which only accepts
            // hosts listed in remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Selected preview"
              className={previewClassName ?? "w-40 h-40 rounded-xl object-cover border"}
            />
          ) : (
            <video src={preview} controls className="w-72 rounded-xl border" />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Change
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              <X size={14} /> Remove
            </Button>
          </div>

          {name && <p className="text-xs text-neutral-500 max-w-72 truncate">{name}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 w-full hover:bg-gray-50"
        >
          {kind === "image" ? (
            <ImagePlus size={28} className="mb-2" />
          ) : (
            <Video size={28} className="mb-2" />
          )}
          <span className="text-sm">
            Click to select {kind === "image" ? "an image" : "a video"}
          </span>
        </button>
      )}
    </div>
  );
}
