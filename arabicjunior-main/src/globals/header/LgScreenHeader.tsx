import React from "react";
import HeaderNav from "./HeaderNav";
import HeaderActionButton from "./HeaderActionButton";
import { cn } from "@/lib/utils";
import HeaderSearch from "./HeaderSearch";

const LgScreenHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <React.Fragment>
      <div
        aria-label="header-for-larger-screen"
        className={cn("flex items-center gap-x-5 md:justify-end lg:justify-between flex-1", className)}
        {...props}
      >
        {/* <HeaderSearch/> */}
        {/* Flexible spacer. It absorbs leftover width on very wide screens so
            the nav sits away from the logo, but collapses when space is tight.
            This was `xl:w-[350px]`, a fixed reservation that kicked in at
            exactly 1280px — the width where the header is already tightest —
            and pushed the "Book a Free Trial" button outside the container
            between roughly 1280px and 1500px. */}
        <div className="hidden xl:block xl:flex-1" aria-hidden="true" />
        <HeaderNav className="flex-row gap-x-10 bg-transparent py-3 px-5 rounded-full" />
        <HeaderActionButton />
      </div>
    </React.Fragment>
  );
};

export default LgScreenHeader;
