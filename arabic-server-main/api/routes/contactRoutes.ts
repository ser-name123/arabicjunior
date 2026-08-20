import express from "express";
import { 
  submitContactMessage,
  getContactSettings,
  updateContactSettings,
  listContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
  deleteManyContactMessages
} from "../controllers/contactController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { verifyTurnstile } from "../middleware/turnstileMiddleware";

const router = express.Router();

// Public routes
router.post("/submit", verifyTurnstile, submitContactMessage);
router.get("/settings", getContactSettings);

// Admin settings routes
router.put("/settings", authenticateAdmin, updateContactSettings);

// Admin contact submissions routes
router.get("/messages", authenticateAdmin, listContactMessages);
// Registered before the /:id routes so "delete-many" is never read as an id.
router.post(
  "/messages/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyContactMessages
);
router.put("/messages/:id", authenticateAdmin, updateContactMessageStatus);
router.delete("/messages/:id", authenticateAdmin, deleteContactMessage);

export default router;
