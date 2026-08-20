import express from "express";
import {
  getPublishedPricing,
  getPricingGroups,
  getPricingGroupById,
  createPricingGroup,
  updatePricingGroup,
  deletePricingGroup,
  getPricingPlans,
  getPricingPlanById,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  deleteManyPricingPlans,
} from "../controllers/pricingController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Public — the pricing page, groups with their plans nested.
router.get("/pricing", getPublishedPricing);

// Admin — tabs. Registered before /admin/pricing/plans/:id so "plans" is never
// swallowed as an id.
router.get("/admin/pricing/groups", authenticateAdmin, getPricingGroups);
router.get("/admin/pricing/groups/:id", authenticateAdmin, getPricingGroupById);
router.post("/admin/pricing/groups", authenticateAdmin, createPricingGroup);
router.put("/admin/pricing/groups/:id", authenticateAdmin, updatePricingGroup);
router.delete("/admin/pricing/groups/:id", authenticateAdmin, deletePricingGroup);

// Admin — plan cards.
router.get("/admin/pricing/plans", authenticateAdmin, getPricingPlans);
router.get("/admin/pricing/plans/:id", authenticateAdmin, getPricingPlanById);
router.post("/admin/pricing/plans", authenticateAdmin, createPricingPlan);
router.put("/admin/pricing/plans/:id", authenticateAdmin, updatePricingPlan);
router.post(
  "/admin/pricing/plans/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyPricingPlans
);
router.delete("/admin/pricing/plans/:id", authenticateAdmin, deletePricingPlan);

export default router;
