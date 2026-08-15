import express from "express";
import { getCityWiseStudents, getConversionFunnel, getDashboardTile, getEnrollmentTrends, getHowFindUs, getTeacherGenderPreference, getTop5Curriculams, getTop5Grades, getTopPreferredTimes } from "../controllers/insightsController";

const router = express.Router();

// GET /insights/conversion-funnel?timeRange=7d
// GET /insights/conversion-funnel?from=2025-08-01&to=2025-08-28
router.get("/conversion-funnel", getConversionFunnel);
router.get("/enrollment-trends", getEnrollmentTrends);
router.get("/teacher-gender-preference", getTeacherGenderPreference);
router.get("/how-find-us", getHowFindUs);
router.get("/city-wise-students", getCityWiseStudents);
router.get("/top-5-grades", getTop5Grades);
router.get("/top-5-curriculums", getTop5Curriculams);
router.get("/top-preferred-times", getTopPreferredTimes);
router.get("/dashboard-tile", getDashboardTile);



export default router;
