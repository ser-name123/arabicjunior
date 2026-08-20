import express from "express";
import { getTeachersPage, updateTeachersPage } from "../controllers/teachersPageController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Public: /our-teachers reads this for the heading and its SEO copy.
router.get("/teachers-page", getTeachersPage);

// Admin only.
router.put("/admin/teachers-page", authenticateAdmin, express.json(), updateTeachersPage);

export default router;
