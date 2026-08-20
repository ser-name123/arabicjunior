"use client";

import React, { useState, useEffect, useCallback } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Loader2,
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
import type {
  TeachersPageCard,
  TeachersPageHighlight,
} from "@/types/TeachersPage";

const inputClass =
  "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200";
const labelClass = "mb-1 block text-sm font-medium text-neutral-700";

/**
 * The card editor is shared by "Why choose" and the methodology steps: both are
 * the same shape, and keeping one editor means a fix to either applies to both.
 */
const CardListEditor = ({
  cards,
  setCards,
  noun,
  addLabel,
  defaultIcon,
  defaultTheme,
  hint,
}: {
  cards: TeachersPageCard[];
  setCards: React.Dispatch<React.SetStateAction<TeachersPageCard[]>>;
  noun: string;
  addLabel: string;
  defaultIcon: string;
  defaultTheme: string;
  hint?: string;
}) => {
  const patch = (index: number, next: Partial<TeachersPageCard>) =>
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...next } : c))
    );

  const add = () =>
    setCards((prev) => [
      ...prev,
      {
        title: "",
        description: "",
        icon: defaultIcon,
        iconTheme: defaultTheme,
        order: prev.length + 1,
      },
    ]);

  /** The array order is what the page renders, so moving one is a swap. */
  const move = (index: number, direction: -1 | 1) =>
    setCards((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-700">
          {noun} ({cards.length})
        </h3>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
        >
          <Plus className="w-4 h-4" /> {addLabel}
        </button>
      </div>

      {hint && <p className="text-xs text-neutral-500">{hint}</p>}

      {cards.length === 0 && (
        <p className="text-sm text-neutral-400">Nothing here yet.</p>
      )}

      {cards.map((card, index) => {
        const Preview = ICON_MAP[card.icon] ?? ICON_MAP.GraduationCap;
        const theme = ICON_THEMES[card.iconTheme] ?? ICON_THEMES.orange;

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
                {index + 1}. {card.title || "Untitled"}
              </span>

              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${index + 1} up`}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === cards.length - 1}
                aria-label={`Move ${index + 1} down`}
                className="rounded-lg border border-neutral-200 p-2 text-neutral-500 hover:bg-neutral-50 disabled:opacity-40"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setCards((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label={`Remove ${index + 1}`}
                className="rounded-lg border border-neutral-200 p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                className={inputClass}
                value={card.title}
                onChange={(e) => patch(index, { title: e.target.value })}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={card.description}
                onChange={(e) => patch(index, { description: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className={labelClass}>Icon</span>
                <select
                  className={inputClass}
                  value={card.icon}
                  onChange={(e) => patch(index, { icon: e.target.value })}
                >
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Colour</span>
                <select
                  className={inputClass}
                  value={card.iconTheme}
                  onChange={(e) => patch(index, { iconTheme: e.target.value })}
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
    </>
  );
};

export default function TeachersPageAdminPage() {
  const { token } = useAuthAdmin();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroBadge, setHeroBadge] = useState("");
  const [heroHeading, setHeroHeading] = useState("");
  const [heroHeadingHighlight, setHeroHeadingHighlight] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroPrimaryLabel, setHeroPrimaryLabel] = useState("");
  const [heroPrimaryUrl, setHeroPrimaryUrl] = useState("");
  const [heroSecondaryLabel, setHeroSecondaryLabel] = useState("");
  const [heroSecondaryUrl, setHeroSecondaryUrl] = useState("");
  const [highlights, setHighlights] = useState<TeachersPageHighlight[]>([]);

  const [heading, setHeading] = useState("");
  const [introLines, setIntroLines] = useState<string[]>([]);

  const [whyChooseHeading, setWhyChooseHeading] = useState("");
  const [whyChooseHeadingHighlight, setWhyChooseHeadingHighlight] = useState("");
  const [whyChooseSubheading, setWhyChooseSubheading] = useState("");
  const [whyChooseCards, setWhyChooseCards] = useState<TeachersPageCard[]>([]);

  const [methodologyHeading, setMethodologyHeading] = useState("");
  const [methodologyHeadingHighlight, setMethodologyHeadingHighlight] = useState("");
  const [methodologySubheading, setMethodologySubheading] = useState("");
  const [methodologySteps, setMethodologySteps] = useState<TeachersPageCard[]>(
    []
  );

  const [ctaEnabled, setCtaEnabled] = useState(true);
  const [ctaHeading, setCtaHeading] = useState("");
  const [ctaSubtext, setCtaSubtext] = useState("");
  const [ctaButtonLabel, setCtaButtonLabel] = useState("");
  const [ctaButtonUrl, setCtaButtonUrl] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers-page`
      );
      const result = await res.json();
      if (res.ok && result?.data) {
        const d = result.data;
        setHeroBadge(d.heroBadge || "");
        setHeroHeading(d.heroHeading || "");
        setHeroHeadingHighlight(d.heroHeadingHighlight || "");
        setHeroSubtitle(d.heroSubtitle || "");
        setHeroPrimaryLabel(d.heroPrimaryLabel || "");
        setHeroPrimaryUrl(d.heroPrimaryUrl || "");
        setHeroSecondaryLabel(d.heroSecondaryLabel || "");
        setHeroSecondaryUrl(d.heroSecondaryUrl || "");
        setHighlights(Array.isArray(d.highlights) ? d.highlights : []);

        setHeading(d.heading || "");
        setIntroLines(Array.isArray(d.introLines) ? d.introLines : []);

        setWhyChooseHeading(d.whyChooseHeading || "");
        setWhyChooseHeadingHighlight(d.whyChooseHeadingHighlight || "");
        setWhyChooseSubheading(d.whyChooseSubheading || "");
        setWhyChooseCards(
          Array.isArray(d.whyChooseCards) ? d.whyChooseCards : []
        );

        setMethodologyHeading(d.methodologyHeading || "");
        setMethodologyHeadingHighlight(d.methodologyHeadingHighlight || "");
        setMethodologySubheading(d.methodologySubheading || "");
        setMethodologySteps(
          Array.isArray(d.methodologySteps) ? d.methodologySteps : []
        );

        setCtaEnabled(d.ctaEnabled !== false);
        setCtaHeading(d.ctaHeading || "");
        setCtaSubtext(d.ctaSubtext || "");
        setCtaButtonLabel(d.ctaButtonLabel || "");
        setCtaButtonUrl(d.ctaButtonUrl || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load the teachers page settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setLine = (index: number, value: string) =>
    setIntroLines((prev) => prev.map((l, i) => (i === index ? value : l)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You are signed out. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teachers-page`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            heroBadge,
            heroHeading,
            heroHeadingHighlight,
            heroSubtitle,
            heroPrimaryLabel,
            heroPrimaryUrl,
            heroSecondaryLabel,
            heroSecondaryUrl,
            highlights,
            heading,
            introLines: introLines.map((l) => l.trim()).filter(Boolean),
            whyChooseHeading,
            whyChooseHeadingHighlight,
            whyChooseSubheading,
            whyChooseCards,
            methodologyHeading,
            methodologyHeadingHighlight,
            methodologySubheading,
            methodologySteps,
            ctaEnabled,
            ctaHeading,
            ctaSubtext,
            ctaButtonLabel,
            ctaButtonUrl,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("Teachers page updated");
        await revalidateContent(token);
        loadSettings();
      } else {
        toast.error(result.message || "Could not save the teachers page");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not save the teachers page");
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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-16">
      <header className="flex items-center gap-3">
        <GraduationCap className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Teachers Page</h1>
          <p className="text-sm text-neutral-500">
            Everything on /our-teachers apart from the tutors themselves, which
            live under Teachers.
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Hero banner
        </h2>

        <label className="block">
          <span className={labelClass}>Badge above the heading</span>
          <input
            className={inputClass}
            value={heroBadge}
            onChange={(e) => setHeroBadge(e.target.value)}
            placeholder="Expert Arabic Teachers"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Heading</span>
            <input
              className={inputClass}
              value={heroHeading}
              onChange={(e) => setHeroHeading(e.target.value)}
              placeholder="Meet the Expert Teachers"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Second line (optional)</span>
            <input
              className={inputClass}
              value={heroHeadingHighlight}
              onChange={(e) => setHeroHeadingHighlight(e.target.value)}
              placeholder="Expert & Caring Teachers"
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>Sub text</span>
          <textarea
            className={`${inputClass} min-h-[90px]`}
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Main button text</span>
            <input
              className={inputClass}
              value={heroPrimaryLabel}
              onChange={(e) => setHeroPrimaryLabel(e.target.value)}
              placeholder="Book a Free Trial"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Main button link</span>
            <input
              className={inputClass}
              value={heroPrimaryUrl}
              onChange={(e) => setHeroPrimaryUrl(e.target.value)}
              placeholder="/register"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Second button text</span>
            <input
              className={inputClass}
              value={heroSecondaryLabel}
              onChange={(e) => setHeroSecondaryLabel(e.target.value)}
              placeholder="Explore Our Courses"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Second button link</span>
            <input
              className={inputClass}
              value={heroSecondaryUrl}
              onChange={(e) => setHeroSecondaryUrl(e.target.value)}
              placeholder="/pricing"
            />
          </label>
        </div>
        <p className="text-xs text-neutral-500">
          Leave a button&rsquo;s text empty to hide that button.
        </p>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
            Highlights strip ({highlights.length})
          </h2>
          <button
            type="button"
            onClick={() =>
              setHighlights((p) => [
                ...p,
                { title: "", icon: "UserCheck", iconTheme: "orange", order: p.length + 1 },
              ])
            }
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" /> Add Highlight
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          The row of small icons under the hero. Short labels work best &mdash;
          four fit across on desktop.
        </p>

        {highlights.length === 0 && (
          <p className="text-sm text-neutral-400">Nothing here yet.</p>
        )}

        {highlights.map((item, index) => {
          const Preview = ICON_MAP[item.icon] ?? ICON_MAP.UserCheck;
          const theme = ICON_THEMES[item.iconTheme] ?? ICON_THEMES.orange;
          const patch = (next: Partial<TeachersPageHighlight>) =>
            setHighlights((prev) =>
              prev.map((h, i) => (i === index ? { ...h, ...next } : h))
            );

          return (
            <div
              key={index}
              className="rounded-lg border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-end gap-3"
            >
              <span
                className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-full ${theme}`}
              >
                <Preview className="w-5 h-5" />
              </span>

              <label className="block flex-1">
                <span className={labelClass}>Label</span>
                <input
                  className={inputClass}
                  value={item.title}
                  onChange={(e) => patch({ title: e.target.value })}
                  placeholder="Experienced Teachers"
                />
              </label>

              <label className="block sm:w-44">
                <span className={labelClass}>Icon</span>
                <select
                  className={inputClass}
                  value={item.icon}
                  onChange={(e) => patch({ icon: e.target.value })}
                >
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:w-32">
                <span className={labelClass}>Colour</span>
                <select
                  className={inputClass}
                  value={item.iconTheme}
                  onChange={(e) => patch({ iconTheme: e.target.value })}
                >
                  {ICON_THEME_NAMES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() =>
                  setHighlights((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label={`Remove highlight ${index + 1}`}
                className="shrink-0 rounded-lg border border-neutral-200 p-2 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Why choose our teachers
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Heading</span>
            <input
              className={inputClass}
              value={whyChooseHeading}
              onChange={(e) => setWhyChooseHeading(e.target.value)}
              placeholder="Why Choose Our"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Highlighted words (orange)</span>
            <input
              className={inputClass}
              value={whyChooseHeadingHighlight}
              onChange={(e) => setWhyChooseHeadingHighlight(e.target.value)}
              placeholder="Arabic Teachers?"
            />
          </label>
        </div>
        <p className="text-xs text-neutral-500">
          The highlight is the tail of the heading and renders in orange, the
          way every other section heading on the site is written.
        </p>

        <label className="block">
          <span className={labelClass}>Sub heading</span>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={whyChooseSubheading}
            onChange={(e) => setWhyChooseSubheading(e.target.value)}
          />
        </label>

        <CardListEditor
          cards={whyChooseCards}
          setCards={setWhyChooseCards}
          noun="Cards"
          addLabel="Add Card"
          defaultIcon="GraduationCap"
          defaultTheme="orange"
          hint="Three to a row on desktop; any leftovers are centred underneath."
        />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Teaching methodology
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className={labelClass}>Heading</span>
            <input
              className={inputClass}
              value={methodologyHeading}
              onChange={(e) => setMethodologyHeading(e.target.value)}
              placeholder="Our Teaching"
            />
          </label>
          <label className="block">
            <span className={labelClass}>Highlighted words (orange)</span>
            <input
              className={inputClass}
              value={methodologyHeadingHighlight}
              onChange={(e) => setMethodologyHeadingHighlight(e.target.value)}
              placeholder="Methodology"
            />
          </label>
        </div>
        <p className="text-xs text-neutral-500">
          The highlight is the tail of the heading and renders in orange, the
          way every other section heading on the site is written.
        </p>

        <label className="block">
          <span className={labelClass}>Sub heading</span>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={methodologySubheading}
            onChange={(e) => setMethodologySubheading(e.target.value)}
          />
        </label>

        <CardListEditor
          cards={methodologySteps}
          setCards={setMethodologySteps}
          noun="Steps"
          addLabel="Add Step"
          defaultIcon="ClipboardList"
          defaultTheme="orange"
          hint="Numbered automatically from their order here, so reordering renumbers them. Four fit on one row."
        />
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
          Heading above the tutor grid
        </h2>
        <input
          className={inputClass}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder="Meet our dynamic team or tutors"
        />

        <div className="flex items-center justify-between pt-2">
          <h3 className="text-sm font-semibold text-neutral-700">
            Text under the heading ({introLines.length})
          </h3>
          <button
            type="button"
            onClick={() => setIntroLines((p) => [...p, ""])}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            <Plus className="w-4 h-4" /> Add paragraph
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          This is the first prose search engines read on the page. Write for
          parents first and mention what you actually teach.
        </p>

        {introLines.length === 0 && (
          <p className="text-sm text-neutral-400">No paragraphs yet.</p>
        )}

        {introLines.map((line, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              className={`${inputClass} min-h-[84px]`}
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

      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
            Trial banner
          </h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ctaEnabled}
              onChange={(e) => setCtaEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Show on the page
          </label>
        </div>

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
          <textarea
            className={`${inputClass} min-h-[70px]`}
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
