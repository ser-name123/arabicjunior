import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import TeacherRegistration from "../models/teacherRegistration";
import { sendTeacherRegistrationReplyEmail, sendTeacherRegToAdmin } from "../services/emailService";
import { TeacherRegistrationTypes } from "../types";
import { createAdminNotification } from "../utils/createNotification";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "teachers-registration",
    resource_type: "auto",
  });

  return { ...result };
};

/**
 * The name the candidate's own file had. Cloudinary replaces it with a random
 * id, so this is the only chance to keep it. Any directory part is dropped
 * (some browsers send a full path) and the length is capped, because this
 * string is rendered straight into the admin panel.
 */
const originalFileName = (file: Express.Multer.File): string => {
  const raw = (file.originalname || "").trim();
  // Some browsers send a full path rather than a bare name.
  const name = raw.split("/").pop()!.split("\\").pop()!;
  return name.trim().slice(0, 200);
};

/**
 * The resource type Cloudinary filed an asset under, read back off its URL
 * (".../image/upload/..." or ".../raw/upload/...").
 *
 * Uploads here are made with resource_type "auto", which lets Cloudinary pick.
 * "auto" is not a real type though — the destroy API rejects it — so deletes
 * have to name the type the upload ended up with.
 */
const resourceTypeFromUrl = (url: string): "image" | "video" | "raw" => {
  const beforeUpload = url.split("/upload/")[0].split("/");
  const type = beforeUpload[beforeUpload.length - 1];
  return type === "video" || type === "raw" ? type : "image";
};

export const teacherRegistration = async (req: Request, res: Response) => {
  const uploadedAssets: { public_id: string; resource_type: string }[] = [];
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
        const file = files[field][0];
        const { secure_url, public_id, resource_type } = await uploadToCloudinary(file);
        uploadedFiles[field] = secure_url;

        const name = originalFileName(file);
        if (name) uploadedFiles[`${field}_name`] = name;

        uploadedAssets.push({ public_id, resource_type });
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

    // Create Admin Notification
    await createAdminNotification({
      type: "teacher",
      title: "New Teacher Application",
      message: `${body.first_name || ""} ${body.last_name || ""} (${body.email}) applied as a teacher`,
      link: "/admin/teacher-requests",
      data: { id: teachers._id, email: body.email, name: `${body.first_name || ""} ${body.last_name || ""}` }
    });

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

    // Something went wrong: Rollback Cloudinary uploads. allSettled, not all —
    // one file refusing to delete must not abandon the rest.
    await Promise.allSettled(
      uploadedAssets.map(({ public_id, resource_type }) =>
        cloudinary.uploader.destroy(public_id, { resource_type })
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

/**
 * POST: Remove several teacher applications at once (Admin Only).
 *
 * Each application owns up to five Cloudinary files — a photo and four
 * documents — so deleting ten applications means clearing up to fifty assets.
 * Left behind they are unreachable: nothing in the database points at them any
 * more, and nobody can tell whose certificate is whose.
 */
export const deleteManyTeacherRegistrations = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No applications selected" });
    }

    if (ids.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Please delete at most 200 applications at a time",
      });
    }

    const registrations = await TeacherRegistration.find({ _id: { $in: ids } });

    const fileFields = ["personal_image", "doc_1", "doc_2", "doc_3", "doc_4"] as const;
    const assets: { publicId: string; resourceType: "image" | "video" | "raw" }[] = [];

    for (const registration of registrations) {
      for (const field of fileFields) {
        const url = registration[field];
        if (!url || !url.includes("cloudinary.com")) continue;

        const parts = url.split("/upload/");
        if (parts.length < 2) continue;

        const pathParts = parts[1].split("/");
        const startIndex = pathParts[0].startsWith("v") ? 1 : 0;
        const fullPublicIdWithExt = pathParts.slice(startIndex).join("/");
        const lastDotIndex = fullPublicIdWithExt.lastIndexOf(".");
        const publicId =
          lastDotIndex > -1 ? fullPublicIdWithExt.substring(0, lastDotIndex) : fullPublicIdWithExt;

        assets.push({ publicId, resourceType: resourceTypeFromUrl(url) });
      }
    }

    const result = await TeacherRegistration.deleteMany({ _id: { $in: ids } });

    // After the records are gone: a file that refuses to delete must not leave
    // an application listed in the panel that cannot be opened.
    for (const asset of assets) {
      try {
        await cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType });
      } catch (err) {
        console.error(`Could not remove Cloudinary asset ${asset.publicId}:`, err);
      }
    }

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} application(s) deleted successfully!`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting teacher registrations:", error);
    res.status(500).json({ success: false, message: "Failed to delete the applications" });
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
            await cloudinary.uploader.destroy(publicId, {
              resource_type: resourceTypeFromUrl(url),
            });
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
