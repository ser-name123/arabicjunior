import express from "express";
import { getSchoolLogos, createSchoolLogo, deleteSchoolLogo } from "../controllers/schoolLogoController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { imageUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

// Public routes
router.get("/school-logos", getSchoolLogos);

// Admin-only routes
router.post(
  "/admin/school-logos",
  authenticateAdmin,
  imageUpload.fields([{ name: "logo", maxCount: 1 }]),
  handleUploadErrors,
  createSchoolLogo
);

router.delete("/admin/school-logos/:id", authenticateAdmin, deleteSchoolLogo);

export default router;
