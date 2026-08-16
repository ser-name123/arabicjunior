import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import Admin from "../models/admin";
import generateJwtToken from "../utils/generateJwtToken";
import { setAuthCookie } from "../utils/authCookie";

/**
 * Sign in with Google.
 *
 * The browser gets an ID token from Google and posts it here. Everything that
 * matters is checked on this side:
 *
 * - The signature is verified against Google's public keys and `aud` must equal
 *   our own client id. Without the audience check, a token minted for a
 *   different application would be accepted, letting whoever holds it sign in
 *   as any email it names.
 *
 * - `email_verified` must be true. Google issues tokens for addresses it has
 *   not verified — a Workspace domain can hand out an unverified address — and
 *   an unverified address proves nothing about who owns it. Treating one as
 *   proof of identity is how an attacker signs in as an admin whose email they
 *   merely know.
 *
 * - The email must already exist as an admin. Accounts are never created here.
 *   Auto-creating would hand the dashboard — every student record, every
 *   parent's phone number — to anyone in the world with a Google account.
 *
 * - An admin who has turned 2FA on still gets asked for the code. Google's own
 *   second factor is usually stronger, but quietly skipping a control the
 *   admin deliberately enabled is not this endpoint's decision to make.
 *
 * Every rejection returns the same message, so this cannot be used to discover
 * which addresses are admins.
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

  const REJECTED = "This Google account does not have admin access";

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
      return res.status(401).json({ message: REJECTED });
    }

    if (!payload) return res.status(401).json({ message: REJECTED });

    // verifyIdToken already covers these; they are cheap, and this is the one
    // door into the dashboard.
    if (!GOOGLE_ISSUERS.includes(payload.iss)) {
      return res.status(401).json({ message: REJECTED });
    }
    if (payload.aud !== clientId) {
      return res.status(401).json({ message: REJECTED });
    }
    if (!payload.email || payload.email_verified !== true) {
      return res.status(401).json({ message: REJECTED });
    }

    const email = payload.email.toLowerCase().trim();

    // A plain equality lookup. Building `new RegExp("^" + email + "$")` from
    // the token would be needless: emails are stored lower-cased, and any
    // regex assembled from outside input is the same shape as the ReDoS issue
    // already fixed elsewhere in this codebase.
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      console.warn(`Google sign-in refused for non-admin address: ${email}`);
      return res.status(401).json({ message: REJECTED });
    }

    // If this admin is already linked to a different Google account, refuse
    // rather than silently re-pointing it at a new one.
    if (adminUser.googleId && payload.sub && adminUser.googleId !== payload.sub) {
      console.warn(`Google id mismatch for ${email}`);
      return res.status(401).json({ message: REJECTED });
    }

    // Record the link and the profile bits on first sign-in.
    let changed = false;
    if (!adminUser.googleId && payload.sub) {
      adminUser.googleId = payload.sub;
      changed = true;
    }
    if (payload.name && adminUser.name !== payload.name) {
      adminUser.name = payload.name;
      changed = true;
    }
    if (payload.picture && adminUser.picture !== payload.picture) {
      adminUser.picture = payload.picture;
      changed = true;
    }
    if (changed) await adminUser.save();

    if (adminUser.isTwoFactorEnabled) {
      const tempToken = await generateJwtToken(
        { adminId: adminUser._id.toString() },
        "5m"
      );
      return res.status(200).json({ twoFactorRequired: true, tempToken });
    }

    const token = await generateJwtToken({ adminId: adminUser._id.toString() });
    setAuthCookie(res, token);

    res.status(200).json({ message: "Logged in successfully!", token });
  } catch (error) {
    console.error("Google sign-in failed:", error);
    res.status(500).json({ message: "Sign-in failed" });
  }
};
