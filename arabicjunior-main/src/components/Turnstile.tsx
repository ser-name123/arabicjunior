"use client";

import { useEffect, useRef } from "react";

/**
 * Cloudflare Turnstile widget.
 *
 * Written against the API directly rather than pulling in a wrapper package:
 * the whole surface is render/reset/remove, and owning it means the reset after
 * a failed submit is explicit instead of a prop on someone else's component.
 *
 * The token this produces is single-use and expires after five minutes, so a
 * form that sits open needs a fresh one — `expired-callback` clears it and the
 * widget re-runs on its own.
 */

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  appearance?: "always" | "execute" | "interaction-only";
}

interface TurnstileApi {
  render: (el: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onloadTurnstileCallback?: () => void;
  }
}

/** Resolves once the Turnstile script has loaded, and only injects it once. */
let scriptPromise: Promise<void> | null = null;

const loadScript = () => {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    if (window.turnstile) {
      resolve();
      return;
    }

    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export interface TurnstileHandle {
  /** Clears the used token and asks Cloudflare for a new one. */
  reset: () => void;
}

interface TurnstileProps {
  /** Receives the token, or null when it expires or the widget errors. */
  onVerify: (token: string | null) => void;
  /** Populated with a `reset()` the form can call after a failed submit. */
  controlRef?: React.MutableRefObject<TurnstileHandle | null>;
  className?: string;
}

/**
 * Renders nothing when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset. Paired with
 * the server, which also stands down when its secret is missing, that means an
 * environment without keys behaves exactly as it did before captcha existed
 * rather than rejecting every submission.
 */
export const isTurnstileEnabled = Boolean(
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
);

const Turnstile = ({ onVerify, controlRef, className }: TurnstileProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  // Held in a ref so re-rendering the parent — which happens on every
  // keystroke in most of these forms — does not tear the widget down and
  // restart the challenge.
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  useEffect(() => {
    if (!isTurnstileEnabled) return;

    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY as string,
          callback: (token) => onVerifyRef.current(token),
          "error-callback": () => onVerifyRef.current(null),
          "expired-callback": () => onVerifyRef.current(null),
          theme: "light",
        });

        if (controlRef) {
          controlRef.current = {
            reset: () => {
              onVerifyRef.current(null);
              if (widgetIdRef.current) {
                window.turnstile?.reset(widgetIdRef.current);
              }
            },
          };
        }
      })
      .catch(() => {
        // An ad blocker or a dropped network can stop the script loading. Say
        // nothing and leave the token null — the form's own message covers it.
        if (!cancelled) onVerifyRef.current(null);
      });

    return () => {
      cancelled = true;
      if (widgetIdRef.current) {
        window.turnstile?.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
      if (controlRef) controlRef.current = null;
    };
    // controlRef is a ref object and stable; the widget is created once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isTurnstileEnabled) return null;

  return <div ref={containerRef} className={className} />;
};

export default Turnstile;
