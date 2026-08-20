import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { chatbotMessageLimiter } from "../middleware/rateLimiters";
import {
  getChatbotConfig,
  createChatbotSession,
  postChatbotMessage,
  markChatbotHandoff,
  getChatbotSessions,
  getChatbotSession,
  deleteChatbotSession,
  deleteManyChatbotSessions,
  getChatbotSettings,
  updateChatbotSettings,
  getChatbotQaEntries,
  createChatbotQaEntry,
  updateChatbotQaEntry,
  deleteChatbotQaEntry,
  previewChatbotReply,
} from "../controllers/chatbotController";

const router = express.Router();

// Public — the widget
router.get("/chatbot/config", getChatbotConfig);
router.post("/chatbot/session", createChatbotSession);
router.post("/chatbot/message", chatbotMessageLimiter, postChatbotMessage);
router.post("/chatbot/handoff", markChatbotHandoff);

// Admin — leads and transcripts.
// "settings" and "qa" are registered before "sessions/:id" only by accident of
// wording, but the /:id route is narrow enough that it cannot swallow them.
router.get("/admin/chatbot/sessions", authenticateAdmin, getChatbotSessions);
router.get("/admin/chatbot/sessions/:id", authenticateAdmin, getChatbotSession);
// Registered before the /:id route so "delete-many" is never read as an id.
router.post(
  "/admin/chatbot/sessions/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyChatbotSessions
);
router.delete("/admin/chatbot/sessions/:id", authenticateAdmin, deleteChatbotSession);

// Admin — customisation
router.get("/admin/chatbot/settings", authenticateAdmin, getChatbotSettings);
router.put("/admin/chatbot/settings", authenticateAdmin, updateChatbotSettings);

// Admin — the academy's own questions
router.get("/admin/chatbot/qa", authenticateAdmin, getChatbotQaEntries);
router.post("/admin/chatbot/qa", authenticateAdmin, createChatbotQaEntry);
router.put("/admin/chatbot/qa/:id", authenticateAdmin, updateChatbotQaEntry);
router.delete("/admin/chatbot/qa/:id", authenticateAdmin, deleteChatbotQaEntry);

// Admin — try a question without leaving the dashboard
router.post("/admin/chatbot/preview", authenticateAdmin, previewChatbotReply);

export default router;
