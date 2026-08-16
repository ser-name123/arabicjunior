import { Response } from "express";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Mirrors the auth token into a cookie.
 *
 * Shared by the password and Google sign-in routes so the two cannot drift —
 * a difference in `httpOnly` or `secure` between them would be a hole that
 * only shows up on one of the two paths.
 *
 * CLIENT_URL may hold a comma-separated list, so the cookie domain comes from
 * the first entry. A malformed value used to throw and turn a valid login into
 * a 500; the token in the response body is what the client actually reads, so
 * a cookie failure is logged and swallowed.
 */
export const setAuthCookie = (res: Response, token: string) => {
  try {
    const primaryOrigin = (process.env.CLIENT_URL as string).split(",")[0].trim();
    const clientHostname = new URL(primaryOrigin).hostname;
    const baseDomain = clientHostname.startsWith("www.")
      ? clientHostname.substring(4)
      : clientHostname;

    res.cookie("jwtToken", token, {
      domain: `.${baseDomain}`, // leading dot for all subdomains
      httpOnly: true, // never readable from JavaScript
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // matches the token's 7d lifetime
      path: "/",
    });
  } catch (cookieErr) {
    console.error("Could not set auth cookie (check CLIENT_URL):", cookieErr);
  }
};
