"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a number up when it first scrolls into view.
 *
 * Takes the display string as written by the admin — "3,500+", "AED 200",
 * "50+" — and animates only the digits inside it, so the separators, currency
 * and trailing "+" survive untouched. Anything with no digits is rendered as
 * given.
 *
 * The final value is what renders on the server, so the real number is in the
 * HTML for search engines and for anyone whose JavaScript never runs.
 */
export default function CountUp({
  value,
  duration = 1600,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Pull the digits out of e.g. "3,500+" -> 3500, and remember where they sat
    // so the suffix and prefix can be put back on every frame.
    const match = value.match(/[\d,]+(?:\.\d+)?/);
    if (!match) return;

    const raw = match[0];
    const target = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(target)) return;

    const prefix = value.slice(0, match.index ?? 0);
    const suffix = value.slice((match.index ?? 0) + raw.length);
    const grouped = raw.includes(",");
    const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = (n: number) => {
      const fixed = n.toFixed(decimals);
      const withGroups = grouped
        ? Number(fixed).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : fixed;
      return `${prefix}${withGroups}${suffix}`;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || started.current) continue;
          started.current = true;
          observer.disconnect();

          const startedAt = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - startedAt) / duration, 1);
            // Same deceleration as the reveals, so the number settles rather
            // than stopping abruptly.
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(format(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };

          setDisplay(format(0));
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
