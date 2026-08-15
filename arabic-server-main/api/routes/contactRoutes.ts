import express from "express";
import { submitContactMessage } from "../controllers/contactController";

const router = express.Router();

// POST /contact/submit
router.post("/submit", submitContactMessage);

export default router;
