import express from "express";
import {
  getPublishedTeachers,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  deleteManyTeachers,
  exportTeachers,
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
// Registered BEFORE /admin/teachers/:id, otherwise Express matches "export"
// as a teacher id and hands it to getTeacherById.
router.get("/admin/teachers/export", authenticateAdmin, exportTeachers);
router.get("/admin/teachers/:id", authenticateAdmin, getTeacherById);
router.post("/admin/teachers", authenticateAdmin, uploadMiddleware, handleUploadErrors, createTeacher);
router.put("/admin/teachers/:id", authenticateAdmin, uploadMiddleware, handleUploadErrors, updateTeacher);
router.post("/admin/teachers/delete-many", authenticateAdmin, express.json(), deleteManyTeachers);
router.delete("/admin/teachers/:id", authenticateAdmin, deleteTeacher);

export default router;
