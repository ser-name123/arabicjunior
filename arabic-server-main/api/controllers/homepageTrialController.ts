import { Request, Response } from "express";
import HomepageTrial from "../models/homepageTrial";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "homepage-trial",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

// GET: Fetch homepage trial settings (Public)
export const getHomepageTrialSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await HomepageTrial.findOne();
    if (!settings) {
      settings = new HomepageTrial();
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching homepage trial settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch homepage trial settings" });
  }
};

// PUT: Update homepage trial settings (Admin Only)
export const updateHomepageTrialSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      badgeText,
      heading,
      headingHighlight,
      headingSuffix,
      description,
      features,
      btnBookText,
      btnDetailsText,
      subtext1,
      subtext2,
      bottomCards
    } = req.body;

    let settings = await HomepageTrial.findOne();
    if (!settings) {
      settings = new HomepageTrial();
    }

    const parseField = (field: any) => {
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    };

    if (badgeText !== undefined) settings.badgeText = badgeText;
    if (heading !== undefined) settings.heading = heading;
    if (headingHighlight !== undefined) settings.headingHighlight = headingHighlight;
    if (headingSuffix !== undefined) settings.headingSuffix = headingSuffix;
    if (description !== undefined) settings.description = description;
    if (btnBookText !== undefined) settings.btnBookText = btnBookText;
    if (btnDetailsText !== undefined) settings.btnDetailsText = btnDetailsText;
    if (subtext1 !== undefined) settings.subtext1 = subtext1;
    if (subtext2 !== undefined) settings.subtext2 = subtext2;

    if (features !== undefined) settings.features = parseField(features);
    if (bottomCards !== undefined) settings.bottomCards = parseField(bottomCards);

    // Handle Image Upload
    if (req.file) {
      if (settings.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.imagePublicId);
        } catch (err) {
          console.error("Failed to delete previous homepage trial image:", err);
        }
      }
      const uploaded = await uploadToCloudinary(req.file);
      settings.imageUrl = uploaded.secure_url;
      settings.imagePublicId = uploaded.public_id;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Homepage trial banner settings updated successfully!",
      data: settings
    });
  } catch (error) {
    console.error("Error updating homepage trial settings:", error);
    res.status(500).json({ success: false, message: "Server error during settings update" });
  }
};
