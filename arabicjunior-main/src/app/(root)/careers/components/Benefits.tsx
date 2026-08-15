import {
  IconContinuousLearning,
  IconCrossDomain,
  IconGrowing,
  IconMoneyCharge,
  IconSchoolBuilding,
  IconTechStack,
} from "@/app/(root)/welcome/components/svgIcons";
import WhyJoinCard from "@/app/(root)/welcome/components/WhyJoinCard";
import { WhyJoinItemsTypes } from "@/app/(root)/welcome/types/whyJoinItems";
import React from "react";

const Benefits = () => {
  return (
    <React.Fragment>
      <section aria-label="benefits" className="bg-white py-6 sm:py-16">
        <div className="container">
          <div aria-label="benefits-wrapper">
            <h5
              aria-label="section-subtitle"
              className="text-pink-500 text-base font-semibold text-center mb-4"
            >
              Benefits
            </h5>
            <h1
              aria-label="title"
              className="text-3xl font-bold text-neutral-800 text-center  sm:text-5xl mb-3 sm:leading-tight"
            >
              Why Join Us
            </h1>

            <p
              aria-label="short-description"
              className="text-neutral-400 text-sm sm:text-base text-center font-medium mb-7 sm:mb-10"
            >
              Make a living without leaving home
            </p>

            <div
              aria-label="benefits-card-wrapper"
              className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              <WhyJoinCard
                whyJoinData={WHY_JOIN_ITEMS}
                className="bg-[#F5F6F8]"
                iconWrapperClass="bg-white"
              />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default Benefits;

const WHY_JOIN_ITEMS: WhyJoinItemsTypes[] = [
  {
    key: "fast-growing-company",
    icon: <IconGrowing className="text-4xl text-[#0062FC]" />,
    title: "Flexible Working Hours",
    shortDescription: "Teach from home with a schedule that works for you.",
  },
  {
    icon: <IconSchoolBuilding className="text-4xl text-[#EE2A52]" />,
    key: "great-arabic-schools",
    shortDescription: "Enjoy remote teaching with flexible hours and personal balance",
    title: "Work-Life Balance",
  },
  {
    icon: <IconMoneyCharge className="text-4xl text-[#F5AE14]" />,
    key: "money-charge",
    shortDescription: "Earn competitive pay with clear opportunities for growth.",
    title: "Attractive Payment Structure",
  },
  {
    icon: <IconContinuousLearning className="text-4xl text-[#FF60A8]" />,
    key: "dont-stop-learning",
    shortDescription:
      "Collaborate with a passionate, supportive team of educators",
    title: "Supportive Work Environment",
  },
  {
    icon: <IconTechStack className="text-4xl text-light-green-600" />,
    key: "latest-technology-stack",
    shortDescription: "Contribute to shaping students' futures through your teaching",
    title: "Make a Real Impact",
  },
  {
    icon: <IconCrossDomain className="text-4xl text-[#00E4DB]" />,
    key: "cross-domain-exposure",
    shortDescription:
      "Teach in a stress-free, remote environment with no commute",
    title: "Remote & Stress-Free Teaching",
  },
];
