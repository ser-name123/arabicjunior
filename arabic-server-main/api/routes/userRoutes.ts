import express, { Request, Response } from "express";
import User from "../models/user";
import { authenticateAdmin } from "../middleware/authMiddleware";
import { getAllTrialUsers, getTrialUsers, updateTrialUserAttended } from "../controllers/userRegistrationController";

const router = express.Router();

router.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    console.error("Users doc find error", error);
  }
});

router.get("/trial-users", authenticateAdmin, getTrialUsers);
router.get("/trial-users/all", authenticateAdmin, getAllTrialUsers);
router.patch("/trial-users/:id/attendance", authenticateAdmin, updateTrialUserAttended);


export default router;
