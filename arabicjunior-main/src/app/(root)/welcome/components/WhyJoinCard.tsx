import React from "react";
import { WhyJoinItemsTypes } from "../types/whyJoinItems";
import { cn } from "@/lib/utils";

interface WhyJoinCardProps extends React.HTMLAttributes<HTMLDivElement> {
  whyJoinData: WhyJoinItemsTypes[];
  iconWrapperClass?: string;
}

const WhyJoinCard: React.FC<WhyJoinCardProps> = ({
  whyJoinData,
  className,
  iconWrapperClass,
}) => {
  return (
    <React.Fragment>
      {whyJoinData?.map((card) => (
        <div
          key={card.key}
          aria-label="why-join-us-card"
          className={cn(
            "bg-white py-10 px-8 rounded-xl w-full gap-6 flex items-center justify-between flex-col",
            className
          )}
        >
          <span
            aria-label="icon-wrapper"
            className={cn(
              "flex flex-col items-center justify-center flex-shrink-0 flex-grow-0 basis-auto",
              iconWrapperClass
            )}
          >
            {card.icon}
          </span>
          <h4
            aria-label="title"
            className="text-2xl font-semibold text-neutral-800"
          >
            {card.title}
          </h4>
        </div>
      ))}
    </React.Fragment>
  );
};

export default WhyJoinCard;
