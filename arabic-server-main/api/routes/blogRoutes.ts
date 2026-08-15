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

import multer from "multer";
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

const router = express.Router();
const uploadMiddleware = upload.fields([
    { name: "cover-image", maxCount: 1 }, // 👈 match your frontend field name
])

// CRUD
router.get("/blogs/:slug", getBlogBySlug);     // Get by slug
router.get("/blogs", getAllBlogs);  //Get all blogs

// for admin
router.post("/admin/blogs", uploadMiddleware, authenticateAdmin, createBlog);            // Create
router.get("/admin/blogs", authenticateAdmin, getBlogs);               // Get all
router.put("/admin/blogs/:id", uploadMiddleware, authenticateAdmin, updateBlog);          // Update
router.delete("/admin/blogs/:id", authenticateAdmin, deleteBlog);       // Delete
router.get("/admin/blogs/:id", authenticateAdmin, getBlogById); //Get By Id

export default router;
