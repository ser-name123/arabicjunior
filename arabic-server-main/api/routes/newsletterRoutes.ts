import express from "express";
import { getAllNewsletters, getNewsletters, subscribeNewsletter } from "../controllers/newsletterController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// POST /newsletter/subscribe
router.post("/subscribe", subscribeNewsletter);

router.get("/get", authenticateAdmin, getNewsletters);
router.get("/get/all", authenticateAdmin, getAllNewsletters);

export default router;
