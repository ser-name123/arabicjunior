import React from "react";
import { ClipboardList } from "lucide-react";
import { ICON_MAP, ICON_THEMES, STEP_THEMES } from "@/lib/sectionIcons";
import Reveal from "@/components/Reveal";
import type { TeachersPageCard } from "@/types/TeachersPage";

/**
 * "Our Teaching Methodology" — the numbered steps.
 *
 * The reference design put this on a dark navy band, but nothing on this site
 * uses a dark section: every band is a light tint of the brand palette, so a
 * navy block sat on the page as an obvious import from somewhere else. The soft
 * peach here is the tint the site already uses most, and it separates cleanly
 * from the white section above and the pale green tutor grid below.
 *
 * The step number comes from the card's position rather than a stored value, so
 * reordering in the admin screen renumbers the steps automatically instead of
 * producing a 1, 3, 2, 4 sequence.
 */
const TeachingMethodology = ({
  heading,
  headingHighlight,
  subheading,
  steps,
}: {
  heading: string;
  headingHighlight: string;
  subheading: string;
  steps: TeachersPageCard[];
}) => {
  if (!steps.length) return null;

  return (
    <section
      aria-label="teaching-methodology"
      className="bg-[#FFF5F1] py-12 sm:pt-14 sm:pb-16"
    >
      <div className="container">
        <Reveal variant="up" className="text-center mb-14">
          <h2 className="text-3xl leading-tight sm:text-5xl sm:leading-tight font-bold text-neutral-900 mb-5">
            {heading}{" "}
            {headingHighlight && (
              <span className="text-orange-500">{headingHighlight}</span>
            )}
          </h2>
          {subheading && (
            <p className="text-base sm:text-lg font-normal text-neutral-700 leading-relaxed max-w-3xl mx-auto">
              {subheading}
            </p>
          )}
        </Reveal>

        <Reveal
          variant="rise"
          delay={120}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-5"
        >
          {steps.map((step, index) => {
            const Icon = ICON_MAP[step.icon] ?? ClipboardList;
            const badge = STEP_THEMES[step.iconTheme] ?? STEP_THEMES.orange;
            const tile = ICON_THEMES[step.iconTheme] ?? ICON_THEMES.orange;
            const isLast = index === steps.length - 1;

            return (
              <div key={`${step.title}-${index}`} className="relative">
                {/* The connector between steps. Hidden on the last card and on
                    narrow screens, where the cards stack and a horizontal line
                    would point at nothing. */}
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="hidden lg:block absolute top-1/2 -right-5 w-5 border-t-2 border-dashed border-orange-200"
                  />
                )}

                <div className="h-full rounded-2xl border border-neutral-100 bg-white px-5 pb-7 pt-9 text-center">
                  <span
                    aria-hidden="true"
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${badge}`}
                  >
                    {index + 1}
                  </span>

                  <span
                    aria-hidden="true"
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${tile}`}
                  >
                    <Icon className="w-6 h-6" />
                  </span>

                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-base font-normal text-neutral-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default TeachingMethodology;
