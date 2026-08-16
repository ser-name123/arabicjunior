"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Renders Google's own sign-in button and exchanges the ID token it produces
 * for an admin session.
 *
 * The button is drawn by Google's script rather than hand-built: a look-alike
 * is not permitted to carry the Google mark, and the real one brings the
 * account chooser and localisation with it.
 *
 * The token is only ever handed to our API, which verifies it against Google's
 * keys and checks it against the admin list before trusting a single field.
 * Nothing here decides who gets in — this component cannot be the gate, and
 * must not be treated as one.
 *
 * Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID is unset, so the password
 * form is still usable before Google is configured.
 */

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const SCRIPT_SRC = "https://accounts.google.com/gsi/client";

export default function GoogleSignInButton({
  onBusyChange,
  onTwoFactorRequired,
}: {
  onBusyChange?: (busy: boolean) => void;
  /** An admin who kept 2FA on still has to enter the code after Google. */
  onTwoFactorRequired?: (tempToken: string) => void;
}) {
  const router = useRouter();
  const holder = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredential = useCallback(
    async (response: { credential?: string }) => {
      if (!response.credential) {
        toast.error("Google did not return a sign-in token.");
        return;
      }

      onBusyChange?.(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/google-login`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          }
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          // The API says the same thing whether the address is unknown or the
          // token was bad, so it is passed straight through rather than
          // second-guessed here.
          toast.error(data?.message || "Could not sign in with Google.");
          return;
        }

        if (data.twoFactorRequired && data.tempToken) {
          onTwoFactorRequired?.(data.tempToken);
          toast("Enter your 2FA code");
          return;
        }

        localStorage.setItem("jwtToken", JSON.stringify(data.token));
        toast.success(data?.message || "Login successful!");
        router.push("/admin");
      } catch (err) {
        console.error("Google sign-in failed", err);
        toast.error("Could not reach the server. Please try again.");
      } finally {
        onBusyChange?.(false);
      }
    },
    [router, onBusyChange, onTwoFactorRequired]
  );

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const render = () => {
      if (cancelled || !window.google || !holder.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        // One Tap stays off: on a login page it pops up over the form it is
        // meant to complement.
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      holder.current.innerHTML = "";
      window.google.accounts.id.renderButton(holder.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: 320,
      });

      setReady(true);
    };

    if (window.google) {
      render();
      return;
    }

    // Reuse the tag if a previous mount already added it.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );
    if (existing) {
      existing.addEventListener("load", render);
      return () => existing.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => console.error("Could not load Google's sign-in script");
    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId, handleCredential]);

  if (!clientId) return null;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-center min-h-[44px]">
        <div ref={holder} />
        {!ready && (
          <div className="flex items-center text-sm text-muted-foreground">
            Loading Google sign-in…
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
