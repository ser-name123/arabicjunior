import express from "express";
import {
  getPublishedTeachers,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { multiImageUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

// imageUpload caps at one file; a teacher can send a headshot and a portrait.
const uploadMiddleware = multiImageUpload.fields([
  { name: "photo", maxCount: 1 },
  { name: "portrait", maxCount: 1 },
]);

// Public — teachers page, homepage slider, About Us carousel.
router.get("/teachers", getPublishedTeachers);

// Admin. authenticateAdmin runs before multer so an unauthenticated request is
// rejected before its files are read into memory.
router.get("/admin/teachers", authenticateAdmin, getTeachers);
router.get("/admin/teachers/:id", authenticateAdmin, getTeacherById);
router.post("/admin/teachers", authenticateAdmin, uploadMiddleware, handleUploadErrors, createTeacher);
router.put("/admin/teachers/:id", authenticateAdmin, uploadMiddleware, handleUploadErrors, updateTeacher);
router.delete("/admin/teachers/:id", authenticateAdmin, deleteTeacher);

export default router;
