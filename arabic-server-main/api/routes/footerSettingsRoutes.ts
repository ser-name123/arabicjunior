import express from "express";
import { getFooterSettings, updateFooterSettings } from "../controllers/footerSettingsController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// GET /footer-settings (Public)
router.get("/", getFooterSettings);

// PUT /footer-settings (Admin Only)
router.put("/", authenticateAdmin, updateFooterSettings);

export default router;
