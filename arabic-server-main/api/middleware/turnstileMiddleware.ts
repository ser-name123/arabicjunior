import { NextFunction, Request, Response } from "express";

/**
 * Cloudflare Turnstile verification for the public forms.
 *
 * The widget in the browser produces a single-use token; only Cloudflare can
 * say whether that token is genuine, so it has to be checked here. A check done
 * only in the browser stops nobody — a spam script posts straight to the API and
 * never loads the widget at all.
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Turnstile tokens expire 300s after they are issued. */
const VERIFY_TIMEOUT_MS = 8000;

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  hostname?: string;
  challenge_ts?: string;
}

/**
 * Messages for the failures a real visitor can hit, so they are told what to do
 * rather than being handed Cloudflare's error code.
 */
const VISITOR_FACING_ERRORS: Record<string, string> = {
  "timeout-or-duplicate":
    "That security check has expired. Please tick the box again and resubmit.",
  "invalid-input-response":
    "The security check could not be verified. Please try again.",
  "missing-input-response":
    "Please complete the security check before submitting.",
};

let warnedAboutMissingSecret = false;

/**
 * Rejects a submission whose Turnstile token is missing, expired, reused or
 * forged.
 *
 * When `TURNSTILE_SECRET_KEY` is not set the middleware logs once and lets the
 * request through. That is deliberate: the alternative is that the day this
 * ships, before anyone has pasted the key into the server's .env, every form on
 * the site starts rejecting real enquiries. An unconfigured captcha is the same
 * amount of protection the site had yesterday; a silently broken contact form
 * is worse. The startup log is there so the gap is not invisible.
 *
 * On a multipart route this must be registered AFTER multer, because the token
 * travels in the form body and does not exist until multer has parsed it.
 */
export const verifyTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();

  if (!secret) {
    if (!warnedAboutMissingSecret) {
      warnedAboutMissingSecret = true;
      console.warn(
        "[turnstile] TURNSTILE_SECRET_KEY is not set — captcha checks are OFF. " +
          "Set it in .env to start rejecting bot submissions."
      );
    }
    return next();
  }

  // The header is there for callers that send a body this middleware cannot
  // read, such as a raw upload. The body is the normal path.
  const token: unknown =
    req.body?.turnstileToken ?? req.headers["cf-turnstile-response"];

  // Never let the token reach a controller: several of them hand req.body
  // straight to a Mongoose model, and a stray field there is noise at best.
  if (req.body && typeof req.body === "object") {
    delete req.body.turnstileToken;
  }

  if (typeof token !== "string" || !token.trim()) {
    res.status(400).json({
      success: false,
      message: VISITOR_FACING_ERRORS["missing-input-response"],
    });
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    const result = (await response.json()) as SiteverifyResponse;

    if (result.success) {
      next();
      return;
    }

    const code = result["error-codes"]?.[0] ?? "";

    // A bad secret is the operator's mistake, not the visitor's, and it would
    // otherwise show up as "please try again" on every single submission.
    if (code === "invalid-input-secret" || code === "missing-input-secret") {
      console.error(
        "[turnstile] the configured TURNSTILE_SECRET_KEY was rejected by Cloudflare"
      );
      res.status(500).json({
        success: false,
        message: "The security check is misconfigured. Please contact us directly.",
      });
      return;
    }

    console.warn("[turnstile] rejected a submission:", result["error-codes"]);
    res.status(400).json({
      success: false,
      message:
        VISITOR_FACING_ERRORS[code] ??
        "The security check failed. Please try again.",
    });
  } catch (error) {
    // Cloudflare being unreachable must not silently open the door, but it also
    // must not look like the visitor did something wrong.
    console.error("[turnstile] could not reach Cloudflare:", error);
    res.status(503).json({
      success: false,
      message:
        "We could not complete the security check just now. Please try again in a moment.",
    });
  }
};

export default verifyTurnstile;
