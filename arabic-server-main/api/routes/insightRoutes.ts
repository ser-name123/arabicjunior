import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware";
import {
    getCityWiseStudents,
    getConversionFunnel,
    getDashboardTile,
    getEnrollmentTrends,
    getHowFindUs,
    getTeacherGenderPreference,
    getTop5Curriculams,
    getTop5Grades,
    getTopPreferredTimes,
} from "../controllers/insightsController";

const router = express.Router();

// Every analytics endpoint was publicly readable (audit finding F3) — enrolment
// numbers, conversion rates, city distribution and curriculum popularity were
// all available without logging in. These only ever feed the admin dashboard
// charts, which already send a bearer token, so the whole group is gated here.
router.use(authenticateAdmin);

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
