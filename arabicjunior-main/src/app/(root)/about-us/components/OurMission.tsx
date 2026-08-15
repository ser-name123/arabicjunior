import Image from "next/image";
import React from "react";
import { IconMission } from "../svgIcons";
import { cn } from "@/lib/utils";

const OurMission = () => {
  return (
    <React.Fragment>
      <section aria-label="our-dream-area" className="bg-white py-6 md:py-20">
        <div className="container">
          <div aria-label="dream-card-wrapper" className="w-full space-y-8">
            {MISSION_DATA.map((mv) => (
              <React.Fragment key={mv.key}>
                <div
                  aria-label="our-mission-wrapper"
                  className={cn(
                    "flex items-center gap-x-10 justify-between overflow-hidden rounded-3xl flex-col lg:flex-row",

                    // card bg
                    mv.key === "our-mission" && "bg-yellow-500",
                    mv.key === "our-vision" && "bg-pink-500"
                  )}
                >
                  <div
                    aria-label="column-left"
                    className="max-w-[400px] self-start lg:self-end order-2 lg:order-1"
                  >
                    <Image
                      src={mv.image.url}
                      alt={mv.image.alt}
                      width={mv.image.width}
                      height={mv.image.height}
                      priority
                      className="transform scale-x-[-1] -translate-x-3"
                    />
                  </div>

                  <div
                    aria-label="column-right"
                    className={cn(
                      "p-4 md:px-8 md:py-10 rounded-2xl flex-1 m-5 md:m-10 lg:ml-0 max-w-[39rem] order-1 lg:order-2",
                      // bg
                      mv.key === "our-mission" && "bg-yellow-300",
                      mv.key === "our-vision" && "bg-pink-300"
                    )}
                  >
                    <div
                      aria-label="title-wrapper"
                      className="flex items-center gap-x-5 mb-6 md:mb-8"
                    >
                      <span
                        aria-label="icon-wrapper"
                        className="flex items-center text-[2.5rem] text-neutral-800 flex-shrink-0 flex-grow-0 basis-auto"
                      >
                        {mv.title.icon}
                      </span>
                      <h3
                        aria-label="title"
                        className="text-2xl sm:text-3xl font-bold text-neutral-800"
                      >
                        {mv.title.text}
                      </h3>
                    </div>

                    <p
                      aria-label="mission-description"
                      className="text-neutral-800 font-normal text-base sm:text-xl"
                    >
                      {mv.description}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default OurMission;

const MISSION_DATA = [
  {
    key: "our-mission",
    title: { text: "Our Mission", icon: <IconMission /> },
    description: `We design and offer digital educational programs and curricula, guiding students from primary to high school. Our goal is to integrate modern teaching strategies and innovative technologies, while staying true to core educational principles and fostering overall student development.`,
    image: {
      width: 1132,
      height: 952,
      url: "https://res.cloudinary.com/dromjx3rx/image/upload/v1737914364/our-mission_1_vlm1zx.png",
      alt: "juniors arabic our mission",
    },
  },
  {
    key: "our-vision",
    title: { text: "Our Vision", icon: <IconMission /> },
    description: `At Arabic Juniors, our mission is to provide high-quality, one-on-one Arabic tutoring, helping students master grammar, literature, and comprehension. We create a supportive environment where learners gain the skills, confidence, and knowledge to succeed academically and beyond.`,
    image: {
      width: 1132,
      height: 952,
      url: "https://res.cloudinary.com/dromjx3rx/image/upload/v1737996315/our-vision_vnwyrk.png",
      alt: "juniors arabic our vision",
    },
  },
];
