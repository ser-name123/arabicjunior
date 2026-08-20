"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import { toast } from "sonner";
import {
  HelpCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type Item = { question: string; answer: string; order: number };

export default function FaqSectionAdminPage() {
  const { token } = useAuthAdmin();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heading, setHeading] = useState("");
  const [headingHighlight, setHeadingHighlight] = useState("");
  const [personName, setPersonName] = useState("");
  const [personLabel, setPersonLabel] = useState("");
  const [introLines, setIntroLines] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/faq-section`
      );
      const result = await res.json();
      if (res.ok && result?.data) {
        const d = result.data;
        setHeading(d.heading || "");
        setHeadingHighlight(d.headingHighlight || "");
        setPersonName(d.personName || "");
        setPersonLabel(d.personLabel || "");
        setIntroLines(Array.isArray(d.introLines) ? d.introLines : []);
        setItems(Array.isArray(d.items) ? d.items : []);
        setImageUrl(d.imageUrl || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load the FAQ section");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const setLine = (index: number, value: string) =>
    setIntroLines((prev) => prev.map((l, i) => (i === index ? value : l)));

  const setItem = (index: number, field: keyof Item, value: string) =>
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it))
    );

  const moveItem = (index: number, direction: -1 | 1) =>
    setItems((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((it, i) => ({ ...it, order: i + 1 }));
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You are signed out. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("headingHighlight", headingHighlight);
      formData.append("personName", personName);
      formData.append("personLabel", personLabel);
      formData.append(
        "introLines",
        JSON.stringify(introLines.map((l) => l.trim()).filter(Boolean))
      );
      formData.append(
        "items",
        JSON.stringify(items.map((it, i) => ({ ...it, order: i + 1 })))
      );
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/faq-section`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("FAQ section updated");
        setImageFile(null);
        setImagePreview("");
        await revalidateContent(token);
        loadSettings();
      } else {
        toast.error(result.message || "Could not save the FAQ section");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save the FAQ section");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-16">
      <header className="flex items-center gap-3">
        <HelpCircle className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-neutral-900">FAQ Section</h1>
          <p className="text-sm text-neutral-500">
            The &ldquo;We are often Asked&rdquo; block on the homepage.
          </p>
        </div>
      </header>

      {/* Heading */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Heading
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Heading</span>
            <input
              className={inputClass}
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="We are often"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Highlighted word (shown in orange)
            </span>
            <input
              className={inputClass}
              value={headingHighlight}
              onChange={(e) => setHeadingHighlight(e.target.value)}
              placeholder="Asked"
            />
          </label>
        </div>
      </section>

      {/* Intro copy */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
            Intro paragraphs
          </h2>
          <button
            type="button"
            onClick={() => setIntroLines((p) => [...p, ""])}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" /> Add paragraph
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          These sit above the photo and are the first text search engines read
          in this section.
        </p>

        {introLines.length === 0 && (
          <p className="text-sm text-neutral-400">No paragraphs yet.</p>
        )}

        {introLines.map((line, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={line}
              onChange={(e) => setLine(index, e.target.value)}
              placeholder="Write one paragraph…"
            />
            <button
              type="button"
              onClick={() =>
                setIntroLines((p) => p.filter((_, i) => i !== index))
              }
              aria-label={`Remove paragraph ${index + 1}`}
              className="shrink-0 self-start rounded-lg border border-neutral-200 p-2 text-red-500 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </section>

      {/* Photo + caption */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Photo &amp; caption
        </h2>

        <div className="flex flex-wrap items-start gap-5">
          <div className="w-40">
            {(imagePreview || imageUrl) && (
              <Image
                src={imagePreview || imageUrl}
                alt="Current FAQ section photo"
                width={320}
                height={320}
                unoptimized
                className="w-40 h-auto rounded-lg border border-neutral-200"
              />
            )}
            <input
              id="faq-image"
              type="file"
              accept="image/*"
              onChange={onPickImage}
              className="hidden"
            />
            <label
              htmlFor="faq-image"
              className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
            >
              <Upload className="w-4 h-4" /> Change photo
            </label>
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-2 min-w-[16rem]">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Name</span>
              <input
                className={inputClass}
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="John Paul"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Caption</span>
              <input
                className={inputClass}
                value={personLabel}
                onChange={(e) => setPersonLabel(e.target.value)}
                placeholder="Student Grade 4"
              />
            </label>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
            Questions ({items.length})
          </h2>
          <button
            type="button"
            onClick={() =>
              setItems((p) => [
                ...p,
                { question: "", answer: "", order: p.length + 1 },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" /> Add question
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          Answers accept links, for example{" "}
          <code>&lt;a href=&quot;/register&quot;&gt;free trial&lt;/a&gt;</code>.
        </p>

        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-neutral-200 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                #{index + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move down"
                  className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setItems((p) => p.filter((_, i) => i !== index))
                  }
                  aria-label="Remove question"
                  className="rounded-lg border border-neutral-200 p-1.5 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <input
              className={inputClass}
              value={item.question}
              onChange={(e) => setItem(index, "question", e.target.value)}
              placeholder="Question"
            />
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={item.answer}
              onChange={(e) => setItem(index, "answer", e.target.value)}
              placeholder="Answer"
            />
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-neutral-400">No questions yet.</p>
        )}
      </section>

      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
