import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimiters";
import {
  adminLogin,
  adminProfile,
  adminSignup,
  adminUsers,
  disable2FA,
  enable2FA,
  reset2FA,
  updateAdminPassword,
  verify2FA,
} from "../controllers/adminControllers";

const router = express.Router();

// ALL ADMIN ---- GET
router.get("/users", authenticateAdmin, adminUsers);

// ADMIN PROFILE
router.get("/profile", authenticateAdmin, adminProfile);

// ADMIN SIGNUP ---- POST
// Was public (audit finding F2): anyone could POST an email and password,
// receive "User created!", then log in with full access to every student
// record. Creating an admin now requires already being one.
router.post("/signup", authenticateAdmin, adminSignup);

// ADMIN LOGIN --- POST
router.post("/login", authLimiter, adminLogin);

// UPDATE PASSWORD --- POST
router.post("/update-password", authenticateAdmin, authLimiter, updateAdminPassword);

// 2FA
router.post("/2fa/enable", authenticateAdmin, enable2FA);
router.post("/2fa/disable", authenticateAdmin, disable2FA);
// Was reachable without logging in, guarded only by a 17-character master key
// (audit finding F6). Now behind authentication as well as the key.
router.post("/2fa/reset", authenticateAdmin, authLimiter, reset2FA);
router.post("/2fa/verify", authLimiter, verify2FA);

export default router;
