"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PricingCard from "./PricingCard";
import type { PricingGroup } from "@/types/Pricing";

/**
 * The notes under the cards belong to the tab, so they render inside each
 * TabsContent. The previous version tracked the selected tab in state purely to
 * pick between two hard-coded lists of bullets.
 */
const PricingTabs = ({ groups }: { groups: PricingGroup[] }) => (
  <Tabs defaultValue={groups[0]?.key} className="w-full">
    <TabsList>
      {groups.map((group) => (
        <TabsTrigger key={group.key} value={group.key}>
          {group.label}
        </TabsTrigger>
      ))}
    </TabsList>

    {groups.map((group) => (
      <TabsContent key={group.key} value={group.key}>
        <div
          aria-label="pricing-card-wrapper"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-y-6 gap-x-5"
        >
          <PricingCard pricingCardData={group.plans} />
        </div>

        {group.notes.length > 0 && (
          <div aria-describedby="section-bottom" className="mt-8">
            <ul className="text-neutral-700 font-normal text-xs list-disc space-y-1 pl-4">
              {group.notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </TabsContent>
    ))}
  </Tabs>
);

export default PricingTabs;
