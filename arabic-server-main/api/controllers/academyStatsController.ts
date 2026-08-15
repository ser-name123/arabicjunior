import { Request, Response } from "express";
import AcademyStats from "../models/academyStats";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "academy-stats",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

// GET: Fetch academy stats (Public)
export const getAcademyStats = async (req: Request, res: Response): Promise<any> => {
  try {
    let statsDoc = await AcademyStats.findOne();
    
    // If not in database yet, create the default record using Mongoose schema defaults
    if (!statsDoc) {
      statsDoc = new AcademyStats();
      await statsDoc.save();
    }
    
    res.status(200).json({ success: true, data: statsDoc });
  } catch (error) {
    console.error("Error fetching academy stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch academy stats" });
  }
};

// PUT: Update academy stats (Admin Only)
export const updateAcademyStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const { heading, subHeading, description, stats } = req.body;

    // Validate inputs
    if (!heading || !heading.trim()) {
      return res.status(400).json({ success: false, message: "Heading is required" });
    }
    if (!subHeading || !subHeading.trim()) {
      return res.status(400).json({ success: false, message: "Subheading is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    let parsedStats = stats;
    if (typeof stats === "string") {
      try {
        parsedStats = JSON.parse(stats);
      } catch (e) {
        return res.status(400).json({ success: false, message: "Invalid stats format" });
      }
    }

    if (!parsedStats || !Array.isArray(parsedStats) || parsedStats.length !== 4) {
      return res.status(400).json({ success: false, message: "All 4 stats items must be specified" });
    }

    // Find the first config document
    let statsDoc = await AcademyStats.findOne();
    if (!statsDoc) {
      statsDoc = new AcademyStats();
    }

    // Handle Image Upload
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files?.["image"]?.[0]) {
      if (statsDoc.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(statsDoc.imagePublicId);
        } catch (destroyErr) {
          console.error("Failed to destroy previous image:", destroyErr);
        }
      }
      const uploadedImage = await uploadToCloudinary(files["image"][0]);
      statsDoc.imageUrl = uploadedImage.secure_url;
      statsDoc.imagePublicId = uploadedImage.public_id;
    }

    // Update fields
    statsDoc.heading = heading.trim();
    statsDoc.subHeading = subHeading.trim();
    statsDoc.description = description.trim();
    statsDoc.stats = parsedStats;

    await statsDoc.save();

    res.status(200).json({
      success: true,
      message: "Academy stats updated successfully!",
      data: statsDoc,
    });
  } catch (error) {
    console.error("Error updating academy stats:", error);
    res.status(500).json({ success: false, message: "Server error during stats update" });
  }
};
