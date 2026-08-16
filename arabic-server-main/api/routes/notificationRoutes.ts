import express from "express";
import {
  getNotifications,
  markAsRead,
  clearNotifications,
} from "../controllers/notificationController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getNotifications);
router.put("/mark-read", markAsRead);
router.delete("/clear", clearNotifications);
router.delete("/:id", clearNotifications);

export default router;
