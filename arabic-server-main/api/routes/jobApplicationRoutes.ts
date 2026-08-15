import express from "express";
import {
  applyJob,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/jobApplicationController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { documentUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

const uploadMiddleware = documentUpload.fields([{ name: "resume", maxCount: 1 }]);

// Public route to apply
router.post("/job-applications", uploadMiddleware, handleUploadErrors, applyJob);

// Admin-only management routes
router.get("/admin/job-applications", authenticateAdmin, getApplications);
router.put("/admin/job-applications/:id/status", authenticateAdmin, updateApplicationStatus);
router.delete("/admin/job-applications/:id", authenticateAdmin, deleteApplication);

export default router;
