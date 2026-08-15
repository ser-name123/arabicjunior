import React from "react";
import PlanGuideSection from "./components/PlanGuideSection";
import PricingTabs from "./components/PricingTabs";
import { FaqSection } from "@/components/homepage";
import { FaqTypes } from "@/types";
import { fetchContent } from "@/lib/contentApi";
import type { PricingGroup } from "@/types/Pricing";
import Reveal from "@/components/Reveal";

const FAQ_DATA: FaqTypes[] = [
  {
    key: "1",
    question: "What is the cost of the Arabic tuition classes?",
    answer: `Prices vary by package—based on session frequency and class type (group or one-on-one). Check our pricing plans for details.`,
  },
  {
    key: "2",
    question: "Do you offer any discounts or promotions?",
    answer: `Yes, we offer sibling discounts, long-term enrollment deals, and seasonal promotions.`,
  },
  {
    key: "3",
    question: "How can I choose the best pricing plan for my child?",
    answer: `Choose based on your child’s needs and schedule. Contact us for a free consultation if you need help deciding.`,
  },
  {
    key: "4",
    question: "What payment methods do you accept?",
    answer: `We accept credit/debit cards, bank transfers, and PayPal.`,
  },
];

// The page previously also rendered a <Head> block. In the App Router that is a
// no-op — the tags come from layout.tsx, which already carries exactly these
// title, description, Open Graph and canonical values.
const PricingPlanPage = async () => {
  const groups = await fetchContent<PricingGroup>("/pricing");

  // A tab with no cards would render as an empty panel.
  const populated = groups.filter((group) => group.plans.length > 0);

  return (
    <React.Fragment>
      <section
        aria-label="pricing-plan"
        className="relative mb-12 z-[1] before:absolute before:h-96 before:w-full before:bg-gradient-to-r before:from-pink-500 before:from-5% before:via-orange-500 before:via-50% before:to-yellow-500 before:to-100% before:-z-[1]"
      >
        <div className="container pt-10 lg:pt-20">
          <div
            aria-label="pricing-content-wrapper"
            className="bg-white p-5 rounded-xl lg:pt-12 lg:px-9"
          >
            <Reveal as="h1" variant="rise" className="text-3xl font-bold text-neutral-800 text-center mb-4 lg:text-5xl lg:mb-6">
              Your Plan, Your Price
            </Reveal>

            <Reveal as="p" variant="up" delay={120} className="text-sm font-normal text-neutral-700 text-center mb-6 lg:text-lg max-w-[540px] mx-auto">
              Our pricing is built to support every learner at every stage.
              <br />
              Transform your Arabic skills in just{" "}
              <span className="font-bold text-orange-500">60 minutes per class</span>
            </Reveal>

            {populated.length > 0 && (
              <div aria-label="pricing-tab-wrapper">
                <PricingTabs groups={populated} />
              </div>
            )}
          </div>
        </div>
      </section>

      <PlanGuideSection />
      <FaqSection faqData={FAQ_DATA} />
    </React.Fragment>
  );
};

export default PricingPlanPage;
