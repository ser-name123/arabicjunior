import express, { Request, Response } from "express";
import { getClientLocation } from "../utils/getClientLocation";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const userInfo = await getClientLocation(req);
  res.send({
    message: `You're landed in an empty ocean! 😊`,
    today: `${Date.now()}`,
    info: {
      city: userInfo.city,
      country: userInfo.country,
      region: userInfo.region,
      success: userInfo.success,
    },
  });
});

export default router;
