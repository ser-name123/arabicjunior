import { AdminDocument } from "../../models/admin";  // Adjust the path to where your User type is defined

declare global {
  namespace Express {
    interface Request {
      user?: AdminDocument;  // Make it optional if user might not be set at all times
    }
  }
}