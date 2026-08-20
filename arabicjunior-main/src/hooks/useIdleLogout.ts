"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/** How long the console may sit untouched before the session is dropped. */
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * How long before the cut-off the warning appears. Without it someone reading
 * a long page — which produces no events at all — gets dropped mid-edit with
 * no chance to save.
 */
export const IDLE_WARNING_MS = 60 * 1000;

/**
 * The last-activity stamp lives in localStorage rather than in a ref so that
 * every open admin tab shares one clock. Working in one tab has to keep the
 * others alive, otherwise a second tab left open in the background signs the
 * whole session out while you are actively typing in the first.
 */
const LAST_ACTIVITY_KEY = "adminLastActivity";

/**
 * Writing on every single mousemove would hit localStorage hundreds of times a
 * second. Five seconds of slop against a ten minute window is not observable.
 */
const WRITE_INTERVAL_MS = 5000;

/** Fast enough to drive a readable countdown once the warning is up. */
const CHECK_INTERVAL_MS = 1000;

/**
 * Deliberately excludes `visibilitychange`: coming back to a tab after twenty
 * minutes away should sign you out, not reset the clock.
 */
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "wheel",
  "scroll",
  "touchstart",
] as const;

const clearSession = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  localStorage.removeItem(LAST_ACTIVITY_KEY);
};

/**
 * Signs the admin out after {@link IDLE_TIMEOUT_MS} without any interaction.
 *
 * This protects an unattended screen; it is not a server-side control. The API
 * token itself stays valid for its full lifetime, so a token already copied out
 * of the browser is unaffected by this.
 *
 * @param enabled pass false while auth is still resolving, so the timer does
 *   not run against a session that may not exist.
 */
const useIdleLogout = (enabled: boolean) => {
  const router = useRouter();

  /** null while the session is healthy; milliseconds remaining once warning. */
  const [msLeft, setMsLeft] = useState<number | null>(null);

  const lastWriteRef = useRef(0);
  const loggedOutRef = useRef(false);

  const markActive = useCallback((force = false) => {
    const now = Date.now();
    if (!force && now - lastWriteRef.current < WRITE_INTERVAL_MS) return;
    lastWriteRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  }, []);

  /** Called by the warning dialog's button. */
  const stayLoggedIn = useCallback(() => {
    markActive(true);
    setMsLeft(null);
  }, [markActive]);

  const logout = useCallback(
    (announce: boolean) => {
      if (loggedOutRef.current) return;
      loggedOutRef.current = true;
      clearSession();
      if (announce) {
        toast.info("Signed out after 10 minutes of inactivity.");
      }
      router.replace("/login");
    },
    [router]
  );

  useEffect(() => {
    if (!enabled) return;

    // Opening the console counts as activity, otherwise a stale stamp from a
    // previous session would sign the admin straight back out.
    markActive(true);

    const onActivity = () => markActive();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true })
    );

    const tick = () => {
      const stamp = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
      const idleFor = Date.now() - (stamp || Date.now());

      if (idleFor >= IDLE_TIMEOUT_MS) {
        logout(true);
        return;
      }

      const remaining = IDLE_TIMEOUT_MS - idleFor;
      setMsLeft(remaining <= IDLE_WARNING_MS ? remaining : null);
    };

    const interval = window.setInterval(tick, CHECK_INTERVAL_MS);

    // Background tabs have their timers throttled, so a tab that was hidden for
    // an hour would otherwise take several seconds to notice on return.
    const onVisibility = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Signing out in one tab — by this timer or by the Logout button — has to
    // take every other open tab with it.
    const onStorage = (event: StorageEvent) => {
      if (event.key === "jwtToken" && event.newValue === null) logout(false);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, onActivity)
      );
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [enabled, logout, markActive]);

  return {
    /** True while the countdown dialog should be on screen. */
    warning: msLeft !== null,
    secondsLeft: msLeft === null ? 0 : Math.max(0, Math.ceil(msLeft / 1000)),
    stayLoggedIn,
    logoutNow: () => logout(false),
  };
};

export default useIdleLogout;
