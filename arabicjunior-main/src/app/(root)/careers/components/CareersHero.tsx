import React from "react";

const CareersHero = () => {
  return (
    <React.Fragment>
      <section
        aria-label="career-hero"
        className="relative bg-gradient-to-r from-[#FF60A8] from-5% via-[#FB6238] via-50% to-[#F5AE14] to-100%"
      >
        <div className="container">
          <div
            aria-label="career-hero-wrapper"
            className="py-5 sm:py-10 md:py-20"
          >
            <h5
              aria-label="subtitle"
              className="text-lg font-medium text-[#FFDA62] mb-3"
            >
              Careers
            </h5>
            <h1
              aria-label="title"
              className="text-3xl sm:leading-tight sm:text-5xl font-bold text-white mb-6 leading-tight"
            >
              We are creating a world of lifelong learners, Now you could be
              part of it!
            </h1>
            <p
              aria-label="description"
              className="text-sm sm:text-2xl text-white font-normal max-w-screen-lg leading-tight"
            >
              Be a Part of Something Greater ! It is more than just a job - it’s
              a chance to grow, lead with purpose, and contribute to something
              truly meaningful.
            </p>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default CareersHero;
