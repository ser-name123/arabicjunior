import React from "react";
import { Star } from "lucide-react";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/Reveal";
import type { PricingPageLabel } from "@/types/PricingPage";

/** "Why Parents Choose Arabic Juniors" — a row of short reassurance points. */
const WhyParentsChoose = ({
  heading,
  highlight,
  subheading,
  items,
}: {
  heading: string;
  highlight: string;
  subheading: string;
  items: PricingPageLabel[];
}) => {
  if (!items.length) return null;

  return (
    <section aria-label="why-parents-choose" className="bg-white py-12 sm:py-14">
      <div className="container">
        <SectionHeading
          heading={heading}
          highlight={highlight}
          subheading={subheading}
          className="mb-10"
        />

        <Reveal
          variant="up"
          delay={120}
          className="flex flex-wrap items-start justify-center gap-x-8 gap-y-8 sm:gap-x-12"
        >
          {items.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? Star;
            const theme = ICON_THEMES[item.iconTheme] ?? ICON_THEMES.orange;
            const iconColor = theme.split(" ").find((c) => c.startsWith("text-"));

            return (
              <div
                key={`${item.title}-${index}`}
                // Capped so a long label wraps under its icon rather than
                // stretching the row and pushing the others apart.
                className="flex w-36 sm:w-40 flex-col items-center gap-y-3 text-center"
              >
                <Icon aria-hidden="true" className={`w-8 h-8 ${iconColor}`} />
                <p className="text-sm font-semibold text-neutral-800 leading-snug">
                  {item.title}
                </p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default WhyParentsChoose;
