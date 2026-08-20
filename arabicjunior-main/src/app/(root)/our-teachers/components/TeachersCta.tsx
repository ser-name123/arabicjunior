import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/Reveal";

/** The "Start Your Arabic Learning Journey Today!" banner under the tutor grid. */
const TeachersCta = ({
  heading,
  subtext,
  buttonLabel,
  buttonUrl,
}: {
  heading: string;
  subtext: string;
  buttonLabel: string;
  buttonUrl: string;
}) => {
  if (!heading && !buttonLabel) return null;

  return (
    <section aria-label="teachers-cta" className="bg-white py-12 sm:py-16">
      <div className="container">
        <Reveal
          variant="rise"
          className="rounded-2xl border border-orange-200 bg-orange-100 px-5 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left"
        >
          <span
            aria-hidden="true"
            className="flex shrink-0 items-center justify-center w-14 h-14 rounded-full bg-white"
          >
            <BookOpenText className="w-7 h-7 text-orange-500" />
          </span>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
              {heading}
            </h2>
            {subtext && (
              <p className="text-base font-normal text-neutral-700 leading-relaxed">
                {subtext}
              </p>
            )}
          </div>

          {buttonLabel && (
            <Button asChild className="shrink-0 w-full sm:w-auto md:text-base">
              <Link href={buttonUrl || "/register"}>
                {buttonLabel}
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Link>
            </Button>
          )}
        </Reveal>
      </div>
    </section>
  );
};

export default TeachersCta;
