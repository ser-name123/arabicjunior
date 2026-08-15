import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { WhatsAppIcon } from "./svgIcons";

const HeaderActionButton = () => {
  return (
    <React.Fragment>
      <div className="flex items-center gap-2 md:gap-3">
        <Button asChild aria-label="header-action-button" className="text-sm md:text-lg px-4 md:px-5 py-2">
          <Link href={"tel:+971 50 534 4645"}>
            <WhatsAppIcon className="text-sm md:text-base lg:text-xl text-white" />
            <span className="hidden sm:inline">+971 50 534 4645</span>
            <span className="sm:hidden">Call</span>
          </Link>
        </Button>

        <Button 
          variant="outline" 
          asChild 
          aria-label="book-free-trial-button"
          className="text-sm md:text-lg px-4 md:px-5 py-2 whitespace-nowrap"
        >
          <Link href="/register">            
            <span className="hidden sm:inline">Book a Free Trial</span>
            <span className="sm:hidden">Trial</span>
          </Link>
        </Button>
      </div>
    </React.Fragment>
  );
};

export default HeaderActionButton;
