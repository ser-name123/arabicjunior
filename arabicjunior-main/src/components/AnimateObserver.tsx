"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const SELECTOR =
  "[data-reveal]:not(.is-visible), .reveal-fade-in:not(.active), .reveal-slide-up:not(.active), .reveal-slide-left:not(.active), .reveal-slide-right:not(.active), .reveal-scale-up:not(.active)";

const markVisible = (el: Element) => {
  el.classList.add("is-visible", "active");
};

/**
 * Reveals elements as they scroll into view.
 *
 * Three things the previous version got wrong, all of them visible to users:
 *
 * - It waited 200ms before observing anything, so content already on screen at
 *   load sat invisible and then faded in late — the reveal read as a stutter
 *   rather than an entrance. Elements in the viewport on the first frame are
 *   now shown immediately.
 *
 * - It ran `querySelectorAll` exactly once. Anything rendered later — a client
 *   fetch finishing, "load more" appending cards, a tab switching — was never
 *   observed and stayed at `opacity: 0` forever. A MutationObserver now picks
 *   up new nodes.
 *
 * - It set `scrollRestoration = "manual"` and forced `scrollTo(0, 0)` on mount,
 *   which threw away the browser's saved scroll position: pressing Back from a
 *   blog post dumped the reader at the top of the list every time.
 */
export default function AnimateObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;

    // Belt and braces: the inline script in the layout normally adds this
    // before first paint. If it was stripped, adding it here still gives the
    // animations — just one frame later.
    root.classList.add("js-anim");

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // With motion reduced, mark everything visible and never observe. The CSS
    // already neutralises the transforms; this keeps the observer from doing
    // pointless work.
    if (reducedMotion.matches) {
      document.querySelectorAll(SELECTOR).forEach(markVisible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          markVisible(entry.target);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.08,
        // Start the reveal slightly before the element reaches the fold, so it
        // has finished by the time it is properly in view.
        rootMargin: "0px 0px -8% 0px",
      }
    );

    const observe = (scope: ParentNode) => {
      scope.querySelectorAll(SELECTOR).forEach((el) => observer.observe(el));
    };

    observe(document);

    // Catch anything React renders after this effect: async content, route
    // transitions within the same layout, list pagination.
    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(SELECTOR)) observer.observe(node);
          observe(node);
        }
      }
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [pathname]);

  return null;
}
