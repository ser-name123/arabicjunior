"use client";

import React, { useState, useEffect, useCallback } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import { toast } from "sonner";
import { BadgeDollarSign, Loader2, Save } from "lucide-react";
import {
  ItemListEditor,
  TextListEditor,
  inputClass,
  labelClass,
} from "@/components/admin/SectionEditors";
import type {
  PricingPageCard,
  PricingPageLabel,
  PricingPlanHint,
} from "@/types/PricingPage";

/** Heading + orange highlight + optional sub heading, repeated per section. */
const HeadingFields = ({
  heading,
  setHeading,
  highlight,
  setHighlight,
  subheading,
  setSubheading,
  headingPlaceholder,
  highlightPlaceholder,
}: {
  heading: string;
  setHeading: (v: string) => void;
  highlight: string;
  setHighlight: (v: string) => void;
  subheading: string;
  setSubheading: (v: string) => void;
  headingPlaceholder: string;
  highlightPlaceholder: string;
}) => (
  <>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label className="block">
        <span className={labelClass}>Heading</span>
        <input
          className={inputClass}
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          placeholder={headingPlaceholder}
        />
      </label>
      <label className="block">
        <span className={labelClass}>Highlighted words (orange)</span>
        <input
          className={inputClass}
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          placeholder={highlightPlaceholder}
        />
      </label>
    </div>

    <label className="block">
      <span className={labelClass}>
        Sub heading{" "}
        <span className="font-normal text-neutral-400">(optional)</span>
      </span>
      <textarea
        className={inputClass + " min-h-[70px]"}
        value={subheading}
        onChange={(e) => setSubheading(e.target.value)}
      />
    </label>
  </>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
    <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500">
      {title}
    </h2>
    {children}
  </section>
);

