import { Request, Response } from "express";
import generateJwtToken from "../utils/generateJwtToken";
import Admin from "../models/admin";
import bcrypt from "bcryptjs";
import { isProduction } from "..";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

// 2FA
export const enable2FA = async (req: Request, res: Response): Promise<any> => {
  try {
    const { adminId } = req.body; // you may get from JWT/session

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const secret = speakeasy.generateSecret({
      name: "ArabicJuniors Admin Dashboard",
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

export const disable2FA = async (req: Request, res: Response): Promise<any> => {
  try {
    const { adminId } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    // ✅ disable 2FA
    admin.twoFactorSecret = undefined;
    admin.isTwoFactorEnabled = false;
    await admin.save();

    res.json({ message: "2FA disabled successfully" });
  } catch (err) {
    console.error("Disable 2FA error:", err);
    res.status(500).json({ message: "Error disabling 2FA" });
  }
};

export const reset2FA = async (req: Request, res: Response): Promise<any> => {
  try {
    const { adminId, masterKey } = req.body;

    // example: require some master override key in .env
    if (masterKey !== process.env.MASTER_2FA_RESET_KEY) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.twoFactorSecret = undefined;
    admin.isTwoFactorEnabled = false;
    await admin.save();

    res.json({ message: "2FA forcibly reset for admin" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting 2FA" });
  }
};

export const verify2FA = async (req: Request, res: Response): Promise<any> => {
  const { token: tempToken, code } = req.body;

  try {
    const payload: any = jwt.verify(tempToken, process.env.JWT_SECRET as string);
    if (!payload?.adminId) return res.status(403).json({ message: "Temporary Token Expired or Invalid." });
    const admin = await Admin.findById(payload.adminId);

    if (!admin?.twoFactorSecret) return res.status(400).json({ message: "2FA not set up" });

    const verified = speakeasy.totp.verify({
      secret: admin.twoFactorSecret,
      encoding: "base32",
      token: code,
    });

    if (!verified) return res.status(401).json({ message: "Invalid 2FA code" });

    const realToken = await generateJwtToken({ adminId: payload.adminId.toString() });
    res.status(200).json({ message: "Logged in successfully!", token: realToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

// LOGIN CONTROLLER
export const adminLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, token: _2fa } = req.body;

    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      res.status(401).json({ message: "Invalid Email!" });
      return;
    }

    const passMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!passMatch) {
      res.status(401).json({ message: "Incorrect Password!" });
      return;
    }

    if (adminUser.isTwoFactorEnabled) {
      const tempToken = await generateJwtToken({ adminId: adminUser._id.toString() }, '5m');
      return res.status(200).json({ twoFactorRequired: true, tempToken });
    }

    // console.log("admin ID:", adminUser._id.toString());
    const token = await generateJwtToken({ adminId: adminUser._id.toString() });
    console.log("jwt token", token);

    // sent the cookie to client
    const clientHostname = new URL(process.env.CLIENT_URL as string).hostname;
    const baseDomain = clientHostname.startsWith("www.")
      ? clientHostname.substring(4)
      : clientHostname;

    res.cookie("jwtToken", token, {
      domain: `.${baseDomain}`, // Leading dot for all subdomains
      httpOnly: isProduction ? true : false, // JavaScript can't access in production
      secure: isProduction ? true : false, // Only send over HTTPS in production
      sameSite: isProduction ? "none" : "lax",
    });

    res.status(200).json({ message: "Logged in successfully!", token: token });
  } catch (error) {
    console.error("Login failed!", error);
    res.status(500).json({ message: "Login failed!" });
  }
};

// SIGN UP CONTROLLER
export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      res.status(400).json({ message: "User already exists" });
      return; // making sure no further execution
    }

    const hash = await bcrypt.hash(password, 12); // Increased from 10 to 12 for better security
    const newUser = new Admin({ email: email, passwordHash: hash });
    // save to the DB
    await newUser.save();

    // everything OK
    res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during Sign-Up" });
  }
};

// ALL ADMIN
export const adminUsers = async (req: Request, res: Response) => {
  try {
    const adminUsers = await Admin.find();
    res.status(200).json(adminUsers);
  } catch (error) {
    console.log("Admin users error:", error);
  }
};

// ADMIN PROFILE CONTROLLER
interface AdminProfileRequest extends Request {
  adminId?: string;
}

export const adminProfile = async (req: AdminProfileRequest, res: Response) => {
  try {
    const user = await Admin.findById(req.adminId);
    res.status(200).json({ adminId: req.adminId, success: true, user });
  } catch (error) {
    console.log("Admin users error:", error);
    res.status(500)
  }
};

// admin password reset
export const updateAdminPassword = async (req: AdminProfileRequest, res: Response): Promise<any> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old and new password are required" });
    }

    const admin = await Admin.findById(req.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // ✅ Compare old password
    const isMatch = await bcrypt.compare(oldPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // ✅ Hash new password
    const hashed = await bcrypt.hash(newPassword, 12); // Increased from 10 to 12 for better security
    admin.passwordHash = hashed;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Error updating password" });
  }
};
