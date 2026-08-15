import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm md:text-base lg:text-lg font-semibold transition-all ease-in-out duration-300 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-gray-300",
  {
    variants: {
      variant: {
        default:
          "bg-orange-500 text-white hover:bg-orange-500/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
        destructive:
          "bg-white text-neutral-800 font-normal md:text-sm hover:bg-yellow-500 hover:text-white dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90",
        outline:
          "border border-orange-500 bg-white rounded-3xl md:px-5 md:py-2 lg:text-xl shadow-sm hover:bg-orange-500 hover:text-white dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        secondary:
          "bg-light-green-500 text-white hover:bg-light-green-600 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
        ghost:
          "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
        link: "text-gray-900 underline-offset-4 hover:underline dark:text-gray-50",
        sidebarItem:
          "gap-2 !justify-start hover:bg-accent rounded-md hover:bg-primary/80 hover:text-primary-foreground",
        sidebarActiveItem:
          "gap-2 !justify-start bg-primary rounded-md text-primary-foreground hover:bg-primary/90",
      },
      size: {
        default: "h-9 md:h-11 px-3 py-1 md:px-5 md:py-3",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
