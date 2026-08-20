import React from "react";
import { ArrowRight, ClipboardList } from "lucide-react";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";
import SectionHeading from "@/components/sections/SectionHeading";
import Reveal from "@/components/Reveal";
import type { PricingPageCard } from "@/types/PricingPage";

/**
 * "How Our Arabic Tuition Works" — three steps with an arrow between them.
 *
 * The step number comes from position rather than a stored value, so reordering
 * in the admin screen renumbers them instead of leaving a 01, 03, 02 sequence.
 */
const HowItWorks = ({
  heading,
  highlight,
  subheading,
  steps,
}: {
  heading: string;
  highlight: string;
  subheading: string;
  steps: PricingPageCard[];
}) => {
  if (!steps.length) return null;

  return (
    <section aria-label="how-it-works" className="bg-white py-12 sm:py-14">
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
          className="flex flex-col lg:flex-row items-stretch justify-center gap-6 lg:gap-4"
        >
          {steps.map((step, index) => {
            const Icon = ICON_MAP[step.icon] ?? ClipboardList;
            const theme = ICON_THEMES[step.iconTheme] ?? ICON_THEMES.orange;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={`${step.title}-${index}`}>
                <div className="flex flex-1 items-start gap-4 max-w-md mx-auto lg:mx-0">
                  <span
                    aria-hidden="true"
                    className={`flex shrink-0 items-center justify-center w-14 h-14 rounded-full ${theme}`}
                  >
                    <Icon className="w-7 h-7" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-orange-500 mb-1">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-sm font-normal text-neutral-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Hidden on the last step, and on narrow screens where the
                    steps stack and a sideways arrow would point at nothing. */}
                {!isLast && (
                  <ArrowRight
                    aria-hidden="true"
                    className="hidden lg:block w-6 h-6 shrink-0 self-center text-orange-300"
                  />
                )}
              </React.Fragment>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default HowItWorks;
