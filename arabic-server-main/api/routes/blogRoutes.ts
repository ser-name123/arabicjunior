import express from "express";
import {
    createBlog,
    getBlogs,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    getBlogById,
    getAllBlogs,
    deleteManyBlogs,
    exportBlogs,
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
// Both are registered BEFORE /admin/blogs/:id, otherwise Express matches
// "export" and "delete-many" as blog ids and hands them to getBlogById.
router.get("/admin/blogs/export", authenticateAdmin, exportBlogs);
router.post("/admin/blogs/delete-many", authenticateAdmin, express.json(), deleteManyBlogs);
router.get("/admin/blogs/:id", authenticateAdmin, getBlogById);

export default router;
