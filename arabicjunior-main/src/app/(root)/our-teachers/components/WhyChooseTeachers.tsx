import React from "react";
import { GraduationCap } from "lucide-react";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";
import Reveal from "@/components/Reveal";
import type { TeachersPageCard } from "@/types/TeachersPage";

/**
 * "Why Choose Our Arabic Teachers" — the reasons block above the tutor grid.
 *
 * Typography follows the rest of the site: a large centred heading whose last
 * words are orange, and body copy in neutral-700. A plain server component —
 * nothing here is interactive, so there is no reason to ship it as JavaScript.
 */
const WhyChooseTeachers = ({
  heading,
  headingHighlight,
  subheading,
  cards,
}: {
  heading: string;
  headingHighlight: string;
  subheading: string;
  cards: TeachersPageCard[];
}) => {
  if (!cards.length) return null;

  return (
    <section
      aria-label="why-choose-teachers"
      className="bg-white py-12 sm:pt-14 sm:pb-16"
    >
      <div className="container">
        <Reveal variant="up" className="text-center mb-11">
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
          /**
           * Centred rather than a plain 3-up grid: the design has five cards,
           * which leaves a two-card row underneath. Left-aligned that reads as
           * a mistake; centred it reads as deliberate, and it still works for
           * three, four or six cards if an admin adds or removes one.
           */
          className="flex flex-wrap justify-center gap-5"
        >
          {cards.map((card, index) => {
            const Icon = ICON_MAP[card.icon] ?? GraduationCap;
            const theme = ICON_THEMES[card.iconTheme] ?? ICON_THEMES.orange;

            return (
              <div
                key={`${card.title}-${index}`}
                className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)] rounded-2xl border border-neutral-100 bg-[#FFFDFB] p-6 transition-all ease-in-out duration-300 hover:bg-[#FFF5F1]"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span
                    aria-hidden="true"
                    className={`flex shrink-0 items-center justify-center w-12 h-12 rounded-xl ${theme}`}
                  >
                    <Icon className="w-6 h-6" />
                  </span>
                  <h3 className="flex-1 min-w-0 pt-1.5 text-lg font-semibold text-neutral-900 leading-snug">
                    {card.title}
                  </h3>
                </div>

                <p className="text-base font-normal text-neutral-700 leading-relaxed">
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

export default WhyChooseTeachers;
