import express from "express";
import {
  getContactSeoSection,
  updateContactSeoSection,
} from "../controllers/contactSeoSectionController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/contact-seo-section", getContactSeoSection);
router.put(
  "/admin/contact-seo-section",
  authenticateAdmin,
  express.json(),
  updateContactSeoSection
);

export default router;
