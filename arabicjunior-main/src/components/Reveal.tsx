import React from "react";
import { cn } from "@/lib/utils";

export type RevealVariant =
  | "up"
  | "down"
  | "left"
  | "right"
  | "fade"
  | "scale"
  | "rise"
  | "focus";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Direction the element travels from. */
  variant?: RevealVariant;
  /** Milliseconds to wait before this element starts. */
  delay?: number;
  /** Position in a list — multiplied by `step` to stagger a grid. */
  index?: number;
  /** Gap between staggered siblings. */
  step?: number;
  /** Render as a different element, e.g. "li" or "section". */
  as?: React.ElementType;
}

/**
 * Marks a block to animate in when it scrolls into view.
 *
 * The work is done by CSS plus the single IntersectionObserver in
 * AnimateObserver — this component only sets the attribute and the delay, so
 * it stays a server component and adds nothing to the JavaScript bundle. That
 * matters here: these wrappers go around content on every marketing page, and
 * a per-element client component would have pulled the whole tree over the
 * client boundary and out of the server-rendered HTML.
 *
 * Nothing is hidden unless JavaScript has marked the document (see globals.css),
 * so a failed script leaves the page fully readable.
 */
export default function Reveal({
  variant = "up",
  delay,
  index,
  step = 80,
  as: Tag = "div",
  className,
  style,
  children,
  ...rest
}: RevealProps) {
  const computedDelay = delay ?? (index !== undefined ? index * step : 0);

  return (
    <Tag
      data-reveal={variant}
      className={cn(className)}
      style={
        computedDelay
          ? ({ ...style, "--d": `${computedDelay}ms` } as React.CSSProperties)
          : style
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
