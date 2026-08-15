import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware";
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
router.post("/signup", adminSignup);

// ADMIN LOGIN --- POST
router.post("/login", adminLogin);

// UPDATE PASSWORD --- POST
router.post("/update-password", authenticateAdmin, updateAdminPassword);


// 2FA
router.post("/2fa/enable", authenticateAdmin, enable2FA)
router.post("/2fa/disable", authenticateAdmin, disable2FA);
router.post("/2fa/reset", reset2FA);
router.post("/2fa/verify", verify2FA);

export default router;
