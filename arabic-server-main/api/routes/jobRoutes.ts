import express from "express";
import {
  getJobs,
  getJobBySlug,
  getAdminJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  deleteManyJobs,
} from "../controllers/jobController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.get("/jobs", getJobs);
router.get("/jobs/:slug", getJobBySlug);

// Admin routes
router.get("/admin/jobs", authenticateAdmin, getAdminJobs);
router.get("/admin/jobs/:id", authenticateAdmin, getJobById);
router.post("/admin/jobs", authenticateAdmin, createJob);
router.put("/admin/jobs/:id", authenticateAdmin, updateJob);
router.post(
  "/admin/jobs/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyJobs
);
router.delete("/admin/jobs/:id", authenticateAdmin, deleteJob);

export default router;
