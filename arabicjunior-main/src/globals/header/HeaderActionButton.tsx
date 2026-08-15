"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { WhatsAppIcon } from "./svgIcons";

const HeaderActionButton = () => {
  const [headerPhone, setHeaderPhone] = useState("+971 50 534 4645");
  const [headerLink, setHeaderLink] = useState("tel:+971505344645");

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/settings`);
        const result = await res.json();
        if (res.ok && result.data) {
          setHeaderPhone(result.data.headerPhone || "+971 50 534 4645");
          setHeaderLink(result.data.headerPhoneLink || "tel:+971505344645");
        }
      } catch (err) {
        console.error("Error loading header action button contact settings:", err);
      }
    };
    fetchContactSettings();
  }, []);

  return (
    <React.Fragment>
      <div className="flex items-center gap-2 md:gap-3">
        <Button asChild aria-label="header-action-button" className="text-sm md:text-lg px-4 md:px-5 py-2">
          <Link href={headerLink}>
            <WhatsAppIcon className="text-sm md:text-base lg:text-xl text-white" />
            <span className="hidden sm:inline">{headerPhone}</span>
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
