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
        <div className="xl:w-[350px]"></div>
        <HeaderNav className="flex-row gap-x-10 bg-transparent py-3 px-5 rounded-full" />
        <HeaderActionButton />
      </div>
    </React.Fragment>
  );
};

export default LgScreenHeader;
