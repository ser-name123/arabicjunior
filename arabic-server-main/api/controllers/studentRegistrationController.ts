import type { Request, Response } from "express";
import { StudentRegistrationFormTypes } from "../types";
import StudentRegistration from "../models/studentRegistration";
import {
  sendStudentRegConfirmationEmail,
  sendStudentRegNotifToAdmin,
} from "../services/emailService";
import { containsRegex } from "../utils/escapeRegex";

const studentRegistration = async (req: Request, res: Response) => {
  const body: StudentRegistrationFormTypes = req.body;
  const TEACHING_HOURS_PER_PACKAGE = {
    starter: { hour: 4 },
    essential: { hour: 8 },
    premium: { hour: 12 },
    elite: { hour: 16 },
  };

  try {
    const {
      class_start_date,
      email,
      first_name,
      last_name,
      preferred_days,
      preferred_time,
      pricing_package,
      gender
    } = body;

    // ✅ Ensure date is a real Date object
    const parsedDate = new Date(class_start_date);

    const packageName = pricing_package?.split(" ")[0].toLowerCase();
    const monthlyHours =
      TEACHING_HOURS_PER_PACKAGE[
        packageName as keyof typeof TEACHING_HOURS_PER_PACKAGE
      ]?.hour;

    if (!monthlyHours) {
      res.status(400).json({
        message: "Invalid or missing pricing package",
        status: "error",
      });

      return; // prevents further execution
    }

    // db
    const students = new StudentRegistration(body);
    await students.save();

    // send confirmation email after register
    await sendStudentRegConfirmationEmail({
      email: email,
      classStartDate: class_start_date,
      classStartTime: preferred_time,
      firstName: first_name || "",
      lastName: last_name || "",
      monthlyHours: monthlyHours,
      preferredDays: preferred_days,
      selectedPackage: pricing_package,
      gender
    });

    // send notification email to admin after register a student
    await sendStudentRegNotifToAdmin({ ...body });

    res
      .status(200)
      .json({ message: "registered successfully", status: "success" });
  } catch (error: any) {
    if (error.code === 11000 && error.keyPattern?.email) {
      res.status(409).json({ message: "Email is already in use" });
      return;
    }

    res
      .status(500)
      .json({ message: "student registration error from server", error });
  }
};

export const getRegisteredStudents = async (req: Request, res: Response) => {
  try {
    let { page = "1", limit = "10", search = "", startDate, endDate } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    // Build search filter
    let filter: any = {};
    if (search && typeof search === "string" && search.trim() !== "") {
      const regex = containsRegex(search); // case-insensitive, input escaped
      filter = {
        $or: [
          { first_name: regex },
          { last_name: regex },
          { email: regex },
          { phone_number: regex },
          { school_name: regex },
          { curriculum: regex },
        ],
      };
    }
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate as string)
      if (endDate) filter.createdAt.$lte = new Date(endDate as string)
    }
    // Count total documents matching filter
    const total = await StudentRegistration.countDocuments(filter);

    // Fetch paginated students
    const students = await StudentRegistration.find(filter)
      .sort({ createdAt: -1 }) // latest first
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      status: "success",
      data: students,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching registered students:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch registered students",
      error,
    });
  }
};

export const getAllRegisteredStudents = async (req: Request, res: Response) => {
  try {
    const students = await StudentRegistration.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: students,
      total: students.length,
    });
  } catch (error) {
    console.error("Error fetching all students for export:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch all students for export",
      error,
    });
  }
};

export const deleteRegisteredStudent = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const student = await StudentRegistration.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Registered student not found",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Registered student deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting registered student:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete registered student",
      error,
    });
  }
};

export default studentRegistration;
