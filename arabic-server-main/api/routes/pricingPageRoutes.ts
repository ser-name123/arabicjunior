import express from "express";
import {
  getPricingPage,
  updatePricingPage,
} from "../controllers/pricingPageController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/pricing-page", getPricingPage);
router.put(
  "/admin/pricing-page",
  authenticateAdmin,
  express.json({ limit: "1mb" }),
  updatePricingPage
);

export default router;
