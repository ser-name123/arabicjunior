import Image from "next/image";
import React from "react";

const LearnWay = () => {
  return (
    <React.Fragment>
      <section aria-label="world-learn-way" className="py-16">
        <div className="container">
          <div
            aria-label="world-learn-way-wrapper"
            className="flex items-center gap-x-12 gap-y-8 flex-col lg:flex-row"
          >
            <div
              aria-label="left-column"
              className="flex-shrink-0 flex-grow-0 basis-auto order-2 lg:order-1"
            >
              <div
                aria-label="image-wrapper"
                className="max-w-[527px] w-full bg-gradient-to-b from-[#FFB4D5] from-25% via-white via-90% to-[#F6F5F2] to-[112%] rounded-2xl px-16 pt-10"
              >
                <Image
                  src="https://res.cloudinary.com/dromjx3rx/image/upload/v1738256504/learn-way-image_kbhhhv.png"
                  alt="arabic juniors careers"
                  width={1136}
                  height={1754}
                  priority
                />
              </div>
            </div>

            <div aria-label="right-column" className="flex-1 order-1 lg:order-2">
              <h3
                aria-label="section-title"
                className="text-3xl sm:text-5xl font-bold text-neutral-800 mb-4 sm:mb-6 leading-tight sm:leading-tight"
              >
                Change the way the world learns
              </h3>

              <p aria-label="section-paragraph" className="text-sm sm:text-2xl text-neutral-600 font-normal mb-5 last:mb-0">
                We create learning experiences that enhance human potential. Our
                diverse teams work across technology, design, content, marketing
                and more to bring intuitive and impactful programs to learners
                across the world.
              </p>

              <p aria-label="section-paragraph" className="text-sm sm:text-2xl text-neutral-600 font-normal mb-5 last:mb-0">
                Explore your passion at Arabic Juniors. Learn, lead and
                revolutionize education with us.
              </p>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default LearnWay;
