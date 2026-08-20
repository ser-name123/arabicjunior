import express from "express";
import {
  getPublishedTestimonials,
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  deleteManyTestimonials,
} from "../controllers/testimonialController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { testimonialUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

const uploadMiddleware = testimonialUpload.fields([
  { name: "photo", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

// Public — the homepage carousel.
router.get("/testimonials", getPublishedTestimonials);

// Admin. authenticateAdmin runs before the upload middleware so an
// unauthenticated request is rejected before a 50 MB video is read into memory.
router.get("/admin/testimonials", authenticateAdmin, getTestimonials);
router.get("/admin/testimonials/:id", authenticateAdmin, getTestimonialById);
router.post("/admin/testimonials", authenticateAdmin, uploadMiddleware, handleUploadErrors, createTestimonial);
router.put("/admin/testimonials/:id", authenticateAdmin, uploadMiddleware, handleUploadErrors, updateTestimonial);
router.post(
  "/admin/testimonials/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyTestimonials
);
router.delete("/admin/testimonials/:id", authenticateAdmin, deleteTestimonial);

export default router;
