import express from "express";
import { getHomepageTrialSettings, updateHomepageTrialSettings } from "../controllers/homepageTrialController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { imageUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

// Public route to fetch homepage trial banner settings
router.get("/homepage-trial", getHomepageTrialSettings);

// Admin route to update homepage trial settings
router.put(
  "/admin/homepage-trial",
  authenticateAdmin,
  imageUpload.single("imageUrl"),
  handleUploadErrors,
  updateHomepageTrialSettings
);

export default router;
