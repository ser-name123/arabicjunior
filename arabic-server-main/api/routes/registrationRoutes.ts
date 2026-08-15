import express from "express";

import { registerUser } from "../controllers/userRegistrationController";
import { teacherRegistration } from "../controllers/teacherRegistrationController";
import studentRegistration, {
  getRegisteredStudents,
  getAllRegisteredStudents,
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

export default router;
