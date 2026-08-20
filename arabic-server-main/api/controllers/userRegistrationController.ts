import { RequestHandler, type Request, type Response } from "express";
import User from "../models/user";
import { getClientLocation } from "../utils/getClientLocation";
import { buildClientInfo } from "../utils/buildClientInfo";
import {
  sendTrialEmailToAdmin,
  sendTrialSessionEmailToUser,
} from "../services/emailService";
import { TrialRegFormTypes } from "../types";
import { containsRegex } from "../utils/escapeRegex";

export const registerUser: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userLocation = await getClientLocation(req);
    const clientInfo = await buildClientInfo(req);

    const body: TrialRegFormTypes = req.body;

    if (!body) {
      res.status(400).json({ message: "All fields are required!" });
      return; // Ensure no further execution
    }

    // save to db
    // clientContext is stripped out: it is the browser's raw report, and the
    // cleaned version already lives in clientInfo.
    const { clientContext, ...formFields } = body as any;

    const registrationData = {
      ...formFields,
      userIP: userLocation?.city ?? body.city ?? "Unknown",
      clientInfo,
    };
    const users = new User(registrationData);
    await users.save();

    // send email to user after register
    await sendTrialSessionEmailToUser({ ...body });

    // send email to admin after register a user for trial
    await sendTrialEmailToAdmin({ ...body });

    res.status(200).json({ message: "Registration successful. Email sent!" });
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.email) {
      res.status(409).json({ message: "Email is already in use" });
      return;
    }

    res
      .status(500)
      .json({ message: "Registration failed. Could not send email.", error });
  }
};

// Get Trial Users (with pagination, search, and attended filter)
export const getTrialUsers = async (req: Request, res: Response) => {
  try {
    let { page = "1", limit = "10", search = "", attended, startDate, endDate } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    // Build search filter
    let filter: any = {};
    if (search && typeof search === "string" && search.trim() !== "") {
      const regex = containsRegex(search); // case-insensitive, input escaped
      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phoneNumber: regex },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate as string)
      if (endDate) filter.createdAt.$lte = new Date(endDate as string)
    }

    // Attended filter (optional)
    if (attended === "true") {
      filter.attended = true;
    } else if (attended === "false") {
      filter.attended = false;
    }

    // Count total documents
    const total = await User.countDocuments(filter);

    // Fetch paginated users
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      status: "success",
      data: users,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching trial users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch trial users",
      error,
    });
  }
};

// Get All Trial Users (for export, no pagination)
export const getAllTrialUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching all trial users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch all trial users",
      error,
    });
  }
};

// Update Attended Status
export const updateTrialUserAttended = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { attended } = req.body;

    if (typeof attended !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "attended field must be boolean (true/false)",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { attended },
      { new: true } // return updated document
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Trial user not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Attended status updated",
      data: user,
    });
  } catch (error) {
    console.error("Error updating attended status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update attended status",
      error,
    });
  }
};

export const deleteTrialUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Trial user not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Trial user deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trial user:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete trial user",
      error,
    });
  }
};

/**
 * Delete several trial signups at once.
 *
 * A POST rather than a DELETE because the ids travel in the body, and a body on
 * DELETE is poorly supported by proxies and some HTTP clients.
 */
export const deleteManyTrialUsers = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No trial students selected" });
    }

    // Guard against a runaway request clearing the table in one call. The admin
    // screen sends at most one page of rows, so this is far above normal use.
    if (ids.length > 500) {
      return res
        .status(400)
        .json({ status: "error", message: "Too many at once. Select up to 500." });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      status: "success",
      message: `${result.deletedCount} trial student(s) deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting trial users:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete the trial students",
      error,
    });
  }
};
