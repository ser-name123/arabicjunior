import express from "express";
import { getAcademyStats, updateAcademyStats } from "../controllers/academyStatsController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { imageUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

const uploadMiddleware = imageUpload.fields([{ name: "image", maxCount: 1 }]);

// Public route
router.get("/academy-stats", getAcademyStats);

// Admin route
router.put(
  "/admin/academy-stats",
  authenticateAdmin,
  uploadMiddleware,
  handleUploadErrors,
  updateAcademyStats
);

export default router;
