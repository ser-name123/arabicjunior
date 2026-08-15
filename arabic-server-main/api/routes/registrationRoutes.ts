import express from "express";
const router = express.Router();

import multer from "multer";
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });

import { registerUser } from "../controllers/userRegistrationController";
import { teacherRegistration } from "../controllers/teacherRegistrationController";
import studentRegistration, { getRegisteredStudents, getAllRegisteredStudents } from "../controllers/studentRegistrationController";
import { authenticateAdmin } from "../middleware/authMiddleware";

router.post("/register", registerUser);


const uploadMiddleware = upload.fields([
  { name: "doc_1", maxCount: 1 },
  { name: "doc_2", maxCount: 1 },
  { name: "doc_3", maxCount: 1 },
  { name: "doc_4", maxCount: 1 },
  { name: "personal_image", maxCount: 1 },
]);

router.post("/teacher-registration", uploadMiddleware, teacherRegistration);

router.post("/student-registration", studentRegistration);
router.get("/registered-students", authenticateAdmin, getRegisteredStudents);
router.get("/registered-students/all", authenticateAdmin, getAllRegisteredStudents);

export default router;
