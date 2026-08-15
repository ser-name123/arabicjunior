import React from "react";
import WhyJoinCard from "./WhyJoinCard";
import {
  IconClassSession,
  IconContinuousLearning,
  IconCrossDomain,
  IconGrowing,
  IconMoneyCharge,
  IconSchedule,
  IconSchoolBuilding,
  IconSupport,
  IconTechStack,
} from "./svgIcons";
import { WhyJoinItemsTypes } from "../types/whyJoinItems";

const WhyJoinUs = () => {
  return (
    <React.Fragment>
      <section aria-label="why-join-us" className="bg-[#F3F7F4] py-6 sm:py-16">
        <div className="container">
          <div aria-label="why-join-us-wrapper">
            <h5
              aria-label="section-subtitle"
              className="text-pink-500 text-base font-semibold text-center mb-4"
            >
              Lets Learn Together
            </h5>
            <h1
              aria-label="title"
              className="text-3xl font-bold text-neutral-800 text-center mb-7 sm:text-5xl sm:mb-10 sm:leading-tight"
            >
              What Next...
            </h1>

            <div
              aria-label="why-join-card-wrapper"
              className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2 xl:grid-cols-3"
            >
              <WhyJoinCard whyJoinData={WHY_JOIN_ITEMS} />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default WhyJoinUs;

const WHY_JOIN_ITEMS: WhyJoinItemsTypes[] = [
  {
    key: "fast-growing-company",
    icon: <IconSupport className="text-8xl" />,
    title: "We will contact you!",
  },
  {
    icon: <IconClassSession className="text-8xl" />,
    key: "great-arabic-schools",
    title: "Join Trial Session",
  },
  {
    icon: <IconSchedule className="text-8xl" />,
    key: "money-charge",
    title: "Get your Class Schedule",
  },
];
