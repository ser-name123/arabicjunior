import React from "react";
import { IconCheckmarkCircleFill } from "./svgIcons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlanChildren } from "../types/pricingPlanTypes";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { images } from "@/constants/images";

interface PricingCardProps {
  pricingCardData: PlanChildren[];
}

const PricingCard: React.FC<PricingCardProps> = ({ pricingCardData }) => {
  return (
    <React.Fragment>
      {pricingCardData?.map((planCard, index) => (
        <React.Fragment key={index}>
          <div
            aria-label="pricing-card"
            className={cn(
              "bg-neutral-50 pt-9 pb-5 px-8 rounded-2xl shadow-md w-full flex items-center flex-col justify-start relative before:absolute before:top-0 before:left-0 before:h-5 before:w-full before:rounded-t-2xl before:bg-yellow-500",
              planCard.title === "Starter" && "before:bg-yellow-500",
              planCard.title === "Essential" && "before:bg-pink-500",
              planCard.title === "Premium" && "before:bg-light-green-500",
              planCard.title === "Elite" && "before:bg-orange-500",

              //  second tab
              planCard.title === "Group Class 1" && "before:bg-orange-500",
              planCard.title === "Group Class 2" && "before:bg-light-green-500",
              planCard.title === "Group Class 3" && "before:bg-pink-500",
              planCard.title === "Group Class 4" && "before:bg-yellow-500"
            )}
          >
            <div aria-label="card-header" className="flex flex-col w-full">
              <h5
                aria-label="plan-type"
                className={cn(
                  "mb-4 mx-auto bg-yellow-500/10 py-1 px-5 rounded-2xl text-lg font-medium text-yellow-500 text-center flex flex-col items-center justify-center max-w-max",

                  planCard.title === "Starter" &&
                    "bg-yellow-500/10 text-yellow-500",
                  planCard.title === "Essential" &&
                    "bg-pink-500/10 text-pink-500",
                  planCard.title === "Premium" &&
                    "bg-light-green-500/10 text-light-green-500",
                  planCard.title === "Elite" &&
                    "bg-orange-500/10 text-orange-500",

                  //  second tab
                  planCard.title === "Group Class 1" &&
                    "bg-orange-500/10 text-orange-500",
                  planCard.title === "Group Class 2" &&
                    "bg-light-green-500/10 text-light-green-500",
                  planCard.title === "Group Class 3" &&
                    "bg-pink-500/10 text-pink-500",
                  planCard.title === "Group Class 4" &&
                    "bg-yellow-500/10 text-yellow-500"
                )}
              >
                {planCard.title}
              </h5>

              <h4
                aria-label="price-wrapper"
                className="mb-7 pb-3 border-b border-neutral-100 flex items-start gap-x-1 text-xl font-semibold text-neutral-700 justify-center"
              >
                <span aria-label="currenct-type" className="uppercase">
                  {planCard.currencyType}
                </span>
                <span
                  aria-label="price"
                  className="text-neutral-700 font-bold text-5xl"
                >
                  {planCard.price}
                </span>
              </h4>
            </div>

            <div aria-label="card-body" className="flex flex-col w-full">
              <ul
                aria-label="feature-list"
                className="flex items-start justify-normal mx-auto max-w-max gap-y-4 flex-col mb-10"
              >
                {planCard.features?.map((feature, index) => (
                  <React.Fragment key={index}>
                    <li className="flex items-center gap-x-2">
                      {feature.included ? (
                        <Image
                          src={images.imgCorrect}
                          alt="arabic juniors correct photo"
                          width={60}
                          height={60}
                          priority
                          className="flex w-5 flex-shrink-0 flex-grow-0 basis-auto"
                        />
                      ) : (
                        <Image
                          src={images.imgCross}
                          alt="arabic juniors cross photo"
                          width={60}
                          height={60}
                          priority
                          className="flex w-5 flex-shrink-0 flex-grow-0 basis-auto"
                        />
                      )}

                      <span
                        className={cn(
                          "text-base font-medium ",
                          feature.included
                            ? "text-neutral-800"
                            : "text-neutral-500"
                        )}
                      >
                        {feature.title}
                      </span>
                    </li>
                  </React.Fragment>
                ))}
              </ul>
            </div>

            <div
              aria-label="card-bottom"
              className="flex flex-col w-full mt-auto"
            >
              <Button aria-label="start-btn" variant={"outline"} asChild>
                <Link href={planCard.actionBtn.url}>
                  {planCard.actionBtn.label}
                </Link>
              </Button>
            </div>
          </div>
        </React.Fragment>
      ))}
    </React.Fragment>
  );
};

export default PricingCard;
