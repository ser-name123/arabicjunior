import express from "express";
import { submitQuestion } from "../controllers/faqController";
import { verifyTurnstile } from "../middleware/turnstileMiddleware";

const router = express.Router();

// POST /faq/submit
router.post("/submit", verifyTurnstile, submitQuestion);

export default router;
