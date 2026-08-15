import { Request, Response } from "express";
import crypto from "crypto";
import generateJwtToken from "../utils/generateJwtToken";
import Admin from "../models/admin";
import bcrypt from "bcryptjs";
import { isProduction } from "..";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

// Fields that must never leave the server. `passwordHash` is obvious;
// `twoFactorSecret` is worse — anyone holding it can generate valid codes for
// that admin, which defeats 2FA entirely (audit finding F5).
const SAFE_ADMIN_FIELDS = "-passwordHash -twoFactorSecret -__v";

const MIN_MASTER_KEY_LENGTH = 64;

// Constant-time comparison so the key can't be recovered a character at a time
// by measuring response times.
const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// 2FA
export const enable2FA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    // Taken from the verified token, not the request body. Previously any
    // signed-in admin could pass someone else's id and act on their account
    // (audit finding F6).
    const adminId = req.adminId;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const secret = speakeasy.generateSecret({
      name: `ArabicJuniors Admin (${admin.email})`,
    });

    admin.twoFactorSecret = secret.base32;
    admin.isTwoFactorEnabled = true;
    await admin.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url as string);

    res.json({ qrCode, secret: secret.base32 });
  } catch (err) {
    console.error("Enable 2FA error:", err);
    res.status(500).json({ message: "Error enabling 2FA" });
  }
};

export const disable2FA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const adminId = req.adminId; // from the verified token, see enable2FA

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.twoFactorSecret = undefined;
    admin.isTwoFactorEnabled = false;
    await admin.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (err) {
    console.error("Disable 2FA error:", err);
    res.status(500).json({ message: "Error disabling 2FA" });
  }
};

// Emergency override for an admin locked out of their authenticator.
//
// This one deliberately still takes a target adminId rather than deriving it
// from the session: its whole purpose is recovering an account that cannot
// complete login, so a session-derived id would make the endpoint useless.
// The exposure the audit flagged — reachable by anyone who guesses the master
// key — is closed by requiring authentication too (see adminRoutes).
export const reset2FA = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { adminId, masterKey } = req.body;
    const configured = process.env.MASTER_2FA_RESET_KEY;

    if (!configured || configured.length < MIN_MASTER_KEY_LENGTH) {
      console.error(
        `MASTER_2FA_RESET_KEY is missing or shorter than ${MIN_MASTER_KEY_LENGTH} characters — refusing to run 2FA reset.`
      );
      return res.status(503).json({
        message: "2FA reset is not configured on this server.",
      });
    }

    if (typeof masterKey !== "string" || !safeEqual(masterKey, configured)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.twoFactorSecret = undefined;
    admin.isTwoFactorEnabled = false;
    await admin.save();

    console.warn(`2FA forcibly reset for ${admin.email} by admin ${req.adminId}`);
    res.json({ message: "2FA forcibly reset for admin" });
  } catch (err) {
    console.error("Reset 2FA error:", err);
    res.status(500).json({ message: "Error resetting 2FA" });
  }
};

export const verify2FA = async (req: Request, res: Response): Promise<any> => {
  const { token: tempToken, code } = req.body;

  try {
    const payload: any = jwt.verify(tempToken, process.env.JWT_SECRET as string);
    if (!payload?.adminId)
      return res.status(403).json({ message: "Temporary Token Expired or Invalid." });
    const admin = await Admin.findById(payload.adminId);

    if (!admin?.twoFactorSecret)
      return res.status(400).json({ message: "2FA not set up" });

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: "base32",
      token: code,
    });

    if (!verified) return res.status(401).json({ message: "Invalid 2FA code" });

    const realToken = await generateJwtToken({
      adminId: payload.adminId.toString(),
    });
    res.status(200).json({ message: "Logged in successfully!", token: realToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// LOGIN CONTROLLER
export const adminLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    // One message for both branches. Distinct "Invalid Email!" / "Incorrect
    // Password!" replies let anyone test which addresses have accounts.
    const INVALID = "Invalid email or password";

    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      return res.status(401).json({ message: INVALID });
    }

    const passMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!passMatch) {
      return res.status(401).json({ message: INVALID });
    }

    if (adminUser.isTwoFactorEnabled) {
      const tempToken = await generateJwtToken(
        { adminId: adminUser._id.toString() },
        "5m"
      );
      return res.status(200).json({ twoFactorRequired: true, tempToken });
    }

    const token = await generateJwtToken({ adminId: adminUser._id.toString() });

    // Mirror the token into a cookie. CLIENT_URL may hold a comma-separated
    // list, so the cookie domain is derived from the first entry.
    try {
      const primaryOrigin = (process.env.CLIENT_URL as string).split(",")[0].trim();
      const clientHostname = new URL(primaryOrigin).hostname;
      const baseDomain = clientHostname.startsWith("www.")
        ? clientHostname.substring(4)
        : clientHostname;

      res.cookie("jwtToken", token, {
        domain: `.${baseDomain}`, // Leading dot for all subdomains
        httpOnly: true, // never readable from JavaScript
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // matches the token's 7d lifetime
        path: "/",
      });
    } catch (cookieErr) {
      // A malformed CLIENT_URL used to throw here and turn a valid login into
      // a 500. The token in the response body is what the client actually uses.
      console.error("Could not set auth cookie (check CLIENT_URL):", cookieErr);
    }

    res.status(200).json({ message: "Logged in successfully!", token: token });
  } catch (error) {
    console.error("Login failed!", error);
    res.status(500).json({ message: "Login failed!" });
  }
};

// SIGN UP CONTROLLER — reachable only by an already-authenticated admin.
export const adminSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }
    if (typeof password !== "string" || password.length < 12) {
      return res
        .status(400)
        .json({ message: "Password must be at least 12 characters" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 12);
    const newUser = new Admin({ email: email, passwordHash: hash });
    await newUser.save();

    res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during Sign-Up" });
  }
};

// ALL ADMIN
export const adminUsers = async (_req: Request, res: Response) => {
  try {
    const adminUsers = await Admin.find().select(SAFE_ADMIN_FIELDS);
    res.status(200).json(adminUsers);
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ message: "Failed to fetch admin users" });
  }
};

// ADMIN PROFILE CONTROLLER
export const adminProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await Admin.findById(req.adminId).select(SAFE_ADMIN_FIELDS);
    res.status(200).json({ adminId: req.adminId, success: true, user });
  } catch (error) {
    console.error("Admin profile error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// admin password reset
export const updateAdminPassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new password are required" });
    }

    if (typeof newPassword !== "string" || newPassword.length < 12) {
      return res
        .status(400)
        .json({ message: "New password must be at least 12 characters" });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    admin.passwordHash = hashed;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Error updating password" });
  }
};

export const deleteAdmin = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (id === req.adminId) {
      return res.status(400).json({ message: "You cannot delete yourself!" });
    }
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.status(200).json({ message: "Admin deleted successfully!" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ message: "Failed to delete admin" });
  }
};
