import React from "react";
import { Star } from "lucide-react";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";
import Reveal from "@/components/Reveal";
import type { PricingPageLabel } from "@/types/PricingPage";

/** "Flexible Learning, Anytime, Anywhere" — the peach banner with its pills. */
const FlexibleLearning = ({
  heading,
  subtext,
  pills,
}: {
  heading: string;
  subtext: string;
  pills: PricingPageLabel[];
}) => {
  if (!heading && !pills.length) return null;

  return (
    <section aria-label="flexible-learning" className="bg-white py-8 sm:py-10">
      <div className="container">
        <Reveal
          variant="rise"
          className="rounded-3xl bg-[#FFF5F1] px-5 py-9 sm:px-10 sm:py-11 text-center"
        >
          {heading && (
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
              {heading}
            </h2>
          )}
          {subtext && (
            <p className="text-base font-normal text-neutral-600 leading-relaxed mb-7">
              {subtext}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {pills.map((pill, index) => {
              const Icon = ICON_MAP[pill.icon] ?? Star;
              const theme = ICON_THEMES[pill.iconTheme] ?? ICON_THEMES.orange;
              // The tint pair is "bg-… text-…"; only the text half is wanted
              // here — the pill itself is white.
              const iconColor = theme.split(" ").find((c) => c.startsWith("text-"));

              return (
                <span
                  key={`${pill.title}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800"
                >
                  <Icon aria-hidden="true" className={`w-4 h-4 ${iconColor}`} />
                  {pill.title}
                </span>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FlexibleLearning;
