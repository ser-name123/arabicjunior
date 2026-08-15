import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  adminId?: string;
}

export const authenticateAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No Token", success: false });
    return;
  }

  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          res.status(403).json({ message: "JWT verify errors", error: err });
          return;
        }

        req.adminId = decoded.adminId;

        next();
      }
    );
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};
