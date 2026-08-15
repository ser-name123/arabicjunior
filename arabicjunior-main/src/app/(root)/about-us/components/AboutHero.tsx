import Image from "next/image";
import React from "react";

const AboutHero = () => {
  return (
    <React.Fragment>
      <section
        aria-label="about-us-hero"
        className="py-6 sm:py-10 md:py-20 bg-gradient-to-r from-[#FF60A8] from-5% via-[#FB6238] via-50% to-[#F5AE14] to-[101%]"
      >
        <div className="container">
          <div
            aria-label="about-us-wrapper"
            className="flex items-center gap-x-8 justify-between flex-col gap-y-6 md:flex-row"
          >
            <div aria-label="column-left" className="max-w-screen-md">
              <h5
                aria-label="subtitle"
                className="text-lg font-medium text-[#FFDA62] mb-2"
              >
                About us
              </h5>
              <h1
                aria-label="title"
                className="text-3xl sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight font-bold text-white leading-tight mb-3"
              >
                Creating a better future for each learner
              </h1>
              <p
                aria-label="description"
                className="text-sm sm:text-base font-medium text-white"
              >
                We believe strong Arabic skills open doors to academic success,
                cultural connection, and lasting confidence. Mastering Arabic
                empowers students to excel in their studies and build meaningful
                connections
              </p>
            </div>

            <div
              aria-label="column-right"
              className="flex-shrink-0 flex-grow-0 basis-auto"
            >
              <Image
                src="https://res.cloudinary.com/dromjx3rx/image/upload/v1737911763/about-us-hero_tr2fa9.svg"
                alt="Arabic Juniors about us hero"
                width={268}
                height={280}
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default AboutHero;
