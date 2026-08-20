"use client";

import React, { useState, useEffect, useCallback } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  ICON_MAP,
  ICON_NAMES,
  ICON_THEMES,
  ICON_THEME_NAMES,
} from "@/lib/sectionIcons";
import type { ContactSeoItem } from "@/types/ContactSeoSection";

export default function ContactSectionAdminPage() {
  const { token } = useAuthAdmin();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heading, setHeading] = useState("");
  const [introText, setIntroText] = useState("");
  const [items, setItems] = useState<ContactSeoItem[]>([]);
  const [ctaHeading, setCtaHeading] = useState("");
  const [ctaSubtext, setCtaSubtext] = useState("");
  const [ctaButtonLabel, setCtaButtonLabel] = useState("");
  const [ctaButtonUrl, setCtaButtonUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contact-seo-section`
      );
      const result = await res.json();
      if (res.ok && result?.data) {
        const d = result.data;
        setHeading(d.heading || "");
        setIntroText(d.introText || "");
        setItems(Array.isArray(d.items) ? d.items : []);
        setCtaHeading(d.ctaHeading || "");
        setCtaSubtext(d.ctaSubtext || "");
        setCtaButtonLabel(d.ctaButtonLabel || "");
        setCtaButtonUrl(d.ctaButtonUrl || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load the contact page section");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setItem = (index: number, patch: Partial<ContactSeoItem>) =>
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        icon: "GraduationCap",
        iconTheme: "green",
        order: prev.length + 1,
      },
    ]);

  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  /** The array order is what the page renders, so moving a card is a swap. */
  const move = (index: number, direction: -1 | 1) =>
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You are signed out. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/contact-seo-section`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            heading,
            introText,
            items,
            ctaHeading,
            ctaSubtext,
            ctaButtonLabel,
            ctaButtonUrl,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("Contact page section updated");
        await revalidateContent(token);
        load();
      } else {
        toast.error(result.message || "Could not save");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save");
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
  const labelClass = "mb-1 block text-sm font-medium text-neutral-700";

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-16">
      <header className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            Contact Page Section
          </h1>
          <p className="text-sm text-neutral-500">
            The heading, cards and trial banner below the contact form on
            /contact-us.
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Heading &amp; intro
        </h2>

        <label className="block">
          <span className={labelClass}>Heading</span>
          <input
            className={inputClass}
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            placeholder="Arabic Tuition for Kids Near Me…"
          />
        </label>

        <label className="block">
          <span className={labelClass}>
            Intro paragraph{" "}
            <span className="font-normal text-neutral-400">
              (the first prose search engines read here)
            </span>
          </span>
          <textarea
            className={`${inputClass} min-h-[110px]`}
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
          />
        </label>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
            Cards ({items.length})
          </h2>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" /> Add Card
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          They lay out three to a row on desktop, so multiples of three look
          tidiest.
        </p>

        {items.length === 0 && (
          <p className="text-sm text-neutral-400">No cards yet.</p>
        )}

        {items.map((item, index) => {
          const Preview = ICON_MAP[item.icon] ?? ICON_MAP.GraduationCap;
          const theme = ICON_THEMES[item.iconTheme] ?? ICON_THEMES.green;

          return (
            <div
              key={index}
              className="rounded-lg border border-neutral-200 p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-lg ${theme}`}
                >
                  <Preview className="w-5 h-5" />
                </span>
                <span className="flex-1 text-sm font-semibold text-neutral-700">
                  Card {index + 1}
                </span>

                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Move card ${index + 1} up`}
                  className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label={`Move card ${index + 1} down`}
                  className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove card ${index + 1}`}
                  className="rounded-lg border border-neutral-200 p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <label className="block">
                <span className={labelClass}>Title</span>
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => setItem(index, { title: e.target.value })}
                  placeholder="Qualified Arabic Tutors"
                />
              </label>

              <label className="block">
                <span className={labelClass}>Description</span>
                <textarea
                  className={`${inputClass} min-h-[88px]`}
                  value={item.description}
                  onChange={(e) =>
                    setItem(index, { description: e.target.value })
                  }
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelClass}>Icon</span>
                  <select
                    className={inputClass}
                    value={item.icon}
                    onChange={(e) => setItem(index, { icon: e.target.value })}
                  >
                    {ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={labelClass}>Icon colour</span>
                  <select
                    className={inputClass}
                    value={item.iconTheme}
                    onChange={(e) =>
                      setItem(index, { iconTheme: e.target.value })
                    }
                  >
                    {ICON_THEME_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Trial banner
        </h2>

        <label className="block">
          <span className={labelClass}>Heading</span>
          <input
            className={inputClass}
            value={ctaHeading}
            onChange={(e) => setCtaHeading(e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Sub text</span>
          <input
            className={inputClass}
            value={ctaSubtext}
            onChange={(e) => setCtaSubtext(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Button text</span>
            <input
              className={inputClass}
              value={ctaButtonLabel}
              onChange={(e) => setCtaButtonLabel(e.target.value)}
            />
          </label>

          <label className="block">
            <span className={labelClass}>Button link</span>
            <input
              className={inputClass}
              value={ctaButtonUrl}
              onChange={(e) => setCtaButtonUrl(e.target.value)}
              placeholder="/register"
            />
          </label>
        </div>
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
