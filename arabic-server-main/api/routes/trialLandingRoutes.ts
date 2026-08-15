import express from "express";
import { 
  getTrialLandingSettings, 
  listTrialLandings, 
  getTrialLandingById, 
  createTrialLanding, 
  updateTrialLandingSettings, 
  deleteTrialLanding 
} from "../controllers/trialLandingController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { imageUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

const uploadMiddleware = imageUpload.fields([
  { name: "heroImage", maxCount: 1 },
  { name: "suitabilityImage", maxCount: 1 },
  { name: "ctaImage", maxCount: 1 }
]);

// Public route to fetch settings by slug
router.get("/trial-landing", getTrialLandingSettings);
router.get("/trial-landing/:slug", getTrialLandingSettings);

// Admin route to list landing pages
router.get("/admin/trial-landing", authenticateAdmin, listTrialLandings);

// Admin route to create a new page
router.post("/admin/trial-landing", authenticateAdmin, createTrialLanding);

// Admin route to get page settings by ID
router.get("/admin/trial-landing/:id", authenticateAdmin, getTrialLandingById);

// Admin route to update page settings by ID
router.put(
  "/admin/trial-landing/:id",
  authenticateAdmin,
  uploadMiddleware,
  handleUploadErrors,
  updateTrialLandingSettings
);

// Admin route to delete a page
router.delete("/admin/trial-landing/:id", authenticateAdmin, deleteTrialLanding);

export default router;
