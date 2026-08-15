import express from "express";
import {
    createBlog,
    getBlogs,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    getBlogById,
    getAllBlogs,
} from "../controllers/blogController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { imageUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

// 👇 field name matches the frontend
const uploadMiddleware = imageUpload.fields([{ name: "cover-image", maxCount: 1 }]);

// Public
router.get("/blogs/:slug", getBlogBySlug);     // Get by slug (published only)
router.get("/blogs", getAllBlogs);             // Get all published blogs

// Admin.
// NOTE the ordering: authenticateAdmin runs BEFORE the upload middleware.
// Previously multer ran first, so an unauthenticated request had its file read
// and buffered into memory before the request was rejected.
router.post("/admin/blogs", authenticateAdmin, uploadMiddleware, handleUploadErrors, createBlog);
router.get("/admin/blogs", authenticateAdmin, getBlogs);
router.put("/admin/blogs/:id", authenticateAdmin, uploadMiddleware, handleUploadErrors, updateBlog);
router.delete("/admin/blogs/:id", authenticateAdmin, deleteBlog);
router.get("/admin/blogs/:id", authenticateAdmin, getBlogById);

export default router;
