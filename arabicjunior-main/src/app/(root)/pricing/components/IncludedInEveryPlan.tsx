import React from "react";
import { Star } from "lucide-react";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/Reveal";
import type { PricingPageCard } from "@/types/PricingPage";

/** "What's Included With Every Plan" — the six things every tier gets. */
const IncludedInEveryPlan = ({
  heading,
  highlight,
  subheading,
  cards,
}: {
  heading: string;
  highlight: string;
  subheading: string;
  cards: PricingPageCard[];
}) => {
  if (!cards.length) return null;

  return (
    <section aria-label="included-every-plan" className="bg-white py-12 sm:py-14">
      <div className="container">
        <SectionHeading
          heading={heading}
          highlight={highlight}
          subheading={subheading}
          className="mb-10"
        />

        {/* Wrapping rather than a fixed grid so a seventh card, or a fifth,
            centres itself instead of leaving a ragged last row. */}
        <Reveal
          variant="rise"
          delay={120}
          className="flex flex-wrap justify-center gap-4"
        >
          {cards.map((card, index) => {
            const Icon = ICON_MAP[card.icon] ?? Star;
            const theme = ICON_THEMES[card.iconTheme] ?? ICON_THEMES.orange;

            return (
              <div
                key={`${card.title}-${index}`}
                className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] xl:w-[calc(16.666%-0.834rem)] rounded-2xl bg-[#FFF5F1] p-5 text-center"
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${theme}`}
                >
                  <Icon className="w-6 h-6" />
                </span>
                <h3 className="text-base font-bold text-neutral-900 mb-1.5 leading-snug">
                  {card.title}
                </h3>
                <p className="text-sm font-normal text-neutral-600 leading-relaxed">
                  {card.description}
                </p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default IncludedInEveryPlan;
