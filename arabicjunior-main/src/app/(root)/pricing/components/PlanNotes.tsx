import React from "react";
import Reveal from "@/components/Reveal";

/** The small print under the plan cards: cancellation, rescheduling, credits. */
const PlanNotes = ({ notes }: { notes: string[] }) => {
  if (!notes.length) return null;

  return (
    <Reveal
      variant="up"
      aria-label="plan-notes"
      as="ul"
      className="mt-8 flex flex-col gap-y-2"
    >
      {notes.map((note, index) => (
        <li key={index} className="flex items-start gap-x-3">
          <span
            aria-hidden="true"
            className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"
          />
          <span className="text-sm font-normal text-neutral-600 leading-relaxed">
            {note}
          </span>
        </li>
      ))}
    </Reveal>
  );
};

export default PlanNotes;
