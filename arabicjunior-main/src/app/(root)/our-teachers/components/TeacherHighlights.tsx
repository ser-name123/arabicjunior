import React from "react";
import { UserCheck } from "lucide-react";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";
import Reveal from "@/components/Reveal";
import type { TeachersPageHighlight } from "@/types/TeachersPage";

/**
 * The short "what you get" strip directly under the hero.
 *
 * In the reference these sit inside a white hero. This page's hero is the
 * site's gradient band, so they get their own white strip immediately below —
 * same reading order, and the labels stay legible instead of fighting an
 * orange-to-pink background.
 */
const TeacherHighlights = ({
  highlights,
}: {
  highlights: TeachersPageHighlight[];
}) => {
  if (!highlights.length) return null;

  return (
    <section aria-label="teacher-highlights" className="bg-white pt-8 pb-2 sm:pt-10 sm:pb-4">
      <div className="container">
        <Reveal
          variant="up"
          className="flex flex-wrap items-start justify-center gap-x-8 gap-y-7 sm:gap-x-14"
        >
          {highlights.map((item, index) => {
            const Icon = ICON_MAP[item.icon] ?? UserCheck;
            const theme = ICON_THEMES[item.iconTheme] ?? ICON_THEMES.orange;

            return (
              <div
                key={`${item.title}-${index}`}
                // Capped so a long label wraps to two lines under its icon
                // rather than stretching the row and pushing the others apart.
                className="flex w-32 sm:w-36 flex-col items-center gap-y-3 text-center"
              >
                <span
                  aria-hidden="true"
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${theme}`}
                >
                  <Icon className="w-6 h-6" />
                </span>
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

export default TeacherHighlights;
