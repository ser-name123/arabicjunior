import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import SchoolLogo from "../models/schoolLogo";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "school-logos",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

// GET: Get all school logos
export const getSchoolLogos = async (req: Request, res: Response): Promise<any> => {
  try {
    const logos = await SchoolLogo.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: logos });
  } catch (error) {
    console.error("Error fetching school logos:", error);
    res.status(500).json({ success: false, message: "Failed to fetch school logos" });
  }
};

// POST: Upload/Create school logo (Admin Only)
export const createSchoolLogo = async (req: Request, res: Response): Promise<any> => {
  let uploadedLogo = null;
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ success: false, message: "School name is required" });
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    if (!files || !files["logo"] || !files["logo"][0]) {
      return res.status(400).json({ success: false, message: "Logo image is required" });
    }

    // Upload to Cloudinary
    uploadedLogo = await uploadToCloudinary(files["logo"][0]);

    // Save to Database
    const newSchoolLogo = new SchoolLogo({
      name: name.trim(),
      logoUrl: uploadedLogo.secure_url,
      logoPublicId: uploadedLogo.public_id,
    });

    await newSchoolLogo.save();

    res.status(210).json({
      success: true,
      message: "School logo uploaded successfully!",
      data: newSchoolLogo,
    });
  } catch (error) {
    console.error("Error creating school logo:", error);

    // Rollback Cloudinary if db save fails
    if (uploadedLogo) {
      try {
        await cloudinary.uploader.destroy(uploadedLogo.public_id);
      } catch (destroyErr) {
        console.error("Failed to destroy upload during error rollback:", destroyErr);
      }
    }

    res.status(500).json({ success: false, message: "Server error during logo upload" });
  }
};

// DELETE: Remove school logo (Admin Only)
export const deleteSchoolLogo = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const logo = await SchoolLogo.findById(id);
    if (!logo) {
      return res.status(404).json({ success: false, message: "School logo not found" });
    }

    // Delete from Cloudinary
    if (logo.logoPublicId) {
      try {
        await cloudinary.uploader.destroy(logo.logoPublicId);
      } catch (cloudinaryErr) {
        console.error("Failed to delete from Cloudinary:", cloudinaryErr);
      }
    }

    // Delete from Database
    await SchoolLogo.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "School logo deleted successfully!" });
  } catch (error) {
    console.error("Error deleting school logo:", error);
    res.status(500).json({ success: false, message: "Server error during logo deletion" });
  }
};
