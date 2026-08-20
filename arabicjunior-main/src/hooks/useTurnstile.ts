"use client";

import { useCallback, useRef, useState } from "react";
import { isTurnstileEnabled, type TurnstileHandle } from "@/components/Turnstile";

/**
 * Wiring shared by every form that carries a captcha, so each one only adds the
 * widget and three lines around its own submit.
 *
 * ```tsx
 * const captcha = useTurnstile();
 * if (!captcha.ready) return toast.error(captcha.notReadyMessage);
 * // ...send captcha.token as turnstileToken, then captcha.reset() on failure
 * <Turnstile onVerify={captcha.onVerify} controlRef={captcha.controlRef} />
 * ```
 */
const useTurnstile = () => {
  const [token, setToken] = useState<string | null>(null);
  const controlRef = useRef<TurnstileHandle | null>(null);

  const onVerify = useCallback((value: string | null) => setToken(value), []);

  /**
   * Cloudflare tokens are single-use, so a submit that failed for any reason —
   * a validation error, a duplicate email, a dropped connection — has burnt the
   * token. Without this the visitor's second attempt fails on the captcha
   * instead of on whatever they just fixed.
   */
  const reset = useCallback(() => {
    setToken(null);
    controlRef.current?.reset();
  }, []);

  return {
    token,
    onVerify,
    controlRef,
    reset,
    /** True when there is nothing to wait for, or the challenge has passed. */
    ready: !isTurnstileEnabled || Boolean(token),
    notReadyMessage: "Please complete the security check below.",
  };
};

export default useTurnstile;
