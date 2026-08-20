import express from "express";
import {
  getAllNewsletters,
  getNewsletters,
  subscribeNewsletter,
  deleteNewsletter,
  deleteManyNewsletters,
} from "../controllers/newsletterController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { verifyTurnstile } from "../middleware/turnstileMiddleware";

const router = express.Router();

// POST /newsletter/subscribe
router.post("/subscribe", verifyTurnstile, subscribeNewsletter);

router.get("/get", authenticateAdmin, getNewsletters);
router.get("/get/all", authenticateAdmin, getAllNewsletters);

// Bulk delete is registered before the :id route so "delete-many" is never
// mistaken for an id.
router.post("/delete-many", authenticateAdmin, express.json(), deleteManyNewsletters);
router.delete("/:id", authenticateAdmin, deleteNewsletter);

export default router;
