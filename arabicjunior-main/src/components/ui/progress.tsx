"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-5 w-full overflow-hidden rounded-full bg-orange-200 dark:bg-gray-50/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-orange-500 transition-all dark:bg-gray-50 relative"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      <span
        aria-label="progress-percentage"
        className="absolute right-1 top-1/2 -translate-y-1/2 min-w-1 h-full text-white text-sm font-normal leading-[normal] flex items-center justify-center max-w-maxI"
      >{`${value}%`}</span>
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
