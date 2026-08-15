import express from "express";

import { registerUser } from "../controllers/userRegistrationController";
import {
  teacherRegistration,
  getTeacherRegistrations,
  deleteTeacherRegistration,
} from "../controllers/teacherRegistrationController";
import studentRegistration, {
  getRegisteredStudents,
  getAllRegisteredStudents,
  deleteRegisteredStudent,
} from "../controllers/studentRegistrationController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { teacherDocsUpload, handleUploadErrors } from "../config/upload";

const router = express.Router();

const uploadMiddleware = teacherDocsUpload.fields([
  { name: "doc_1", maxCount: 1 },
  { name: "doc_2", maxCount: 1 },
  { name: "doc_3", maxCount: 1 },
  { name: "doc_4", maxCount: 1 },
  { name: "personal_image", maxCount: 1 },
]);

// Public forms
router.post("/register", registerUser);
router.post("/teacher-registration", uploadMiddleware, handleUploadErrors, teacherRegistration);
router.post("/student-registration", studentRegistration);

// Admin
router.get("/registered-students", authenticateAdmin, getRegisteredStudents);
router.get("/registered-students/all", authenticateAdmin, getAllRegisteredStudents);
router.delete("/registered-students/:id", authenticateAdmin, deleteRegisteredStudent);
router.get("/admin/teacher-registrations", authenticateAdmin, getTeacherRegistrations);
router.delete("/admin/teacher-registrations/:id", authenticateAdmin, deleteTeacherRegistration);

export default router;
