import express from "express";
import multer from "multer";
import { getFaqSection, updateFaqSection } from "../controllers/faqSectionController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public: the homepage reads this to build the FAQ section.
router.get("/faq-section", getFaqSection);

// Admin only.
router.put("/admin/faq-section", authenticateAdmin, upload.single("image"), updateFaqSection);

export default router;
