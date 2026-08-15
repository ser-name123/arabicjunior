import React from "react";
import { cn } from "@/lib/utils";
import { OurValuesTypes } from "@/app/(root)/about-us/types";
import {
  IconBoard,
  IconCustomizedLearning,
  IconEmbracing,
  IconOpenBook,
} from "@/app/(root)/about-us/svgIcons";

const EnvisionEmpower = () => {
  const colors = ["#FB6238", "#A6CF4A", "#FF60A8", "#F5AE14"];
  return (
    <React.Fragment>
      <section
        aria-label="envision-empower-section"
        className="py-6 sm:py-10 md:py-20 overflow-hidden bg-[#F3F7F4] z-[1] relative before:absolute before:top-0 before:left-0 before:w-60 before:h-72 before:bg-light-green-500/80 before:blur-[300px] before:-z-[1]"
      >
        <div className="container">
          <div aria-label="envision-empower-wrapper">
            <div
              aria-label="envision-empower-top"
              className="flex flex-col items-center justify-center mb-8 sm:mb-12"
            >
              <h6
                aria-label="subtitle"
                className="mb-3 sm:mb-6 text-pink-500 text-base font-semibold"
              >
                Our Values
              </h6>

              <h3
                aria-label="section-title"
                className="text-3xl text-center sm:text-5xl sm:leading-tight font-bold text-neutral-900 mb-4"
              >
                Envision Enable Empower
              </h3>

              <p
                aria-label="short-description"
                className="text-neutral-400 text-sm sm:text-base text-center font-medium"
              >
                Inspire growth through guided learning paths
              </p>
            </div>

            <div
              aria-label="envision-empower-card-wrapper"
              className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6"
            >
              {OUR_VALUES.map((value, index) => (
                <React.Fragment key={value.key}>
                  <div
                    aria-label="values-card"
                    className="p-4 sm:p-6 rounded-2xl bg-white flex items-start gap-x-5 md:flex-col gap-y-5"
                  >
                    <span
                      aria-label="icon-wrapper"
                      className={cn(
                        "flex-shrink-0 flex-grow-0 basis-auto p-4 sm:p-5 rounded-2xl flex items-center justify-center text-2xl text-white md:text-3xl"
                      )}
                      style={{ background: colors[index % colors.length] }}
                    >
                      {value.icon}
                    </span>

                    <div
                      aria-label="card-column-right"
                      className="flex flex-col gap-y-2"
                    >
                      <h4
                        aria-label="card-title"
                        className="text-neutral-800 font-semibold text-lg sm:text-2xl"
                      >
                        {value.title}
                      </h4>
                      <p
                        aria-label="card-description"
                        className="text-neutral-600 text-sm sm:text-base font-normal"
                      >
                        {value.description}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default EnvisionEmpower;

const OUR_VALUES: OurValuesTypes[] = [
  {
    key: "customized-arabic-learning",
    title: "Build Strong Connections",
    description:
      "We value meaningful relationships between teachers, students, and parents.",
    icon: <IconCustomizedLearning />,
  },
  {
    key: "embracing-arabic-essence",
    title: " Inspire Innovation",
    description:
      "We embrace smart solutions that make online learning simple, engaging, and effective.",
    icon: <IconEmbracing />,
  },
  {
    key: "expert-career-strategist",
    title: "Stay Purpose-Driven",
    description:
      "Every lesson we teach is rooted in a clear mission to impact lives for the better.",
    icon: <IconOpenBook />,
  },
  {
    key: "creative-business-consultant",
    title: "Celebrate Growth",
    description:
      "We believe in progress, not perfection — and we cheer for every step forward.",
    icon: <IconBoard />,
  },
];
