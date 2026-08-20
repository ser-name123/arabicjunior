import React from "react";
import Reveal from "@/components/Reveal";

/**
 * The centred heading every marketing section on this site uses: dark text with
 * the closing words in orange, and an optional line of copy underneath.
 *
 * Pulled out because it was being retyped in every new section, and the sizes
 * had already started to drift apart between them.
 */
const SectionHeading = ({
  heading,
  highlight,
  subheading,
  className = "",
}: {
  heading: string;
  highlight?: string;
  subheading?: string;
  className?: string;
}) => (
  <Reveal variant="up" className={`text-center ${className}`}>
    <h2 className="text-3xl leading-tight sm:text-[2.5rem] sm:leading-tight font-bold text-neutral-900 mb-4">
      {heading}{" "}
      {highlight && <span className="text-orange-500">{highlight}</span>}
    </h2>
    {subheading && (
      <p className="text-base sm:text-lg font-normal text-neutral-700 leading-relaxed max-w-3xl mx-auto">
        {subheading}
      </p>
    )}
  </Reveal>
);

export default SectionHeading;
