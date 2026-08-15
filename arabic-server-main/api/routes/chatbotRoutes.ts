import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware";
import {
  createChatbotSession,
  getChatbotSessions,
  deleteChatbotSession,
} from "../controllers/chatbotController";

const router = express.Router();

// Public route to save a new session/lead
router.post("/chatbot/session", createChatbotSession);

// Admin routes
router.get("/admin/chatbot/sessions", authenticateAdmin, getChatbotSessions);
router.delete("/admin/chatbot/sessions/:id", authenticateAdmin, deleteChatbotSession);

export default router;
