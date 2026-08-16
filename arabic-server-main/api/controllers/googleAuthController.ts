import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import Admin from "../models/admin";
import generateJwtToken from "../utils/generateJwtToken";
import { setAuthCookie } from "../utils/authCookie";

/**
 * Sign in with Google.
 *
 * The browser gets an ID token from Google and posts it here. What is checked
 * on this side:
 *
 * - The signature is verified against Google's public keys and `aud` must equal
 *   our own client id. Without the audience check, a token minted for a
 *   different application would be accepted, letting whoever holds it sign in
 *   as any email it names.
 *
 * - The email must already exist as an admin. Accounts are never created here.
 *   Auto-creating would hand the dashboard — every student record, every
 *   parent's phone number — to anyone in the world with a Google account.
 *
 * - An admin who has turned 2FA on is NOT asked for the code when using Google
 *   sign-in. Google's own authentication acts as the second factor.
 *
 * Deliberately NOT checked, at the owner's decision:
 *
 * - `email_verified`. Google issues tokens for addresses it has not verified —
 *   a Workspace domain can hand one out — so an address in the token is not on
 *   its own proof of who owns it.
 *
 * - Which Google account an admin row is tied to. Any Google account whose
 *   address matches an admin row can sign in as that admin.
 *
 * Rejection messages distinguish "not an admin" from "bad token", so the
 * endpoint can be used to test whether a given address is an admin.
 */

const client = new OAuth2Client();

const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

export const googleAdminLogin = async (req: Request, res: Response): Promise<any> => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID is not set — Google sign-in is unavailable");
    return res
      .status(503)
      .json({ message: "Google sign-in is not configured on this server" });
  }

  try {
    const { credential } = req.body as { credential?: unknown };
    if (typeof credential !== "string" || !credential.trim()) {
      return res.status(400).json({ message: "Missing Google credential" });
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (err) {
      // Bad signature, wrong audience or expired token all land here.
      console.warn("Google ID token rejected:", (err as Error).message);
      return res.status(401).json({ message: "Google Authentication failed" });
    }

    if (!payload) {
      return res.status(401).json({ message: "Google Authentication failed" });
    }

    // verifyIdToken already covers these; they are cheap, and this is the one
    // door into the dashboard.
    if (!GOOGLE_ISSUERS.includes(payload.iss)) {
      return res.status(401).json({ message: "Google Authentication failed" });
    }
    if (payload.aud !== clientId) {
      return res.status(401).json({ message: "Google Authentication failed" });
    }
    if (!payload.email) {
      return res.status(400).json({ message: "Invalid token payload" });
    }

    const email = payload.email.toLowerCase().trim();

    // A plain equality lookup. Building `new RegExp("^" + email + "$")` from
    // the token would be needless: emails are stored lower-cased, and any
    // regex assembled from outside input is the same shape as the ReDoS issue
    // already fixed elsewhere in this codebase.
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      return res
        .status(401)
        .json({ message: "This email is not registered as an Admin" });
    }

    // Keep the display name and avatar fresh for the admin header.
    let changed = false;
    if (payload.name && adminUser.name !== payload.name) {
      adminUser.name = payload.name;
      changed = true;
    }
    if (payload.picture && adminUser.picture !== payload.picture) {
      adminUser.picture = payload.picture;
      changed = true;
    }
    if (changed) await adminUser.save();

    // Google login bypasses 2FA even if isTwoFactorEnabled is true.

    const token = await generateJwtToken({ adminId: adminUser._id.toString() });
    setAuthCookie(res, token);

    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (error) {
    console.error("Google sign-in failed:", error);
    res.status(500).json({ message: "Sign-in failed" });
  }
};
