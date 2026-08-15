import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { images } from "@/constants/images";
import type { AccentColor, PricingPlan } from "@/types/Pricing";
import Reveal from "@/components/Reveal";

interface PricingCardProps {
  pricingCardData: PricingPlan[];
}

/**
 * Written out in full rather than composed from the colour name, because
 * Tailwind only ships classes it can find as literal strings in the source.
 */
const ACCENT: Record<AccentColor, { bar: string; badge: string }> = {
  yellow: {
    bar: "before:bg-yellow-500",
    badge: "bg-yellow-500/10 text-yellow-500",
  },
  pink: {
    bar: "before:bg-pink-500",
    badge: "bg-pink-500/10 text-pink-500",
  },
  green: {
    bar: "before:bg-light-green-500",
    badge: "bg-light-green-500/10 text-light-green-500",
  },
  orange: {
    bar: "before:bg-orange-500",
    badge: "bg-orange-500/10 text-orange-500",
  },
};

const PricingCard: React.FC<PricingCardProps> = ({ pricingCardData }) => {
  return (
    <React.Fragment>
      {pricingCardData?.map((planCard, cardIndex) => {
        const accent = ACCENT[planCard.accentColor] ?? ACCENT.yellow;

        return (
          <Reveal
            key={planCard._id}
            variant="rise"
            index={cardIndex}
            step={110}
            aria-label="pricing-card"
            className={cn(
              "bg-neutral-50 pt-9 pb-5 px-8 rounded-2xl shadow-md w-full flex items-center flex-col justify-start relative before:absolute before:top-0 before:left-0 before:h-5 before:w-full before:rounded-t-2xl hover-lift",
              accent.bar
            )}
          >
            <div aria-label="card-header" className="flex flex-col w-full">
              <h5
                aria-label="plan-type"
                className={cn(
                  "mb-4 mx-auto py-1 px-5 rounded-2xl text-lg font-medium text-center flex flex-col items-center justify-center max-w-max",
                  accent.badge
                )}
              >
                {planCard.title}
              </h5>

              <h4
                aria-label="price-wrapper"
                className="mb-7 pb-3 border-b border-neutral-100 flex items-start gap-x-1 text-xl font-semibold text-neutral-700 justify-center"
              >
                <span aria-label="currency-type" className="uppercase">
                  {planCard.currency}
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
                  <li key={index} className="flex items-center gap-x-2">
                    <Image
                      src={feature.included ? images.imgCorrect : images.imgCross}
                      alt={feature.included ? "included" : "not included"}
                      width={60}
                      height={60}
                      className="flex w-5 flex-shrink-0 flex-grow-0 basis-auto"
                    />

                    <span
                      className={cn(
                        "text-base font-medium ",
                        feature.included ? "text-neutral-800" : "text-neutral-500"
                      )}
                    >
                      {feature.title}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div aria-label="card-bottom" className="flex flex-col w-full mt-auto">
              <Button aria-label="start-btn" variant={"outline"} asChild className="hover-shine">
                <Link href={planCard.actionUrl}>{planCard.actionLabel}</Link>
              </Button>
            </div>
          </Reveal>
        );
      })}
    </React.Fragment>
  );
};

export default PricingCard;
