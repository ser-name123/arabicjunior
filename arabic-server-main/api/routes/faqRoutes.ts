import express from "express";
import { submitQuestion } from "../controllers/faqController";

const router = express.Router();

// POST /faq/submit
router.post("/submit", submitQuestion);

export default router;
