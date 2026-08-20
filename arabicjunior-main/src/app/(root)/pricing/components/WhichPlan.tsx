import React from "react";
import { Star } from "lucide-react";
import { ICON_THEMES, STEP_THEMES } from "@/lib/sectionIcons";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/Reveal";
import type { PricingPlanHint } from "@/types/PricingPage";

/**
 * "Which Plan Is Right for Your Child?" — a one-line steer for each tier, for
 * the parent who has read four feature lists and still cannot decide.
 *
 * A card carrying a badge gets a coloured border so the recommendation is
 * visible before anyone reads a word.
 */
const WhichPlan = ({
  heading,
  highlight,
  subheading,
  cards,
}: {
  heading: string;
  highlight: string;
  subheading: string;
  cards: PricingPlanHint[];
}) => {
  if (!cards.length) return null;

  return (
    <section aria-label="which-plan" className="bg-white py-12 sm:py-14">
      <div className="container">
        <SectionHeading
          heading={heading}
          highlight={highlight}
          subheading={subheading}
          className="mb-11"
        />

        <Reveal
          variant="rise"
          delay={120}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {cards.map((card, index) => {
            const tint = ICON_THEMES[card.iconTheme] ?? ICON_THEMES.orange;
            const solid = STEP_THEMES[card.iconTheme] ?? STEP_THEMES.orange;
            // The tint pair is "bg-… text-…"; the text half is the tier colour.
            const titleColor = tint.split(" ").find((c) => c.startsWith("text-"));

            return (
              <div
                key={`${card.title}-${index}`}
                className={`relative rounded-2xl border bg-white p-6 pt-8 text-center ${
                  card.badge ? "border-pink-300" : "border-neutral-100"
                }`}
              >
                {card.badge && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${solid}`}
                  >
                    {card.badge}
                  </span>
                )}

                <h3 className={`text-lg font-bold mb-3 ${titleColor}`}>
                  {card.title}
                </h3>
                <p className="text-sm font-normal text-neutral-600 leading-relaxed">
                  {card.description}
                </p>

                <Star
                  aria-hidden="true"
                  className={`mx-auto mt-4 w-5 h-5 ${titleColor}`}
                />
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default WhichPlan;
