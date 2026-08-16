import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import JobApplication from "../models/jobApplication";
import Job from "../models/job";
import { createAdminNotification } from "../utils/createNotification";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "job-resumes",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

// POST: Candidate Apply to Job (Public)
export const applyJob = async (req: Request, res: Response): Promise<any> => {
  let uploadedResume = null;
  try {
    const { jobId, fullName, email, phone, coverLetter } = req.body;

    if (!jobId || !fullName || !email || !phone) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job position not found" });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (!files || !files["resume"] || !files["resume"][0]) {
      return res.status(400).json({ success: false, message: "Resume/CV file is required" });
    }

    // Upload CV file to Cloudinary
    uploadedResume = await uploadToCloudinary(files["resume"][0]);

    // Save job application record
    const application = new JobApplication({
      jobId,
      jobTitle: job.title,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      resumeUrl: uploadedResume.secure_url,
      resumePublicId: uploadedResume.public_id,
      coverLetter: coverLetter?.trim() || "",
      status: "pending",
    });

    await application.save();

    // Create Admin Notification
    await createAdminNotification({
      type: "job",
      title: "New Job Application",
      message: `${fullName} applied for ${job.title}`,
      link: "/admin/jobs",
      data: { id: application._id, fullName, jobTitle: job.title }
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! Our team will get back to you soon.",
      data: application,
    });
  } catch (error) {
    console.error("Error submitting job application:", error);

    // Clean up uploaded file if DB save failed
    if (uploadedResume) {
      try {
        await cloudinary.uploader.destroy(uploadedResume.public_id, { resource_type: "raw" });
      } catch (destroyErr) {
        console.error("Failed to delete upload on error rollback:", destroyErr);
      }
    }

    res.status(500).json({ success: false, message: "Server error during application submission" });
  }
};

// GET: Fetch all applications (Admin Only)
export const getApplications = async (req: Request, res: Response): Promise<any> => {
  try {
    const applications = await JobApplication.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

// PUT: Update Application Status (Admin Only)
export const updateApplicationStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status } = req.body;
    if (!status || !["pending", "reviewed", "shortlisted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid application status value" });
    }

    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Job application not found" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status} successfully!`,
      data: application,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ success: false, message: "Server error during status update" });
  }
};

// DELETE: Remove Application (Admin Only)
export const deleteApplication = async (req: Request, res: Response): Promise<any> => {
  try {
    const application = await JobApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: "Job application not found" });
    }

    // Delete CV file from Cloudinary
    if (application.resumePublicId) {
      try {
        await cloudinary.uploader.destroy(application.resumePublicId, { resource_type: "raw" });
      } catch (destroyErr) {
        console.error("Failed to delete resume from Cloudinary during removal:", destroyErr);
      }
    }

    await JobApplication.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job application deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting job application:", error);
    res.status(500).json({ success: false, message: "Server error during application deletion" });
  }
};
