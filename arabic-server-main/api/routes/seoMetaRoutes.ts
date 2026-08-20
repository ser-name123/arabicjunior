import express from "express";
import { getAllSeoMeta, getSeoMetaByKey, updateSeoMeta } from "../controllers/seoMetaController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Public: each page reads its own record when building its metadata.
router.get("/seo-meta", getAllSeoMeta);
router.get("/seo-meta/:pageKey", getSeoMetaByKey);

// Admin only.
router.put("/admin/seo-meta/:pageKey", authenticateAdmin, express.json(), updateSeoMeta);

export default router;
