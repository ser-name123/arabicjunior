import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware";
import {
  getAllTrialUsers,
  getTrialUsers,
  updateTrialUserAttended,
  deleteTrialUser,
  deleteManyTrialUsers,
} from "../controllers/userRegistrationController";

const router = express.Router();

// NOTE: a public `GET /users` used to live here and returned every trial
// signup — name, email, phone, grade — to anyone who asked, with no
// authentication (audit finding F1). Nothing consumed it: the admin dashboard
// reads /trial-users below, which is authenticated and paginated. It has been
// removed rather than protected, since a duplicate unpaginated dump of the
// same data has no caller.

router.get("/trial-users", authenticateAdmin, getTrialUsers);
router.get("/trial-users/all", authenticateAdmin, getAllTrialUsers);
router.patch("/trial-users/:id/attendance", authenticateAdmin, updateTrialUserAttended);
// Bulk delete is a POST because the ids travel in the body, and a body on
// DELETE is poorly supported by proxies and some HTTP clients.
router.post(
  "/trial-users/delete-many",
  authenticateAdmin,
  express.json(),
  deleteManyTrialUsers
);
router.delete("/trial-users/:id", authenticateAdmin, deleteTrialUser);

export default router;
