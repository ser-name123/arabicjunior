import express from "express";
import { 
  submitContactMessage,
  getContactSettings,
  updateContactSettings,
  listContactMessages,
  updateContactMessageStatus,
  deleteContactMessage
} from "../controllers/contactController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Public routes
router.post("/submit", submitContactMessage);
router.get("/settings", getContactSettings);

// Admin settings routes
router.put("/settings", authenticateAdmin, updateContactSettings);

// Admin contact submissions routes
router.get("/messages", authenticateAdmin, listContactMessages);
router.put("/messages/:id", authenticateAdmin, updateContactMessageStatus);
router.delete("/messages/:id", authenticateAdmin, deleteContactMessage);

export default router;
