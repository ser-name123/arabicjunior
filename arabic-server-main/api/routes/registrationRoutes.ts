import express from "express";

import { registerUser } from "../controllers/userRegistrationController";
import {
  teacherRegistration,
  getTeacherRegistrations,
  deleteTeacherRegistration,
  deleteManyTeacherRegistrations,
} from "../controllers/teacherRegistrationController";
import studentRegistration, {
  getRegisteredStudents,
  deleteManyRegisteredStudents,
  getAllRegisteredStudents,
  deleteRegisteredStudent,
} from "../controllers/studentRegistrationController";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { teacherDocsUpload, handleUploadErrors } from "../config/upload";
import { verifyTurnstile } from "../middleware/turnstileMiddleware";

const router = express.Router();

const uploadMiddleware = teacherDocsUpload.fields([
  { name: "doc_1", maxCount: 1 },
  { name: "doc_2", maxCount: 1 },
  { name: "doc_3", maxCount: 1 },
  { name: "doc_4", maxCount: 1 },
  { name: "personal_image", maxCount: 1 },
]);

// Public forms
router.post("/register", verifyTurnstile, registerUser);
// verifyTurnstile sits after multer on purpose: the token arrives as a
// multipart field and does not exist on req.body until multer has parsed it.
router.post(
  "/teacher-registration",
  uploadMiddleware,
  handleUploadErrors,
  verifyTurnstile,
  teacherRegistration
);
router.post("/student-registration", verifyTurnstile, studentRegistration);

// Admin
router.get("/registered-students", authenticateAdmin, getRegisteredStudents);
router.get("/registered-students/all", authenticateAdmin, getAllRegisteredStudents);
// Bulk delete is a POST because the ids travel in the body, and a body on
// DELETE is poorly supported by proxies and some HTTP clients.
router.post(
  "/registered-students/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyRegisteredStudents
);
router.delete("/registered-students/:id", authenticateAdmin, deleteRegisteredStudent);
router.get("/admin/teacher-registrations", authenticateAdmin, getTeacherRegistrations);
router.post(
  "/admin/teacher-registrations/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyTeacherRegistrations
);
router.delete("/admin/teacher-registrations/:id", authenticateAdmin, deleteTeacherRegistration);

export default router;
