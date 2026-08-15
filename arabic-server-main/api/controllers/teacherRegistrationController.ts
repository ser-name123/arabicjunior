import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import TeacherRegistration from "../models/teacherRegistration";
import { sendTeacherRegistrationReplyEmail, sendTeacherRegToAdmin } from "../services/emailService";
import { TeacherRegistrationTypes } from "../types";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "teachers-registration",
    resource_type: "auto",
  });

  return { ...result };
};

export const teacherRegistration = async (req: Request, res: Response) => {
  const uploadedAssets: string[] = [];
  try {
    const body: TeacherRegistrationTypes = req.body;
    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    // Upload files to Cloudinary
    const uploadedFiles: Record<string, string> = {};
    const uploadFields = ["personal_image", "doc_1", "doc_2", "doc_3", "doc_4"];

    for (const field of uploadFields) {
      if (files?.[field]?.[0]) {
        const { secure_url, public_id } = await uploadToCloudinary(files[field][0]);
        uploadedFiles[field] = secure_url;
        uploadedAssets.push(public_id);
      }
    }

    // Combine all data
    const teacherData = {
      ...body,
      expected_salary: parseFloat(body.expected_salary),
      work_hours: parseFloat(body.work_hours),
      declaration: body.declaration === "true",
      ...uploadedFiles,
    };

    // Save teacherData to MongoDB
    const teachers = new TeacherRegistration(teacherData);
    await teachers.save();

    // send reply email after register a teacher
    try {
      await sendTeacherRegistrationReplyEmail({ ...body });
    } catch (emailErr) {
      console.error("Failed to send teacher registration reply email:", emailErr);
    }

    // send a email to admin after register a teacher
    try {
      await sendTeacherRegToAdmin({ ...body });
    } catch (emailErr) {
      console.error("Failed to send teacher registration email to admin:", emailErr);
    }

    res.status(200).json({ message: "Registration successful" });
  } catch (error) {
    console.error("teacher registration error:", error);
    res.status(500).json({
      message: "Teacher registration failed",
      error: error instanceof Error ? error.message : error,
    });

    // Something went wrong: Rollback Cloudinary uploads
    await Promise.all(
      uploadedAssets.map((public_id) =>
        cloudinary.uploader.destroy(public_id, {
          resource_type: "auto",
        })
      )
    );
  }
};

// GET: Fetch all teacher registrations (Admin Only)
export const getTeacherRegistrations = async (req: Request, res: Response): Promise<any> => {
  try {
    const registrations = await TeacherRegistration.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: registrations });
  } catch (error) {
    console.error("Error fetching teacher registrations:", error);
    res.status(500).json({ success: false, message: "Failed to fetch teacher registrations" });
  }
};

// DELETE: Remove a teacher registration (Admin Only)
export const deleteTeacherRegistration = async (req: Request, res: Response): Promise<any> => {
  try {
    const registration = await TeacherRegistration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Registration not found" });
    }

    // Clean up uploaded files from Cloudinary
    const fileFields = ["personal_image", "doc_1", "doc_2", "doc_3", "doc_4"] as const;
    for (const field of fileFields) {
      const url = registration[field];
      if (url && url.includes("cloudinary.com")) {
        try {
          const parts = url.split("/upload/");
          if (parts.length > 1) {
            const pathParts = parts[1].split("/");
            const startIndex = pathParts[0].startsWith("v") ? 1 : 0;
            const fullPublicIdWithExt = pathParts.slice(startIndex).join("/");
            const lastDotIndex = fullPublicIdWithExt.lastIndexOf(".");
            const publicId = lastDotIndex > -1 ? fullPublicIdWithExt.substring(0, lastDotIndex) : fullPublicIdWithExt;
            await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
          }
        } catch (destroyErr) {
          console.error("Cloudinary asset deletion error:", destroyErr);
        }
      }
    }

    await TeacherRegistration.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Teacher registration deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting teacher registration:", error);
    res.status(500).json({ success: false, message: "Server error during registration deletion" });
  }
};
