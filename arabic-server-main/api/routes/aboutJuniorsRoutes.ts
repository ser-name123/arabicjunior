import express from "express";
import multer from "multer";
import { getAboutJuniorsSettings, updateAboutJuniorsSettings } from "../controllers/aboutJuniorsController";
import { authenticateAdmin } from "../middleware/authMiddleware";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/about-juniors", getAboutJuniorsSettings);
router.put("/admin/about-juniors", upload.single("imageUrl"), updateAboutJuniorsSettings);

export default router;
