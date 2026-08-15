import React from "react";
import JobCard from "./JobCard";
import Reveal from "@/components/Reveal";

const OpenJobSection = () => {
  return (
    <React.Fragment>
      <section aria-label="open-jobs" className="py-20 bg-white">
        <div className="container">
          <div aria-label="open-jobs-wrapper">
            <Reveal
              as="h5"
              variant="up"
              aria-label="section-subtitlw"
              className="mb-6 text-base font-semibold text-yellow-500 text-center"
            >
              Job Open
            </Reveal>
            <Reveal
              as="h3"
              variant="up"
              delay={90}
              aria-label="section-title"
              className="mb-10 sm:mb-12 text-center text-3xl sm:text-5xl font-bold text-neutral-800"
            >
              Current Job Openning
            </Reveal>

            <div
              aria-label="job-card-wrapper"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-center gap-x-6 gap-y-6"
            >
              <JobCard />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default OpenJobSection;