export default function PricingPageAdminPage() {
  const { token } = useAuthAdmin();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [planNotes, setPlanNotes] = useState<string[]>([]);

  const [includedHeading, setIncludedHeading] = useState("");
  const [includedHeadingHighlight, setIncludedHeadingHighlight] = useState("");
  const [includedSubheading, setIncludedSubheading] = useState("");
  const [includedCards, setIncludedCards] = useState<PricingPageCard[]>([]);

  const [chooseHeading, setChooseHeading] = useState("");
  const [chooseHeadingHighlight, setChooseHeadingHighlight] = useState("");
  const [chooseSubheading, setChooseSubheading] = useState("");
  const [chooseCards, setChooseCards] = useState<PricingPlanHint[]>([]);

  const [howHeading, setHowHeading] = useState("");
  const [howHeadingHighlight, setHowHeadingHighlight] = useState("");
  const [howSubheading, setHowSubheading] = useState("");
  const [howSteps, setHowSteps] = useState<PricingPageCard[]>([]);

  const [flexibleHeading, setFlexibleHeading] = useState("");
  const [flexibleSubtext, setFlexibleSubtext] = useState("");
  const [flexiblePills, setFlexiblePills] = useState<PricingPageLabel[]>([]);

  const [whyHeading, setWhyHeading] = useState("");
  const [whyHeadingHighlight, setWhyHeadingHighlight] = useState("");
  const [whySubheading, setWhySubheading] = useState("");
  const [whyItems, setWhyItems] = useState<PricingPageLabel[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/pricing-page`
      );
      const result = await res.json();
      if (res.ok && result?.data) {
        const d = result.data;
        setPlanNotes(Array.isArray(d.planNotes) ? d.planNotes : []);

        setIncludedHeading(d.includedHeading || "");
        setIncludedHeadingHighlight(d.includedHeadingHighlight || "");
        setIncludedSubheading(d.includedSubheading || "");
        setIncludedCards(Array.isArray(d.includedCards) ? d.includedCards : []);

        setChooseHeading(d.chooseHeading || "");
        setChooseHeadingHighlight(d.chooseHeadingHighlight || "");
        setChooseSubheading(d.chooseSubheading || "");
        setChooseCards(Array.isArray(d.chooseCards) ? d.chooseCards : []);

        setHowHeading(d.howHeading || "");
        setHowHeadingHighlight(d.howHeadingHighlight || "");
        setHowSubheading(d.howSubheading || "");
        setHowSteps(Array.isArray(d.howSteps) ? d.howSteps : []);

        setFlexibleHeading(d.flexibleHeading || "");
        setFlexibleSubtext(d.flexibleSubtext || "");
        setFlexiblePills(Array.isArray(d.flexiblePills) ? d.flexiblePills : []);

        setWhyHeading(d.whyHeading || "");
        setWhyHeadingHighlight(d.whyHeadingHighlight || "");
        setWhySubheading(d.whySubheading || "");
        setWhyItems(Array.isArray(d.whyItems) ? d.whyItems : []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load the pricing page settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("You are signed out. Please sign in again.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing-page`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            planNotes: planNotes.map((n) => n.trim()).filter(Boolean),
            includedHeading,
            includedHeadingHighlight,
            includedSubheading,
            includedCards,
            chooseHeading,
            chooseHeadingHighlight,
            chooseSubheading,
            chooseCards,
            howHeading,
            howHeadingHighlight,
            howSubheading,
            howSteps,
            flexibleHeading,
            flexibleSubtext,
            flexiblePills,
            whyHeading,
            whyHeadingHighlight,
            whySubheading,
            whyItems,
          }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("Pricing page updated");
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

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8 pb-16">
      <header className="flex items-center gap-3">
        <BadgeDollarSign className="w-6 h-6 text-orange-500" />
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Pricing Page</h1>
          <p className="text-sm text-neutral-500">
            The sections around the plan cards on /pricing. The plans and their
            prices are edited under Pricing.
          </p>
        </div>
      </header>

      <Section title={`Notes under the plans (${planNotes.length})`}>
        <p className="text-xs text-neutral-500">
          The small print about cancelling, rescheduling and class credits.
        </p>
        <TextListEditor
          lines={planNotes}
          setLines={setPlanNotes}
          addLabel="Add Note"
          placeholder="Write one note…"
        />
      </Section>

      <Section title={`What's included with every plan (${includedCards.length})`}>
        <HeadingFields
          heading={includedHeading}
          setHeading={setIncludedHeading}
          highlight={includedHeadingHighlight}
          setHighlight={setIncludedHeadingHighlight}
          subheading={includedSubheading}
          setSubheading={setIncludedSubheading}
          headingPlaceholder="What's Included With"
          highlightPlaceholder="Every Plan"
        />
        <ItemListEditor<PricingPageCard>
          items={includedCards}
          setItems={setIncludedCards}
          addLabel="Add Card"
          fields={{ description: true, icon: true }}
          blank={() => ({
            title: "",
            description: "",
            icon: "Star",
            iconTheme: "orange",
            order: includedCards.length + 1,
          })}
        />
      </Section>

      <Section title={`Which plan is right (${chooseCards.length})`}>
        <HeadingFields
          heading={chooseHeading}
          setHeading={setChooseHeading}
          highlight={chooseHeadingHighlight}
          setHighlight={setChooseHeadingHighlight}
          subheading={chooseSubheading}
          setSubheading={setChooseSubheading}
          headingPlaceholder="Which Plan Is Right for"
          highlightPlaceholder="Your Child?"
        />
        <p className="text-xs text-neutral-500">
          One card per plan tier. A card with a badge also gets a coloured
          border, so use it on one card only.
        </p>
        <ItemListEditor<PricingPlanHint>
          items={chooseCards}
          setItems={setChooseCards}
          addLabel="Add Plan"
          fields={{ description: true, badge: true }}
          blank={() => ({
            title: "",
            description: "",
            badge: "",
            iconTheme: "orange",
            order: chooseCards.length + 1,
          })}
        />
      </Section>

      <Section title={`How it works (${howSteps.length})`}>
        <HeadingFields
          heading={howHeading}
          setHeading={setHowHeading}
          highlight={howHeadingHighlight}
          setHighlight={setHowHeadingHighlight}
          subheading={howSubheading}
          setSubheading={setHowSubheading}
          headingPlaceholder="How Our Arabic Tuition"
          highlightPlaceholder="Works"
        />
        <p className="text-xs text-neutral-500">
          Numbered automatically from the order here, so reordering renumbers
          them. Three fit on one row.
        </p>
        <ItemListEditor<PricingPageCard>
          items={howSteps}
          setItems={setHowSteps}
          addLabel="Add Step"
          round
          fields={{ description: true, icon: true }}
          blank={() => ({
            title: "",
            description: "",
            icon: "ClipboardList",
            iconTheme: "orange",
            order: howSteps.length + 1,
          })}
        />
      </Section>

      <Section title={`Flexible learning banner (${flexiblePills.length})`}>
        <label className="block">
          <span className={labelClass}>Heading</span>
          <input
            className={inputClass}
            value={flexibleHeading}
            onChange={(e) => setFlexibleHeading(e.target.value)}
            placeholder="Flexible Learning, Anytime, Anywhere"
          />
        </label>

        <label className="block">
          <span className={labelClass}>Sub text</span>
          <textarea
            className={inputClass + " min-h-[70px]"}
            value={flexibleSubtext}
            onChange={(e) => setFlexibleSubtext(e.target.value)}
          />
        </label>

        <p className="text-xs text-neutral-500">
          The small pills along the bottom of the banner. Short labels only.
        </p>
        <ItemListEditor<PricingPageLabel>
          items={flexiblePills}
          setItems={setFlexiblePills}
          addLabel="Add Pill"
          round
          fields={{ icon: true }}
          blank={() => ({
            title: "",
            icon: "Star",
            iconTheme: "orange",
            order: flexiblePills.length + 1,
          })}
        />
      </Section>

      <Section title={`Why parents choose us (${whyItems.length})`}>
        <HeadingFields
          heading={whyHeading}
          setHeading={setWhyHeading}
          highlight={whyHeadingHighlight}
          setHighlight={setWhyHeadingHighlight}
          subheading={whySubheading}
          setSubheading={setWhySubheading}
          headingPlaceholder="Why Parents Choose"
          highlightPlaceholder="Arabic Juniors"
        />
        <ItemListEditor<PricingPageLabel>
          items={whyItems}
          setItems={setWhyItems}
          addLabel="Add Reason"
          round
          fields={{ icon: true }}
          blank={() => ({
            title: "",
            icon: "Star",
            iconTheme: "orange",
            order: whyItems.length + 1,
          })}
        />
      </Section>

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
